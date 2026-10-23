<?php

declare(strict_types=1);

final class BlogStatify
{
    public const GRAPHQL_ENDPOINT = 'https://klef.newfacecards.com/graphql';
    public const REST_ENDPOINT = 'https://klef.newfacecards.com/wp-json/wp/v2';
    public const SITE_URL = 'https://klef.agency';

    private const LIST_QUERY = <<<'GRAPHQL'
query GetBlogPosts {
  posts(first: 100, where: { categoryName: "Blog" }) {
    nodes {
      id
      title
      slug
      excerpt
      date
      modified
      featuredImage { node { sourceUrl altText mediaDetails { width height } } }
      categories { nodes { name slug } }
      tags { nodes { name slug } }
    }
  }
}
GRAPHQL;

    private const DETAIL_QUERY = <<<'GRAPHQL'
query GetBlogPost($slug: ID!) {
  post(id: $slug, idType: SLUG) {
    id
    title
    slug
    uri
    date
    modified
    content(format: RENDERED)
    excerpt
    featuredImage { node { sourceUrl altText mediaDetails { width height } } }
    categories { nodes { name slug } }
    tags { nodes { name slug } }
    author { node { name firstName lastName uri url avatar { url } } }
  }
}
GRAPHQL;

    public static function build(string $root, string $endpoint = self::GRAPHQL_ENDPOINT): void
    {
        $list = self::graphql($endpoint, self::LIST_QUERY);
        $nodes = $list['data']['posts']['nodes'] ?? [];
        if (!is_array($nodes)) $nodes = [];
        $nodes = self::mergeRestBlogPosts($nodes);
        $localItems = self::readLocalItems($root);
        $localSlugs = array_values(array_filter(array_map(static fn (array $item): string => self::safeSlug((string) ($item['slug'] ?? '')), $localItems)));

        $generatedAt = gmdate('c');
        $outputDir = $root . '/data/blog';
        self::ensureDirectory($outputDir);
        $manifestPath = $outputDir . '/.statify-manifest.json';
        $previousManifest = is_file($manifestPath)
            ? json_decode((string) file_get_contents($manifestPath), true)
            : [];
        $previousSlugs = is_array($previousManifest['slugs'] ?? null) ? $previousManifest['slugs'] : [];
        $previousLocalSlugs = is_array($previousManifest['localSlugs'] ?? null) ? $previousManifest['localSlugs'] : [];
        $previousWordpressSlugs = is_array($previousManifest['wordpressSlugs'] ?? null)
            ? $previousManifest['wordpressSlugs']
            : array_values(array_diff($previousSlugs, $previousLocalSlugs));

        $items = [];
        $slugs = [];
        $wordpressSlugs = [];
        $seenSlugs = [];
        $sitemapEntries = [['loc' => self::SITE_URL . '/blog/', 'lastmod' => $generatedAt]];

        foreach ($nodes as $node) {
            if (!is_array($node)) continue;
            $slug = self::safeSlug((string) ($node['slug'] ?? ''));
            if ($slug === '') continue;
            if (isset($seenSlugs[$slug])) continue;
            $seenSlugs[$slug] = true;

            $detail = self::graphql($endpoint, self::DETAIL_QUERY, ['slug' => $slug]);
            $post = $detail['data']['post'] ?? null;
            if (!is_array($post)) throw new RuntimeException("No se encontró el artículo {$slug}.");

            $item = self::normalizeItem($post);
            $items[] = $item;
            $slugs[] = $slug;
            $wordpressSlugs[] = $slug;
            self::writeJson($outputDir . '/' . $slug . '.json', [
                'version' => 1,
                'generatedAt' => $generatedAt,
                'source' => $endpoint,
                'data' => $post,
            ]);
            self::writeAtomically($root . '/blog/' . $slug . '/index.html', self::renderPostPage($post));
            $sitemapEntries[] = [
                'loc' => self::SITE_URL . '/blog/' . rawurlencode($slug) . '/',
                'lastmod' => self::sitemapLastmod((string) ($post['modified'] ?? $post['date'] ?? ''), $generatedAt),
            ];
        }

        foreach ($localItems as $item) {
            $slug = self::safeSlug((string) ($item['slug'] ?? ''));
            if ($slug === '' || isset($seenSlugs[$slug])) continue;
            $seenSlugs[$slug] = true;
            $items[] = $item;
            $slugs[] = $slug;
            $sitemapEntries[] = [
                'loc' => self::SITE_URL . '/blog/' . rawurlencode($slug) . '/',
                'lastmod' => self::sitemapLastmod((string) ($item['modified'] ?? $item['date'] ?? ''), $generatedAt),
            ];
        }

        foreach (array_diff($previousWordpressSlugs, $wordpressSlugs) as $staleSlug) {
            $staleSlug = self::safeSlug((string) $staleSlug);
            if ($staleSlug === '') continue;
            @unlink($root . '/blog/' . $staleSlug . '/index.html');
            @unlink($outputDir . '/' . $staleSlug . '.json');
        }

        self::writeJson($outputDir . '/index.json', [
            'version' => 1,
            'generatedAt' => $generatedAt,
            'source' => 'local+wordpress',
            'items' => $items,
        ]);
        self::writeJson($manifestPath, [
            'slugs' => $slugs,
            'wordpressSlugs' => $wordpressSlugs,
            'localSlugs' => $localSlugs,
            'generatedAt' => $generatedAt,
        ]);
        self::updateIndexFallback($root . '/blog/index.html', $items);
        self::updateSitemap($root . '/sitemap.xml', $sitemapEntries);

        echo sprintf("Statify PHP Blog: publicados %d artículos\n", count($items));
    }

    public static function validate(string $root): array
    {
        $issues = [];
        $indexPath = $root . '/data/blog/index.json';
        $index = is_file($indexPath) ? json_decode((string) file_get_contents($indexPath), true) : null;
        if (!is_array($index) || !is_array($index['items'] ?? null)) return ['Falta un índice Statify válido para Blog.'];

        $blogIndex = is_file($root . '/blog/index.html') ? (string) file_get_contents($root . '/blog/index.html') : '';
        foreach (['STATIFY:BLOG_START', 'STATIFY:BLOG_END', 'name="description"', 'rel="canonical"'] as $marker) {
            if ($blogIndex === '' || !str_contains($blogIndex, $marker)) $issues[] = "El índice Blog no contiene {$marker}.";
        }

        $sitemap = is_file($root . '/sitemap.xml') ? (string) file_get_contents($root . '/sitemap.xml') : '';
        $blogLocCount = preg_match_all('~<loc>' . preg_quote(self::SITE_URL . '/blog/', '~') . '[^<]*</loc>~', $sitemap, $matches);
        $expectedCount = count($index['items']) + 1;
        if ($sitemap === '' || $blogLocCount !== $expectedCount) $issues[] = 'El sitemap no coincide con el índice Statify de Blog.';

        foreach ($index['items'] as $item) {
            $slug = self::safeSlug((string) ($item['slug'] ?? ''));
            $pagePath = $root . '/blog/' . $slug . '/index.html';
            $html = is_file($pagePath) ? (string) file_get_contents($pagePath) : '';
            if ($slug === '' || $html === '') {
                $issues[] = "Falta la página estática del artículo {$slug}.";
                continue;
            }
            foreach (['data-statify-static', '<h1', 'name="description"', 'rel="canonical"', 'application/ld+json'] as $marker) {
                if (!str_contains($html, $marker)) $issues[] = "{$slug}: falta {$marker}.";
            }
            if (preg_match('/lorem ipsum/i', $html)) $issues[] = "{$slug}: contiene Lorem ipsum.";
        }

        return $issues;
    }

    private static function normalizeItem(array $post): array
    {
        $image = $post['featuredImage']['node'] ?? [];
        $author = $post['author']['node'] ?? [];
        return [
            'id' => (string) ($post['id'] ?? ''),
            'slug' => self::safeSlug((string) ($post['slug'] ?? '')),
            'title' => self::plainText((string) ($post['title'] ?? 'Artículo de Klef Agency')),
            'excerpt' => self::description($post),
            'date' => (string) ($post['date'] ?? ''),
            'modified' => (string) ($post['modified'] ?? ''),
            'categories' => array_values(array_filter(array_map(static fn (array $category): string => self::plainText((string) ($category['name'] ?? '')), $post['categories']['nodes'] ?? []))),
            'tags' => array_values(array_filter(array_map(static fn (array $tag): string => self::plainText((string) ($tag['name'] ?? '')), $post['tags']['nodes'] ?? []))),
            'image' => (string) ($image['sourceUrl'] ?? ''),
            'image_alt' => (string) ($image['altText'] ?? ''),
            'authorSlug' => self::authorSlug($author),
            'author' => [
                'name' => self::plainText((string) ($author['name'] ?? 'Klef Agency')),
                'url' => (string) ($author['url'] ?? ''),
                'avatar' => (string) ($author['avatar']['url'] ?? ''),
            ],
        ];
    }

    private static function renderPostPage(array $post): string
    {
        $title = self::plainText((string) ($post['title'] ?? 'Artículo de Klef Agency'));
        $slug = self::safeSlug((string) ($post['slug'] ?? ''));
        $description = self::description($post);
        $canonical = self::SITE_URL . '/blog/' . rawurlencode($slug) . '/';
        $image = (string) ($post['featuredImage']['node']['sourceUrl'] ?? '');
        $categories = $post['categories']['nodes'] ?? [];
        $category = self::plainText((string) ($categories[0]['name'] ?? 'Klef'));
        $authorNode = $post['author']['node'] ?? [];
        $author = self::plainText((string) ($authorNode['name'] ?? 'Klef Agency'));
        $authorSlug = self::authorSlug($authorNode);
        $authorUrl = (string) ($authorNode['url'] ?? '');
        $authorMeta = $authorSlug !== '' ? ' data-author-slug="' . self::html($authorSlug) . '"' : '';
        $authorAvatar = (string) ($authorNode['avatar']['url'] ?? '');
        if ($authorAvatar === '' && $authorSlug === 'ivangonzalez') $authorAvatar = '/assets/images/portfolio/team/ivan-gonzalez-profile-photo-pic.jpg';
        $authorLink = '<a data-author-link href="' . self::html($authorUrl !== '' ? $authorUrl : self::SITE_URL . '/') . '" rel="author noopener"><img class="klef-blog-author-avatar" data-author-avatar src="' . self::html($authorAvatar) . '" alt="Foto de ' . self::html($author) . '" width="40" height="40" loading="lazy"><span data-author-name>' . self::html($author) . '</span></a>';
        $published = (string) ($post['date'] ?? '');
        $modified = (string) ($post['modified'] ?? $published);
        $content = self::sanitizeHtml((string) ($post['content'] ?? '<p>' . self::html($description) . '</p>'));
        $jsonLd = json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $title,
            'description' => $description,
            'url' => $canonical,
            'datePublished' => $published !== '' ? $published : null,
            'dateModified' => $modified !== '' ? $modified : null,
            'image' => $image !== '' ? [$image] : null,
            'author' => ['@type' => 'Person', 'name' => $author],
            'publisher' => ['@type' => 'Organization', 'name' => 'Klef Agency', 'url' => self::SITE_URL . '/'],
            'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonical],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $imageMeta = $image !== '' ? '<meta property="og:image" content="' . self::html($image) . '"><meta name="twitter:image" content="' . self::html($image) . '">\n' : '';
        return str_replace('\\n', "\n", (
            '<!doctype html>\n<html lang="es">\n<head>\n'
            . '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            . '<title>' . self::html($title . ' | Klef Agency') . '</title>\n'
            . '<meta name="description" content="' . self::html($description) . '">\n'
            . '<link rel="canonical" href="' . self::html($canonical) . '">\n'
            . '<meta property="og:type" content="article"><meta property="og:title" content="' . self::html($title) . '">\n'
            . '<meta property="og:description" content="' . self::html($description) . '"><meta property="og:url" content="' . self::html($canonical) . '">\n'
            . $imageMeta
            . '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' . self::html($title) . '"><meta name="twitter:description" content="' . self::html($description) . '">\n'
            . '<script type="application/ld+json">' . $jsonLd . '</script>\n'
            . '<link rel="stylesheet" href="../../assets/styles/blog.css?v=4">\n'
            . '</head>\n<body>\n'
            . '<article class="klef-blog-article" data-shell-content data-statify-static' . $authorMeta . '><nav class="klef-blog-breadcrumbs" aria-label="Breadcrumb"><a href="/">Klef Agency</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><span>' . self::html($category) . '</span></nav><p class="klef-blog-kicker">' . self::html($category) . '</p><h1>' . self::html($title) . '</h1><p class="klef-blog-article-summary">' . self::html($description) . '</p><p class="klef-blog-article-meta">Por ' . $authorLink . ($published !== '' ? ' · <time datetime="' . self::html($published) . '">' . self::html(self::formatDate($published)) . '</time>' : '') . '</p><div class="klef-blog-prose">' . $content . '</div><p class="klef-blog-back"><a href="/blog/">← Volver al blog</a></p></article>\n'
            . '<script src="../../shared/components/load-basics/load-basics.js?v=16"></script>\n<script src="../../assets/scripts/blog-page-layout.js"></script>\n<script src="../../shared/components/blog/blog-author-hydrator.js"></script>\n<script src="../../shared/components/blog/blog-article-enhancer.js"></script>\n'
            . '</body>\n</html>\n'
        ));
    }

    private static function updateIndexFallback(string $path, array $items): void
    {
        if (!is_file($path)) throw new RuntimeException('No existe blog/index.html.');
        $html = (string) file_get_contents($path);
        $featuredItem = self::featuredItem($items);
        $featuredFallback = '';
        if (is_array($featuredItem)) {
            $featuredCategory = (string) (($featuredItem['categories'] ?? [])[0] ?? 'Klef');
            $featuredDate = self::formatDate((string) ($featuredItem['date'] ?? $featuredItem['modified'] ?? ''));
            $featuredImage = (string) ($featuredItem['image'] ?? '');
            $featuredAuthor = self::renderAuthorMeta($featuredItem);
            $featuredAuthorSlug = self::html((string) ($featuredItem['authorSlug'] ?? 'ivangonzalez'));
            $featuredFallback = '<a class="klef-blog-featured" data-blog-featured data-author-slug="' . $featuredAuthorSlug . '" data-statify-static href="/blog/' . self::html((string) $featuredItem['slug']) . '/"><div class="klef-blog-featured-media">' . ($featuredImage !== '' ? '<img src="' . self::html($featuredImage) . '" alt="' . self::html((string) ($featuredItem['image_alt'] ?? $featuredItem['title'])) . '" loading="eager">' : '') . '</div><div class="klef-blog-featured-content"><div class="klef-blog-card-top"><span class="klef-blog-card-category">' . self::html($featuredCategory) . '</span><time class="klef-blog-card-date" datetime="' . self::html((string) ($featuredItem['date'] ?? '')) . '">' . self::html($featuredDate) . '</time></div><h3>' . self::html((string) $featuredItem['title']) . '</h3><p>' . self::html((string) $featuredItem['excerpt']) . '</p>' . $featuredAuthor . '<span class="klef-blog-featured-cta">Leer la nota <span aria-hidden="true">↗</span></span></div></a>';
        }
        $fallback = '';
        if ($items === []) {
            $fallback = '<div class="klef-blog-empty" data-statify-static>No hay artículos publicados todavía.</div>';
        } else {
            foreach ($items as $item) {
                if (is_array($featuredItem) && (string) ($item['slug'] ?? '') === (string) ($featuredItem['slug'] ?? '')) continue;
                $category = (string) (($item['categories'] ?? [])[0] ?? 'Klef');
                $date = self::formatDate((string) ($item['date'] ?? $item['modified'] ?? ''));
                $image = (string) ($item['image'] ?? '');
                $authorSlug = self::html((string) ($item['authorSlug'] ?? 'ivangonzalez'));
                $fallback .= '<a class="klef-blog-card" data-author-slug="' . $authorSlug . '" data-statify-static href="/blog/' . self::html((string) $item['slug']) . '/">' . ($image !== '' ? '<div class="klef-blog-card-media"><img src="' . self::html($image) . '" alt="' . self::html((string) ($item['image_alt'] ?? $item['title'])) . '" loading="lazy"></div>' : '') . '<div class="klef-blog-card-body"><div class="klef-blog-card-top"><span class="klef-blog-card-category">' . self::html($category) . '</span><time class="klef-blog-card-date" datetime="' . self::html((string) ($item['date'] ?? '')) . '">' . self::html($date) . '</time></div><h2>' . self::html((string) $item['title']) . '</h2><p>' . self::html((string) $item['excerpt']) . '</p>' . self::renderAuthorMeta($item) . '<span class="klef-blog-card-arrow" aria-hidden="true">↗</span></div></a>';
            }
        }
        $featuredPattern = '/<!-- STATIFY:FEATURED_START -->.*?<!-- STATIFY:FEATURED_END -->/s';
        $featuredReplacement = '<!-- STATIFY:FEATURED_START -->' . $featuredFallback . '<!-- STATIFY:FEATURED_END -->';
        $updated = preg_replace($featuredPattern, $featuredReplacement, $html, 1);
        $pattern = '/<!-- STATIFY:BLOG_START -->.*?<!-- STATIFY:BLOG_END -->/s';
        $replacement = '<!-- STATIFY:BLOG_START -->' . $fallback . '<!-- STATIFY:BLOG_END -->';
        $updated = is_string($updated) ? preg_replace($pattern, $replacement, $updated, 1) : null;
        if (!is_string($updated)) throw new RuntimeException('No se encontró el bloque Statify del Blog.');
        self::writeAtomically($path, $updated);
    }

    private static function updateSitemap(string $path, array $entries): void
    {
        $xml = is_file($path) ? (string) file_get_contents($path) : '';
        if ($xml === '' || !str_contains($xml, '</urlset>')) {
            $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n</urlset>\n";
        }
        $blogPattern = '~\s*<url>\s*<loc>' . preg_quote(self::SITE_URL . '/blog/', '~') . '[^<]*</loc>.*?</url>~s';
        $xml = preg_replace($blogPattern, '', $xml) ?? $xml;
        $insert = '';
        foreach ($entries as $entry) {
            $insert .= '  <url><loc>' . htmlspecialchars((string) $entry['loc'], ENT_XML1, 'UTF-8') . '</loc><lastmod>' . htmlspecialchars((string) $entry['lastmod'], ENT_XML1, 'UTF-8') . '</lastmod></url>\n';
        }
        $xml = str_replace('</urlset>', $insert . '</urlset>', $xml);
        self::writeAtomically($path, $xml);
    }

    private static function graphql(string $endpoint, string $query, array $variables = []): array
    {
        if (!function_exists('curl_init')) throw new RuntimeException('La extensión cURL de PHP es necesaria para Blog Statify.');
        $handle = curl_init($endpoint);
        curl_setopt_array($handle, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json', 'Cache-Control: no-cache, no-store', 'Pragma: no-cache'], CURLOPT_POSTFIELDS => json_encode(['query' => $query, 'variables' => $variables], JSON_UNESCAPED_SLASHES), CURLOPT_TIMEOUT => 30]);
        $body = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        $error = curl_error($handle);
        curl_close($handle);
        if ($body === false || $error !== '') throw new RuntimeException('GraphQL no respondió: ' . $error);
        if ($status < 200 || $status >= 300) throw new RuntimeException("GraphQL HTTP {$status}.");
        $payload = json_decode((string) $body, true);
        if (!is_array($payload)) throw new RuntimeException('GraphQL devolvió JSON inválido.');
        if (!empty($payload['errors'])) throw new RuntimeException((string) ($payload['errors'][0]['message'] ?? 'Error GraphQL.'));
        return $payload;
    }

    /**
     * WPGraphQL exposes individual Blog posts correctly on this installation,
     * but its public posts connection can omit the Blog category. Use the
     * native REST index as a discovery bridge, then keep GraphQL as the source
     * for each article's full content and metadata.
     */
    private static function mergeRestBlogPosts(array $graphqlNodes): array
    {
        try {
            $categoryPayload = self::restJson(self::REST_ENDPOINT . '/categories?slug=blog&per_page=1&_fields=id');
            $category = $categoryPayload[0] ?? null;
            $categoryId = is_array($category) ? (int) ($category['id'] ?? 0) : 0;
            if ($categoryId <= 0) return $graphqlNodes;

            $restPayload = self::restJson(
                self::REST_ENDPOINT . '/posts?categories=' . rawurlencode((string) $categoryId) . '&per_page=100&orderby=date&order=desc&_fields=slug'
            );
            if (!is_array($restPayload)) return $graphqlNodes;

            $merged = [];
            $seen = [];
            foreach (array_merge($graphqlNodes, $restPayload) as $node) {
                if (!is_array($node)) continue;
                $slug = self::safeSlug((string) ($node['slug'] ?? ''));
                if ($slug === '' || isset($seen[$slug])) continue;
                $seen[$slug] = true;
                $merged[] = $node;
            }
            return $merged;
        } catch (Throwable $error) {
            if ($graphqlNodes !== []) return $graphqlNodes;
            throw new RuntimeException('No se pudo descubrir el índice de Blog por GraphQL ni REST: ' . $error->getMessage(), 0, $error);
        }
    }

    private static function readLocalItems(string $root): array
    {
        $path = $root . '/data/blog/local-index.json';
        if (!is_file($path)) return [];

        $payload = json_decode((string) file_get_contents($path), true);
        $items = is_array($payload['items'] ?? null) ? $payload['items'] : [];
        $normalized = [];
        $seen = [];
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $slug = self::safeSlug((string) ($item['slug'] ?? ''));
            if ($slug === '' || isset($seen[$slug])) continue;
            $seen[$slug] = true;
            $item['slug'] = $slug;
            $item['source'] = (string) ($item['source'] ?? 'sonatta');
            $item['authorSlug'] = (string) ($item['authorSlug'] ?? '');
            $item['categories'] = is_array($item['categories'] ?? null) ? array_values($item['categories']) : [];
            $item['tags'] = is_array($item['tags'] ?? null) ? array_values($item['tags']) : [];
            $normalized[] = $item;
        }
        return $normalized;
    }

    private static function featuredItem(array $items): ?array
    {
        foreach ($items as $item) {
            if (is_array($item) && !empty($item['featured'])) return $item;
        }
        return is_array($items[0] ?? null) ? $items[0] : null;
    }

    private static function renderAuthorMeta(array $item): string
    {
        $author = is_array($item['author'] ?? null) ? $item['author'] : [];
        $slug = self::safeSlug((string) ($item['authorSlug'] ?? '')) !== ''
            ? self::safeSlug((string) $item['authorSlug'])
            : 'ivangonzalez';
        $name = self::plainText((string) ($author['name'] ?? $item['authorName'] ?? 'Iván González'));
        if ($name === '') $name = 'Iván González';
        $avatar = (string) ($author['avatar'] ?? $item['authorAvatar'] ?? '');
        if ($avatar === '' && $slug === 'ivangonzalez') $avatar = '/assets/images/portfolio/team/ivan-gonzalez-profile-photo-pic.jpg';
        return '<span class="klef-blog-author"><img class="klef-blog-author-avatar" data-author-avatar src="' . self::html($avatar) . '" alt="Foto de ' . self::html($name) . '" width="40" height="40" loading="lazy"><span class="klef-blog-author-copy"><span class="klef-blog-author-label">Escrito por</span><span class="klef-blog-author-name" data-author-name>' . self::html($name) . '</span></span></span>';
    }

    private static function restJson(string $url): array
    {
        if (!function_exists('curl_init')) throw new RuntimeException('La extensión cURL de PHP es necesaria para Blog Statify.');
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_HTTPGET => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json', 'Cache-Control: no-cache, no-store', 'Pragma: no-cache', 'User-Agent: Klef-Blog-Statify'],
            CURLOPT_TIMEOUT => 30,
        ]);
        $body = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        $error = curl_error($handle);
        curl_close($handle);
        if ($body === false || $error !== '') throw new RuntimeException('REST no respondió: ' . $error);
        if ($status < 200 || $status >= 300) throw new RuntimeException("REST HTTP {$status}.");
        $payload = json_decode((string) $body, true);
        if (!is_array($payload)) throw new RuntimeException('REST devolvió JSON inválido.');
        return $payload;
    }

    private static function description(array $post): string
    {
        $text = self::plainText((string) ($post['excerpt'] ?? ''));
        if ($text === '') $text = self::plainText((string) ($post['content'] ?? ''));
        if ($text === '') $text = self::plainText((string) ($post['title'] ?? 'Artículo de Klef Agency')) . ' — artículo de Klef Agency.';
        return strlen($text) > 160 ? rtrim(substr($text, 0, 157)) . '...' : $text;
    }

    private static function plainText(string $value): string
    {
        $value = strip_tags($value);
        $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = preg_replace('/^\s*-#\s*[^\s]+\s*/iu', '', $value) ?? $value;
        $value = preg_replace('/(^|\s)-#\s*/u', '$1', $value) ?? $value;
        return trim((string) preg_replace('/\s+/u', ' ', $value));
    }

    private static function sanitizeHtml(string $html): string
    {
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $html) ?? '';
        $html = preg_replace('/\son\w+\s*=\s*(["\']).*?\1/is', '', $html) ?? $html;
        $html = preg_replace('/\s(?:href|src)\s*=\s*(["\'])\s*(?:javascript:|data:).*?\1/i', '', $html) ?? $html;
        $html = preg_replace('/(<p\b[^>]*>)\s*-#\s*[^\s]+\s*/iu', '$1', $html) ?? $html;
        $html = preg_replace('/(^|>|\s)-#\s*/u', '$1', $html) ?? $html;
        return strip_tags($html, '<p><br><strong><em><h2><h3><h4><ul><ol><li><a><img><figure><figcaption><blockquote><video><source>');
    }

    private static function formatDate(string $value): string
    {
        if ($value === '') return '';
        $timestamp = strtotime($value);
        return $timestamp === false ? '' : date('j M Y', $timestamp);
    }

    private static function sitemapLastmod(string $value, string $fallback): string
    {
        $timestamp = $value !== '' ? strtotime($value) : false;
        return $timestamp === false ? $fallback : gmdate('c', $timestamp);
    }

    private static function html(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function safeSlug(string $slug): string
    {
        return preg_match('/^[a-z0-9][a-z0-9-]{1,120}$/', $slug) === 1 ? $slug : '';
    }

    private static function authorSlug(array $author): string
    {
        foreach ([(string) ($author['uri'] ?? ''), (string) ($author['url'] ?? '')] as $value) {
            if ($value === '') continue;
            $path = parse_url($value, PHP_URL_PATH);
            $parts = array_values(array_filter(explode('/', trim((string) $path, '/'))));
            $candidate = $parts !== [] ? strtolower(rawurldecode((string) end($parts))) : '';
            $slug = self::safeSlug($candidate);
            if ($slug !== '') return $slug;
        }
        return '';
    }

    private static function ensureDirectory(string $directory): void
    {
        if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) throw new RuntimeException("No se pudo crear {$directory}.");
    }

    private static function writeJson(string $path, array $payload): void
    {
        self::writeAtomically($path, (string) json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n");
    }

    private static function writeAtomically(string $path, string $contents): void
    {
        self::ensureDirectory(dirname($path));
        $temporary = $path . '.tmp-' . bin2hex(random_bytes(6));
        if (file_put_contents($temporary, $contents, LOCK_EX) === false || !rename($temporary, $path)) {
            @unlink($temporary);
            throw new RuntimeException("No se pudo escribir {$path}.");
        }
    }
}

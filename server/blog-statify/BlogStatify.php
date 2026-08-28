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
    author { node { name firstName lastName url avatar { url } } }
  }
}
GRAPHQL;

    public static function build(string $root, string $endpoint = self::GRAPHQL_ENDPOINT): void
    {
        $list = self::graphql($endpoint, self::LIST_QUERY);
        $nodes = $list['data']['posts']['nodes'] ?? [];
        if (!is_array($nodes)) $nodes = [];
        $nodes = self::mergeRestBlogPosts($nodes);

        $generatedAt = gmdate('c');
        $outputDir = $root . '/data/blog';
        self::ensureDirectory($outputDir);
        $manifestPath = $outputDir . '/.statify-manifest.json';
        $previousManifest = is_file($manifestPath)
            ? json_decode((string) file_get_contents($manifestPath), true)
            : [];
        $previousSlugs = is_array($previousManifest['slugs'] ?? null) ? $previousManifest['slugs'] : [];

        $items = [];
        $slugs = [];
        $sitemapEntries = [['loc' => self::SITE_URL . '/blog/', 'lastmod' => $generatedAt]];

        foreach ($nodes as $node) {
            if (!is_array($node)) continue;
            $slug = self::safeSlug((string) ($node['slug'] ?? ''));
            if ($slug === '') continue;

            $detail = self::graphql($endpoint, self::DETAIL_QUERY, ['slug' => $slug]);
            $post = $detail['data']['post'] ?? null;
            if (!is_array($post)) throw new RuntimeException("No se encontró el artículo {$slug}.");

            $item = self::normalizeItem($post);
            $items[] = $item;
            $slugs[] = $slug;
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

        foreach (array_diff($previousSlugs, $slugs) as $staleSlug) {
            $staleSlug = self::safeSlug((string) $staleSlug);
            if ($staleSlug === '') continue;
            @unlink($root . '/blog/' . $staleSlug . '/index.html');
            @unlink($outputDir . '/' . $staleSlug . '.json');
        }

        self::writeJson($outputDir . '/index.json', [
            'version' => 1,
            'generatedAt' => $generatedAt,
            'source' => $endpoint,
            'items' => $items,
        ]);
        self::writeJson($manifestPath, ['slugs' => $slugs, 'generatedAt' => $generatedAt]);
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
        $author = self::plainText((string) ($post['author']['node']['name'] ?? 'Klef Agency'));
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
            . '<link rel="stylesheet" href="../../assets/styles/blog.css">\n'
            . '</head>\n<body>\n'
            . '<article class="klef-blog-article" data-shell-content data-statify-static><nav class="klef-blog-breadcrumbs" aria-label="Breadcrumb"><a href="/">Klef Agency</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><span>' . self::html($category) . '</span></nav><p class="klef-blog-kicker">' . self::html($category) . '</p><h1>' . self::html($title) . '</h1><p class="klef-blog-article-summary">' . self::html($description) . '</p><p class="klef-blog-article-meta"><span>Por ' . self::html($author) . '</span>' . ($published !== '' ? ' · <time datetime="' . self::html($published) . '">' . self::html(self::formatDate($published)) . '</time>' : '') . '</p><div class="klef-blog-prose">' . $content . '</div><p class="klef-blog-back"><a href="/blog/">← Volver al blog</a></p></article>\n'
            . '<script src="../../shared/components/load-basics/load-basics.js?v=3"></script>\n<script src="../../assets/scripts/blog-page-layout.js"></script>\n'
            . '</body>\n</html>\n'
        ));
    }

    private static function updateIndexFallback(string $path, array $items): void
    {
        if (!is_file($path)) throw new RuntimeException('No existe blog/index.html.');
        $html = (string) file_get_contents($path);
        $fallback = '';
        if ($items === []) {
            $fallback = '<div class="klef-blog-empty" data-statify-static>No hay artículos publicados todavía.</div>';
        } else {
            foreach ($items as $item) {
                $category = (string) (($item['categories'] ?? [])[0] ?? 'Klef');
                $date = self::formatDate((string) ($item['date'] ?? $item['modified'] ?? ''));
                $fallback .= '<a class="klef-blog-card" data-statify-static href="/blog/' . self::html((string) $item['slug']) . '/"><div class="klef-blog-card-top"><span class="klef-blog-card-category">' . self::html($category) . '</span><time class="klef-blog-card-date" datetime="' . self::html((string) ($item['date'] ?? '')) . '">' . self::html($date) . '</time></div><h2>' . self::html((string) $item['title']) . '</h2><p>' . self::html((string) $item['excerpt']) . '</p><span class="klef-blog-card-arrow" aria-hidden="true">↗</span></a>';
            }
        }
        $pattern = '/<!-- STATIFY:BLOG_START -->.*?<!-- STATIFY:BLOG_END -->/s';
        $replacement = '<!-- STATIFY:BLOG_START -->' . $fallback . '<!-- STATIFY:BLOG_END -->';
        $updated = preg_replace($pattern, $replacement, $html, 1);
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

<?php

declare(strict_types=1);

final class PortfolioStatify
{
    public const GRAPHQL_ENDPOINT = 'https://klef.newfacecards.com/graphql';
    public const SITE_URL = 'https://klef.agency';

    /**
     * Static local-service pages are part of the SEO surface, but are not
     * managed by WordPress portfolio content. Keep them in the same sitemap
     * so every Statify deployment publishes one coherent URL inventory.
     */
    private const SERVICE_PAGES = [
        '/servicios/',
        '/servicios/marketing-digital-los-cabos/',
        '/servicios/branding-los-cabos/',
        '/servicios/diseno-web-los-cabos/',
        '/servicios/desarrollo-web-los-cabos/',
        '/contacto/',
    ];

    private const LIST_QUERY = <<<'GRAPHQL'
query GetPortfolioCards {
  posts(first: 20, where: { categoryName: "Portfolio" }) {
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
      author { node { name } }
    }
  }
}
GRAPHQL;

    private const DETAIL_QUERY = <<<'GRAPHQL'
query GetPortfolioItem($slug: ID!) {
  post(id: $slug, idType: SLUG) {
    id
    title
    slug
    uri
    date
    content(format: RENDERED)
    excerpt
    featuredImage { node { sourceUrl altText mediaDetails { width height } } }
    portfolioImages { id sourceUrl(size: LARGE) altText mediaItemUrl }
    categories { nodes { categoryId name slug uri } }
    tags { nodes { tagId name slug } }
    author { node { id name firstName lastName uri url avatar { url } } }
    coAuthors {
      __typename
      ... on User { id name firstName lastName uri url userId rolesList avatar { url } description }
      ... on GuestAuthor { id name firstName lastName avatar { url } description website }
    }
  }
}
GRAPHQL;

    public static function build(string $root, string $endpoint = self::GRAPHQL_ENDPOINT): void
    {
        $list = self::graphql($endpoint, self::LIST_QUERY);
        $nodes = $list['data']['posts']['nodes'] ?? [];
        if (!is_array($nodes) || $nodes === []) {
            throw new RuntimeException('GraphQL devolvió cero proyectos de Portfolio.');
        }
        $excludedSlugs = self::excludedSlugs();
        $nodes = array_values(array_filter($nodes, static function (mixed $node) use ($excludedSlugs): bool {
            return is_array($node) && !in_array(self::safeSlug((string) ($node['slug'] ?? '')), $excludedSlugs, true);
        }));
        if ($nodes === []) {
            throw new RuntimeException('Todos los proyectos de Portfolio están temporalmente excluidos.');
        }

        $generatedAt = gmdate('c');
        $outputDir = $root . '/data/portfolio';
        self::ensureDirectory($outputDir);
        $previousManifestPath = $outputDir . '/.statify-manifest.json';
        $previousManifest = is_file($previousManifestPath)
            ? json_decode((string) file_get_contents($previousManifestPath), true)
            : [];
        $previousSlugs = is_array($previousManifest['slugs'] ?? null) ? $previousManifest['slugs'] : [];

        $cards = array_map(static fn (array $node): array => self::normalizeCard($node), $nodes);
        self::writeJson($outputDir . '/index.json', [
            'version' => 1,
            'generatedAt' => $generatedAt,
            'source' => $endpoint,
            'items' => $cards,
        ]);

        $sitemapUrls = [
            ['loc' => self::SITE_URL . '/', 'lastmod' => $generatedAt],
            ['loc' => self::SITE_URL . '/portfolio/', 'lastmod' => $generatedAt],
        ];
        foreach (self::SERVICE_PAGES as $servicePath) {
            $sitemapUrls[] = ['loc' => self::SITE_URL . $servicePath, 'lastmod' => $generatedAt];
        }
        $slugs = [];
        foreach ($nodes as $node) {
            $slug = self::safeSlug((string) ($node['slug'] ?? ''));
            if ($slug === '') continue;
            $slugs[] = $slug;
            $detail = self::graphql($endpoint, self::DETAIL_QUERY, ['slug' => $slug]);
            $post = $detail['data']['post'] ?? null;
            if (!is_array($post)) {
                throw new RuntimeException("No se encontró el proyecto {$slug}.");
            }
            self::writeJson($outputDir . '/' . $slug . '.json', [
                'version' => 1,
                'generatedAt' => $generatedAt,
                'source' => $endpoint,
                'data' => $post,
            ]);
            self::writeAtomically($root . '/portfolio/' . $slug . '/index.html', self::renderProjectPage($post));
            $sitemapUrls[] = [
                'loc' => self::SITE_URL . '/portfolio/' . rawurlencode($slug) . '/',
                'lastmod' => self::sitemapLastmod(
                    (string) ($node['modified'] ?? $node['date'] ?? ''),
                    $generatedAt,
                ),
            ];
        }

        foreach (array_diff($previousSlugs, $slugs) as $staleSlug) {
            $staleSlug = self::safeSlug((string) $staleSlug);
            if ($staleSlug === '') continue;
            @unlink($root . '/portfolio/' . $staleSlug . '/index.html');
            @unlink($outputDir . '/' . $staleSlug . '.json');
        }

        self::writeJson($outputDir . '/.statify-manifest.json', ['slugs' => $slugs, 'generatedAt' => $generatedAt]);

        self::writeAtomically($root . '/sitemap.xml', self::renderSitemap($sitemapUrls));
        self::updateIndexFallback($root . '/portfolio/index.html', $cards);
        echo sprintf("Statify PHP: publicados %d proyectos\n", count($nodes));
    }

    public static function validate(string $root): array
    {
        $issues = [];
        $indexPath = $root . '/data/portfolio/index.json';
        $index = is_file($indexPath) ? json_decode((string) file_get_contents($indexPath), true) : null;
        if (!is_array($index) || !is_array($index['items'] ?? null)) {
            return ['Falta un índice Statify válido.'];
        }

        $portfolioIndex = is_file($root . '/portfolio/index.html') ? (string) file_get_contents($root . '/portfolio/index.html') : '';
        if ($portfolioIndex === '' || !str_contains($portfolioIndex, 'STATIFY:INDEX_START') || !str_contains($portfolioIndex, 'data-statify-static')) {
            $issues[] = 'El índice de Portfolio no contiene el fallback HTML de Statify.';
        }

        $sitemap = is_file($root . '/sitemap.xml') ? (string) file_get_contents($root . '/sitemap.xml') : '';
        $expectedUrlCount = count($index['items']) + 2 + count(self::SERVICE_PAGES);
        if ($sitemap === '' || substr_count($sitemap, '<loc>') !== $expectedUrlCount) {
            $issues[] = 'El sitemap no coincide con el índice Statify.';
        }
        if ($sitemap !== '' && substr_count($sitemap, '<lastmod>') !== substr_count($sitemap, '<loc>')) {
            $issues[] = 'El sitemap no contiene lastmod para todas sus URLs.';
        }

        foreach ($index['items'] as $item) {
            $slug = self::safeSlug((string) ($item['slug'] ?? ''));
            $pagePath = $root . '/portfolio/' . $slug . '/index.html';
            $html = is_file($pagePath) ? (string) file_get_contents($pagePath) : '';
            if ($slug === '' || $html === '') {
                $issues[] = "Falta la página estática de {$slug}.";
                continue;
            }
            foreach (['data-statify-static', '<h1', 'name="description"', 'rel="canonical"'] as $marker) {
                if (!str_contains($html, $marker)) {
                    $issues[] = "{$slug}: falta {$marker}.";
                }
            }
            if (preg_match('/lorem ipsum/i', $html)) {
                $issues[] = "{$slug}: contiene Lorem ipsum.";
            }
        }

        foreach (self::SERVICE_PAGES as $servicePath) {
            $relativePath = trim($servicePath, '/') . '/index.html';
            $serviceHtml = is_file($root . '/' . $relativePath)
                ? (string) file_get_contents($root . '/' . $relativePath)
                : '';
            if ($serviceHtml === '') {
                $issues[] = "Falta la página estática de servicio {$servicePath}.";
                continue;
            }
            foreach (['<h1', 'name="description"', 'rel="canonical"', 'application/ld+json'] as $marker) {
                if (!str_contains($serviceHtml, $marker)) {
                    $issues[] = "{$servicePath}: falta {$marker}.";
                }
            }
            if (preg_match('/lorem ipsum/i', $serviceHtml)) {
                $issues[] = "{$servicePath}: contiene Lorem ipsum.";
            }
        }

        return $issues;
    }

    private static function graphql(string $endpoint, string $query, array $variables = []): array
    {
        if (!function_exists('curl_init')) {
            throw new RuntimeException('La extensión cURL de PHP es necesaria para Statify.');
        }
        $handle = curl_init($endpoint);
        curl_setopt_array($handle, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_POSTFIELDS => json_encode(['query' => $query, 'variables' => $variables], JSON_UNESCAPED_SLASHES),
            CURLOPT_TIMEOUT => 30,
        ]);
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

    private static function normalizeCard(array $node): array
    {
        $discipline = self::inferDiscipline($node);
        $image = $node['featuredImage']['node'] ?? [];
        return [
            'id' => (string) ($node['id'] ?? ''),
            'slug' => self::safeSlug((string) ($node['slug'] ?? '')),
            'discipline' => $discipline,
            'category' => array_values(array_map(static fn (array $category): string => (string) ($category['name'] ?? ''), $node['categories']['nodes'] ?? [])),
            'content_type' => 'Portfolio',
            'title' => self::parseTitle((string) ($node['title'] ?? ''), $discipline),
            'client_name' => 'Klef Agency',
            'client_industry' => 'Agencia de Marketing Digital',
            'extract' => self::plainText((string) ($node['excerpt'] ?? $node['title'] ?? '')),
            'cover_image' => (string) ($image['sourceUrl'] ?? ''),
            'logo' => (string) ($image['sourceUrl'] ?? ''),
            'project_url' => null,
            'image_alt' => (string) ($image['altText'] ?? $node['title'] ?? 'Proyecto de Klef Agency'),
        ];
    }

    private static function inferDiscipline(array $node): string
    {
        $names = array_map(static fn (array $category): string => strtolower((string) ($category['name'] ?? '')), $node['categories']['nodes'] ?? []);
        if (self::containsAny($names, ['brand', 'diseño'])) return 'brands';
        if (self::containsAny($names, ['web', 'desarrollo', 'dev'])) return 'dev';
        if (self::containsAny($names, ['studio', 'multimedia', 'video'])) return 'studio';
        if (self::containsAny($names, ['marketing', 'strategy', 'estrategia'])) return 'strategy';
        return 'brands';
    }

    private static function containsAny(array $values, array $needles): bool
    {
        foreach ($values as $value) foreach ($needles as $needle) if (str_contains($value, $needle)) return true;
        return false;
    }

    private static function parseTitle(string $title, string $discipline): array
    {
        if ($title === '') return ['Sin título', $discipline];
        if (!str_contains($title, '|')) return [$title, $discipline];
        $parts = array_map('trim', explode('|', $title));
        return [$parts[0], trim(implode(' | ', array_slice($parts, 1))) ?: $discipline];
    }

    private static function renderProjectPage(array $post): string
    {
        $title = self::plainText((string) ($post['title'] ?? 'Proyecto de Klef Agency'));
        $slug = self::safeSlug((string) ($post['slug'] ?? ''));
        $description = self::description($post);
        $canonical = self::SITE_URL . '/portfolio/' . rawurlencode($slug) . '/';
        $image = (string) ($post['featuredImage']['node']['sourceUrl'] ?? '');
        $categories = $post['categories']['nodes'] ?? [];
        $category = self::plainText((string) ($categories[0]['name'] ?? 'Portfolio'));
        $content = self::sanitizeHtml((string) ($post['content'] ?? '<p>' . htmlspecialchars($description, ENT_QUOTES, 'UTF-8') . '</p>'));
        $jsonLd = json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'CreativeWork',
            'name' => $title,
            'description' => $description,
            'url' => $canonical,
            'image' => $image !== '' ? $image : null,
            'creator' => ['@type' => 'Organization', 'name' => 'Klef Agency', 'url' => self::SITE_URL . '/'],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        return str_replace('\\n', "\n", (
            '<!doctype html>\n<html lang="es">\n<head>\n'
            . '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            . '<title>' . self::html($title . ' | Klef Agency') . '</title>\n'
            . '<meta name="description" content="' . self::html($description) . '">\n'
            . '<link rel="canonical" href="' . self::html($canonical) . '">\n'
            . '<meta property="og:type" content="article"><meta property="og:title" content="' . self::html($title) . '">\n'
            . '<meta property="og:description" content="' . self::html($description) . '"><meta property="og:url" content="' . self::html($canonical) . '">\n'
            . ($image !== '' ? '<meta property="og:image" content="' . self::html($image) . '">\n' : '')
            . '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' . self::html($title) . '"><meta name="twitter:description" content="' . self::html($description) . '">\n'
            . ($image !== '' ? '<meta name="twitter:image" content="' . self::html($image) . '">\n' : '')
            . '<script type="application/ld+json">' . $jsonLd . '</script>\n'
            . '<style>.statify-static-content{max-width:960px;margin:0 auto;padding:7rem 1.25rem 5rem;font-family:system-ui,sans-serif;line-height:1.7;color:#202124}.statify-static-content h1{font-size:clamp(2.25rem,6vw,5rem);line-height:1.05;margin:.5rem 0 1rem}.statify-static-content .statify-category{color:#64748b;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.statify-static-content .statify-summary{font-size:1.2rem;color:#596579;max-width:700px}.statify-static-content img{max-width:100%;height:auto}.statify-static-content a{color:inherit}</style>\n'
            . '</head>\n<body>\n'
            . '<article class="statify-static-content" data-statify-static><p class="statify-category">' . self::html($category) . '</p><h1>' . self::html($title) . '</h1><p class="statify-summary">' . self::html($description) . '</p><div class="statify-prose">' . $content . '</div></article>\n'
            . '<script src="../../shared/components/load-basics/load-basics.js?v=3"></script>\n<script src="../../shared/components/portfolio/portfolio-loader.js"></script>\n'
            . '</body>\n</html>\n'));
    }

    private static function updateIndexFallback(string $path, array $cards): void
    {
        if (!is_file($path)) throw new RuntimeException('No existe portfolio/index.html.');
        $html = (string) file_get_contents($path);
        $fallback = '<section class="statify-static-catalog" data-statify-static><h1>Portafolio de Klef Agency</h1><p>Proyectos de estrategia, branding, producto digital y desarrollo.</p><p><a href="/servicios/">Conoce nuestros servicios de estrategia, branding y desarrollo web en Los Cabos.</a></p><ul>';
        foreach ($cards as $card) {
            $fallback .= '<li><a href="./' . self::html((string) $card['slug']) . '/">' . self::html(implode(' | ', $card['title'])) . '</a><p>' . self::html((string) $card['extract']) . '</p></li>';
        }
        $fallback .= '</ul></section>';
        $pattern = '/<!-- STATIFY:INDEX_START -->.*?<!-- STATIFY:INDEX_END -->/s';
        $replacement = '<!-- STATIFY:INDEX_START -->' . $fallback . '<!-- STATIFY:INDEX_END -->';
        $updated = preg_replace($pattern, $replacement, $html, 1);
        if (!is_string($updated)) throw new RuntimeException('No se encontró el bloque Statify del índice.');
        self::writeAtomically($path, $updated);
    }

    private static function sitemapLastmod(string $value, string $fallback): string
    {
        $timestamp = $value !== '' ? strtotime($value) : false;
        return $timestamp === false ? $fallback : gmdate('c', $timestamp);
    }

    private static function renderSitemap(array $urls): string
    {
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
        foreach ($urls as $entry) {
            $url = (string) ($entry['loc'] ?? '');
            $lastmod = (string) ($entry['lastmod'] ?? '');
            $xml .= "  <url><loc>" . htmlspecialchars($url, ENT_XML1, 'UTF-8') . "</loc>";
            if ($lastmod !== '') $xml .= '<lastmod>' . htmlspecialchars($lastmod, ENT_XML1, 'UTF-8') . '</lastmod>';
            $xml .= "</url>\n";
        }
        return $xml . "</urlset>\n";
    }

    private static function description(array $post): string
    {
        $text = self::plainText((string) ($post['excerpt'] ?? ''));
        if ($text === '') $text = self::plainText((string) ($post['content'] ?? ''));
        if ($text === '') $text = self::plainText((string) ($post['title'] ?? 'Proyecto de Klef Agency')) . ' — caso de estudio de Klef Agency.';
        return strlen($text) > 160 ? rtrim(substr($text, 0, 157)) . '...' : $text;
    }

    private static function plainText(string $value): string
    {
        $value = strip_tags($value);
        $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        // WordPress can concatenate the first section marker with the auto-excerpt.
        // Remove the marker and its label so cards never expose the editorial syntax.
        $value = preg_replace('/^\s*-#\s*(?:proyecto|construcción|construccion|resultados|recursos)\b\s*/iu', '', $value) ?? $value;
        $value = preg_replace('/(^|\s)-#\s*/u', '$1', $value) ?? $value;
        return trim((string) preg_replace('/\s+/u', ' ', $value));
    }

    private static function sanitizeHtml(string $html): string
    {
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $html) ?? '';
        $html = preg_replace('/\son\w+\s*=\s*(["\']).*?\1/is', '', $html) ?? $html;
        $html = preg_replace('/\s(?:href|src)\s*=\s*(["\'])\s*(?:javascript:|data:).*?\1/i', '', $html) ?? $html;
        $html = preg_replace('/(<p\b[^>]*>)\s*-#\s*(?:proyecto|construcción|construccion|resultados|recursos)\b\s*/iu', '$1', $html) ?? $html;
        $html = preg_replace('/(^|>|\s)-#\s*/u', '$1', $html) ?? $html;
        return strip_tags($html, '<p><br><strong><em><h2><h3><h4><ul><ol><li><a><img><figure><figcaption><blockquote><video><source>');
    }

    private static function html(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function safeSlug(string $slug): string
    {
        return preg_match('/^[a-z0-9][a-z0-9-]{1,120}$/', $slug) === 1 ? $slug : '';
    }

    private static function excludedSlugs(): array
    {
        $raw = getenv('PORTFOLIO_STATIFY_EXCLUDED_SLUGS') ?: '';
        return array_values(array_filter(array_map(
            static fn (string $slug): string => self::safeSlug(trim($slug)),
            explode(',', $raw),
        )));
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

<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$pages = [
    'blog/index.html' => 'klef-blog-page',
    'servicios/index.html' => 'klef-local-page',
    'contacto/index.html' => 'klef-contact-page',
];
$issues = [];

$loader = (string) @file_get_contents($root . '/shared/components/load-basics/load-basics.js');
if ($loader === '' || !str_contains($loader, 'function placeShellContent') || !str_contains($loader, 'placeShellContent();')) {
    $issues[] = 'load-basics.js no contiene el montaje central del contenido dentro de body > main.';
}

foreach ($pages as $relativePath => $className) {
    $path = $root . '/' . $relativePath;
    $html = is_file($path) ? (string) file_get_contents($path) : '';
    if ($html === '') {
        $issues[] = "Falta la página shell {$relativePath}.";
        continue;
    }
    if (!str_contains($html, 'data-shell-content') || !str_contains($html, 'class="' . $className . '"')) {
        $issues[] = "{$relativePath} debe marcar su contenido con data-shell-content.";
    }
    if (!str_contains($html, 'load-basics.js')) {
        $issues[] = "{$relativePath} no carga load-basics.js.";
    }
}

if ($issues !== []) {
    fwrite(STDERR, implode(PHP_EOL, $issues) . PHP_EOL);
    exit(1);
}

echo "Shell placement: OK (" . count($pages) . " páginas verificadas)" . PHP_EOL;

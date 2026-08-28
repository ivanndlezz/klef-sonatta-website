<?php

declare(strict_types=1);

require __DIR__ . '/BlogStatify.php';

$root = dirname(__DIR__, 2);
$endpoint = getenv('BLOG_GRAPHQL_ENDPOINT') ?: BlogStatify::GRAPHQL_ENDPOINT;

try {
    BlogStatify::build($root, $endpoint);
} catch (Throwable $error) {
    fwrite(STDERR, 'Blog Statify PHP: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}

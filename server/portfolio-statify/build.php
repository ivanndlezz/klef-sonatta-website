<?php

declare(strict_types=1);

require __DIR__ . '/PortfolioStatify.php';

$root = dirname(__DIR__, 2);
$endpoint = getenv('PORTFOLIO_GRAPHQL_ENDPOINT') ?: PortfolioStatify::GRAPHQL_ENDPOINT;

try {
    PortfolioStatify::build($root, $endpoint);
} catch (Throwable $error) {
    fwrite(STDERR, 'Statify PHP: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}

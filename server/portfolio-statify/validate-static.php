<?php

declare(strict_types=1);

require __DIR__ . '/PortfolioStatify.php';

$root = dirname(__DIR__, 2);
$issues = PortfolioStatify::validate($root);
if ($issues !== []) {
    fwrite(STDERR, "Validación HTML estática fallida:\n- " . implode("\n- ", $issues) . PHP_EOL);
    exit(1);
}
echo "Validación HTML estática: OK\n";

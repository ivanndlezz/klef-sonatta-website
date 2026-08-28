<?php

declare(strict_types=1);

require __DIR__ . '/BlogStatify.php';

$root = dirname(__DIR__, 2);
$issues = BlogStatify::validate($root);
if ($issues !== []) {
    fwrite(STDERR, "Validación HTML estática de Blog fallida:\n- " . implode("\n- ", $issues) . PHP_EOL);
    exit(1);
}
echo "Validación HTML estática de Blog: OK\n";

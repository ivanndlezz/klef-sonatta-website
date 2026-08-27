<?php
/**
 * Plugin Name: Klef Portfolio Statify Trigger
 * Description: Solicita una compilación de GitHub cuando se publica un proyecto del portafolio y administra la rotación de tokens.
 * Version: 0.2.0
 */

declare(strict_types=1);

if (!defined('ABSPATH')) exit;

const KLEF_STATIFY_CURRENT_TOKEN_OPTION = 'klef_statify_current_token';
const KLEF_STATIFY_CURRENT_EXPIRY_OPTION = 'klef_statify_current_expiry';
const KLEF_STATIFY_NEXT_TOKEN_OPTION = 'klef_statify_next_token';
const KLEF_STATIFY_NEXT_EXPIRY_OPTION = 'klef_statify_next_expiry';
const KLEF_STATIFY_LAST_NOTICE_OPTION = 'klef_statify_last_token_notice';
const KLEF_STATIFY_ROTATION_NOTICE_DAYS = 180;

function klef_statify_repository(): string
{
    return defined('KLEF_STATIFY_GITHUB_REPOSITORY') ? trim((string) KLEF_STATIFY_GITHUB_REPOSITORY) : '';
}

function klef_statify_repository_path(): string
{
    if (preg_match('/^([^\/]+)\/([^\/]+)$/', klef_statify_repository(), $parts) !== 1) return '';
    return rawurlencode($parts[1]) . '/' . rawurlencode($parts[2]);
}

function klef_statify_encryption_key(): string
{
    $authKey = defined('AUTH_KEY') ? (string) AUTH_KEY : '';
    $secureAuthKey = defined('SECURE_AUTH_KEY') ? (string) SECURE_AUTH_KEY : '';
    if ($authKey === '' || $secureAuthKey === '') return '';
    return hash('sha256', $authKey . $secureAuthKey, true);
}

function klef_statify_encrypt(string $value): string
{
    $key = klef_statify_encryption_key();
    if ($key === '' || !function_exists('openssl_encrypt')) return '';
    $iv = random_bytes(16);
    $tag = '';
    $ciphertext = openssl_encrypt($value, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    return $ciphertext === false ? '' : base64_encode($iv . $tag . $ciphertext);
}

function klef_statify_decrypt(string $value): string
{
    $key = klef_statify_encryption_key();
    $decoded = base64_decode($value, true);
    if ($key === '' || $decoded === false || strlen($decoded) <= 32 || !function_exists('openssl_decrypt')) return '';
    $plaintext = openssl_decrypt(substr($decoded, 32), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, substr($decoded, 0, 16), substr($decoded, 16, 16));
    return $plaintext === false ? '' : (string) $plaintext;
}

function klef_statify_expiry_timestamp(string $date): int
{
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date, new DateTimeZone('UTC'));
    $errors = DateTimeImmutable::getLastErrors();
    if (!$parsed || (is_array($errors) && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) return 0;
    return $parsed->getTimestamp();
}

function klef_statify_valid_expiry(string $date): bool
{
    return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1 && klef_statify_expiry_timestamp($date) > 0;
}

function klef_statify_slot(string $slot): array
{
    $tokenOption = $slot === 'next' ? KLEF_STATIFY_NEXT_TOKEN_OPTION : KLEF_STATIFY_CURRENT_TOKEN_OPTION;
    $expiryOption = $slot === 'next' ? KLEF_STATIFY_NEXT_EXPIRY_OPTION : KLEF_STATIFY_CURRENT_EXPIRY_OPTION;
    $encrypted = (string) get_option($tokenOption, '');
    $token = $encrypted !== '' ? klef_statify_decrypt($encrypted) : '';
    if ($slot === 'current' && $token === '' && defined('KLEF_STATIFY_GITHUB_TOKEN')) {
        $token = trim((string) KLEF_STATIFY_GITHUB_TOKEN);
    }
    return ['token' => $token, 'expiry' => (string) get_option($expiryOption, '')];
}

function klef_statify_promote_next_token(): string
{
    $next = klef_statify_slot('next');
    if ($next['token'] === '' || !klef_statify_valid_expiry($next['expiry']) || klef_statify_expiry_timestamp($next['expiry']) <= time()) return '';
    update_option(KLEF_STATIFY_CURRENT_TOKEN_OPTION, (string) get_option(KLEF_STATIFY_NEXT_TOKEN_OPTION, ''), false);
    update_option(KLEF_STATIFY_CURRENT_EXPIRY_OPTION, $next['expiry'], false);
    delete_option(KLEF_STATIFY_NEXT_TOKEN_OPTION);
    delete_option(KLEF_STATIFY_NEXT_EXPIRY_OPTION);
    return $next['token'];
}

function klef_statify_active_token(): string
{
    $current = klef_statify_slot('current');
    if ($current['token'] !== '' && (!klef_statify_valid_expiry($current['expiry']) || klef_statify_expiry_timestamp($current['expiry']) > time())) {
        return $current['token'];
    }
    return klef_statify_promote_next_token();
}

function klef_statify_validate_token(string $token): bool
{
    $repositoryPath = klef_statify_repository_path();
    if ($repositoryPath === '' || $token === '') return false;
    $response = wp_remote_get('https://api.github.com/repos/' . $repositoryPath, [
        'timeout' => 15,
        'headers' => [
            'Accept' => 'application/vnd.github+json',
            'Authorization' => 'Bearer ' . $token,
            'User-Agent' => 'Klef-Portfolio-Statify',
            'X-GitHub-Api-Version' => '2022-11-28',
        ],
    ]);
    return !is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200;
}

function klef_statify_dispatch(int $postId, string $slug, bool $update): void
{
    $token = klef_statify_active_token();
    $repositoryPath = klef_statify_repository_path();
    if ($token === '' || $repositoryPath === '') {
        error_log('Klef Statify: no hay un token activo o el repositorio no tiene formato valido.');
        return;
    }
    if (get_transient('klef_statify_dispatch_' . $postId)) return;
    set_transient('klef_statify_dispatch_' . $postId, '1', MINUTE_IN_SECONDS);

    $response = wp_remote_post('https://api.github.com/repos/' . $repositoryPath . '/dispatches', [
        'timeout' => 15,
        'headers' => [
            'Accept' => 'application/vnd.github+json',
            'Authorization' => 'Bearer ' . $token,
            'User-Agent' => 'Klef-Portfolio-Statify',
            'X-GitHub-Api-Version' => '2022-11-28',
        ],
        'body' => wp_json_encode([
            'event_type' => 'portfolio-published',
            'client_payload' => [
                'post_id' => $postId,
                'slug' => $slug,
                'updated' => $update,
            ],
        ]),
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) >= 300) {
        error_log('Klef Statify: no se pudo activar GitHub para el post ' . $postId . '.');
    }
}

add_action('save_post_post', static function (int $postId, WP_Post $post, bool $update): void {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($postId) || $post->post_status !== 'publish') return;
    if (!has_category('Portfolio', $postId)) return;
    klef_statify_dispatch($postId, $post->post_name, $update);
}, 20, 3);

add_action('transition_post_status', static function (string $newStatus, string $oldStatus, WP_Post $post): void {
    if ($post->post_type !== 'post' || $oldStatus !== 'publish' || $newStatus === 'publish') return;
    if (!has_category('Portfolio', $post->ID)) return;
    klef_statify_dispatch((int) $post->ID, $post->post_name, true);
}, 20, 3);

add_action('before_delete_post', static function (int $postId): void {
    $post = get_post($postId);
    if (!$post instanceof WP_Post || $post->post_type !== 'post') return;
    if (!has_category('Portfolio', $postId)) return;
    klef_statify_dispatch($postId, $post->post_name, true);
}, 20, 1);

function klef_statify_save_tokens(): void
{
    if (!current_user_can('manage_options')) wp_die('No tienes permisos para realizar esta acción.');
    check_admin_referer('klef_statify_save_tokens');

    $currentToken = trim((string) wp_unslash($_POST['current_token'] ?? ''));
    $currentExpiry = sanitize_text_field((string) wp_unslash($_POST['current_expiry'] ?? ''));
    $nextToken = trim((string) wp_unslash($_POST['next_token'] ?? ''));
    $nextExpiry = sanitize_text_field((string) wp_unslash($_POST['next_expiry'] ?? ''));
    $errors = [];

    if ($currentToken !== '' && !klef_statify_validate_token($currentToken)) $errors[] = 'El token actual no pudo validarse contra GitHub.';
    if ($nextToken !== '' && !klef_statify_validate_token($nextToken)) $errors[] = 'El token siguiente no pudo validarse contra GitHub.';
    if ($currentToken !== '' && !klef_statify_valid_expiry($currentExpiry)) $errors[] = 'La fecha de expiración actual debe tener formato YYYY-MM-DD.';
    if ($nextToken !== '' && !klef_statify_valid_expiry($nextExpiry)) $errors[] = 'La fecha de expiración siguiente debe tener formato YYYY-MM-DD.';
    if ($nextToken !== '' && klef_statify_valid_expiry($currentExpiry) && klef_statify_expiry_timestamp($nextExpiry) <= klef_statify_expiry_timestamp($currentExpiry)) {
        $errors[] = 'La fecha del token siguiente debe ser posterior a la del token actual.';
    }

    if ($errors !== []) {
        $url = add_query_arg(['page' => 'klef-statify-tokens', 'klef_error' => rawurlencode(implode(' ', $errors))], admin_url('options-general.php'));
        wp_safe_redirect($url);
        exit;
    }

    if ($currentToken !== '') {
        $encrypted = klef_statify_encrypt($currentToken);
        if ($encrypted === '') wp_die('No se pudo cifrar el token. Verifica que OpenSSL esté disponible.');
        update_option(KLEF_STATIFY_CURRENT_TOKEN_OPTION, $encrypted, false);
        update_option(KLEF_STATIFY_CURRENT_EXPIRY_OPTION, $currentExpiry, false);
    } elseif ($currentExpiry !== '' && klef_statify_valid_expiry($currentExpiry)) {
        update_option(KLEF_STATIFY_CURRENT_EXPIRY_OPTION, $currentExpiry, false);
    }

    if ($nextToken !== '') {
        $encrypted = klef_statify_encrypt($nextToken);
        if ($encrypted === '') wp_die('No se pudo cifrar el token siguiente. Verifica que OpenSSL esté disponible.');
        update_option(KLEF_STATIFY_NEXT_TOKEN_OPTION, $encrypted, false);
        update_option(KLEF_STATIFY_NEXT_EXPIRY_OPTION, $nextExpiry, false);
    } elseif ($nextExpiry !== '' && klef_statify_valid_expiry($nextExpiry)) {
        update_option(KLEF_STATIFY_NEXT_EXPIRY_OPTION, $nextExpiry, false);
    }

    $url = add_query_arg(['page' => 'klef-statify-tokens', 'klef_updated' => '1'], admin_url('options-general.php'));
    wp_safe_redirect($url);
    exit;
}
add_action('admin_post_klef_statify_save_tokens', 'klef_statify_save_tokens');

function klef_statify_admin_page(): void
{
    if (!current_user_can('manage_options')) return;
    $current = klef_statify_slot('current');
    $next = klef_statify_slot('next');
    $currentExpiry = klef_statify_valid_expiry($current['expiry']) ? klef_statify_expiry_timestamp($current['expiry']) : 0;
    $rotationDeadline = $currentExpiry > 0 ? $currentExpiry - (KLEF_STATIFY_ROTATION_NOTICE_DAYS * DAY_IN_SECONDS) : 0;
    $currentStatus = $current['token'] === '' ? 'Falta token actual' : ($currentExpiry > 0 && $currentExpiry <= time() ? 'Expirado' : 'Activo');
    ?>
    <div class="wrap">
        <h1>Klef Statify — tokens de GitHub</h1>
        <?php if (isset($_GET['klef_updated'])): ?><div class="notice notice-success is-dismissible"><p>Tokens guardados. Los valores nunca se muestran en pantalla.</p></div><?php endif; ?>
        <?php if (isset($_GET['klef_error'])): ?><div class="notice notice-error"><p><?php echo esc_html(rawurldecode((string) $_GET['klef_error'])); ?></p></div><?php endif; ?>
        <p>El formulario sólo está disponible para administradores. El token se cifra usando las claves privadas de WordPress y se cambia automáticamente al siguiente cuando expire el actual.</p>
        <p><strong>Estado actual:</strong> <?php echo esc_html($currentStatus); ?><?php if ($current['expiry'] !== ''): ?> — expira <?php echo esc_html($current['expiry']); ?><?php endif; ?></p>
        <?php if ($rotationDeadline > 0): ?><p><strong>Fecha límite de rotación:</strong> <?php echo esc_html(gmdate('Y-m-d', $rotationDeadline)); ?> (180 días antes de la expiración).</p><?php endif; ?>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="klef_statify_save_tokens">
            <?php wp_nonce_field('klef_statify_save_tokens'); ?>
            <h2>Token actual</h2>
            <p><label for="current_token">Token actual</label><br><input type="password" id="current_token" name="current_token" class="regular-text" autocomplete="new-password"><br><span class="description">Déjalo vacío para conservar el token actual.</span></p>
            <p><label for="current_expiry">Fecha de expiración actual</label><br><input type="date" id="current_expiry" name="current_expiry" value="<?php echo esc_attr($current['expiry']); ?>"></p>
            <h2>Token siguiente</h2>
            <p><label for="next_token">Token siguiente</label><br><input type="password" id="next_token" name="next_token" class="regular-text" autocomplete="new-password"><br><span class="description">Regístralo con anticipación. Se usará cuando expire el actual.</span></p>
            <p><label for="next_expiry">Fecha de expiración siguiente</label><br><input type="date" id="next_expiry" name="next_expiry" value="<?php echo esc_attr($next['expiry']); ?>"></p>
            <?php submit_button('Guardar tokens'); ?>
        </form>
    </div>
    <?php
}

add_action('admin_menu', static function (): void {
    add_options_page('Klef Statify Tokens', 'Klef Statify', 'manage_options', 'klef-statify-tokens', 'klef_statify_admin_page');
});

add_action('admin_notices', static function (): void {
    if (!current_user_can('manage_options')) return;
    $current = klef_statify_slot('current');
    $next = klef_statify_slot('next');
    if ($current['token'] === '' || !klef_statify_valid_expiry($current['expiry']) || $next['token'] !== '') return;
    $deadline = klef_statify_expiry_timestamp($current['expiry']) - (KLEF_STATIFY_ROTATION_NOTICE_DAYS * DAY_IN_SECONDS);
    if (time() >= $deadline) {
        echo '<div class="notice notice-warning"><p><strong>Klef Statify:</strong> registra el token siguiente de GitHub en Ajustes → Klef Statify. El token actual expira el ' . esc_html($current['expiry']) . '.</p></div>';
    }
});

function klef_statify_token_health_check(): void
{
    $current = klef_statify_slot('current');
    $next = klef_statify_slot('next');
    if ($current['token'] === '' || !klef_statify_valid_expiry($current['expiry'])) return;
    $rotationDeadline = klef_statify_expiry_timestamp($current['expiry']) - (KLEF_STATIFY_ROTATION_NOTICE_DAYS * DAY_IN_SECONDS);
    if (time() < $rotationDeadline || $next['token'] !== '') return;
    $lastNotice = (int) get_option(KLEF_STATIFY_LAST_NOTICE_OPTION, 0);
    if ($lastNotice > 0 && $lastNotice > time() - (30 * DAY_IN_SECONDS)) return;
    $subject = 'Klef Statify: registra el token siguiente de GitHub';
    $message = 'El token de GitHub de Klef Statify expira el ' . $current['expiry'] . '. Registra el siguiente token en Ajustes > Klef Statify antes de esa fecha.';
    wp_mail((string) get_option('admin_email'), $subject, $message);
    update_option(KLEF_STATIFY_LAST_NOTICE_OPTION, time(), false);
}

add_action('init', static function (): void {
    if (!wp_next_scheduled('klef_statify_token_health_check')) {
        wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', 'klef_statify_token_health_check');
    }
});
add_action('klef_statify_token_health_check', 'klef_statify_token_health_check');

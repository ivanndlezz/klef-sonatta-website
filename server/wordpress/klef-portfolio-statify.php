<?php
/**
 * Plugin Name: Klef Portfolio Statify Trigger
 * Description: Solicita una compilación de GitHub cuando se publica un proyecto del portafolio.
 * Version: 0.1.0
 */

declare(strict_types=1);

if (!defined('ABSPATH')) exit;

function klef_statify_dispatch(int $postId, string $slug, bool $update): void
{
    $repository = defined('KLEF_STATIFY_GITHUB_REPOSITORY') ? trim((string) KLEF_STATIFY_GITHUB_REPOSITORY) : '';
    $token = defined('KLEF_STATIFY_GITHUB_TOKEN') ? trim((string) KLEF_STATIFY_GITHUB_TOKEN) : '';
    if ($repository === '' || $token === '') {
        error_log('Klef Statify: faltan KLEF_STATIFY_GITHUB_REPOSITORY o KLEF_STATIFY_GITHUB_TOKEN.');
        return;
    }
    if (preg_match('/^([^\/]+)\/([^\/]+)$/', $repository, $parts) !== 1) {
        error_log('Klef Statify: KLEF_STATIFY_GITHUB_REPOSITORY debe tener formato organizacion/repositorio.');
        return;
    }
    if (get_transient('klef_statify_dispatch_' . $postId)) return;
    set_transient('klef_statify_dispatch_' . $postId, '1', MINUTE_IN_SECONDS);

    $repositoryPath = rawurlencode($parts[1]) . '/' . rawurlencode($parts[2]);
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

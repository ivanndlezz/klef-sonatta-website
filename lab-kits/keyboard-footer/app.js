(() => {
  'use strict';
  const root = document.documentElement;
  const viewport = window.visualViewport;
  const bar = document.getElementById('action-bar');
  const form = document.getElementById('login-form');
  let frame = 0;
  let revealField = false;
  let lastUnfocusedHeight = window.innerHeight;
  const isField = element => element instanceof HTMLElement && element.matches('input, textarea');

  function update() {
    frame = 0;
    const height = viewport?.height ?? window.innerHeight;
    const top = viewport?.offsetTop ?? 0;
    const focused = isField(document.activeElement);
    // Zoom is left to the browser; it must remain available for accessibility.
    const zoomed = viewport && Math.abs(viewport.scale - 1) > 0.02;
    const offset = zoomed ? 0 : Math.max(0, window.innerHeight - height - top);
    if (!focused && offset < 1) lastUnfocusedHeight = window.innerHeight;
    // This flag only removes home-indicator padding. Placement uses exact geometry.
    const keyboardOpen = !zoomed && (offset > 80 || (focused && lastUnfocusedHeight - height > 100));
    root.toggleAttribute('data-keyboard-open', keyboardOpen);
    root.style.setProperty('--bottom-offset', `${offset}px`);
    root.style.setProperty('--bar-height', `${bar.getBoundingClientRect().height}px`);

    if (revealField && focused && !zoomed) {
      const field = document.activeElement.getBoundingClientRect();
      const availableBottom = top + height - bar.getBoundingClientRect().height - 16;
      // Reveal the end of a field only if it fits; long textareas retain native scrolling.
      if (field.bottom > availableBottom && field.height < availableBottom - top - 16) {
        window.scrollBy(0, field.bottom - availableBottom);
      } else if (field.top < top + 16) {
        window.scrollBy(0, field.top - top - 16);
      }
    }
    revealField = false;
  }

  function schedule(reveal = false) {
    revealField ||= reveal;
    if (!frame) frame = requestAnimationFrame(update);
  }
  viewport?.addEventListener('resize', () => schedule(true));
  viewport?.addEventListener('scroll', () => schedule());
  window.addEventListener('resize', () => schedule(true));
  document.addEventListener('focusin', () => schedule(true));
  document.addEventListener('focusout', () => schedule());
  window.addEventListener('pageshow', () => schedule());
  if ('ResizeObserver' in window) new ResizeObserver(() => schedule()).observe(bar);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (isField(document.activeElement)) document.activeElement.blur();
    document.getElementById('result').textContent = 'Prueba completada. Los datos no se han enviado ni guardado.';
    schedule();
  });
  const password = document.getElementById('password');
  const toggle = document.getElementById('password-toggle');
  toggle.addEventListener('click', () => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(visible));
    toggle.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
  const notice = text => { document.getElementById('result').textContent = text; };
  document.getElementById('forgot-password').addEventListener('click', () => notice('Esta es una prueba local; la recuperación de contraseña no está conectada.'));
  document.getElementById('back-button').addEventListener('click', () => {
    if (isField(document.activeElement)) document.activeElement.blur();
    notice('Esta es la pantalla inicial de la prueba.');
  });
  document.querySelectorAll('[data-notice]').forEach(button => button.addEventListener('click', () => notice(`${button.dataset.notice}: enlace de demostración sin navegación externa.`)));
  schedule();
})();

/*
 ui-composer.js
 --------------------------------------------------
 Core declarativo para componer UI a partir de:
 - HTML Templates
 - JSON Data (async)

 Filosofía:
 - El HTML define estructura
 - El JSON define estado
 - Este core SOLO hace pairing e hidratación
 - No incluye estilos ni comportamiento específico
 --------------------------------------------------
*/

(function (global) {
  const UIComposer = {};

  /* --------------------------------------------------
    Espera de forma asíncrona a que exista un <script type="application/json">
  -------------------------------------------------- */
  function waitForJSON(id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        try {
          resolve(JSON.parse(existing.textContent));
        } catch (e) {
          reject(e);
        }
        return;
      }

      const observer = new MutationObserver(() => {
        const script = document.getElementById(id);
        if (script) {
          observer.disconnect();
          try {
            resolve(JSON.parse(script.textContent));
          } catch (e) {
            reject(e);
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  /* --------------------------------------------------
    Aplica data-bind="key" sobre un nodo
  -------------------------------------------------- */
  function applyBindings(root, data) {
    root.querySelectorAll("[data-bind]").forEach((el) => {
      const key = el.dataset.bind;
      if (data[key] !== undefined) {
        el.textContent = data[key];
      }
    });

    // Handle data-attr-* for attributes
    root.querySelectorAll("[data-attr-href]").forEach((el) => {
      const key = el.dataset.attrHref;
      if (data[key] !== undefined) {
        el.setAttribute("href", data[key]);
      }
    });
  }

  /* --------------------------------------------------
    Procesa data-repeat="key" clonando elementos
  -------------------------------------------------- */
  function processRepeats(root, data) {
    const repeats = root.querySelectorAll("[data-repeat]");
    repeats.forEach((el) => {
      const key = el.dataset.repeat;
      if (Array.isArray(data[key])) {
        const parent = el.parentNode;
        const placeholder = document.createComment(`repeat-${key}`);
        parent.replaceChild(placeholder, el);

        data[key].forEach((itemData) => {
          const clone = el.cloneNode(true);
          delete clone.dataset.repeat;
          applyBindings(clone, itemData);
          processRepeats(clone, itemData); // Recursive for nested repeats
          parent.insertBefore(clone, placeholder);
        });

        parent.removeChild(placeholder);
      }
    });
  }

  /* --------------------------------------------------
    Render Skeleton (opcional)
  -------------------------------------------------- */
  function renderSkeleton(target, skeletonSelector) {
    if (!skeletonSelector) return;

    const skel = document.querySelector(skeletonSelector);
    if (!skel) return;

    target.innerHTML = "";
    target.appendChild(skel.content.cloneNode(true));
  }

  /* --------------------------------------------------
    API pública: hydrate
  -------------------------------------------------- */
  UIComposer.hydrate = function ({ template, data, target, skeleton }) {
    const tplEl = document.querySelector(template);
    const targetEl = document.querySelector(target);

    if (!tplEl || !targetEl) {
      console.warn("[UIComposer] Template o target no encontrado");
      return Promise.resolve();
    }

    renderSkeleton(targetEl, skeleton);

    return waitForJSON(data.replace("#", "")).then((json) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = tplEl.innerHTML;

      applyBindings(wrapper, json);
      processRepeats(wrapper, json);

      targetEl.innerHTML = "";
      targetEl.appendChild(wrapper);

      return wrapper;
    });
  };

  /* --------------------------------------------------
    API pública: destroy
  -------------------------------------------------- */
  UIComposer.destroy = function (target) {
    const el = document.querySelector(target);
    if (el) el.innerHTML = "";
  };

  /* --------------------------------------------------
    Exponer global
  -------------------------------------------------- */
  global.UIComposer = UIComposer;
})(window);

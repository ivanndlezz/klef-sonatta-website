/**
 * basics-loader.js
 * Sistema de carga progresiva y priorizada de componentes base
 */

class BasicsLoader {
  constructor(config) {
    this.config = config;
    this.loadedSets = new Set();
    this.loadingSets = new Map();
    this.loadedStyles = new Set();
  }

  async load(setName) {
    if (this.loadedSets.has(setName)) {
      return Promise.resolve();
    }

    if (this.loadingSets.has(setName)) {
      return this.loadingSets.get(setName);
    }

    const loadPromise = (async () => {
      console.log(`[BasicsLoader] Cargando set: ${setName}`);
      const set = this.config.sets[setName];
      if (!set) {
        throw new Error(`Set no encontrado: ${setName}`);
      }

      // 1. Cargar dependencias primero
      if (set.dependsOn) {
        await Promise.all(set.dependsOn.map((dep) => this.load(dep)));
      }

      // 2. Cargar estilos
      if (set.styles) {
        const styles = Array.isArray(set.styles) ? set.styles : [set.styles];
        for (const style of styles) {
          const stylePath = typeof style === "string" ? style : style.file;
          await this.loadStyles(stylePath);
        }
      }

      // 3. Insertar HTML / Componentes (ANTES de los scripts)
      if (set.components) {
        for (const comp of set.components) {
          this.insertHTML(comp.html, comp.selector);
        }
      } else if (set.container) {
        this.insertHTML(set.container.html, set.container.selector || "body");
        if (set.html) {
          this.insertHTML(
            set.html,
            set.container.selector || ".mega-menus-container",
          );
        }
      } else if (set.html) {
        this.insertHTML(set.html, set.domTarget || "body");
      }

      // 4. Cargar scripts (SEQUENCIALMENTE para asegurar orden de dependencia interna)
      const scriptsToLoad = set.scripts || (set.script ? [set.script] : []);
      for (const script of scriptsToLoad) {
        const scriptFile = typeof script === "string" ? script : script.file;
        const isModule = typeof script === "object" ? !!script.module : false;
        await this.loadScript(scriptFile, isModule);
      }

      // 5. Cargar fuente (source function if defined)
      if (set.source && set.source.file) {
        await this.loadScript(set.source.file);
        if (
          set.source.function &&
          typeof window[set.source.function] === "function"
        ) {
          window[set.source.function]();
        }
      }

      // 6. Callback de finalización
      if (set.onComplete && typeof set.onComplete === "function") {
        console.log(`[BasicsLoader] Ejecutando onComplete para ${setName}`); // Changed addLog to console.log
        set.onComplete();
      }

      this.loadedSets.add(setName);
      this.loadingSets.delete(setName);

      console.log(`[BasicsLoader] Set ${setName} cargado correctamente`);
    })();

    this.loadingSets.set(setName, loadPromise);
    return loadPromise;
  }

  async loadAll() {
    console.log(
      "[BasicsLoader] Iniciando carga de todos los elementos críticos",
    );
    // Cargar todos los sets que no sean lazy según el loadOrder
    const criticalSteps = this.config.loadOrder.filter(
      (step) =>
        step.strategy !== "lazy" && step.strategy !== "user-interaction",
    );

    for (const step of criticalSteps) {
      await this.load(step.set);
    }
  }

  async loadStyles(stylePath) {
    if (this.loadedStyles.has(stylePath)) return;

    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = stylePath;
      link.onload = () => {
        this.loadedStyles.add(stylePath);
        resolve();
      };
      link.onerror = () =>
        reject(new Error(`Error al cargar estilos: ${stylePath}`));
      document.head.appendChild(link);
    });
  }

  insertHTML(html, selector) {
    if (!html) return;

    // Si el selector existe en el DOM, insertamos dentro
    if (selector && selector !== "body") {
      const el = document.querySelector(selector);
      if (el) {
        el.innerHTML = html;
        return;
      }
    }

    // Si no existe, creamos un fragmento a partir del HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html.trim();
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }

    // Decidir dónde insertar
    let target = document.body;

    // Si es navegación o topbar, probablemente queremos insertarlo al inicio
    const isNav =
      selector && (selector.includes("nav") || selector.includes("topbar"));

    if (isNav && target.firstChild) {
      target.insertBefore(fragment, target.firstChild);
    } else {
      target.appendChild(fragment);
    }
  }

  async loadScript(scriptPath, isModule = false) {
    return new Promise((resolve, reject) => {
      // Evitar recargar el mismo script si ya existe en el DOM
      if (document.querySelector(`script[src="${scriptPath}"]`)) {
        return resolve();
      }

      const script = document.createElement("script");
      script.src = scriptPath;
      if (isModule) script.type = "module";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`Error al cargar script: ${scriptPath}`));
      document.body.appendChild(script);
    });
  }
}

export default BasicsLoader;

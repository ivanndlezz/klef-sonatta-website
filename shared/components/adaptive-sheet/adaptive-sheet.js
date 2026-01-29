// ============================================================================
// ADAPTIVE SHEET SYSTEM - Shared Component for Portfolio & Detail Pages
// ============================================================================

(function() {
    'use strict';

    // ============================================
    // ADAPTIVE SHEET CONTROLLER
    // ============================================
    class AdaptiveSheet {
        constructor() {
            this.sheet = document.getElementById("bottomsheet");
            this.backdrop = document.getElementById("backdrop");
            this.header = document.getElementById("header");
            this.closeBtn = document.getElementById("close-btn");
            this.state = "CLOSED";

            this.startY = 0;
            this.currentY = 0;
            this.isDragging = false;
        }

        init() {
            if (!this.sheet || !this.backdrop) {
                console.warn('⚠️ Adaptive Sheet elements not found');
                return;
            }

            this.header.addEventListener(
                "touchstart",
                this.handleTouchStart.bind(this)
            );
            this.header.addEventListener(
                "touchmove",
                this.handleTouchMove.bind(this)
            );
            this.header.addEventListener(
                "touchend",
                this.handleTouchEnd.bind(this)
            );

            this.backdrop.addEventListener("click", () => this.close());
            if (this.closeBtn) {
                this.closeBtn.addEventListener("click", () => this.close());
            }

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && this.state !== "CLOSED") {
                    this.close();
                }
            });

            window.addEventListener("resize", () => {
                if (this.state !== "CLOSED") {
                    this.adjustForViewport();
                }
            });
        }

        isMobile() {
            return window.innerWidth < 768;
        }

        open() {
            this.sheet.classList.add("open");
            this.backdrop.classList.add("visible");
            this.state = "NORMAL";
            document.body.style.overflow = "hidden";
        }

        close() {
            this.sheet.classList.remove("open", "full");
            this.backdrop.classList.remove("visible");
            this.state = "CLOSED";
            document.body.style.overflow = "";
        }

        setState(state) {
            if (state === "FULL") {
                this.sheet.classList.add("full");
                this.state = "FULL";
            } else {
                this.sheet.classList.remove("full");
                this.state = "NORMAL";
            }
        }

        toggleFull() {
            if (this.state === "FULL") {
                this.setState("NORMAL");
            } else {
                this.setState("FULL");
            }
        }

        adjustForViewport() {
            if (!this.isMobile() && this.state === "FULL") {
                this.setState("FULL");
            }
        }

        handleTouchStart(e) {
            if (!this.isMobile()) return;
            this.startY = e.touches[0].clientY;
            this.isDragging = true;
        }

        handleTouchMove(e) {
            if (!this.isDragging || !this.isMobile()) return;

            this.currentY = e.touches[0].clientY;
            const deltaY = this.currentY - this.startY;

            if (deltaY > 0 && this.state === "NORMAL") {
                this.sheet.style.transform = `translateY(${deltaY}px)`;
            } else if (deltaY < 0 && this.state === "NORMAL") {
                this.sheet.style.transform = `translateY(${deltaY}px)`;
            }
        }

        handleTouchEnd(e) {
            if (!this.isDragging || !this.isMobile()) return;

            const deltaY = this.currentY - this.startY;
            this.isDragging = false;
            this.sheet.style.transform = "";

            if (deltaY > 100 && this.state === "NORMAL") {
                this.close();
            } else if (deltaY < -100 && this.state === "NORMAL") {
                this.setState("FULL");
            }
        }
    }

    // ============================================
    // COMPONENT LOADER
    // ============================================
    class ComponentLoader {
        constructor(targetId, componentLibrary = {}) {
            this.loadzone = document.getElementById(targetId);
            this.ctaZone = document.getElementById("load-cta");
            this.nameZone = document.getElementById("component-name");
            this.componentLibrary = componentLibrary;
        }

        setLibrary(library) {
            this.componentLibrary = library;
        }

        async load(componentName, props = {}) {
            const component = this.componentLibrary[componentName];

            if (!component) {
                console.error(`❌ Component "${componentName}" not found`);
                return;
            }

            // Mostrar loading
            this.loadzone.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Cargando ${component.name}...</p>
                </div>
            `;

            // Simular delay de carga
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Inyectar contenido
            const html = component.render(props);
            this.loadzone.innerHTML = html;

            // Actualizar título
            if (this.nameZone) {
                this.nameZone.textContent = component.name || componentName;
            }

            // Inyectar CTA
            if (component.cta) {
                this.ctaZone.innerHTML = component.cta();
                this.ctaZone.style.display = "block";
            } else {
                this.ctaZone.style.display = "none";
            }

            // Ejecutar inicializador si existe
            if (component.init && typeof component.init === "function") {
                component.init(this.loadzone, props);
            }

            // Abrir el sheet
            if (window.adaptiveSheet) {
                window.adaptiveSheet.open();
            }
        }

        clear() {
            this.loadzone.innerHTML = "";
            this.ctaZone.innerHTML = "";
            this.ctaZone.style.display = "none";
        }
    }

    // ============================================
    // AUTO-BIND: Sistema de emparejamiento automático
    // ============================================
    function bindComponentTriggers() {
        const triggers = document.querySelectorAll("[data-component]");

        console.log(`✅ Found ${triggers.length} component triggers`);

        triggers.forEach((trigger) => {
            trigger.addEventListener("click", (e) => {
                e.preventDefault();

                const componentName = trigger.getAttribute("data-component");

                // Obtener todos los data-attributes como props
                const props = {};
                Array.from(trigger.attributes).forEach((attr) => {
                    if (
                        attr.name.startsWith("data-") &&
                        attr.name !== "data-component"
                    ) {
                        // Convertir data-project-name -> projectName
                        const propName = attr.name
                            .replace("data-", "")
                            .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        props[propName] = attr.value;
                    }
                });

                console.log(`🚀 Loading component: ${componentName}`, props);

                // Cargar el componente
                if (window.componentLoader) {
                    window.componentLoader.load(componentName, props);
                }
            });
        });
    }

    // ============================================
    // INICIALIZACIÓN Y EXPORTACIÓN
    // ============================================
    function initAdaptiveSheet(componentLibrary = {}) {
        const adaptiveSheet = new AdaptiveSheet();
        const componentLoader = new ComponentLoader("loadzone", componentLibrary);

        adaptiveSheet.init();
        bindComponentTriggers();

        // Exponer globalmente
        window.adaptiveSheet = adaptiveSheet;
        window.componentLoader = componentLoader;

        console.log("✅ Adaptive Sheet System inicializado");
        console.log('🎯 Usa data-component="nombre" en cualquier botón para vincularlo');

        return { adaptiveSheet, componentLoader };
    }

    // Exportar función de inicialización
    window.initAdaptiveSheet = initAdaptiveSheet;
})();


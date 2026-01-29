// ============================================================================
// SEO IMAGE HYDRATION SYSTEM
// Patrón Symbol/Use inspirado en SVG
//
// - Registra imágenes del bloque #seo-images (símbolos)
// - Hidrata targets con data-image-id (instancias/use)
// - Maneja prioridades y carga lazy
// ============================================================================

class SEOImageHydrator {
    constructor() {
        this.imageRegistry = new Map();
        this.hydrated = new Set();
        this.loading = new Set();
        this.errors = new Set();

        this.init();
    }

    init() {
        this.indexSEOImages();
        this.hydrateAllTargets();
    }

    indexSEOImages() {
        const seoBlock = document.getElementById("seo-images");
        if (!seoBlock) {
            if (window.logger) window.logger.warn("SEO_BLOCK_MISSING", "SEO images block not found");
            return;
        }

        const images = seoBlock.querySelectorAll("img[data-id]");

        images.forEach((img) => {
            const id = img.dataset.id;
            this.imageRegistry.set(id, {
                src: img.src,
                alt: img.alt,
                fetch: img.dataset.fetch || "low",
            });
        });

        if (window.logger) window.logger.success("INDEXED", { count: this.imageRegistry.size });
    }

    hydrateAllTargets() {
        const targets = document.querySelectorAll("[data-image-id]");

        const fetchGroups = {
            high: [],
            medium: [],
            low: [],
        };

        targets.forEach((target) => {
            const imageId = target.dataset.imageId;
            const imageData = this.imageRegistry.get(imageId);

            if (!imageData) {
                if (window.logger) window.logger.warn("IMAGE_NOT_IN_REGISTRY", imageId);
                return;
            }

            const fetch = imageData.fetch;
            fetchGroups[fetch].push({ target, imageId, imageData });
        });

        // High priority images load immediately for better LCP
        fetchGroups.high.forEach(({ target, imageId, imageData }) => {
            this.hydrateTarget(target, imageId, imageData);
        });
        this.hydrateByPriority(fetchGroups.medium, 200);
        this.hydrateByPriority(fetchGroups.low, 400);
    }

    hydrateByPriority(group, delay) {
        setTimeout(() => {
            group.forEach(({ target, imageId, imageData }) => {
                this.hydrateTarget(target, imageId, imageData);
            });
        }, delay);
    }

    hydrateTarget(target, imageId, imageData) {
        const uniqueKey = `${imageId}-${target.dataset.targetIndex || Math.random()}`;

        if (this.hydrated.has(uniqueKey)) {
            return;
        }

        // Skip if already has an img element (for direct HTML images)
        if (target.querySelector('img')) {
            this.hydrated.add(uniqueKey);
            target.classList.remove("skeleton");
            target.classList.add("loaded");
            return;
        }

        this.loading.add(uniqueKey);

        const img = document.createElement("img");
        img.src = imageData.src;
        img.alt = imageData.alt;
        img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";

        if (imageData.fetch === "high") {
            img.fetchpriority = "high";
        }

        img.onload = () => {
            target.appendChild(img);
            target.classList.remove("skeleton");
            target.classList.add("loaded");

            this.loading.delete(uniqueKey);
            this.hydrated.add(uniqueKey);

            if (window.logger) window.logger.success("HYDRATED", imageId);
        };

        img.onerror = () => {
            target.classList.remove("skeleton");
            target.classList.add("error");

            this.loading.delete(uniqueKey);
            this.errors.add(uniqueKey);

            if (window.logger) window.logger.error("LOAD_FAILED", imageId);
        };
    }

    hydrate(imageId) {
        const targets = document.querySelectorAll(
            `[data-image-id="${imageId}"]`,
        );
        const imageData = this.imageRegistry.get(imageId);

        if (!imageData) {
            if (window.logger) window.logger.warn("IMAGE_NOT_FOUND", imageId);
            return;
        }

        targets.forEach((target) => {
            this.hydrateTarget(target, imageId, imageData);
        });
    }

    preload(imageId) {
        const imageData = this.imageRegistry.get(imageId);
        if (!imageData) return;

        const img = new Image();
        img.src = imageData.src;
    }
}

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    window.seoImageHydrator = new SEOImageHydrator();
});

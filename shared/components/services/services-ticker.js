// ============================================================================
// SERVICES TICKER - Infinite Scroll of Services
// ============================================================================

(function () {
  "use strict";

  const TAGS = [
    "Marketing",
    "Redes",
    "Diseño",
    "Videos",
    "Programación",
    "Webs",
    "Wordpress",
    "Publicidad",
    "UI/UX",
    "Animación",
    "SEO",
    "Estrategia",
    "Foto",
  ];
  const DURATION = 20000;
  const ROWS = 3;
  const TAGS_PER_ROW = 6;

  function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function shuffle(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
  }

  function initServicesTicker() {
    const container = document.getElementById("services-scroll");
    if (!container) return;

    // Structure
    container.innerHTML = `
            <div class="services-app">
                <header class="text-center" style="--mb:4rem;">
                    <h2 class="k-section-title center">
                        Servicios
                    </h2>
                    <p class="k-section-subtitle">Descubre todo lo que podemos hacer</p>
                </header>
                <div class="tag-list">
                    <div class="fade"></div>
                </div>
            </div>
        `;

    const tagList = container.querySelector(".tag-list");

    // Styles injection for the component
    const style = document.createElement("style");
    style.textContent = `
            .services-app { padding: 4rem 0; overflow: hidden; }
            .tag-list { width: 100vw; display: flex; flex-direction: column; gap: 1rem; position: relative; }
            .loop-slider { display: flex; width: fit-content; animation-name: loop; animation-timing-function: linear; animation-iteration-count: infinite; }
            .loop-slider .inner { display: flex; width: fit-content; animation-name: loop; animation-timing-function: linear; animation-iteration-count: infinite; }
            @keyframes loop { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .tag {border-top: solid; border-color: #e6e5e5; border-width: 1px; display: flex; align-items: center; gap: 0 0.2rem; color: #1d1d1f; font-size: 0.9rem; background: #fff; border-radius: 15px; padding: 0.7rem 1rem; margin-right: 1rem; box-shadow: 0 0.1rem 0.2rem rgba(0,0,0,0.1); white-space: nowrap; }
            .tag span { font-size: 1.2rem; color: #64748b; }
            
        `;
    document.head.appendChild(style);

    // Create Rows
    for (let i = 0; i < ROWS; i++) {
      const duration = random(DURATION - 5000, DURATION + 5000);
      const reverse = i % 2 !== 0;

      const loopSlider = document.createElement("div");
      loopSlider.className = "loop-slider";
      loopSlider.style.cssText = `
                --duration: ${duration}ms;
                --direction: ${reverse ? "reverse" : "normal"};
                animation-duration: ${duration}ms;
                animation-direction: ${reverse ? "reverse" : "normal"};
            `;

      const inner = document.createElement("div");
      inner.className = "inner";

      // Populate logic
      const shuffledTags = shuffle(TAGS).slice(0, TAGS_PER_ROW);
      // Double duplication for seamless loop (ensuring width > screen)
      const tagsToRender = [
        ...shuffledTags,
        ...shuffledTags,
        ...shuffledTags,
        ...shuffledTags,
      ];

      tagsToRender.forEach((tagText) => {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.innerHTML = `<span>#</span> ${tagText}`;
        inner.appendChild(tag);
      });

      loopSlider.appendChild(inner);
      tagList.appendChild(loopSlider);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initServicesTicker);
  } else {
    initServicesTicker();
  }
})();

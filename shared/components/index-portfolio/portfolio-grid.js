/**
 * Portfolio Grid System
 * Handles portfolio card filtering, search, and navigation
 * This script should only run when portfolio elements (#cardGrid, #tabsList, etc.) exist in the DOM
 */

(function () {
  "use strict";

  // Check if required elements exist before initializing
  const requiredElements = [
    "#tabsList",
    "#cardGrid",
    "#tab-search__bar",
    "#results-count",
  ];

  const allExist = requiredElements.every(
    (selector) => document.querySelector(selector) !== null,
  );

  if (!allExist) {
    console.log(
      "[PortfolioGrid] Required elements not found. Skipping initialization.",
    );
    return;
  }

  console.log("[PortfolioGrid] Initializing portfolio grid system...");

  // Portfolio configuration and data
  const categories = [
    { id: 0, label: "Todo", filter: "all", subs: [] },
    {
      id: 1,
      label: "Diseño",
      filter: "brands",
      subs: [],
    },
    {
      id: 2,
      label: "Webs",
      filter: "dev",
      subs: [],
    },
    {
      id: 3,
      label: "Studio",
      filter: "studio",
      subs: [],
    },
    {
      id: 4,
      label: "Marketing",
      filter: "strategy",
      subs: [],
    },
  ];

  const portfolioData = [
    {
      id: "001",
      slug: "hello-dish",
      discipline: "brands",
      category: ["manual-de-marca", "branding"],
      content_type: "Portfolio",
      title: ["Hello Dish", "Identidad"],
      client_name: "Hello Dish",
      client_industry: "Restaurantes",
      extract:
        "La convergencia entre lo análogo y lo digital nos da lugar a Hello Dish. Un reto de marca que nos llevó a crear un manual de marca y una identidad visual que reflejara la cultura de la marca.",
      cover_image:
        "../../../assets/images/portfolio/hello-dish-portfolio-card.jpg",
      logo: "../../../assets/images/portfolio/logos/hello-dish-logo.jpg",
    },
    {
      id: "002",
      discipline: "brands",
      category: ["manual-de-marca", "branding"],
      title: ["Klef", "Identidad"],
      client_name: "Klef",
      client_industry: "Agencia de Marketing Digital",
      extract:
        "Mostramos el proceso de desarrollo del alma de nuestra marca. Klef no es solo una agencia, es una familia.",
      cover_image: "../../../assets/images/portfolio/klef-brand-cover-3.jpg",
      logo: "../../../assets/images/portfolio/logos/cropped-klef-logo.jpg?v0",
    },
    {
      id: "003",
      discipline: "brands",
      category: ["manual-de-marca", "branding"],
      title: ["Casa Valentina", "Iden..."],
      client_name: "Casa Valentina",
      client_industry: "Restaurante",
      extract:
        "La evolución de la identidad visual de Casa Valentina, es una historia que nos muestra como el mercado debe ser la brujula de la marca.",
      cover_image: "../../../assets/images/portfolio/casa-valentina-cover.jpg",
      logo: "../../../assets/images/portfolio/logos/casa-valentina-logo.jpg",
    },
    {
      id: "004",
      discipline: "dev",
      category: ["pagina-web", "diseño-y-desarrollo"],
      title: ["JB Pools", "Website"],
      client_name: "JB Pools",
      client_industry: "Piscinas, Construcción",
      extract:
        "La web de JB Pools es un ejemplo del equilibrio entre diseño y funcionalidad...",
      cover_image:
        "../../../assets/images/portfolio/jbpools-web-design-cover.jpg",
      logo: "../../../assets/images/portfolio/logos/jbpools-logo.jpg",
    },
    {
      id: "005",
      discipline: "studio",
      category: ["sesion-de-video", "multimedia"],
      title: ["Cumbre del Tezal", "V.."],
      client_name: "Cumbre del Tezal",
      client_industry: "Bienes raíces",
      extract:
        "Este proyecto de storytelling nos conecta con el estilo de vida de Cumbre del Tezal, cada frame cuenta una historia.",
      cover_image:
        "../../../assets/images/portfolio/cumbre-del-tezal-content-cover.jpg",
      logo: "../../../assets/images/portfolio/logos/cumbre-del-tezal-logo.jpg",
    },
    {
      id: "006",
      discipline: "strategy",
      category: ["proceso-ventas", "operacion"],
      title: ["Caso de estudio", "Ventas"],
      client_name: "Tour Company",
      client_industry: "Turismo",
      extract:
        "Este proyecto de storytelling nos conecta con el estilo de vida de Cumbre del Tezal, cada frame cuenta una historia.",
      cover_image:
        "../../../assets/images/portfolio/tour-brand-strategy-cover.jpg",
      logo: "../../../assets/images/portfolio/logos/klef-strategy-symbol.jpg",
    },
  ];

  const disciplineLabels = {
    brands: "Klef Brands",
    dev: "Klef Dev",
    studio: "Klef Studio",
    strategy: "Klef Strategy",
  };

  const subMapping = {
    "Identidad visual": "Identidad Visual",
    Logo: "Logo",
    "Brand Kit": "Brand Kit",
    Desarrollo: "Desarrollo Web",
    Diseño: "Diseño UI/UX",
    App: "App",
    Foto: "Fotografía",
    Video: "Video",
    Planning: "Planning",
    Estrategia: "Marketing Digital",
    "Social Media": "Social Media",
    Ads: "Ads",
    Estudios: "Consultoría",
  };

  const tabsList = document.getElementById("tabsList");
  const desktopSubChips = document.getElementById("desktopSubChips");
  const mobileSubDock = document.getElementById("mobileSubDock");
  const searchInputPortfolio = document.getElementById("tab-search__bar");
  const searchingCheckbox = document.getElementById("is-searching");
  const cardGrid = document.getElementById("cardGrid");
  const resultsCount = document.getElementById("results-count");

  if (!resultsCount) {
    console.warn("[PortfolioGrid] resultsCount element not found!");
  }

  let activeId = 0;
  let currentSub = "";
  let searchTerm = "";

  function createCardTemplate(card) {
    return `
        <article class="card dark" data-id="${card.id}" data-discipline="${card.discipline}">
          <span class="category-tag tag-${card.discipline}">${disciplineLabels[card.discipline]}</span>
          <img src="${card.cover_image}" alt="${card.title[0]}">
          <section>
            <div class="project-header">
              <div class="project-logo">
                <img src="${card.logo || card.cover_image}" alt="${card.title[0]}">
              </div>
              <div class="project-title">
                <h2>
                  ${card.title[0]} <small>| ${card.title[1]}</small>
                </h2>
                <span>${card.category.join(", ")}</span>
              </div>
            </div>
            <p><br>
              ${card.extract}
            </p>
            <div class="project-actions">
              <div class="tag-portfolio" role="button" tabindex="0" aria-label="Leer historia de ${card.title[0]}">
                <i class="fa-solid fa-user"></i> Leer historia
              </div>
              <button class="see-more" data-component="portfolioDetail" data-id="${card.id}" aria-label="Ver detalles de ${card.title[0]}">Más</button>
            </div>
          </section>
        </article>
      `;
  }

  function renderCards(cards) {
    cardGrid.innerHTML = cards.map((card) => createCardTemplate(card)).join("");
    if (resultsCount) {
      resultsCount.textContent = `${cards.length} Proyecto${cards.length !== 1 ? "s" : ""}`;
    }
  }

  function applyFilters() {
    let filtered = portfolioData;

    const currentFilter = categories[activeId].filter;

    if (currentFilter !== "all") {
      filtered = filtered.filter((card) => card.discipline === currentFilter);
    }

    if (currentSub) {
      const mapped = subMapping[currentSub];
      if (mapped) {
        filtered = filtered.filter((card) =>
          card.category.some((c) =>
            c.toLowerCase().includes(mapped.toLowerCase()),
          ),
        );
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.title.some((t) =>
            t.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          card.category.some((c) =>
            c.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          card.client_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    renderCards(filtered);
  }

  function renderTabs() {
    tabsList.innerHTML = categories
      .map(
        (cat) => `
        <li data-name="${cat.label}">
          <button class="tab-button ${cat.id === activeId ? "active" : ""}" data-id="${cat.id}" aria-label="Filtrar por ${cat.label}" aria-pressed="${cat.id === activeId}">
            ${cat.label}
            ${cat.subs.length > 0 ? '<span class="has-sub-indicator"></span>' : ""}
          </button>
        </li>
      `,
      )
      .join("");
  }

  function updateSubMenus() {
    const category = categories.find((c) => c.id === activeId);

    // Limpiamos ambos contenedores primero
    desktopSubChips.innerHTML = "";
    mobileSubDock.innerHTML = "";
    desktopSubChips.classList.remove("active");
    mobileSubDock.classList.remove("active");

    if (!category || category.subs.length === 0) return;

    const isMobile = window.innerWidth <= 768;

    const chipsHTML = category.subs
      .map(
        (sub) => `
        <div class="${isMobile ? "sub-chip-mobile" : "sub-chip"}" onclick="selectSub(this)" role="button" tabindex="0" aria-label="Filtrar por ${sub}">
            ${sub}
        </div>
    `,
      )
      .join("");

    if (isMobile) {
      mobileSubDock.innerHTML = chipsHTML;
      mobileSubDock.classList.add("active");
    } else {
      desktopSubChips.innerHTML = chipsHTML;
      desktopSubChips.classList.add("active");

      // Calcular la posición del submenú en función del índice del botón activo
      const activeIndex = categories.findIndex((c) => c.id === activeId);
      const buttonWidth = 120; // Ancho aproximado de cada botón
      const offset = activeIndex * buttonWidth;

      // Asegurar que el submenú no se salga del viewport
      const viewportWidth = window.innerWidth;
      const subMenuWidth = desktopSubChips.offsetWidth;
      const maxOffset = viewportWidth - subMenuWidth - 20; // Margen de 20px

      const leftPosition = Math.min(offset, maxOffset);

      desktopSubChips.style.left = `${leftPosition}px`;
      desktopSubChips.style.transform = "translateY(10px)";
    }
  }

  window.selectSub = (el) => {
    const selector = el.classList.contains("sub-chip-mobile")
      ? ".sub-chip-mobile"
      : ".sub-chip";
    document
      .querySelectorAll(selector)
      .forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  };

  tabsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-button");
    if (!btn) return;

    activeId = parseInt(btn.getAttribute("data-id"));
    renderTabs(); // Tu función que pinta los botones de arriba
    updateSubMenus();
    applyFilters();

    // Scroll automático para centrar el botón activo en móvil
    if (window.innerWidth <= 768) {
      // Usar setTimeout para esperar a que el DOM se actualice
      setTimeout(() => {
        const container = document.getElementById("tabsContainer");
        const activeButton = container.querySelector(".tab-button.active");

        if (!activeButton) return;

        const containerWidth = container.offsetWidth;
        const buttonWidth = activeButton.offsetWidth;
        const buttonOffset = activeButton.offsetLeft;

        // Calcular la posición de scroll para centrar el botón
        const scrollPosition =
          buttonOffset - containerWidth / 2 + buttonWidth / 2;

        // Asegurar que el scroll no exceda los límites del contenedor
        const maxScroll = container.scrollWidth - containerWidth;
        const finalScroll = Math.min(Math.max(0, scrollPosition), maxScroll);

        // Aplicar el scroll
        container.scrollTo({
          left: finalScroll,
          behavior: "smooth",
        });
      }, 0);
    }
    /*END*/
  });

  // Cerrar el menú si se hace clic en una pestaña (opcional pero recomendado)
  tabsList.addEventListener("click", (e) => {
    const container = document.getElementById("tabsContainer");
    if (
      e.target.closest(".tab-button") &&
      container.classList.contains("expanded")
    ) {
      container.classList.remove("expanded");
      const menuIcon = document.getElementById("menuIcon");
      const closeIcon = document.getElementById("closeIcon");
      if (menuIcon) menuIcon.style.display = "block";
      if (closeIcon) closeIcon.style.display = "none";
    }
  });

  if (searchInputPortfolio) {
    searchInputPortfolio.addEventListener("focus", () => {
      if (searchingCheckbox) searchingCheckbox.checked = true;
      desktopSubChips.classList.remove("active");
      mobileSubDock.classList.remove("active");
    });

    searchInputPortfolio.addEventListener("blur", () => {
      if (searchInputPortfolio.value.trim() === "") {
        if (searchingCheckbox) searchingCheckbox.checked = false;
        updateSubMenus();
      }
    });

    searchInputPortfolio.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      applyFilters();
    });
  }

  const menuToggle = document.getElementById("menuToggle");
  const menuIcon = document.getElementById("menuIcon");
  const closeIcon = document.getElementById("closeIcon");
  const tabsContainer = document.getElementById("tabsContainer");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = tabsContainer.classList.toggle("expanded");

      if (isExpanded) {
        if (menuIcon) menuIcon.style.display = "none";
        if (closeIcon) closeIcon.style.display = "block";
      } else {
        if (menuIcon) menuIcon.style.display = "block";
        if (closeIcon) closeIcon.style.display = "none";
      }
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateSubMenus();
    }, 100);
  });

  // Initialize
  renderTabs();
  applyFilters();

  console.log(
    "[PortfolioGrid] Portfolio grid system initialized successfully.",
  );
})();

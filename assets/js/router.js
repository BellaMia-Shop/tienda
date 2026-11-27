/* ============================================
   BellaMia Shop — router.js 2.0
   Controlador del ciclo de vida SPA
   Rutas: #inicio, #catalogo, #producto/:id
   ============================================ */

const Router = (() => {
  let currentRoute = 'inicio';
  let activeFilterCategory = 'todos';
  let activeFilterTipo = '';
  let activeFilterTipoDePiel = '';
  let activeFilterBrand = '';
  let activeFilterBeneficio = '';
  let activeFilterPriceRange = '';
  let activeFilterOnlyOffer = false;
  let activeFilterOnlyStock = false;
  let activeSort = 'destacados';
  let activeSearchQuery = '';

  function getFilterState() {
    return {
      category: activeFilterCategory,
      tipo: activeFilterTipo,
      tipoDePiel: activeFilterTipoDePiel,
      brand: activeFilterBrand,
      beneficio: activeFilterBeneficio,
      priceRange: activeFilterPriceRange,
      onlyOffer: activeFilterOnlyOffer,
      onlyStock: activeFilterOnlyStock,
      sort: activeSort,
      searchQuery: activeSearchQuery
    };
  }

  // ── Inicializar la app ──
  async function init() {
    await Render.loadProducts();
    Store.init();
    injectLayout();

    Store.subscribe(cart => {
      Render.updateCartDrawer(cart);
    });

    setupHeaderScroll();
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  // ── Inyectar layout persistente ──
  function injectLayout() {
    // 1. Header (Mobile toggle + Logo | Nav centro: Inicio, Skincare con dropdown, Bienestar con dropdown, Ofertas, Nosotros | Acciones derecha: Buscador + Carrito)
    const header = document.createElement('header');
    header.className = 'header';
    header.id = 'main-header';
    header.innerHTML = `
      <div class="header__inner container">
        
        <!-- BOTÓN MENÚ MÓVIL (HAMBURGUESA) -->
        <button class="header__mobile-toggle" onclick="Router.openMobileNav()" id="header-mobile-toggle" aria-label="Abrir menú de navegación">
          ${Render.icons.menu}
        </button>

        <!-- LOGO (IZQUIERDA) -->
        <a href="#inicio" onclick="Router.navigate('inicio')" class="header__logo-link" id="header-logo-link">
          <img class="header__logo" src="assets/img/brand/logo-full.png" alt="BellaMia - Skincare & Vitamins">
        </a>

        <!-- NAVEGACIÓN DESKTOP (CENTRO) -->
        <nav class="header__nav" id="desktop-nav">
          <a class="header__nav-link" href="#inicio" onclick="Router.navigate('inicio')" data-route="inicio" id="nav-inicio">Inicio</a>

          <!-- DROPDOWN SKINCARE -->
          <div class="header__nav-item header__dropdown" id="nav-dropdown-skincare">
            <a class="header__nav-link header__dropdown-toggle" href="javascript:void(0)" onclick="Router.goToCatalog('skincare')" data-route="skincare" id="nav-skincare">
              <span>Skincare</span>
              <svg class="header__dropdown-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
            <div class="header__dropdown-menu" role="menu">
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Serum')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Sérums</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Hidratante')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Hidratantes</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Protector Solar')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Protectores Solares</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Tónico')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Tónicos</span>
              </a>
              <div class="dropdown-divider"></div>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Cuidado Capilar')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Cuidado Capilar</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Cuidado Corporal')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Cuidado Corporal</span>
              </a>
              <div class="dropdown-divider"></div>
              <a href="javascript:void(0)" onclick="Router.goToCatalog('skincare')" class="header__dropdown-item header__dropdown-item--all" role="menuitem">
                Ver todo Skincare & Cuidado Personal &rarr;
              </a>
            </div>
          </div>

          <!-- DROPDOWN BIENESTAR -->
          <div class="header__nav-item header__dropdown" id="nav-dropdown-bienestar">
            <a class="header__nav-link header__dropdown-toggle" href="javascript:void(0)" onclick="Router.goToBienestar()" data-route="bienestar" id="nav-bienestar">
              <span>Bienestar</span>
              <svg class="header__dropdown-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
            <div class="header__dropdown-menu" role="menu">
              <a href="javascript:void(0)" onclick="Router.goToCatalog('vitaminas')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Vitaminas</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.goToCatalog('suplementos')" class="header__dropdown-item" role="menuitem">
                <span class="dropdown-item-title">Suplementos</span>
              </a>
              <div class="dropdown-divider"></div>
              <a href="javascript:void(0)" onclick="Router.goToBienestar()" class="header__dropdown-item header__dropdown-item--all" role="menuitem">
                Ver todo Bienestar &rarr;
              </a>
            </div>
          </div>

          <!-- OFERTAS -->
          <a class="header__nav-link header__nav-link--ofertas" href="javascript:void(0)" onclick="Router.goToOffers()" data-route="ofertas" id="nav-ofertas">
            <span>Ofertas</span>
            <span class="nav-oferta-badge">%</span>
          </a>

          <!-- NOSOTROS -->
          <a class="header__nav-link" href="#nosotros" onclick="Router.navigate('nosotros')" data-route="nosotros" id="nav-nosotros">Nosotros</a>
        </nav>

        <!-- ACCIONES (DERECHA: BUSCADOR DESPLEGABLE + CARRITO) -->
        <div class="header__actions">
          
          <!-- ICONO DE BÚSQUEDA DESPLEGABLE -->
          <div class="header__search-container" id="header-search-container">
            <button class="header__search-toggle-btn" onclick="Router.toggleHeaderSearch()" id="header-search-trigger" aria-label="Buscar productos">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <div class="header__search-expand" id="header-search-expand">
              <input type="text" class="header__search-expand-input" id="headerSearchInput" placeholder="Buscar productos, marcas..." onkeypress="if(event.key==='Enter') Router.submitHeaderSearch(this.value)">
              <button class="header__search-submit-btn" onclick="Router.submitHeaderSearch(document.getElementById('headerSearchInput').value)" aria-label="Ejecutar búsqueda">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
              <button class="header__search-close-btn" onclick="Router.closeHeaderSearch()" aria-label="Cerrar búsqueda">${Render.icons.x}</button>
            </div>
          </div>

          <!-- CARRITO -->
          <button class="header__cart-btn" onclick="Render.openCart()" id="header-cart-btn" aria-label="Abrir carrito de compras">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span class="header__cart-badge" id="cart-badge">0</span>
          </button>
        </div>
      </div>
    `;
    document.body.prepend(header);

    // 2. Cart Drawer
    const cartContainer = document.createElement('div');
    cartContainer.id = 'cart-container';
    cartContainer.innerHTML = Render.renderCartDrawer();
    document.body.appendChild(cartContainer);

    // 3. Filter Drawer (Panel Flotante Lateral Derecho)
    const filterContainer = document.createElement('div');
    filterContainer.id = 'filter-container';
    filterContainer.innerHTML = `
      <div class="filter-drawer-overlay" id="filter-overlay" onclick="Router.closeFilterDrawer()"></div>
      <div class="filter-drawer" id="filter-drawer" role="dialog" aria-modal="true" aria-label="Filtros del Catálogo"></div>
    `;
    document.body.appendChild(filterContainer);

    // 4. Mobile Navigation Drawer (Panel Deslizante Izquierdo para Celulares)
    const mobileNavContainer = document.createElement('div');
    mobileNavContainer.id = 'mobile-nav-container';
    mobileNavContainer.innerHTML = `
      <div class="mobile-nav-overlay" id="mobile-nav-overlay" onclick="Router.closeMobileNav()"></div>
      <aside class="mobile-nav-drawer" id="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Menú de Navegación">
        <div class="mobile-nav-header">
          <a href="#inicio" onclick="Router.navigate('inicio'); Router.closeMobileNav();" class="mobile-nav-logo-link">
            <img class="mobile-nav-logo" src="assets/img/brand/logo-full.png" alt="BellaMia Shop">
          </a>
          <button class="mobile-nav-close" onclick="Router.closeMobileNav()" aria-label="Cerrar menú">
            ${Render.icons.x}
          </button>
        </div>

        <div class="mobile-nav-body">
          <!-- Inicio -->
          <a href="#inicio" onclick="Router.navigate('inicio'); Router.closeMobileNav();" class="mobile-nav-item" data-route="inicio">
            <span class="mobile-nav-item-icon">${Render.icons.home}</span>
            <span class="mobile-nav-item-text">Inicio</span>
          </a>

          <!-- Skincare Acordeón -->
          <div class="mobile-nav-accordion" id="mnav-acc-skincare">
            <button type="button" class="mobile-nav-accordion-row" onclick="Router.toggleMobileSubmenu('skincare')" aria-expanded="false" aria-label="Desplegar submenú Skincare">
              <span class="mobile-nav-accordion-link">
                <span class="mobile-nav-item-icon">${Render.icons.sparkle}</span>
                <span class="mobile-nav-item-text">Skincare</span>
              </span>
              <span class="mobile-nav-accordion-toggle">
                <svg class="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>
            <div class="mobile-nav-sublist" id="mnav-sub-skincare">
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Serum')" class="mobile-nav-subitem">
                <span>Sérums</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Hidratante')" class="mobile-nav-subitem">
                <span>Hidratantes</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Protector Solar')" class="mobile-nav-subitem">
                <span>Protectores Solares</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Tónico')" class="mobile-nav-subitem">
                <span>Tónicos</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Cuidado Capilar')" class="mobile-nav-subitem">
                <span>Cuidado Capilar</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.filterSubcategory('skincare', 'Cuidado Corporal')" class="mobile-nav-subitem">
                <span>Cuidado Corporal</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.goToCatalog('skincare'); Router.closeMobileNav();" class="mobile-nav-subitem mobile-nav-subitem--all">
                Ver todo Skincare & Cuidado Personal &rarr;
              </a>
            </div>
          </div>

          <!-- Bienestar Acordeón -->
          <div class="mobile-nav-accordion" id="mnav-acc-bienestar">
            <button type="button" class="mobile-nav-accordion-row" onclick="Router.toggleMobileSubmenu('bienestar')" aria-expanded="false" aria-label="Desplegar submenú Bienestar">
              <span class="mobile-nav-accordion-link">
                <span class="mobile-nav-item-icon">${Render.icons.leaf}</span>
                <span class="mobile-nav-item-text">Bienestar</span>
              </span>
              <span class="mobile-nav-accordion-toggle">
                <svg class="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>
            <div class="mobile-nav-sublist" id="mnav-sub-bienestar">
              <a href="javascript:void(0)" onclick="Router.goToCatalog('vitaminas'); Router.closeMobileNav();" class="mobile-nav-subitem">
                <span>Vitaminas</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.goToCatalog('suplementos'); Router.closeMobileNav();" class="mobile-nav-subitem">
                <span>Suplementos</span>
              </a>
              <a href="javascript:void(0)" onclick="Router.goToBienestar(); Router.closeMobileNav();" class="mobile-nav-subitem mobile-nav-subitem--all">
                Ver todo Bienestar &rarr;
              </a>
            </div>
          </div>

          <!-- Ofertas -->
          <a href="javascript:void(0)" onclick="Router.goToOffers(); Router.closeMobileNav();" class="mobile-nav-item mobile-nav-item--ofertas" data-route="ofertas">
            <span class="mobile-nav-item-icon">${Render.icons.tag}</span>
            <span class="mobile-nav-item-text">Ofertas</span>
            <span class="mobile-nav-badge-sale">% OFF</span>
          </a>

          <!-- Nosotros -->
          <a href="#nosotros" onclick="Router.navigate('nosotros'); Router.closeMobileNav();" class="mobile-nav-item" data-route="nosotros">
            <span class="mobile-nav-item-icon">${Render.icons.users}</span>
            <span class="mobile-nav-item-text">Nosotros</span>
          </a>
        </div>

        <div class="mobile-nav-footer">
          <a href="https://wa.me/59178804382?text=Hola%20BellaMia%20%F0%9F%90%B8%E2%9C%A8%20Quiero%20recibir%20asesor%C3%ADa%20personalizada" target="_blank" rel="noopener noreferrer" class="mobile-nav-wa-btn">
            ${Render.icons.whatsapp}
            <span>Asesoría por WhatsApp</span>
          </a>
        </div>
      </aside>
    `;
    document.body.appendChild(mobileNavContainer);

    // 5. Bottom Nav (Mobile)
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';
    bottomNav.id = 'bottom-nav';
    bottomNav.innerHTML = `
      <button class="bottom-nav__item active" onclick="Router.navigate('inicio')" data-route="inicio" id="bnav-inicio">
        ${Render.icons.home}
        <span class="bottom-nav__label">Inicio</span>
      </button>
      <button class="bottom-nav__item" onclick="Router.openMobileNav()" id="bnav-menu">
        ${Render.icons.menu}
        <span class="bottom-nav__label">Menú</span>
      </button>
      <button class="bottom-nav__item" onclick="Router.navigate('catalogo')" data-route="catalogo" id="bnav-catalogo">
        ${Render.icons.grid}
        <span class="bottom-nav__label">Catálogo</span>
      </button>
      <button class="bottom-nav__item" onclick="Render.openCart()" id="bnav-carrito" aria-label="Abrir carrito de compras">
        ${Render.icons.cart}
        <span class="bottom-nav__label">Carrito</span>
        <span class="bottom-nav__badge" id="bnav-cart-badge" style="display:none;">0</span>
      </button>
    `;
    document.body.appendChild(bottomNav);

    // 5. Floating WhatsApp Button
    const waFloat = document.createElement('a');
    waFloat.className = 'whatsapp-float';
    waFloat.id = 'whatsapp-float';
    waFloat.href = 'https://wa.me/59178804382?text=Hola%20BellaMia%20%F0%9F%90%B8%E2%9C%A8%20Quiero%20recibir%20asesor%C3%ADa%20personalizada';
    waFloat.target = '_blank';
    waFloat.rel = 'noopener noreferrer';
    waFloat.setAttribute('aria-label', 'Contactar asesor por WhatsApp');
    waFloat.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <span class="whatsapp-float__badge">1</span>
    `;
    document.body.appendChild(waFloat);

    // 6. Toast Notification Container
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    document.body.appendChild(toast);

    // 7. Modal Nosotros
    const modalNosotros = document.createElement('div');
    modalNosotros.className = 'modal-overlay';
    modalNosotros.id = 'nosotros-modal';
    modalNosotros.onclick = function(e) { if (e.target === this) Router.closeNosotrosModal(); };
    modalNosotros.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="Router.closeNosotrosModal()" aria-label="Cerrar modal">${Render.icons.x}</button>
        <div class="nosotros-modal__inner">
          <img src="assets/img/brand/logo-full.png" alt="BellaMia" class="nosotros-modal__logo">
          <span class="nosotros-modal__tag">Tu bienestar, nuestra belleza</span>
          <h2>Sobre BellaMia Shop</h2>
          <p><strong>BellaMia</strong> es tu boutique digital especializada en Skincare de cosmética avanzada, Vitaminas y Suplementos 100% originales de las mejores marcas internacionales.</p>
          <div class="nosotros-features">
            <div class="nosotros-feature-item">
              <span class="nosotros-feature-icon">${Render.icons.shield}</span>
              <div>
                <strong>Productos Originales</strong>
                <p>Garantía de autenticidad en cada producto de nuestro catálogo.</p>
              </div>
            </div>
            <div class="nosotros-feature-item">
              <span class="nosotros-feature-icon">${Render.icons.chat}</span>
              <div>
                <strong>Asesoría Especializada</strong>
                <p>Atención directa por WhatsApp (78804382) para armar tu rutina ideal.</p>
              </div>
            </div>
            <div class="nosotros-feature-item">
              <span class="nosotros-feature-icon">${Render.icons.truck}</span>
              <div>
                <strong>Envíos a toda Bolivia</strong>
                <p>Despachos rápidos y seguros a todos los departamentos.</p>
              </div>
            </div>
          </div>
          <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20recibir%20asesor%C3%ADa%20personalizada" target="_blank" rel="noopener" class="btn btn--whatsapp btn--full" style="margin-top: 1.5rem;">
            ${Render.icons.whatsapp} Contactar Asesor por WhatsApp
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modalNosotros);
  }

  // ── Manejar cambios de ruta ──
  function handleRoute() {
    const hash = location.hash.slice(1) || 'inicio';
    const [page, param] = hash.split('/');

    window.scrollTo(0, 0);

    const app = document.getElementById('app');
    if (!app) return;

    app.classList.add('page-transitioning');

    setTimeout(async () => {
      // Si salimos de la página de inicio, detenemos el temporizador del slider
      if (currentRoute === 'inicio' && page !== 'inicio') {
        if (typeof Render.stopHeroSliderTimer === 'function') {
          Render.stopHeroSliderTimer();
        }
      }

      const products = await Render.loadProducts();

      switch (page) {
        case 'inicio':
          app.innerHTML = Render.renderHome(products);
          currentRoute = 'inicio';
          setTimeout(() => Render.initHeroSwipe(), 50);
          break;

        case 'catalogo':
          if (param) {
            const pNorm = param.toLowerCase();
            if (pNorm === 'ofertas') {
              activeFilterCategory = 'todos';
              activeFilterTipo = '';
              activeFilterOnlyOffer = true;
            } else if (['skincare', 'vitaminas', 'suplementos', 'bienestar', 'todos'].includes(pNorm)) {
              activeFilterCategory = pNorm;
              activeFilterOnlyOffer = false;
            }
          }
          app.innerHTML = Render.renderCatalog(products, getFilterState());
          currentRoute = 'catalogo';
          break;

        case 'skincare':
          activeFilterCategory = 'skincare';
          activeFilterTipo = '';
          activeFilterOnlyOffer = false;
          app.innerHTML = Render.renderCatalog(products, getFilterState());
          currentRoute = 'catalogo';
          break;

        case 'bienestar':
          activeFilterCategory = 'bienestar';
          activeFilterTipo = '';
          activeFilterOnlyOffer = false;
          app.innerHTML = Render.renderCatalog(products, getFilterState());
          currentRoute = 'catalogo';
          break;

        case 'ofertas':
          activeFilterCategory = 'todos';
          activeFilterTipo = '';
          activeFilterOnlyOffer = true;
          app.innerHTML = Render.renderCatalog(products, getFilterState());
          currentRoute = 'catalogo';
          break;

        case 'producto':
          const product = Render.getProductById(param);
          app.innerHTML = Render.renderDetail(product);
          currentRoute = 'producto';
          setTimeout(() => Render.initGallerySwipe(), 50);
          break;

        case 'nosotros':
          app.innerHTML = Render.renderNosotros();
          currentRoute = 'nosotros';
          break;

        default:
          app.innerHTML = Render.renderHome(products);
          currentRoute = 'inicio';
      }

      updateNavStates(page);

      requestAnimationFrame(() => {
        app.classList.remove('page-transitioning');
      });

      observeElements();
    }, 120);
  }

  // ── Navegación programática ──
  function navigate(page, category) {
    closeHeaderDropdowns();
    closeMobileNav();
    if (category) {
      activeFilterCategory = category;
    }
    if (page === 'catalogo' && !category) {
      activeFilterCategory = 'todos';
      activeFilterTipo = '';
      activeFilterTipoDePiel = '';
      activeFilterBrand = '';
      activeFilterBeneficio = '';
      activeFilterPriceRange = '';
      activeFilterOnlyOffer = false;
      activeFilterOnlyStock = false;
      activeSort = 'destacados';
      activeSearchQuery = '';
    }
    if (location.hash === `#${page}` && page === 'catalogo') {
      refreshCatalogView();
      return;
    }
    if (location.hash === `#${page}` || (location.hash === '' && page === 'inicio')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    location.hash = page;
  }

  // ── Filtrar catálogo en caliente ──
  // Si ya estamos en #catalogo se re-renderiza en sitio; si no, se cambia el hash
  // y handleRoute() renderiza con los filtros activos (URL, atrás y recarga coherentes).
  async function refreshCatalogView({ keepSearchFocus = false } = {}) {
    if (location.hash !== '#catalogo') {
      location.hash = 'catalogo';
      return;
    }
    const app = document.getElementById('app');
    const products = await Render.loadProducts();
    if (app) {
      app.innerHTML = Render.renderCatalog(products, getFilterState());
    }
    updateNavStates('catalogo');
    observeElements();
    if (keepSearchFocus) {
      const input = document.getElementById('searchInput');
      if (input) {
        input.focus({ preventScroll: true });
        const end = input.value.length;
        input.setSelectionRange(end, end);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function filterCatalog(category) {
    activeFilterCategory = category;
    closeHeaderDropdowns();
    closeMobileNav();
    refreshCatalogView();
  }

  // Enlace profundo al catálogo con filtros limpios (usado por footer y CTAs)
  function goToCatalog(category = 'todos', query = '') {
    activeFilterCategory = category || 'todos';
    activeFilterTipo = '';
    activeFilterTipoDePiel = '';
    activeFilterBrand = '';
    activeFilterBeneficio = '';
    activeFilterPriceRange = '';
    activeFilterOnlyOffer = false;
    activeFilterOnlyStock = false;
    activeSort = 'destacados';
    activeSearchQuery = query;
    closeHeaderDropdowns();
    closeMobileNav();
    refreshCatalogView();
  }

  function filterCatalogByTipo(tipo) {
    activeFilterCategory = 'todos';
    activeFilterTipo = tipo;
    activeFilterTipoDePiel = '';
    activeFilterBrand = '';
    activeFilterBeneficio = '';
    activeFilterPriceRange = '';
    activeFilterOnlyOffer = false;
    activeFilterOnlyStock = false;
    activeSort = 'destacados';
    activeSearchQuery = '';
    closeHeaderDropdowns();
    closeMobileNav();
    refreshCatalogView();
  }

  function filterCatalogByBeneficio(beneficio) {
    activeFilterCategory = 'todos';
    activeFilterTipo = '';
    activeFilterTipoDePiel = '';
    activeFilterBrand = '';
    activeFilterBeneficio = beneficio;
    activeFilterPriceRange = '';
    activeFilterOnlyOffer = false;
    activeFilterOnlyStock = false;
    activeSort = 'destacados';
    activeSearchQuery = '';
    closeHeaderDropdowns();
    closeMobileNav();
    refreshCatalogView();
  }

  // Navegación directa a Bienestar (Vitaminas + Suplementos)
  function goToBienestar() {
    activeFilterCategory = 'bienestar';
    activeFilterTipo = '';
    activeFilterTipoDePiel = '';
    activeFilterBrand = '';
    activeFilterBeneficio = '';
    activeFilterPriceRange = '';
    activeFilterOnlyOffer = false;
    activeFilterOnlyStock = false;
    activeSort = 'destacados';
    activeSearchQuery = '';
    closeHeaderDropdowns();
    closeMobileNav();
    if (location.hash !== '#catalogo') {
      location.hash = 'catalogo';
    } else {
      refreshCatalogView();
    }
  }

  // Navegación directa a Ofertas
  function goToOffers() {
    activeFilterCategory = 'todos';
    activeFilterTipo = '';
    activeFilterTipoDePiel = '';
    activeFilterBrand = '';
    activeFilterBeneficio = '';
    activeFilterPriceRange = '';
    activeFilterOnlyOffer = true;
    activeFilterOnlyStock = false;
    activeSort = 'destacados';
    activeSearchQuery = '';
    closeHeaderDropdowns();
    closeMobileNav();
    if (location.hash !== '#catalogo') {
      location.hash = 'catalogo';
    } else {
      refreshCatalogView();
    }
  }

  // Filtrar categoría y tipo específico (ej: Skincare -> Sérums)
  function filterSubcategory(category, tipo) {
    activeFilterCategory = category || 'todos';
    activeFilterTipo = tipo || '';
    activeFilterTipoDePiel = '';
    activeFilterBrand = '';
    activeFilterBeneficio = '';
    activeFilterPriceRange = '';
    activeFilterOnlyOffer = false;
    activeFilterOnlyStock = false;
    activeSort = 'destacados';
    activeSearchQuery = '';
    closeHeaderDropdowns();
    closeMobileNav();
    if (location.hash !== '#catalogo') {
      location.hash = 'catalogo';
    } else {
      refreshCatalogView();
    }
  }

  // ── Ocultar / Cerrar menús desplegables del Header al seleccionar opción ──
  function closeHeaderDropdowns() {
    document.querySelectorAll('.header__dropdown').forEach(dropdown => {
      dropdown.classList.add('is-closed');
      setTimeout(() => {
        dropdown.classList.remove('is-closed');
      }, 400);
    });
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  // ── Control del Drawer de Navegación Móvil ──
  function openMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const overlay = document.getElementById('mobile-nav-overlay');
    const bnavMenu = document.getElementById('bnav-menu');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      if (bnavMenu) bnavMenu.classList.add('active');
    }
  }

  function closeMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const overlay = document.getElementById('mobile-nav-overlay');
    const bnavMenu = document.getElementById('bnav-menu');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (bnavMenu) bnavMenu.classList.remove('active');
      updateNavStates(currentRoute);
    }
  }

  function toggleMobileSubmenu(key) {
    const accordion = document.getElementById(`mnav-acc-${key}`);
    const toggleBtn = accordion ? accordion.querySelector('.mobile-nav-accordion-row') : null;
    if (accordion) {
      const isOpen = accordion.classList.toggle('open');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    }
  }

  function navigateToHomeCategorySection(filterKey) {
    if (location.hash !== '#inicio' && location.hash !== '') {
      location.hash = 'inicio';
      setTimeout(() => {
        scrollToCategorySection(filterKey);
      }, 250);
    } else {
      scrollToCategorySection(filterKey);
    }
  }

  function scrollToCategorySection(filterKey) {
    const section = document.getElementById('section-categories');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (filterKey) {
        const cardId = `cat-type-${filterKey.toLowerCase().replace(/\s+/g, '-')}`;
        const card = document.getElementById(cardId);
        if (card) {
          card.classList.add('highlight-pulse');
          setTimeout(() => card.classList.remove('highlight-pulse'), 1800);
        }
      }
    }
  }

  // ── Panel Flotante de Filtros (Derecho) ──
  async function openFilterDrawer() {
    const products = await Render.loadProducts();
    const drawer = document.getElementById('filter-drawer');
    const overlay = document.getElementById('filter-overlay');

    if (drawer && overlay) {
      drawer.innerHTML = Render.renderFilterDrawerContent(products, getFilterState());
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeFilterDrawer() {
    const drawer = document.getElementById('filter-drawer');
    const overlay = document.getElementById('filter-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      refreshCatalogView();
    }
  }

  async function updateFilterDrawerLive() {
    const drawer = document.getElementById('filter-drawer');
    if (drawer && drawer.classList.contains('open')) {
      const products = await Render.loadProducts();
      drawer.innerHTML = Render.renderFilterDrawerContent(products, getFilterState());
    }
  }

  function setFilterCategory(cat) {
    activeFilterCategory = cat;
    updateFilterDrawerLive();
  }

  function setFilterTipo(tipo) {
    activeFilterTipo = (activeFilterTipo === tipo) ? '' : tipo;
    updateFilterDrawerLive();
  }

  function setFilterTipoDePiel(tipoDePiel) {
    activeFilterTipoDePiel = (activeFilterTipoDePiel === tipoDePiel) ? '' : tipoDePiel;
    updateFilterDrawerLive();
  }

  function setFilterBrand(brand) {
    activeFilterBrand = (activeFilterBrand.toLowerCase() === brand.toLowerCase()) ? '' : brand;
    updateFilterDrawerLive();
  }

  function setFilterBeneficio(beneficio) {
    activeFilterBeneficio = (activeFilterBeneficio === beneficio) ? '' : beneficio;
    updateFilterDrawerLive();
  }

  function setFilterPriceRange(range) {
    activeFilterPriceRange = (activeFilterPriceRange === range) ? '' : range;
    updateFilterDrawerLive();
  }

  function toggleFilterOnlyOffer() {
    activeFilterOnlyOffer = !activeFilterOnlyOffer;
    updateFilterDrawerLive();
  }

  function toggleFilterOnlyStock() {
    activeFilterOnlyStock = !activeFilterOnlyStock;
    updateFilterDrawerLive();
  }

  function setFilterSort(sort) {
    activeSort = sort;
    updateFilterDrawerLive();
  }

  function applyFilters() {
    closeFilterDrawer();
    refreshCatalogView();
  }

  function resetAllFilters() {
    activeFilterCategory = 'todos';
    activeFilterTipo = '';
    activeFilterTipoDePiel = '';
    activeFilterBrand = '';
    activeFilterBeneficio = '';
    activeFilterPriceRange = '';
    activeFilterOnlyOffer = false;
    activeFilterOnlyStock = false;
    activeSort = 'destacados';
    activeSearchQuery = '';
    closeFilterDrawer();
    refreshCatalogView();
  }

  function clearCategoryFilter() {
    activeFilterCategory = 'todos';
    refreshCatalogView();
  }

  function clearTipoFilter() {
    activeFilterTipo = '';
    refreshCatalogView();
  }

  function clearTipoDePielFilter() {
    activeFilterTipoDePiel = '';
    refreshCatalogView();
  }

  function clearBrandFilter() {
    activeFilterBrand = '';
    refreshCatalogView();
  }

  function clearBeneficioFilter() {
    activeFilterBeneficio = '';
    refreshCatalogView();
  }

  function clearPriceRangeFilter() {
    activeFilterPriceRange = '';
    refreshCatalogView();
  }

  function clearOfferFilter() {
    activeFilterOnlyOffer = false;
    refreshCatalogView();
  }

  function clearStockFilter() {
    activeFilterOnlyStock = false;
    refreshCatalogView();
  }

  function clearSortFilter() {
    activeSort = 'destacados';
    refreshCatalogView();
  }

  // ── Buscar desde el Header ──
  function toggleHeaderSearch() {
    const container = document.getElementById('header-search-container');
    if (!container) return;
    const isActive = container.classList.toggle('active');
    if (isActive) {
      const input = document.getElementById('headerSearchInput');
      if (input) {
        setTimeout(() => input.focus(), 150);
      }
    }
  }

  function closeHeaderSearch() {
    const container = document.getElementById('header-search-container');
    if (container) {
      container.classList.remove('active');
    }
  }

  function submitHeaderSearch(query) {
    if (!query || !query.trim()) return;
    closeHeaderSearch();
    activeSearchQuery = query.trim();
    refreshCatalogView();
  }

  let searchDebounce = null;
  function searchCatalog(query) {
    activeSearchQuery = query;
    const typing = document.activeElement && document.activeElement.id === 'searchInput';
    clearTimeout(searchDebounce);
    if (!typing) { refreshCatalogView(); return; }
    searchDebounce = setTimeout(() => refreshCatalogView({ keepSearchFocus: true }), 180);
  }

  // ── Modal Nosotros ──
  function openNosotrosModal() {
    const modal = document.getElementById('nosotros-modal');
    if (modal) modal.classList.add('open');
  }

  function closeNosotrosModal() {
    const modal = document.getElementById('nosotros-modal');
    if (modal) modal.classList.remove('open');
  }

  // ── Actualizar estado de navegación activa y visibilidad de WhatsApp flotante ──
  function updateNavStates(page) {
    document.querySelectorAll('.header__nav-link').forEach(link => {
      let isActive = link.dataset.route === page;
      if (page === 'catalogo') {
        if (activeFilterOnlyOffer && link.dataset.route === 'ofertas') isActive = true;
        else if (activeFilterCategory === 'skincare' && link.dataset.route === 'skincare') isActive = true;
        else if ((activeFilterCategory === 'bienestar' || activeFilterCategory === 'vitaminas' || activeFilterCategory === 'suplementos') && link.dataset.route === 'bienestar') isActive = true;
      }
      link.classList.toggle('active', isActive);
    });

    document.querySelectorAll('.bottom-nav__item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === page);
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      let isActive = item.dataset.route === page;
      if (page === 'catalogo' && activeFilterOnlyOffer && item.dataset.route === 'ofertas') isActive = true;
      item.classList.toggle('active', isActive);
    });

    // Botón flotante de WhatsApp: visible en Inicio y Nosotros
    const waFloat = document.getElementById('whatsapp-float');
    if (waFloat) {
      if (page === 'inicio' || page === 'nosotros') {
        waFloat.classList.remove('page-hidden');
      } else {
        waFloat.classList.add('page-hidden');
      }
    }
  }

  // ── Efectos de scroll en el Header ──
  function setupHeaderScroll() {
    window.addEventListener('scroll', () => {
      const header = document.getElementById('main-header');
      if (!header) return;
      if (window.scrollY > 15) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });

    document.addEventListener('click', (e) => {
      // Cerrar menú desplegable al hacer clic en cualquiera de sus opciones
      if (e.target.closest('.header__dropdown-item') || e.target.closest('.header__dropdown-menu a')) {
        closeHeaderDropdowns();
      }

      const container = document.getElementById('header-search-container');
      if (container && container.classList.contains('active')) {
        if (!container.contains(e.target)) {
          closeHeaderSearch();
        }
      }
    });

    // Accesibilidad y ergonomía en computadoras: Tecla Escape cierra paneles y modales
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeHeaderSearch();
        closeMobileNav();
        if (typeof Render.closeCart === 'function') Render.closeCart();
        closeFilterDrawer();
        closeNosotrosModal();
      }
    });
  }

  // ── Animaciones al hacer scroll ──
  function observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.product-card, .category-card, .trust-card, .brand-item').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = `opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)`;
      observer.observe(el);
    });
  }

  return {
    init,
    navigate,
    filterCatalog,
    goToCatalog,
    goToBienestar,
    goToOffers,
    filterSubcategory,
    openMobileNav,
    closeMobileNav,
    closeHeaderDropdowns,
    toggleMobileSubmenu,
    filterCatalogByTipo,
    filterCatalogByBeneficio,
    navigateToHomeCategorySection,
    searchCatalog,
    submitHeaderSearch,
    toggleHeaderSearch,
    closeHeaderSearch,
    openNosotrosModal,
    closeNosotrosModal,
    openFilterDrawer,
    closeFilterDrawer,
    setFilterCategory,
    setFilterTipo,
    setFilterTipoDePiel,
    setFilterBrand,
    setFilterBeneficio,
    setFilterPriceRange,
    toggleFilterOnlyOffer,
    toggleFilterOnlyStock,
    setFilterSort,
    applyFilters,
    resetAllFilters,
    clearCategoryFilter,
    clearTipoFilter,
    clearTipoDePielFilter,
    clearBrandFilter,
    clearBeneficioFilter,
    clearPriceRangeFilter,
    clearOfferFilter,
    clearStockFilter,
    clearSortFilter,
    refreshCatalogView,
    handleRoute
  };
})();

// Exposición global confiable para eventos y scripts
if (typeof window !== 'undefined') {
  window.Router = Router;
}

// ── Arrancar aplicación ──
document.addEventListener('DOMContentLoaded', Router.init);

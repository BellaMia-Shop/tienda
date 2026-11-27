/* ============================================
   BellaMia Shop — render.js 2.0
   Premium Rendering Engine
   Customized Layout per User Specifications
   ============================================ */

const Render = (() => {
  let productosData = [];
  let productsLoaded = false;
  let currentHeroSlide = 0;
  let heroTimer = null;
  let currentGalleryIndex = 0;
  let currentDetailQty = 1;

  async function loadProducts(forceReload = false) {
    if (productsLoaded && !forceReload) return productosData;
    try {
      const res = await fetch(`assets/data/productos.json?v=${Date.now()}`, { cache: "no-store" });
      productosData = await res.json();
      productsLoaded = true;
      return productosData;
    } catch (e) {
      console.error("Error cargando productos:", e);
      productosData = [];
      productsLoaded = true;
      return [];
    }
  }

  function getProductById(id) {
    return productosData.find((p) => p.id === parseInt(id));
  }

  // Normaliza texto para búsquedas sin tildes ni mayúsculas
  function normalizeText(value) {
    return (value == null ? "" : String(value))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // Escapa texto ingresado por el usuario antes de inyectarlo en HTML
  function escapeHtml(value) {
    return (value == null ? "" : String(value)).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  // ── SVG Icons (Outline / Bordes limpios) ──
  const icons = {
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    cart: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    bag: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    filter: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>`,
    truck: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
    shield: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    instagram: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
    facebook: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
    formula: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31a2 2 0 0 1-.37 1.17L4.22 18.4A2 2 0 0 0 5.86 21h12.28a2 2 0 0 0 1.64-2.6l-5.41-7.92A2 2 0 0 1 14 9.31V2"></path><line x1="8.5" y1="2" x2="15.5" y2="2"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>`,
    routine: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    sparkle: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
    leaf: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>`,
    card: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
    chat: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    mapPin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    users: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    info: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    bolt: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    tag: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
    droplet: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
    sparkleGlow: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
    hourglass: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>`,
    energy: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    flame: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
    starFill: `<svg class="star-icon star-icon--fill" viewBox="0 0 24 24" width="13" height="13" fill="#FFB800" stroke="#FFB800" stroke-width="1.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    starOutline: `<svg class="star-icon star-icon--outline" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#D1D5DB" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    checkMini: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    menu: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  };

  function renderStars(rating) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let html = "";
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        html += icons.starFill;
      } else if (i === full && hasHalf) {
        html += `<svg class="star-icon star-icon--half" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FFB800" stroke-width="1.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FFB800" style="clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);"></polygon></svg>`;
      } else {
        html += icons.starOutline;
      }
    }
    return html;
  }

  function getBadgeClass(etiqueta) {
    if (!etiqueta) return "";
    const map = {
      TOP: "product-card__badge--top",
      NUEVO: "product-card__badge--nuevo",
      "BEST SELLER": "product-card__badge--bestseller",
      OFERTA: "product-card__badge--oferta",
    };
    return map[etiqueta] || "product-card__badge--top";
  }

  function getBadgeLabel(etiqueta) {
    const labels = {
      TOP: "TOP VENTAS",
      NUEVO: "NOVEDAD",
      "BEST SELLER": "BESTSELLER",
      OFERTA: "OFERTA",
    };
    return labels[etiqueta] || etiqueta;
  }

  // ── Imágenes genéricas representativas por Tipo y Categoría de Producto ──
  function getRepresentativeFallbacks(product = {}) {
    const tipo = (product.tipo || "").toLowerCase();
    const cat = (product.categoria || "").toLowerCase();

    if (tipo === "suplemento" || cat === "suplementos") {
      return [
        "assets/img/products/generic-suplemento-1.jpg",
        "assets/img/products/generic-suplemento-2.jpg",
        "assets/img/products/protein.jpg",
      ];
    }
    if (tipo === "vitamina" || cat === "vitaminas") {
      return [
        "assets/img/products/vitamin-c.jpg",
        "assets/img/products/generic-suplemento-1.jpg",
        "assets/img/products/generic-suplemento-2.jpg",
      ];
    }
    if (tipo === "serum") {
      return [
        "assets/img/products/serum.jpg",
        "assets/img/products/texture-serum.jpg",
        "assets/img/products/lifestyle-serum.jpg",
      ];
    }
    if (tipo === "protector solar") {
      return [
        "assets/img/products/sunscreen.jpg",
        "assets/img/products/texture-sunscreen.jpg",
        "assets/img/products/lifestyle-cream.jpg",
      ];
    }
    if (tipo === "tónico" || tipo === "tonico") {
      return [
        "assets/img/products/toner.jpg",
        "assets/img/products/texture-serum.jpg",
        "assets/img/products/lifestyle-cleanser.jpg",
      ];
    }
    if (tipo === "cuidado capilar" || tipo === "capilar") {
      return [
        "assets/img/products/hair-biology-silver-glowing-acondicionador-matizador-con-biotina-1.jpg",
        "assets/img/products/dove-mencare-thick-strong-shampoo-y-acondicionador-2-en-1-355-ml-1.jpg",
        "assets/img/products/unite-acondicionador-desenredante-sin-enjuague-7seconds-236-ml-1.jpg",
      ];
    }
    if (tipo === "cuidado corporal" || tipo === "corporal") {
      return [
        "assets/img/products/lume-desodorante-corporal-invisible-spray-mandarina-limpia-1.jpg",
        "assets/img/products/cream.jpg",
      ];
    }
    if (tipo === "hidratante") {
      return [
        "assets/img/products/cream.jpg",
        "assets/img/products/texture-cream.jpg",
        "assets/img/products/lifestyle-cream.jpg",
      ];
    }
    return [
      "assets/img/products/cream.jpg",
      "assets/img/products/texture-cream.jpg",
      "assets/img/products/lifestyle-cream.jpg",
    ];
  }

  function getPrimaryFallbackImage(product = {}) {
    return getRepresentativeFallbacks(product)[0];
  }

  // ── Product Card Render (con botón rápido +) ──
  function renderProductCard(product) {
    const isAgotado = product.agotado || product.stock === 0;
    const fallbackImg = getPrimaryFallbackImage(product);
    const discount =
      product.precioAnterior && !isAgotado
        ? Math.round(
            ((product.precioAnterior - product.precio) /
              product.precioAnterior) *
              100,
          )
        : 0;

    return `
      <article class="product-card ${isAgotado ? "product-card--out-of-stock" : ""}" onclick="Router.navigate('producto/${product.id}')" data-product-id="${product.id}" id="product-card-${product.id}">
        <div class="product-card__image-wrap">
          <div class="product-card__badge-container">
            ${
              isAgotado
                ? `<span class="product-card__badge product-card__badge--agotado">Agotado</span>`
                : product.etiqueta
                  ? `<span class="product-card__badge ${getBadgeClass(product.etiqueta)}">${getBadgeLabel(product.etiqueta)}</span>`
                  : ""
            }
          </div>
          ${discount >= 5 ? `<span class="product-card__discount">-${discount}%</span>` : ""}
          <img class="product-card__image" src="${product.imagen}" alt="${product.nombre}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
          
          ${
            isAgotado
              ? `
            <button class="product-card__quick-add-btn disabled" disabled onclick="event.stopPropagation();" title="Producto Agotado">
              ${icons.x}
            </button>
          `
              : `
            <button class="product-card__quick-add-btn" 
                    onclick="event.stopPropagation(); Store.addItem(Render.getProductById(${product.id})); Render.showToast('¡Añadido al carrito!');" 
                    aria-label="Añadir ${product.nombre} al carrito"
                    title="Añadir al carrito">
              ${icons.plus}
            </button>
          `
          }
        </div>
        <div class="product-card__info">
          <span class="product-card__brand">${product.marca}</span>
          <h3 class="product-card__name">${product.nombre}</h3>
          ${
            product.sellos && product.sellos.length > 0
              ? `
            <div class="product-card__sellos">
              ${product.sellos
                .slice(0, 2)
                .map((s) => `<span class="product-card__sello">${s}</span>`)
                .join("")}
            </div>
          `
              : ""
          }
          <div class="product-card__pricing">
            <span class="product-card__price">${Store.CURRENCY} ${product.precio.toFixed(2)}</span>
            ${product.precioAnterior ? `<span class="product-card__price-old">${Store.CURRENCY} ${product.precioAnterior.toFixed(2)}</span>` : ""}
          </div>
          <div class="product-card__rating">
            ${
              product.reviews && product.reviews > 0
                ? `
              <span class="product-card__stars">${renderStars(product.rating)}</span>
              <span class="product-card__reviews-count">(${product.reviews.toLocaleString()})</span>
            `
                : `
              <span class="product-card__verified-badge" style="font-size: 0.75rem; color: #8E8E93; display: inline-flex; align-items: center; gap: 4px;">
                ${icons.sparkle} 100% Original
              </span>
            `
            }
          </div>
        </div>
      </article>
    `;
  }

  // ══════════════════════════════════════════
  //  PÁGINA DE INICIO (INDEX)
  // ══════════════════════════════════════════
  function renderHome(products) {
    // 6 productos para Ofertas de la Semana (exactamente 6: 4 disponibles, 2 agotados)
    const ofertas = products
      .filter((p) => p.esOferta || p.etiqueta === "OFERTA")
      .slice(0, 12);
    // 8 productos para Te Recomendamos
    const recomendados = products.slice(0, 12);

    // Extracción 100% dinámica de categorías recomendadas desde los productos de la tienda
    const knownLabels = {
      serum: "Sérums",
      hidratante: "Hidratantes",
      "protector solar": "Protector Solar",
      tonico: "Tónicos",
      "cuidado capilar": "Cuidado Capilar",
      "cuidado corporal": "Cuidado Corporal",
      vitamina: "Vitaminas",
      suplemento: "Suplementos",
    };

    const knownImages = {
      serum: "assets/img/products/serum.jpg",
      hidratante: "assets/img/products/cream.jpg",
      "protector solar": "assets/img/products/sunscreen.jpg",
      tonico: "assets/img/products/toner.jpg",
      "cuidado capilar": "assets/img/products/hair-biology-silver-glowing-acondicionador-matizador-con-biotina-1.jpg",
      "cuidado corporal": "assets/img/products/lume-desodorante-corporal-invisible-spray-mandarina-limpia-1.jpg",
      vitamina: "assets/img/products/vitamin-c.jpg",
      suplemento: "assets/img/products/generic-suplemento-1.jpg",
    };

    const uniqueTypes = [...new Set(products.map((p) => p.tipo).filter(Boolean))];
    const priorityOrder = [
      "serum",
      "hidratante",
      "protector solar",
      "tonico",
      "cuidado capilar",
      "cuidado corporal",
      "vitamina",
      "suplemento",
    ];

    uniqueTypes.sort((a, b) => {
      const idxA = priorityOrder.indexOf(normalizeText(a));
      const idxB = priorityOrder.indexOf(normalizeText(b));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const categoryTypes = uniqueTypes.map((tipo) => {
      const norm = normalizeText(tipo);
      let image = knownImages[norm];
      if (!image) {
        const prod = products.find((p) => p.tipo && normalizeText(p.tipo) === norm && p.imagen);
        image = prod && prod.imagen ? prod.imagen : "assets/img/products/cream.jpg";
      }
      return {
        key: tipo,
        label: knownLabels[norm] || tipo,
        image: image,
      };
    });

    startHeroSliderTimer();

    return `
      <!-- HERO BANNER SLIDER EDITORIAL (3 BANNERS PROFESIONALES FULL WIDTH) -->
      <section class="hero-slider-section" id="hero-banner">
        <div class="hero-slider" id="hero-slider">
          <div class="hero-slides-track" id="hero-slides-track">
            
            <!-- Slide 1: Skincare Coreano & Alta Cosmética -->
            <div class="hero-slide active" data-slide-category="skincare">
              <img class="hero-slide__image" src="assets/img/hero/hero-skincare.jpg?v=4" alt="Skincare CeraVe The Ordinary e ISDIN BellaMia" onerror="this.onerror=null; this.src='assets/img/hero/hero-banner.jpg';">
              <div class="hero-slide__overlay">
                <div class="hero-slide__container">
                  <div class="hero-slide__content">
                    <span class="hero-slide__badge">${icons.sparkle} Skincare & Alta Cosmética</span>
                    <h1 class="hero-slide__title">Tu piel radiante con fórmulas de <em>alta gama</em></h1>                   
                    <div class="hero-slide__actions">
                      <a href="#catalogo" class="btn btn--primary btn--lg" onclick="Router.navigate('catalogo', 'skincare')">
                        Explorar Skincare ${icons.arrowRight}
                      </a>
                      <a href="javascript:void(0)" class="btn btn--hero-secondary btn--lg" onclick="event.preventDefault(); document.getElementById('section-ofertas')?.scrollIntoView({behavior:'smooth'})">
                        Ver Ofertas ${icons.flame}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Slide 2: Vitaminas & Bienestar Diario -->
            <div class="hero-slide" data-slide-category="vitaminas">
              <img class="hero-slide__image" src="assets/img/hero/hero-vitaminas.jpg?v=4" alt="Vitaminas y Gomitas OLLY Vitafusion BellaMia" onerror="this.onerror=null; this.src='assets/img/products/vitamin-c.jpg';">
              <div class="hero-slide__overlay">
                <div class="hero-slide__container">
                  <div class="hero-slide__content">
                    <span class="hero-slide__badge hero-slide__badge--vit">${icons.leaf} Vitaminas & Bienestar Diario</span>
                    <h1 class="hero-slide__title">Bienestar diario en gomitas que <em>amarás tomar</em></h1>
                    <div class="hero-slide__actions">
                      <a href="#catalogo" class="btn btn--primary btn--lg" onclick="Router.navigate('catalogo', 'vitaminas')">
                        Ver Vitaminas ${icons.arrowRight}
                      </a>
                      <a href="#catalogo" class="btn btn--hero-secondary btn--lg" onclick="Router.goToCatalog('todos')">
                        Catálogo Completo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Slide 3: Suplementos, Adaptógenos & Vitalidad -->
            <div class="hero-slide" data-slide-category="suplementos">
              <img class="hero-slide__image" src="assets/img/hero/hero-suplementos.jpg?v=4" alt="Colageno Vital Proteins Creatina ON y Magnesio BellaMia" onerror="this.onerror=null; this.src='assets/img/products/protein.jpg';">
              <div class="hero-slide__overlay">
                <div class="hero-slide__container">
                  <div class="hero-slide__content">
                    <span class="hero-slide__badge hero-slide__badge--sup">${icons.bolt}  Suplementos & Vitalidad</span>
                    <h1 class="hero-slide__title">Equilibrio, descanso y <em>máximo rendimiento</em></h1>
                    <div class="hero-slide__actions">
                      <a href="#catalogo" class="btn btn--primary btn--lg" onclick="Router.navigate('catalogo', 'suplementos')">
                        Ver Suplementos ${icons.arrowRight}
                      </a>
                      <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20recibir%20asesor%C3%ADa%20sobre%20suplementos" target="_blank" rel="noopener" class="btn btn--hero-secondary btn--lg">
                        ${icons.whatsapp} Asesoría Gratis
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Flechas de navegación Desktop tipo Glassmorphism -->
          <button class="hero-slider__nav hero-slider__nav--prev" onclick="Render.prevHeroSlide()" aria-label="Banner anterior">
            ${icons.arrowLeft}
          </button>
          <button class="hero-slider__nav hero-slider__nav--next" onclick="Render.nextHeroSlide()" aria-label="Siguiente banner">
            ${icons.arrowRight}
          </button>

          <!-- Paginación con barras de progreso segmentadas (Estilo OLLY / Editorial) -->
          <div class="hero-slider__pagination" id="hero-slider-pagination" role="tablist" aria-label="Selector de diapositivas">
            <button class="hero-slider__bar active" onclick="Render.goToHeroSlide(0)" role="tab" aria-selected="true" aria-label="Diapositiva 1: Skincare Coreano">
              <span class="hero-slider__bar-track">
                <span class="hero-slider__bar-fill"></span>
              </span>
              <span class="hero-slider__bar-meta">
                <span class="hero-slider__bar-num">01</span>
                <span class="hero-slider__bar-text">Skincare</span>
              </span>
            </button>
            <button class="hero-slider__bar" onclick="Render.goToHeroSlide(1)" role="tab" aria-selected="false" aria-label="Diapositiva 2: Vitaminas y Gomitas OLLY">
              <span class="hero-slider__bar-track">
                <span class="hero-slider__bar-fill"></span>
              </span>
              <span class="hero-slider__bar-meta">
                <span class="hero-slider__bar-num">02</span>
                <span class="hero-slider__bar-text">Vitaminas</span>
              </span>
            </button>
            <button class="hero-slider__bar" onclick="Render.goToHeroSlide(2)" role="tab" aria-selected="false" aria-label="Diapositiva 3: Suplementos y Vitalidad">
              <span class="hero-slider__bar-track">
                <span class="hero-slider__bar-fill"></span>
              </span>
              <span class="hero-slider__bar-meta">
                <span class="hero-slider__bar-num">03</span>
                <span class="hero-slider__bar-text">Suplementos</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- 1. FRANJA SUPERIOR DE CONFIANZA INMEDIATA (VALUE PROPOSITION BAR) -->
      <section class="home-trust-section" id="home-trust">
        <div class="container">
          <div class="home-trust-grid">
            <div class="home-trust-card">
              <div class="home-trust-icon">${icons.shield}</div>
              <div class="home-trust-info">
                <strong class="home-trust-title">Productos originales</strong>
                <span class="home-trust-desc">Cosmeticos coreanos y americanos</span>
              </div>
            </div>
            <div class="home-trust-card">
              <div class="home-trust-icon">${icons.truck}</div>
              <div class="home-trust-info">
                <strong class="home-trust-title">Envíos a toda Bolivia</strong>
                <span class="home-trust-desc">Despachos diarios rápidos y seguros</span>
              </div>
            </div>
            <div class="home-trust-card">
              <div class="home-trust-icon">${icons.chat}</div>
              <div class="home-trust-info">
                <strong class="home-trust-title">Asesoría Gratuita</strong>
                <span class="home-trust-desc">Rutina personalizada por WhatsApp</span>
              </div>
            </div>
            <div class="home-trust-card">
              <div class="home-trust-icon">${icons.card}</div>
              <div class="home-trust-info">
                <strong class="home-trust-title">Pagos 100% Flexibles</strong>
                <span class="home-trust-desc">QR Simple, transferencias y efectivo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. SECCIÓN OFERTAS DE LA SEMANA (PRECIOS ESPECIALES & URGENCIA) -->
      <section class="section section--offers" id="section-ofertas">
        <div class="container">
          <div class="section__header section__header--between">
            <div>
              <span class="section__eyebrow section__eyebrow--hot">
                <span class="eyebrow-svg-icon">${icons.flame}</span>
                Oportunidad por Tiempo Limitado
              </span>
              <h2 class="section__title">Ofertas de la Semana</h2>
              <p class="section__subtitle section__subtitle--left">Descuentos exclusivos hasta agotar existencias en almacén</p>
            </div>
            <a href="javascript:void(0)" class="section__link" onclick="Router.goToCatalog('todos')" role="button">
              Ver catálogo completo ${icons.arrowRight}
            </a>
          </div>

          <div class="products-grid" id="grid-ofertas">
            ${
              ofertas.length > 0
                ? ofertas.map((p) => renderProductCard(p)).join("")
                : `
                <div class="empty-state-card empty-state-card--compact" id="empty-ofertas">
                  <div class="empty-state-card__icon">${icons.sparkle}</div>
                  <span class="empty-state-card__tag">Próximamente</span>
                  <h3 class="empty-state-card__title">Nuevas Ofertas en Preparación</h3>
                  <p class="empty-state-card__desc">Estamos preparando y cargando productos con promociones y descuentos especiales. ¡Muy pronto disponibles en catálogo!</p>
                  <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20quisiera%20consultar%20por%20ofertas%20disponibles" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
                    ${icons.whatsapp} Consultar ofertas por WhatsApp
                  </a>
                </div>
              `
            }
          </div>
        </div>
      </section>

      <!-- 3. SECCIÓN CATEGORÍAS RECOMENDADAS (VISIBLE EN COMPUTADORAS) -->
      <section class="section section--categories" id="section-categories">
        <div class="container">
          <div class="section__header section__header--center">
            <span class="section__eyebrow">Descubre</span>
            <h2 class="section__title">Categorías Recomendadas</h2>
            <p class="section__subtitle">Explora los tratamientos y fórmulas más solicitados para el cuidado de tu piel y cuerpo</p>
          </div>
          
          <div class="categories-recommended-grid" id="categories-recommended-grid">
            ${categoryTypes
              .map(
                (cat) => `
              <div class="category-card" onclick="Router.filterCatalogByTipo('${cat.key}')" id="cat-type-${cat.key.toLowerCase().replace(/\s+/g, "-")}">
                <div class="category-card__image-wrap">
                  <img class="category-card__image" src="${cat.image}" alt="${cat.label}" loading="lazy">
                </div>
                <span class="category-card__name">${cat.label}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- 5. SECCIÓN TE RECOMENDAMOS (LOS MÁS VENDIDOS Y MEJOR VALORADOS) -->
      <section class="section section--recommended" id="section-recomendamos">
        <div class="container">
          <div class="section__header section__header--center">
            <span class="section__eyebrow">
              
              Selección premium
            </span>
            <h2 class="section__title">Te Recomendamos</h2>
            <p class="section__subtitle">Las fórmulas más queridas y con mejores resultados comprobados por nuestra comunidad</p>
          </div>

          <div class="slider-wrapper">
            ${
              recomendados.length > 0
                ? `
              <button class="slider-control-btn slider-control-btn--prev" onclick="Render.scrollSlider('recommended-slider-track', -340)" aria-label="Anterior recomendado">
                ${icons.arrowLeft}
              </button>

              <div class="slider-track products-slider" id="recommended-slider-track">
                ${recomendados.map((p) => renderProductCard(p)).join("")}
              </div>

              <button class="slider-control-btn slider-control-btn--next" onclick="Render.scrollSlider('recommended-slider-track', 340)" aria-label="Siguiente recomendado">
                ${icons.arrowRight}
              </button>
            `
                : `
              <div class="empty-state-card empty-state-card--compact" id="empty-recomendados">
                <div class="empty-state-card__icon">${icons.bag}</div>
                <span class="empty-state-card__tag">Catálogo en Actualización</span>
                <h3 class="empty-state-card__title">Seleccionando Fórmulas Destacadas</h3>
                <p class="empty-state-card__desc">Estamos preparando y cargando los productos recomendados de cosmética avanzada, vitaminas y suplementos. ¡Pronto disponibles!</p>
                <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20asesor%C3%ADa%20personalizada%20sobre%20productos" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
                  ${icons.whatsapp} Asesoría por WhatsApp
                </a>
              </div>
            `
            }
          </div>
        </div>
      </section>

      <!-- 6. BANNER DE ASESORÍA PERSONALIZADA EN VIVO (RETENCIÓN & CONVERSIÓN WHATSAPP) -->
      <!--section class="section section--advisor" id="section-asesoria">
        <div class="container">
          <div class="home-advisor-card">
            <div class="home-advisor-card__content">
              <span class="home-advisor-card__badge">${icons.sparkle} Asesoría Personalizada 100% Gratuita</span>
              <h2 class="home-advisor-card__title">¿Dudas sobre qué fórmula es <em>ideal para ti</em>?</h2>
              <p class="home-advisor-card__desc">
                No tienes que adivinar. Escríbenos directamente y nuestras asesoras te armarán una rutina personalizada para tu tipo de piel, objetivo o suplementación en menos de 2 minutos.
              </p>
              <div class="home-advisor-card__features">
                <span class="home-advisor-card__feature">${icons.check} Análisis de tipo de piel</span>
                <span class="home-advisor-card__feature">${icons.check} Guía de combinación de activos</span>
                <span class="home-advisor-card__feature">${icons.check} Respuestas inmediatas</span>
              </div>
            </div>
            <div class="home-advisor-card__cta">
              <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20quisiera%20asesor%C3%ADa%20personalizada%20para%20armar%20mi%20rutina" target="_blank" rel="noopener" class="btn btn--whatsapp-advisor btn--lg">
                ${icons.whatsapp} Consultar por WhatsApp
              </a>
              <span class="home-advisor-card__hint">Atención rápida de Lun a Sáb</span>
            </div>
          </div>
        </div>
      </section-->
      <!-- FOOTER -->
      ${renderFooter()}
    `;
  }

  // ── Controles de Sliders ──
  function scrollSlider(trackId, distance) {
    const track = document.getElementById(trackId);
    if (track) {
      track.scrollBy({ left: distance, behavior: "smooth" });
    }
  }

  let isHeroSliderHovered = false;

  function goToHeroSlide(index) {
    const slides = document.querySelectorAll(".hero-slide");
    const bars = document.querySelectorAll(".hero-slider__bar");
    const dots = document.querySelectorAll(".hero-slider__dot");
    if (!slides.length) return;

    currentHeroSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentHeroSlide);
    });

    bars.forEach((bar, idx) => {
      const isActive = idx === currentHeroSlide;
      bar.classList.toggle("active", isActive);
      bar.setAttribute("aria-selected", isActive ? "true" : "false");
      const fill = bar.querySelector(".hero-slider__bar-fill");
      if (fill) {
        fill.style.animation = "none";
        if (isActive) {
          void fill.offsetWidth; // Forzar reflujo para reiniciar keyframes
          fill.style.animation = "";
        }
      }
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentHeroSlide);
    });

    startHeroSliderTimer();
  }

  function nextHeroSlide() {
    goToHeroSlide(currentHeroSlide + 1);
  }

  function prevHeroSlide() {
    goToHeroSlide(currentHeroSlide - 1);
  }

  function startHeroSliderTimer() {
    stopHeroSliderTimer();
    if (isHeroSliderHovered) return;
    heroTimer = setTimeout(() => {
      nextHeroSlide();
    }, 6000);
  }

  function pauseHeroSlider() {
    isHeroSliderHovered = true;
    if (heroTimer) {
      clearTimeout(heroTimer);
      heroTimer = null;
    }
    const slider = document.getElementById("hero-slider");
    if (slider) slider.classList.add("is-paused");
  }

  function resumeHeroSlider() {
    isHeroSliderHovered = false;
    const slider = document.getElementById("hero-slider");
    if (slider) slider.classList.remove("is-paused");
    startHeroSliderTimer();
  }

  function stopHeroSliderTimer() {
    if (heroTimer) {
      clearTimeout(heroTimer);
      clearInterval(heroTimer);
      heroTimer = null;
    }
  }

  function setupHeroSliderInteractions() {
    const slider = document.getElementById("hero-slider");
    if (!slider || slider.dataset.interactionsInitialized) return;
    slider.dataset.interactionsInitialized = "true";

    slider.addEventListener("mouseenter", pauseHeroSlider);
    slider.addEventListener("mouseleave", resumeHeroSlider);
    slider.addEventListener("focusin", pauseHeroSlider);
    slider.addEventListener("focusout", resumeHeroSlider);

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevHeroSlide();
      } else if (e.key === "ArrowRight") {
        nextHeroSlide();
      }
    });
  }

  // ══════════════════════════════════════════
  //  PÁGINA DE CATÁLOGO (Sin pestañas de categorías, con Buscador + Botón Filtros)
  // ══════════════════════════════════════════
  // ══════════════════════════════════════════
  //  MOTOR DE FILTRADO Y ORDENAMIENTO CENTRALIZADO
  // ══════════════════════════════════════════
  //  MOTOR DE FILTRADO Y ORDENAMIENTO CENTRALIZADO (COHERENTE CON BASE DE DATOS)
  // ══════════════════════════════════════════
  function filterAndSortProducts(products, filterState = {}) {
    let result = [...products];
    const category = filterState.category || "todos";
    const tipo = filterState.tipo || "";
    const tipoDePiel = filterState.tipoDePiel || "";
    const brand = filterState.brand || "";
    const beneficio = filterState.beneficio || "";
    const priceRange = filterState.priceRange || "";
    const onlyOffer = Boolean(filterState.onlyOffer);
    const onlyStock = Boolean(filterState.onlyStock);
    const sort = filterState.sort || "destacados";
    const searchQuery = filterState.searchQuery || "";

    // Filtro por categoría principal
    if (category && category !== "todos") {
      if (category === "bienestar") {
        result = result.filter(
          (p) => p.categoria === "vitaminas" || p.categoria === "suplementos",
        );
      } else {
        result = result.filter((p) => p.categoria === category);
      }
    }

    // Filtro por tipo de producto (ej: Serum, Hidratante, etc.)
    if (tipo) {
      const tNorm = normalizeText(tipo);
      result = result.filter((p) => {
        if (!p.tipo) return false;
        const pNorm = normalizeText(p.tipo);
        return pNorm === tNorm || pNorm.includes(tNorm) || tNorm.includes(pNorm);
      });
    }

    // Filtro por tipo de piel (Dermatología & Skincare)
    if (tipoDePiel) {
      const skinNorm = normalizeText(tipoDePiel);
      result = result.filter((p) =>
        (p.tipoDePiel || []).some((t) => normalizeText(t).includes(skinNorm)),
      );
    }

    // Filtro por marca
    if (brand) {
      result = result.filter(
        (p) => p.marca.toLowerCase() === brand.toLowerCase(),
      );
    }

    // Filtro por beneficio u objetivo
    if (beneficio) {
      const bNorm = normalizeText(beneficio);
      result = result.filter((p) =>
        (p.beneficio || []).some((b) => normalizeText(b).includes(bNorm)),
      );
    }

    // Filtro por rango de precio (Bs.)
    if (priceRange === "under-120") {
      result = result.filter((p) => p.precio <= 120);
    } else if (priceRange === "120-200") {
      result = result.filter((p) => p.precio > 120 && p.precio <= 200);
    } else if (priceRange === "over-200") {
      result = result.filter((p) => p.precio > 200);
    }

    // Filtro solo ofertas verificadas en base de datos
    if (onlyOffer) {
      result = result.filter(
        (p) => Boolean(p.esOferta) || p.etiqueta === "OFERTA",
      );
    }

    // Filtro solo en stock inmediato (disponibilidad)
    if (onlyStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Filtro por búsqueda de texto (insensible a tildes)
    if (searchQuery) {
      const q = normalizeText(searchQuery);
      const has = (v) => normalizeText(v).includes(q);
      result = result.filter(
        (p) =>
          has(p.nombre) ||
          has(p.marca) ||
          has(p.categoria) ||
          has(p.tipo) ||
          (p.ingredientes || []).some(has) ||
          (p.beneficio || []).some(has) ||
          (p.tipoDePiel || []).some(has) ||
          (p.sellos || []).some(has),
      );
    }

    // Ordenamiento estratégico
    if (sort === "precio-asc") {
      result.sort((a, b) => a.precio - b.precio);
    } else if (sort === "precio-desc") {
      result.sort((a, b) => b.precio - a.precio);
    } else if (sort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Destacados: disponibilidad primero, luego orden original
      result.sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0));
    }

    return result;
  }

  // ══════════════════════════════════════════
  //  PÁGINA DE CATÁLOGO (Buscador + Acceso a Panel Filtros)
  // ══════════════════════════════════════════
  function renderCatalog(products, filterArg = {}) {
    // Normalizar argumentos para soportar objeto o parámetros sueltos heredados
    const filterState =
      typeof filterArg === "string"
        ? {
            category: arguments[1] || "todos",
            searchQuery: arguments[2] || "",
            tipo: arguments[3] || "",
            brand: arguments[4] || "",
          }
        : filterArg || {};

    const category = filterState.category || "todos";
    const searchQuery = filterState.searchQuery || "";
    const tipo = filterState.tipo || "";
    const tipoDePiel = filterState.tipoDePiel || "";
    const brand = filterState.brand || "";
    const beneficio = filterState.beneficio || "";
    const priceRange = filterState.priceRange || "";
    const onlyOffer = Boolean(filterState.onlyOffer);
    const onlyStock = Boolean(filterState.onlyStock);
    const sort = filterState.sort || "destacados";

    const filtered = filterAndSortProducts(products, filterState);
    const safeQuery = escapeHtml(searchQuery);

    let activeFilterCount = 0;
    if (category && category !== "todos") activeFilterCount++;
    if (tipo) activeFilterCount++;
    if (tipoDePiel) activeFilterCount++;
    if (brand) activeFilterCount++;
    if (beneficio) activeFilterCount++;
    if (priceRange) activeFilterCount++;
    if (onlyOffer) activeFilterCount++;
    if (onlyStock) activeFilterCount++;
    if (sort && sort !== "destacados") activeFilterCount++;

    const sortLabels = {
      destacados: "Más Populares",
      "precio-asc": "Menor Precio",
      "precio-desc": "Mayor Precio",
      rating: "Mejor Calificados",
    };

    const priceLabels = {
      "under-120": "Hasta Bs. 120",
      "120-200": "Bs. 120 - 200",
      "over-200": "Más de Bs. 200",
    };

    return `
      <div class="container" style="padding-top: 1.5rem; padding-bottom: 4rem;">
        
        <div class="catalog-header">
          <div class="catalog-title-wrap">
            <h1 class="catalog-title">Catálogo de Productos</h1>
            <span class="catalog-count">${products.length === 0 ? "0 productos (Catálogo en preparación)" : `${filtered.length} ${filtered.length === 1 ? "producto" : "productos"}`}</span>
          </div>

          <div class="catalog-controls-bar">
            <div class="search-bar" id="search-bar">
              ${icons.search}
              <input type="text" class="search-bar__input" id="searchInput"
                     placeholder="Buscar por producto, marca, beneficio..."
                     value="${safeQuery}"
                     oninput="Router.searchCatalog(this.value)">
            </div>

            <button class="btn-filter-trigger" onclick="Router.openFilterDrawer()" id="btn-open-filters" aria-label="Abrir panel de filtros">
              ${icons.filter}
              <span>Filtros</span>
              ${activeFilterCount > 0 ? `<span class="filter-count-badge">${activeFilterCount}</span>` : ""}
            </button>
          </div>
        </div>

        ${
          products.length > 0 && (activeFilterCount > 0 || searchQuery)
            ? `
          <div class="active-filters-row">
            <span class="active-filters-label">Filtros aplicados:</span>
            ${
              category !== "todos"
                ? `
              <span class="filter-chip">Categoría: ${category === "bienestar" ? "Bienestar" : category.charAt(0).toUpperCase() + category.slice(1)} <button onclick="Router.clearCategoryFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              tipo
                ? `
              <span class="filter-chip">Tipo: ${tipo} <button onclick="Router.clearTipoFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              tipoDePiel
                ? `
              <span class="filter-chip">Piel: ${tipoDePiel} <button onclick="Router.clearTipoDePielFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              brand
                ? `
              <span class="filter-chip">Marca: ${brand} <button onclick="Router.clearBrandFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              beneficio
                ? `
              <span class="filter-chip">Beneficio: ${beneficio} <button onclick="Router.clearBeneficioFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              priceRange
                ? `
              <span class="filter-chip">Precio: ${priceLabels[priceRange] || priceRange} <button onclick="Router.clearPriceRangeFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              onlyOffer
                ? `
              <span class="filter-chip filter-chip--offer">% Solo Ofertas <button onclick="Router.clearOfferFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              onlyStock
                ? `
              <span class="filter-chip filter-chip--stock"><span class="chip-svg-icon">${icons.checkMini}</span> En Stock <button onclick="Router.clearStockFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              sort && sort !== "destacados"
                ? `
              <span class="filter-chip">Orden: ${sortLabels[sort] || sort} <button onclick="Router.clearSortFilter()" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            ${
              searchQuery
                ? `
              <span class="filter-chip">Búsqueda: "${safeQuery}" <button onclick="Router.searchCatalog('')" aria-label="Quitar filtro">${icons.x}</button></span>
            `
                : ""
            }
            <button class="btn-reset-all-filters" onclick="Router.resetAllFilters()">Limpiar todos</button>
          </div>
        `
            : ""
        }

        <div class="products-grid" id="catalog-grid">
          ${
            products.length === 0
              ? `
              <div class="empty-state-card" id="empty-catalog-db">
                <div class="empty-state-card__icon">${icons.sparkle}</div>
                <span class="empty-state-card__tag">Puesta a punto de Catálogo</span>
                <h2 class="empty-state-card__title">Catálogo en Preparación para Producción</h2>
                <p class="empty-state-card__desc">
                  Actualmente no hay productos registrados en la base de datos mientras cargamos las fórmulas oficiales, stock real y precios actualizados de BellaMia.
                </p>
                <div class="empty-state-card__actions">
                  <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20consultar%20disponibilidad%20de%20productos" target="_blank" rel="noopener" class="btn btn--whatsapp btn--md">
                    ${icons.whatsapp} Consultar por WhatsApp
                  </a>
                  <a href="#inicio" onclick="Router.navigate('inicio')" class="btn btn--outline btn--md">
                    ${icons.home} Ir al Inicio
                  </a>
                </div>
              </div>
            `
              : filtered.length > 0
                ? filtered.map((p) => renderProductCard(p)).join("")
                : `<div class="no-products">
                   <div class="no-products__icon">${icons.search}</div>
                   <h3>No encontramos productos coincidentes</h3>
                   <p>Intenta con otros términos de búsqueda o restablece los filtros aplicados para ver más opciones.</p>
                   <button class="btn btn--primary" onclick="Router.resetAllFilters()">Restablecer filtros</button>
                 </div>`
          }
        </div>
      </div>
      ${renderFooter()}
    `;
  }

  // ══════════════════════════════════════════
  //  PANEL DE FILTROS LATERAL DERECHO (COHERENTE CON BASE DE DATOS)
  // ══════════════════════════════════════════
  function renderFilterDrawerContent(products, filterState = {}) {
    if (products.length === 0) {
      return `
        <!-- CABECERA FIJA SUPERIOR -->
        <div class="filter-drawer__header">
          <div class="filter-drawer__header-title-box">
            <div class="filter-drawer__title-row">
              <span class="filter-drawer__title-icon">${icons.filter}</span>
              <h3 class="filter-drawer__title">Filtros Clave</h3>
            </div>
            <span class="filter-drawer__subtitle">Catálogo en preparación</span>
          </div>
          <div class="filter-drawer__header-actions">
            <button class="filter-drawer__close-btn" onclick="Router.closeFilterDrawer()" aria-label="Cerrar panel de filtros">
              ${icons.x}
            </button>
          </div>
        </div>

        <div class="filter-drawer__body" id="filter-drawer-body">
          <div class="filter-drawer-empty">
            <div class="filter-drawer-empty__icon">
              ${icons.sparkle}
            </div>
            <h4 class="filter-drawer-empty__title">Catálogo en Preparación</h4>
            <p class="filter-drawer-empty__desc">
              Actualmente no hay productos registrados en la base de datos. Los filtros por categoría, marca, precio y beneficios se activarán en cuanto se carguen los productos de producción.
            </p>
            <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20tengo%20una%20consulta%20sobre%20productos" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm btn--full">
              ${icons.whatsapp} Contactar Asesor por WhatsApp
            </a>
          </div>
        </div>

        <div class="filter-drawer__footer">
          <button class="btn btn--primary btn--full filter-drawer__apply-btn" onclick="Router.closeFilterDrawer()">
            Cerrar Filtros
          </button>
        </div>
      `;
    }

    const category = filterState.category || "todos";
    const tipo = filterState.tipo || "";
    const tipoDePiel = filterState.tipoDePiel || "";
    const brand = filterState.brand || "";
    const beneficio = filterState.beneficio || "";
    const priceRange = filterState.priceRange || "";
    const onlyOffer = Boolean(filterState.onlyOffer);
    const onlyStock = Boolean(filterState.onlyStock);
    const sort = filterState.sort || "destacados";

    // 1. Conteo de Disponibilidad y Ofertas en Base de Datos
    const countOffers = products.filter(
      (p) => Boolean(p.esOferta) || p.etiqueta === "OFERTA",
    ).length;
    const countStock = products.filter((p) => p.stock > 0).length;

    // 2. Conteo de Categorías en Base de Datos
    const countSkincare = products.filter(
      (p) => p.categoria === "skincare",
    ).length;
    const countVitaminas = products.filter(
      (p) => p.categoria === "vitaminas",
    ).length;
    const countSuplementos = products.filter(
      (p) => p.categoria === "suplementos",
    ).length;

    // 3. Tipos de Producto con extracción dinámica desde la BD
    const baseTypes = [
      "Serum",
      "Hidratante",
      "Protector Solar",
      "Tónico",
      "Cuidado Capilar",
      "Cuidado Corporal",
      "Vitamina",
      "Suplemento",
    ];
    const dbTypes = [...new Set(products.map((p) => p.tipo).filter(Boolean))];
    const categoryTypes = [...new Set([...baseTypes, ...dbTypes])]
      .filter((t) => products.some((p) => p.tipo && normalizeText(p.tipo) === normalizeText(t)));

    // 4. Tipos de Piel (Dermatología & Skincare) con conteo desde la BD
    const skinTypes = [
      "Todo Tipo de Piel",
      "Piel Seca",
      "Piel Sensible",
      "Piel Grasa",
      "Piel Mixta",
      "Piel Normal",
      "Piel con Acné",
    ];

    // 5. Beneficios / Objetivos reales en la BD
    const keyBeneficios = [
      "Hidratación",
      "Luminosidad",
      "Fortalecimiento Capilar",
      "Energía",
      "Anti-Edad",
      "Inmunidad",
      "Rendimiento Deportivo",
      "Calmante",
      "Limpieza Profunda",
      "Protección Solar",
    ];

    // 6. Rangos de Precio (distribución balanceada de la BD)
    const priceRanges = [
      {
        id: "under-120",
        label: "Hasta Bs. 120",
        count: products.filter((p) => p.precio <= 120).length,
      },
      {
        id: "120-200",
        label: "Bs. 120 - 200",
        count: products.filter((p) => p.precio > 120 && p.precio <= 200).length,
      },
      {
        id: "over-200",
        label: "Más de Bs. 200",
        count: products.filter((p) => p.precio > 200).length,
      },
    ];

    // 7. Lista de marcas de la base de datos
    const brands = [...new Set(products.map((p) => p.marca))].sort();

    // Conteo en vivo de productos que coinciden con los filtros seleccionados
    const matchedProducts = filterAndSortProducts(products, filterState);
    const matchedCount = matchedProducts.length;

    // Conteo de filtros activos para badge de cabecera
    let activeFilterCount = 0;
    if (category && category !== "todos") activeFilterCount++;
    if (tipo) activeFilterCount++;
    if (tipoDePiel) activeFilterCount++;
    if (brand) activeFilterCount++;
    if (beneficio) activeFilterCount++;
    if (priceRange) activeFilterCount++;
    if (onlyOffer) activeFilterCount++;
    if (onlyStock) activeFilterCount++;
    if (sort && sort !== "destacados") activeFilterCount++;

    return `
      <!-- CABECERA FIJA SUPERIOR -->
      <div class="filter-drawer__header">
        <div class="filter-drawer__header-title-box">
          <div class="filter-drawer__title-row">
            <span class="filter-drawer__title-icon">${icons.filter}</span>
            <h3 class="filter-drawer__title">Filtros Clave</h3>
            ${activeFilterCount > 0 ? `<span class="filter-drawer__count-badge">${activeFilterCount}</span>` : ""}
          </div>
          <span class="filter-drawer__subtitle">Coherente con el inventario en tiempo real</span>
        </div>
        <div class="filter-drawer__header-actions">
          ${
            activeFilterCount > 0
              ? `
            <button class="filter-drawer__clear-btn" onclick="Router.resetAllFilters()">Limpiar</button>
          `
              : ""
          }
          <button class="filter-drawer__close-btn" onclick="Router.closeFilterDrawer()" aria-label="Cerrar panel de filtros">
            ${icons.x}
          </button>
        </div>
      </div>

      <!-- CUERPO CON SCROLL SUAVE -->
      <div class="filter-drawer__body" id="filter-drawer-body">

        <!-- 1. OPORTUNIDAD & STOCK INMEDIATO (IMPULSO DE COMPRA) -->
        <div class="filter-group filter-group--switches">
          <div class="filter-switch-card ${onlyOffer ? "active" : ""}" onclick="Router.toggleFilterOnlyOffer()">
            <div class="filter-switch-left">
              <span class="filter-switch-badge filter-switch-badge--offer">% OFF</span>
              <div class="filter-switch-meta">
                <span class="filter-switch-title">Solo Ofertas Especiales (${countOffers})</span>
                <span class="filter-switch-desc">Productos verificados con descuento activo</span>
              </div>
            </div>
            <div class="filter-toggle-pill ${onlyOffer ? "on" : ""}">
              <span class="filter-toggle-knob"></span>
            </div>
          </div>

          <div class="filter-switch-card ${onlyStock ? "active" : ""}" onclick="Router.toggleFilterOnlyStock()">
            <div class="filter-switch-left">
              <span class="filter-switch-badge filter-switch-badge--stock">${icons.checkMini}</span>
              <div class="filter-switch-meta">
                <span class="filter-switch-title">Entrega Inmediata (${countStock})</span>
                <span class="filter-switch-desc">Productos en stock listos para despacho</span>
              </div>
            </div>
            <div class="filter-toggle-pill ${onlyStock ? "on" : ""}">
              <span class="filter-toggle-knob"></span>
            </div>
          </div>
        </div>

        <!-- 2. ORDENAR POR -->
        <div class="filter-group">
          <h4 class="filter-group__heading">Ordenar por</h4>
          <div class="filter-pills-wrap">
            <button class="filter-pill ${sort === "destacados" ? "active" : ""}" onclick="Router.setFilterSort('destacados')">
              Más Populares
            </button>
            <button class="filter-pill ${sort === "precio-asc" ? "active" : ""}" onclick="Router.setFilterSort('precio-asc')">
              Menor Precio
            </button>
            <button class="filter-pill ${sort === "precio-desc" ? "active" : ""}" onclick="Router.setFilterSort('precio-desc')">
              Mayor Precio
            </button>
            <button class="filter-pill ${sort === "rating" ? "active" : ""}" onclick="Router.setFilterSort('rating')">
              Mejor Calificados <span class="pill-star-svg">${icons.starFill}</span>
            </button>
          </div>
        </div>

        <!-- 3. CATEGORÍA PRINCIPAL -->
        <div class="filter-group">
          <h4 class="filter-group__heading">Categoría Principal</h4>
          <div class="filter-pills-wrap">
            <button class="filter-pill ${category === "todos" ? "active" : ""}" onclick="Router.setFilterCategory('todos')">
              Todos <span class="filter-pill__count">${products.length}</span>
            </button>
            <button class="filter-pill ${category === "skincare" ? "active" : ""}" onclick="Router.setFilterCategory('skincare')">
              Skincare <span class="filter-pill__count">${countSkincare}</span>
            </button>
            <button class="filter-pill ${category === "vitaminas" ? "active" : ""}" onclick="Router.setFilterCategory('vitaminas')">
              Vitaminas <span class="filter-pill__count">${countVitaminas}</span>
            </button>
            <button class="filter-pill ${category === "suplementos" ? "active" : ""}" onclick="Router.setFilterCategory('suplementos')">
              Suplementos <span class="filter-pill__count">${countSuplementos}</span>
            </button>
          </div>
        </div>

        <!-- 4. TIPO DE PRODUCTO ESPECÍFICO -->
        <div class="filter-group">
          <h4 class="filter-group__heading">Tipo de Producto</h4>
          <div class="filter-pills-wrap">
            <button class="filter-pill ${!tipo ? "active" : ""}" onclick="Router.setFilterTipo('')">
              Todos
            </button>
            ${categoryTypes
              .map((t) => {
                const count = products.filter(
                  (p) => p.tipo && p.tipo.toLowerCase() === t.toLowerCase(),
                ).length;
                return `
                <button class="filter-pill ${tipo === t ? "active" : ""}" onclick="Router.setFilterTipo('${t}')">
                  ${t} <span class="filter-pill__count">${count}</span>
                </button>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- 5. TIPO DE PIEL (SKINCARE & DERMATOLOGÍA) -->
        <div class="filter-group">
          <h4 class="filter-group__heading">Tipo de Piel</h4>
          <div class="filter-pills-wrap">
            <button class="filter-pill ${!tipoDePiel ? "active" : ""}" onclick="Router.setFilterTipoDePiel('')">
              Cualquiera
            </button>
            ${skinTypes
              .map((st) => {
                const count = products.filter((p) =>
                  (p.tipoDePiel || []).some((s) =>
                    normalizeText(s).includes(normalizeText(st)),
                  ),
                ).length;
                return `
                <button class="filter-pill ${tipoDePiel === st ? "active" : ""}" onclick="Router.setFilterTipoDePiel('${st}')">
                  ${st} <span class="filter-pill__count">${count}</span>
                </button>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- 6. BENEFICIO U OBJETIVO -->
        <div class="filter-group">
          <h4 class="filter-group__heading">Objetivo / Beneficio</h4>
          <div class="filter-pills-wrap">
            <button class="filter-pill ${!beneficio ? "active" : ""}" onclick="Router.setFilterBeneficio('')">
              Cualquiera
            </button>
            ${keyBeneficios
              .map((b) => {
                const count = products.filter((p) =>
                  (p.beneficio || []).some((ben) =>
                    normalizeText(ben).includes(normalizeText(b)),
                  ),
                ).length;
                return `
                <button class="filter-pill ${beneficio === b ? "active" : ""}" onclick="Router.setFilterBeneficio('${b}')">
                  ${b} <span class="filter-pill__count">${count}</span>
                </button>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- 7. RANGO DE PRECIO -->
        <div class="filter-group">
          <h4 class="filter-group__heading">Rango de Precio</h4>
          <div class="filter-pills-wrap">
            <button class="filter-pill ${!priceRange ? "active" : ""}" onclick="Router.setFilterPriceRange('')">
              Todos
            </button>
            ${priceRanges
              .map(
                (pr) => `
              <button class="filter-pill ${priceRange === pr.id ? "active" : ""}" onclick="Router.setFilterPriceRange('${pr.id}')">
                ${pr.label} <span class="filter-pill__count">${pr.count}</span>
              </button>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- 8. MARCAS RECONOCIDAS -->
        <div class="filter-group">
          <h4 class="filter-group__heading">Marca</h4>
          <div class="filter-pills-wrap">
            <button class="filter-pill ${!brand ? "active" : ""}" onclick="Router.setFilterBrand('')">
              Todas
            </button>
            ${brands
              .map((b) => {
                const count = products.filter(
                  (p) => p.marca.toLowerCase() === b.toLowerCase(),
                ).length;
                return `
                <button class="filter-pill ${brand.toLowerCase() === b.toLowerCase() ? "active" : ""}" onclick="Router.setFilterBrand('${b}')">
                  ${b} <span class="filter-pill__count">${count}</span>
                </button>
              `;
              })
              .join("")}
          </div>
        </div>

      </div>

      <!-- PIE FIJO CON BOTÓN DE CONVERSIÓN Y CONTADOR EN VIVO -->
      <div class="filter-drawer__footer">
        <button class="btn btn--primary btn--full filter-drawer__apply-btn" onclick="Router.applyFilters()">
          ${
            matchedCount > 0
              ? `Ver ${matchedCount} ${matchedCount === 1 ? "Producto" : "Productos"}`
              : "Sin coincidencias (Ver catálogo completo)"
          }
        </button>
      </div>
    `;
  }

  // ══════════════════════════════════════════
  //  PÁGINA DE DETALLE DE PRODUCTO (OPTIMIZADA UX 2026 CON SLIDER DE 3 IMÁGENES)
  // ══════════════════════════════════════════
  function renderDetail(product) {
    if (!product) {
      const isDbEmpty = productosData.length === 0;
      return `
        <div class="container" style="padding: 4rem 1.5rem; text-align: center; max-width: 620px; margin: 0 auto; min-height: 55vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div class="empty-state-card" style="margin: 0; width: 100%;">
            <div class="empty-state-card__icon">${isDbEmpty ? icons.sparkle : icons.info}</div>
            <span class="empty-state-card__tag">${isDbEmpty ? "Catálogo en Actualización" : "No Encontrado"}</span>
            <h1 class="empty-state-card__title">${isDbEmpty ? "Producto en Preparación" : "Producto No Encontrado"}</h1>
            <p class="empty-state-card__desc">
              ${
                isDbEmpty
                  ? "Actualmente estamos preparando la base de datos oficial para producción. Si deseas consultar por este u otro producto en específico, puedes contactarnos por WhatsApp."
                  : "El producto que buscas ya no se encuentra disponible o el enlace ingresado no es válido. Puedes explorar nuestro catálogo completo o volver al inicio."
              }
            </p>
            <div class="empty-state-card__actions">
              <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20consultar%20por%20un%20producto" target="_blank" rel="noopener" class="btn btn--whatsapp btn--md">
                ${icons.whatsapp} Consultar por WhatsApp
              </a>
              <a href="#catalogo" onclick="Router.navigate('catalogo')" class="btn btn--primary btn--md">
                ${icons.grid} Ir al Catálogo
              </a>
              <a href="#inicio" onclick="Router.navigate('inicio')" class="btn btn--outline btn--md">
                ${icons.home} Inicio
              </a>
            </div>
          </div>
        </div>
        ${renderFooter()}
      `;
    }

    currentDetailQty = 1;
    currentGalleryIndex = 0;

    const isAgotado = product.agotado || product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 4;
    const discount =
      product.precioAnterior && !isAgotado
        ? Math.round(
            ((product.precioAnterior - product.precio) /
              product.precioAnterior) *
              100,
          )
        : 0;

    // Galería de imágenes: respeta exactamente las imágenes configuradas en la BD (1, 2, 3 o más según decida el admin)
    const fallbackPool = getRepresentativeFallbacks(product);
    const primaryFallback = fallbackPool[0];
    let galleryImages = [];

    if (Array.isArray(product.imagenes) && product.imagenes.length > 0) {
      galleryImages = product.imagenes.filter(
        (src) => typeof src === "string" && src.trim().length > 0,
      );
    }

    if (galleryImages.length === 0 && product.imagen) {
      galleryImages = [product.imagen];
    }

    if (galleryImages.length === 0) {
      galleryImages = [primaryFallback];
    }

    const hasMultipleImages = galleryImages.length > 1;

    // Productos recomendados / relacionados (misma categoría o tipo)
    const relacionados = productosData
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.categoria === product.categoria || p.tipo === product.tipo),
      )
      .slice(0, 4);

    return `
      <div class="container product-detail-page-container" style="padding-top: 1.25rem; padding-bottom: 5rem;">
        
        <!-- BREADCRUMB NAVEGACIÓN -->
        <nav class="breadcrumb-bar" aria-label="Navegación de producto">
          <a href="#inicio" onclick="Router.navigate('inicio')">Inicio</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#catalogo" onclick="Router.navigate('catalogo')">Catálogo</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#catalogo" onclick="Router.filterCatalogByTipo('${product.tipo}')">${product.tipo || product.categoria}</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${product.nombre}</span>
        </nav>

        <div class="product-detail-card ${isAgotado ? "product-detail-card--out-of-stock" : ""}" id="product-detail-${product.id}">
          
          <!-- GALERÍA DE IMÁGENES -->
          <div class="product-gallery">
            <div class="product-gallery__main-wrap">
              <div class="product-gallery__top-badges">
                ${
                  isAgotado
                    ? `<span class="product-card__badge product-card__badge--agotado">Agotado</span>`
                    : product.etiqueta
                      ? `<span class="product-card__badge ${getBadgeClass(product.etiqueta)}">${getBadgeLabel(product.etiqueta)}</span>`
                      : ""
                }
                ${discount >= 5 ? `<span class="product-card__discount">-${discount}%</span>` : ""}
              </div>

              <div class="gallery-slides-container" id="gallery-slides-container">
                ${galleryImages
                  .map(
                    (img, idx) => `
                  <div class="gallery-slide ${idx === 0 ? "active" : ""}" id="gallery-slide-${idx}">
                    <img src="${img}" alt="${product.nombre}${hasMultipleImages ? ` - vista ${idx + 1}` : ""}" class="gallery-slide__image" onerror="this.onerror=null; this.src='${primaryFallback}';">
                  </div>
                `,
                  )
                  .join("")}
              </div>

              ${
                hasMultipleImages
                  ? `
                <!-- Contador de fotos flotante -->
                <span class="gallery-counter" id="gallery-counter">1 / ${galleryImages.length}</span>

                <!-- Flechas de navegación de la galería -->
                <button class="gallery-arrow gallery-arrow--prev" onclick="Render.prevGallerySlide()" aria-label="Anterior foto">
                  ${icons.arrowLeft}
                </button>
                <button class="gallery-arrow gallery-arrow--next" onclick="Render.nextGallerySlide()" aria-label="Siguiente foto">
                  ${icons.arrowRight}
                </button>
              `
                  : ""
              }
            </div>

            ${
              hasMultipleImages
                ? `
              <!-- MINIATURAS INTERACTIVAS (THUMBNAILS) -->
              <div class="product-gallery__thumbnails">
                ${galleryImages
                  .map(
                    (img, idx) => `
                  <button class="gallery-thumb ${idx === 0 ? "active" : ""}" onclick="Render.setGallerySlide(${idx})" id="gallery-thumb-${idx}" aria-label="Ver imagen ${idx + 1}">
                    <img src="${img}" alt="Vista previa ${idx + 1}" onerror="this.onerror=null; this.src='${primaryFallback}';">
                  </button>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            <!-- BANNER DE GARANTÍAS DE CONFIANZA -->
            <div class="gallery-guarantee-bar">
              <div class="guarantee-item">
                ${icons.shield}
                <span>Productos Originales</span>
              </div>
              <div class="guarantee-item">
                ${icons.truck}
                <span>Envío Express a Bolivia</span>
              </div>
            </div>
          </div>

          <!-- DETALLES E INFORMACIÓN DEL PRODUCTO -->
          <div class="product-detail__info-block">
            
            <div class="product-detail__header-meta">
              <span class="product-detail__brand-badge">${product.marca}</span>
              ${isLowStock ? `<span class="stock-urgency-badge"><span class="stock-pulse-dot"></span> ÚLTIMAS ${product.stock} UNIDADES</span>` : ""}
            </div>

            <h1 class="product-detail__name">${product.nombre}</h1>

            <div class="product-detail__rating-row">
              ${
                product.reviews && product.reviews > 0
                  ? `
                <div class="product-card__stars">${renderStars(product.rating)}</div>
                <span class="rating-val">${product.rating}</span>
                <span class="rating-reviews">(${product.reviews.toLocaleString()} opiniones verificadas)</span>
              `
                  : `
                <span class="verified-purchase-tag" style="background: rgba(232, 114, 140, 0.1); color: var(--bella-rose, #E8728C); font-weight: 600;">
                  ${icons.sparkle} 100% Auténtico Garantizado
                </span>
              `
              }
              ${
                isAgotado
                  ? `<span class="stock-status-tag stock-status-tag--out">Agotado temporalmente</span>`
                  : `<span class="verified-purchase-tag"><span class="verified-dot"></span> En Stock</span>`
              }
            </div>

            <!-- BLOQUE DE PRECIO -->
            <div class="product-detail__pricing-box">
              <div class="pricing-main">
                <span class="product-detail__price">${Store.CURRENCY} ${product.precio.toFixed(2)}</span>
                ${product.precioAnterior ? `<span class="product-detail__price-old">${Store.CURRENCY} ${product.precioAnterior.toFixed(2)}</span>` : ""}
              </div>
              ${discount >= 5 ? `<span class="product-detail__savings-badge">Ahorras Bs. ${(product.precioAnterior - product.precio).toFixed(2)} (-${discount}%)</span>` : ""}
            </div>

            <p class="product-detail__description">${product.descripcion}</p>

            ${
              product.sellos && product.sellos.length > 0
                ? `
              <div class="product-detail__sellos-row">
                ${product.sellos.map((s) => `<span class="product-detail__sello-tag">${icons.leaf} ${s}</span>`).join("")}
              </div>
            `
                : ""
            }

            ${
              product.tipoDePiel && product.tipoDePiel.length > 0
                ? `
              <div class="product-detail__skin-type">
                <span class="skin-type__label">Tipo de piel:</span>
                ${product.tipoDePiel.map((t) => `<span class="skin-type__tag">${t}</span>`).join("")}
              </div>
            `
                : ""
            }

            ${
              product.beneficio && product.beneficio.length > 0
                ? `
              <div class="product-detail__benefits">
                <span class="benefits__label">Beneficios clave:</span>
                ${product.beneficio.map((b) => `<span class="benefit__tag">${icons.sparkle} ${b}</span>`).join("")}
              </div>
            `
                : ""
            }

            <div class="product-detail__meta-grid">
              <div class="meta-card">
                <span class="meta-card__label">Contenido neto:</span>
                <span class="meta-card__val">${product.contenido}</span>
              </div>
              <div class="meta-card">
                <span class="meta-card__label">Disponibilidad:</span>
                <span class="meta-card__val">${isAgotado ? "Sin stock temporal" : "Entrega en 24-48 hrs"}</span>
              </div>
            </div>

            <!-- SELECTOR DE CANTIDAD + BOTONES DE ACCIÓN PRINCIPALES -->
            <div class="product-detail__purchase-section" id="product-purchase-section">
              <div class="qty-selector">
                <span class="qty-selector__label">Cantidad:</span>
                <div class="qty-selector__controls">
                  <button onclick="Render.changeDetailQty(-1)" aria-label="Disminuir" ${isAgotado ? "disabled" : ""}>-</button>
                  <span id="detail-qty-val">1</span>
                  <button onclick="Render.changeDetailQty(1)" aria-label="Aumentar" ${isAgotado ? "disabled" : ""}>+</button>
                </div>
              </div>

              <div class="purchase-buttons-group">
                ${
                  isAgotado
                    ? `
                  <button class="btn btn--disabled btn--lg btn--add-cart" disabled>
                    Agotado temporalmente
                  </button>
                `
                    : `
                  <button class="btn btn--primary btn--lg btn--add-cart" 
                          onclick="Store.addItem(Render.getProductById(${product.id}), Render.getDetailQty()); Render.openCart();">
                    ${icons.bag} Añadir al carrito
                  </button>
                `
                }

                <button onclick="Render.directWhatsAppOrder(${product.id})" class="btn btn--whatsapp btn--lg" id="btn-detail-wa">
                  ${icons.whatsapp} ${isAgotado ? "Consultar por WhatsApp" : "Comprar por WhatsApp"}
                </button>
              </div>
            </div>

            <!-- ACORDEONES INTERACTIVOS DE INFORMACIÓN -->
            <div class="product-detail__accordions">
              ${
                product.ingredientes
                  ? `
                <details class="detail-accordion" open>
                  <summary class="detail-accordion__title">
                    <span class="detail-accordion__label">${icons.formula} Fórmula & Activos Clave</span>
                    <span class="detail-accordion__chevron">${icons.chevronDown}</span>
                  </summary>
                  <div class="detail-accordion__content">
                    <div class="ingredients-pills">
                      ${product.ingredientes.map((ing) => `<span class="ingredient-pill">${ing}</span>`).join("")}
                    </div>
                  </div>
                </details>
                <details class="detail-accordion">
                  <summary class="detail-accordion__title">
                    <span class="detail-accordion__label">${icons.routine} Modo de Uso & Rutina</span>
                    <span class="detail-accordion__chevron">${icons.chevronDown}</span>
                  </summary>
                  <div class="detail-accordion__content">
                    <p class="usage-text-styled">${product.modoUso}</p>
                  </div>
                </details>
              `
                  : ""
              }

              <details class="detail-accordion">
                <summary class="detail-accordion__title">
                  <span class="detail-accordion__label">${icons.truck} Envíos y Métodos de Pago</span>
                  <span class="detail-accordion__chevron">${icons.chevronDown}</span>
                </summary>
                <div class="detail-accordion__content">
                  <ul class="shipping-info-list">
                    <li><strong>Envíos Nacionales:</strong> Llegamos a todo Bolivia con envíos rápidos y seguros. Los tiempos de entrega son de 24 a 48 horas aproximadamente, dependiendo de la ciudad y la zona de destino.</li>
                    <li><strong>Formas de Pago:</strong> Pago mediante QR simple, transferencia bancaria o contra entrega.</li>
                    <li><strong>Asesoría Especializada:</strong> Consulta directa vía WhatsApp.</li>
                  </ul>
                </div>
              </details>
            </div>

          </div>
        </div>

        <!-- SECCIÓN DE PRODUCTOS RELACIONADOS (COMPLETA TU RUTINA) -->
        ${
          relacionados.length > 0
            ? `
          <section class="section section--relacionados">
            <div class="section__header">
              <div>
                <span class="section__eyebrow">Rutina Sugerida</span>
                <h2 class="section__title section__title--sm">Completa tu Rutina de Cuidado</h2>
              </div>
            </div>
            <div class="products-grid">
              ${relacionados.map((p) => renderProductCard(p)).join("")}
            </div>
          </section>
        `
            : ""
        }

      </div>

      <!-- FOOTER -->
      ${renderFooter()}

      <!-- BARRA DE COMPRA FIJA EN MÓVIL (STICKY BOTTOM BUY BAR) -->
      ${
        !isAgotado
          ? `
        <div class="mobile-sticky-buy-bar" id="mobile-sticky-buy-bar">
          <div class="mobile-sticky-buy-bar__inner">
            <img src="${product.imagen}" alt="${product.nombre}" class="mobile-sticky-buy-bar__thumb" onerror="this.onerror=null; this.src='assets/img/products/cream.jpg';">
            <div class="mobile-sticky-buy-bar__info">
              <span class="mobile-sticky-buy-bar__name">${product.nombre}</span>
              <span class="mobile-sticky-buy-bar__price">${Store.CURRENCY} ${product.precio.toFixed(2)}</span>
            </div>
            <div class="mobile-sticky-buy-bar__actions">
              <button class="btn btn--primary btn--sm" onclick="Store.addItem(Render.getProductById(${product.id}), Render.getDetailQty()); Render.openCart();" aria-label="Añadir al carrito">
                ${icons.bag}
              </button>
              <button class="btn btn--whatsapp btn--sm" onclick="Render.directWhatsAppOrder(${product.id})" aria-label="Comprar por WhatsApp">
                ${icons.whatsapp}
              </button>
            </div>
          </div>
        </div>
      `
          : ""
      }
    `;
  }

  // ── Controles de Galería del Producto ──
  function setGallerySlide(index) {
    currentGalleryIndex = index;
    const slides = document.querySelectorAll(".gallery-slide");
    const thumbs = document.querySelectorAll(".gallery-thumb");
    const counter = document.getElementById("gallery-counter");

    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === index);
    });

    thumbs.forEach((thumb, idx) => {
      thumb.classList.toggle("active", idx === index);
    });

    if (counter && slides.length > 0) {
      counter.textContent = `${index + 1} / ${slides.length}`;
    }
  }

  function nextGallerySlide() {
    const slides = document.querySelectorAll(".gallery-slide");
    if (!slides.length || slides.length <= 1) return;
    setGallerySlide((currentGalleryIndex + 1) % slides.length);
  }

  function prevGallerySlide() {
    const slides = document.querySelectorAll(".gallery-slide");
    if (!slides.length || slides.length <= 1) return;
    setGallerySlide((currentGalleryIndex - 1 + slides.length) % slides.length);
  }

  function changeDetailQty(delta) {
    currentDetailQty = Math.max(1, currentDetailQty + delta);
    const qtySpan = document.getElementById("detail-qty-val");
    if (qtySpan) qtySpan.textContent = currentDetailQty;
  }

  function directWhatsAppOrder(productId) {
    const product = getProductById(productId);
    if (!product) return;
    const qty = currentDetailQty;
    const isAgotado = product.agotado || product.stock === 0;

    let msg = "";
    if (isAgotado) {
      msg = `Hola BellaMia, deseo consultar sobre la reposición del siguiente producto:\n\n*${product.nombre}*\nMarca: ${product.marca}\n\n¿Cuándo volverán a tener disponibilidad? Muchas gracias.`;
    } else {
      const total = (product.precio * qty).toFixed(2);
      msg = `Hola BellaMia, deseo realizar el pedido del siguiente producto:\n\n*${product.nombre}*\nMarca: ${product.marca}\nCantidad: ${qty} unidad(es)\nTotal a pagar: Bs. ${total}\n\nPor favor indíquenme las formas de pago disponibles y tiempo de entrega. Muchas gracias.`;
    }

    const url = `https://wa.me/59178804382?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");
  }

  function getDetailQty() {
    return currentDetailQty;
  }

  // ══════════════════════════════════════════
  //  CARRITO DE COMPRAS (DRAWER)
  // ══════════════════════════════════════════
  function renderCartDrawer() {
    return `
      <div class="cart-drawer-overlay" id="cart-overlay" onclick="Render.closeCart()"></div>
      <div class="cart-drawer" id="cart-drawer">
        <div class="cart-drawer__header">
          <h2 class="cart-drawer__title">Tu Carrito</h2>
          <button class="cart-drawer__close" onclick="Render.closeCart()" aria-label="Cerrar carrito">
            ${icons.x}
          </button>
        </div>

        <div class="cart-drawer__body" id="cart-drawer-body">
          <!-- Dynamically populated -->
        </div>

        <div class="cart-drawer__footer" id="cart-drawer-footer">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;
  }

  function updateCartDrawer(cart) {
    const totalItems = Store.getTotalItems();
    const badge = document.getElementById("cart-badge");
    if (badge) badge.textContent = totalItems;

    const bnavBadge = document.getElementById("bnav-cart-badge");
    if (bnavBadge) {
      bnavBadge.textContent = totalItems;
      bnavBadge.style.display = totalItems > 0 ? "flex" : "none";
    }

    const body = document.getElementById("cart-drawer-body");
    const footer = document.getElementById("cart-drawer-footer");
    if (!body || !footer) return;

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon-wrap">
            <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#d2d2dc" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <p class="cart-empty__text">Tu carrito está vacío</p>
          <p class="cart-empty__subtext" style="font-size:0.875rem; color:#8E8E93; margin-top:0.4rem; text-align:center;">Agrega productos para solicitar tu pedido por WhatsApp</p>
        </div>
      `;

      footer.innerHTML = `
        <div class="cart-summary">
          <div class="cart-summary__row cart-summary__row--total">
            <span class="total-label">Total a pagar</span>
            <strong class="total-price-val">Bs. 0</strong>
          </div>
        </div>
        <button class="btn btn--whatsapp btn--full btn--lg btn--send-order btn--disabled" disabled id="btn-checkout-whatsapp" style="opacity: 0.55; cursor: not-allowed;" title="Agrega productos para enviar tu pedido">
          ${icons.whatsapp} Enviar pedido por WhatsApp
        </button>
        <button class="btn btn--primary btn--full btn--lg" style="margin-top: 0.65rem;" onclick="Render.closeCart(); window.location.hash='#catalogo';">
          Explorar Catálogo
        </button>
      `;
      return;
    }

    body.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" id="cart-item-${item.id}">
        <img class="cart-item__image" src="${item.imagen}" alt="${item.nombre}" onerror="this.onerror=null; this.src='assets/img/products/cream.jpg';">
        <div class="cart-item__details">
          <span class="cart-item__price">${Store.CURRENCY} ${item.precio * item.qty}</span>
          <span class="cart-item__brand">${item.marca}</span>
          <h4 class="cart-item__name">${item.nombre}</h4>
          
          <div class="cart-item__controls-row">
            <div class="cart-item__qty-pill">
              <button class="cart-item__qty-btn" onclick="Store.updateQty(${item.id}, ${item.qty - 1})" aria-label="Disminuir">-</button>
              <span class="cart-item__qty-val">${item.qty}</span>
              <button class="cart-item__qty-btn" onclick="Store.updateQty(${item.id}, ${item.qty + 1})" aria-label="Aumentar">+</button>
            </div>
            <button class="cart-item__remove-link" onclick="Store.removeItem(${item.id})">Eliminar</button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    const subtotal = Store.getSubtotal();
    footer.innerHTML = `
      <div class="cart-summary">
        <div class="cart-summary__row cart-summary__row--total">
          <span class="total-label">Total a pagar</span>
          <strong class="total-price-val">${Store.CURRENCY} ${subtotal}</strong>
        </div>
      </div>
      <button class="btn btn--whatsapp btn--full btn--lg btn--send-order" onclick="Store.sendToWhatsApp()" id="btn-checkout-whatsapp">
        ${icons.whatsapp} Enviar pedido por WhatsApp
      </button>
    `;
  }

  function openCart() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer && overlay) {
      drawer.classList.add("open");
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeCart() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // ── Touch Swipe Support ──
  function initTouchSwipe(containerId, onSwipeLeft, onSwipeRight) {
    const el = document.getElementById(containerId);
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let diffX = 0;

    el.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        if (containerId === "hero-slider") {
          pauseHeroSlider();
        }
      },
      { passive: true },
    );

    el.addEventListener(
      "touchmove",
      (e) => {
        diffX = e.touches[0].clientX - startX;
        const diffY = e.touches[0].clientY - startY;
        // Evita el scroll vertical cuando se desliza horizontalmente
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    el.addEventListener(
      "touchend",
      () => {
        const threshold = 40;
        if (diffX < -threshold) {
          onSwipeLeft();
        } else if (diffX > threshold) {
          onSwipeRight();
        }
        diffX = 0;
        if (containerId === "hero-slider") {
          resumeHeroSlider();
        }
      },
      { passive: true },
    );
  }

  function initHeroSwipe() {
    initTouchSwipe("hero-slider", nextHeroSlide, prevHeroSlide);
    setupHeroSliderInteractions();
  }

  function initGallerySwipe() {
    initTouchSwipe(
      "gallery-slides-container",
      nextGallerySlide,
      prevGallerySlide,
    );
  }

  // ══════════════════════════════════════════
  //  PÁGINA NOSOTROS (OPTIMIZADA MOBILE-FIRST 2026)
  //  Información Clave, Confiable y de Alto Impacto
  // ══════════════════════════════════════════
  function renderNosotros() {
    return `
      <div class="nosotros-page">
        <!-- BREADCRUMB -->
        <div class="container" style="padding-top: 1rem;">
          <nav class="breadcrumb-bar" aria-label="Navegación Nosotros">
            <a href="#inicio" onclick="Router.navigate('inicio')">Inicio</a>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">Nosotros</span>
          </nav>
        </div>

        <!-- 1. HERO CONCISO DE MARCA -->
        <section class="nosotros-hero-compact">
          <div class="container">
            <span class="nosotros-badge">${icons.sparkle} Conoce BellaMia</span>
            <h1 class="nosotros-title">Tu bienestar, nuestra <em>belleza</em></h1>
            <p class="nosotros-lead">
              Tienda virtual especializada en <strong>skincare, vitaminas y suplementos originales</strong>. Te ofrecemos productos de calidad garantizada, información clara y asesoría cercana antes de decidir.
            </p>
          </div>
        </section>

        <!-- 2. LAS 4 GARANTÍAS CLAVE QUE REALMENTE IMPORTAN AL CLIENTE -->
        <section class="nosotros-section-compact">
          <div class="container">
            <div class="nosotros-guarantees-grid">
              
              <div class="guarantee-card">
                <div class="guarantee-card__icon">${icons.shield}</div>
                <div class="guarantee-card__info">
                  <h3>Productos Originales</h3>
                  <p>Calidad, presentación y confianza asegurada en cada compra.</p>
                </div>
              </div>

              <div class="guarantee-card">
                <div class="guarantee-card__icon">${icons.chat}</div>
                <div class="guarantee-card__info">
                  <h3>Asesoría Directa</h3>
                  <p>Resuelve dudas por WhatsApp o en TikTok Live antes de comprar.</p>
                </div>
              </div>

              <div class="guarantee-card">
                <div class="guarantee-card__icon">${icons.truck}</div>
                <div class="guarantee-card__info">
                  <h3>Envíos a Bolivia</h3>
                  <p>Entregas en La Paz y envios seguros a nivel nacional.</p>
                </div>
              </div>

              <div class="guarantee-card">
                <div class="guarantee-card__icon">${icons.card}</div>
                <div class="guarantee-card__info">
                  <h3>Pagos Fáciles</h3>
                  <p>Cancela al instante con QR Simple o pago contra entrega.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- 3. CÓMO COMPRAR: GUÍA RÁPIDA EN 3 PASOS -->
        <section class="nosotros-section-compact">
          <div class="container">
            <div class="nosotros-how-box">
              <div class="section__header section__header--center" style="margin-bottom: 1.25rem;">
                <span class="section__eyebrow">Proceso Simple & Transparente</span>
                <h2 class="section__title" style="font-size: 1.35rem;">¿Cómo comprar en BellaMia?</h2>
              </div>

              <div class="how-steps-grid">
                <div class="how-step-card">
                  <span class="how-step-num">1</span>
                  <h4>Elige o Consulta</h4>
                  <p>Mira el catálogo o escríbenos a WhatsApp para consultar disponibilidad y rutinas.</p>
                </div>

                <div class="how-step-card">
                  <span class="how-step-num">2</span>
                  <h4>Paga con Comodidad</h4>
                  <p>Elige QR Simple, transferencia o contra entrega en puntos establecidos.</p>
                </div>

                <div class="how-step-card">
                  <span class="how-step-num">3</span>
                  <h4>Recibe tu Pedido</h4>
                  <p>Entrega coordinada en La Paz o envío seguro a nivel nacional.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. MANIFIESTO COMPACTO & CONTACTO DIRECTO -->
        <section class="nosotros-section-compact" style="padding-bottom: 2rem;">
          <div class="container">
            <div class="brand-cta-banner">
              <div class="brand-cta-banner__content">
                <span class="brand-cta-banner__tag">NUESTRO COMPROMISO</span>
                <h3>Calidad · Transparencia · Confianza</h3>
                <p>Cada pedido es una oportunidad para que compres con total tranquilidad y vuelvas por la experiencia.</p>
                <div class="brand-cta-banner__actions">
                  <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20recibir%20asesor%C3%ADa%20personalizada" target="_blank" rel="noopener" class="btn btn--whatsapp btn--md">
                    ${icons.whatsapp} Asesoría por WhatsApp
                  </a>
                  <a href="#catalogo" onclick="Router.navigate('catalogo')" class="btn btn--outline btn--md" style="background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.35);">
                    Ver Catálogo ${icons.arrowRight}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FOOTER -->
        ${renderFooter()}
      </div>
    `;
  }

  // ── FOOTER MODULAR PREMIUM 2026 — EXPERIENCIA INTEGRAL DESKTOP & MÓVIL ──
  function renderFooter() {
    return `
      <footer class="footer" id="footer">
        <div class="container">

          <!-- GRID PRINCIPAL: 4 COLUMNAS (DESKTOP) / OPTIMIZADO (MÓVIL) -->
          <div class="footer__grid">

            <!-- COL 1: MARCA Y REDES SOCIALES -->
            <div class="footer__col footer__col--brand">
              <a href="#inicio" onclick="Router.navigate('inicio')" class="footer__logo-link" aria-label="BellaMia Shop Inicio">
                <img class="footer__logo" src="assets/img/brand/logo-full.png" alt="BellaMia Skincare & Vitamins">
              </a>
              <p class="footer__tagline">Tu bienestar, nuestra belleza</p>
              <p class="footer__desc">
                Cosmética coreana, skincare y vitaminas americanos. Cuidamos cada detalle para ofrecerte solo lo mejor en Bolivia.
              </p>

              <!-- REDES SOCIALES COMPACTAS CON HOVER GLOW -->
              <div class="footer__socials">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="footer__social-btn footer__social-btn--instagram" aria-label="Instagram @bellamia.bo" title="Instagram @bellamia.bo">
                  <span class="footer__social-icon">${icons.instagram}</span>
                  <span class="footer__social-text">Instagram</span>
                </a>
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" class="footer__social-btn footer__social-btn--tiktok" aria-label="TikTok @bellamia.bo" title="TikTok @bellamia.bo">
                  <span class="footer__social-icon">${icons.tiktok}</span>
                  <span class="footer__social-text">TikTok</span>
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" class="footer__social-btn footer__social-btn--facebook" aria-label="Facebook BellaMia Bolivia" title="Facebook BellaMia Bolivia">
                  <span class="footer__social-icon">${icons.facebook}</span>
                  <span class="footer__social-text">Facebook</span>
                </a>
                <a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20recibir%20asesor%C3%ADa%20personalizada" target="_blank" rel="noopener noreferrer" class="footer__social-btn footer__social-btn--whatsapp" aria-label="WhatsApp Asesoría" title="WhatsApp Directo">
                  <span class="footer__social-icon">${icons.whatsapp}</span>
                  <span class="footer__social-text">WhatsApp</span>
                </a>
              </div>
            </div>

            <!-- COL 2: CATEGORÍAS & PRODUCTOS (ACORDEÓN MÓVIL / COLUMNA DESKTOP) -->
            <div class="footer__col footer__col--nav">
              <div class="footer__accordion-group" id="footer-acc-catalog">
                <button type="button" class="footer__accordion-header" onclick="this.parentElement.classList.toggle('open')" aria-label="Desplegar enlaces de catálogo">
                  <span class="footer__title">Catálogo</span>
                  <span class="footer__chevron">${icons.chevronDown}</span>
                </button>
                <ul class="footer__links">
                  <li><a href="#catalogo" onclick="event.preventDefault(); Router.goToCatalog('todos');">Ver Todo el Catálogo</a></li>
                  <li><a href="#catalogo" onclick="event.preventDefault(); Router.goToCatalog('skincare');">Skincare & Rostro</a></li>
                  <li><a href="#catalogo" onclick="event.preventDefault(); Router.goToCatalog('vitaminas');">Vitaminas & Salud</a></li>
                  <li><a href="#catalogo" onclick="event.preventDefault(); Router.goToCatalog('suplementos');">Suplementos</a></li>
                  <li><a href="#catalogo" onclick="event.preventDefault(); Router.filterCatalogByTipo('Serum');">Sérums & Tratamientos</a></li>
                  <li><a href="#catalogo" onclick="event.preventDefault(); Router.filterCatalogByTipo('Protector Solar');">Protección Solar</a></li>
                </ul>
              </div>
            </div>

            <!-- COL 3: NOSOTROS & COMPRA SEGURA (ACORDEÓN MÓVIL / COLUMNA DESKTOP) -->
            <div class="footer__col footer__col--nav">
              <div class="footer__accordion-group" id="footer-acc-bellamia">
                <button type="button" class="footer__accordion-header" onclick="this.parentElement.classList.toggle('open')" aria-label="Desplegar enlaces informativos">
                  <span class="footer__title">BellaMia</span>
                  <span class="footer__chevron">${icons.chevronDown}</span>
                </button>
                <ul class="footer__links">
                  <li><a href="#nosotros" onclick="Router.navigate('nosotros');">Sobre Nosotros</a></li>
                  <li><a href="#nosotros" onclick="Router.navigate('nosotros');">Filosofía & Calidad</a></li>
                  <li><a href="#nosotros" onclick="Router.navigate('nosotros');">Cómo Comprar en 3 Pasos</a></li>
                  <li><a href="#nosotros" onclick="Router.navigate('nosotros');">Envíos & Cobertura</a></li>
                  <li><a href="javascript:void(0)" onclick="Render.openCart();">Mi Carrito de Compras</a></li>
                  <li><a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20tengo%20una%20consulta" target="_blank" rel="noopener noreferrer">Asesoría Personalizada</a></li>
                </ul>
              </div>
            </div>

            <!-- COL 4: ATENCIÓN AL CLIENTE & MEDIOS DE PAGO -->
            <div class="footer__col footer__col--contact">
              <h4 class="footer__title">Atención & Pedidos</h4>
              
              <!-- TARJETA WHATSAPP DIRECTA CON ESTADO ONLINE -->
              <!--a href="https://wa.me/59178804382?text=Hola%20BellaMia%2C%20deseo%20hacer%20un%20pedido%20o%20consulta" target="_blank" rel="noopener noreferrer" class="footer__contact-card">
                <div class="footer__contact-badge">
                  <span class="footer__live-dot"></span>
                  <span class="footer__live-text">En línea • Respuesta rápida</span>
                </div>
                <div class="footer__contact-content">
                  <div class="footer__contact-icon">${icons.whatsapp}</div>
                  <div class="footer__contact-meta">
                    <span class="footer__contact-number">+591 78804382</span>
                    <span class="footer__contact-role">Atención y Pedidos por WhatsApp</span>
                  </div>
                </div>
              </a-->

              <!-- HORARIO Y COBERTURA -->
              <div class="footer__details">
                <div class="footer__detail-item">
                  <span class="footer__detail-icon">${icons.clock}</span>
                  <span>Lun a Sáb: 8:30 – 20:30</span>
                </div>
                <div class="footer__detail-item">
                  <span class="footer__detail-icon">${icons.mapPin}</span>
                  <span>La Paz • Envíos a todo Bolivia</span>
                </div>
              </div>

              <!-- MÉTODOS DE PAGO DISPONIBLES -->
              <div class="footer__payments">
                <span class="footer__payments-title">Pagos Aceptados:</span>
                <div class="footer__payment-tags">
                  <span class="footer__pay-tag">QR Simple</span>
                  <span class="footer__pay-tag">Transferencia</span>
                  <span class="footer__pay-tag">Contra Entrega</span>
                </div>
              </div>

            </div>

          </div>

          <!-- 3. BARRA INFERIOR / COPYRIGHT -->
          <div class="footer__bottom">
            <div class="footer__bottom-wrap">
              <p class="footer__copy">
                © 2026 <strong>BellaMia Shop</strong> — Skincare & Vitamins Bolivia. Todos los derechos reservados.
              </p>
            </div>
          </div>

        </div>
      </footer>
    `;
  }

  return {
    loadProducts,
    getProductById,
    renderHome,
    renderCatalog,
    renderDetail,
    renderNosotros,
    renderFooter,
    renderCartDrawer,
    renderFilterDrawerContent,
    updateCartDrawer,
    openCart,
    closeCart,
    showToast,
    scrollSlider,
    goToHeroSlide,
    nextHeroSlide,
    prevHeroSlide,
    startHeroSliderTimer,
    pauseHeroSlider,
    resumeHeroSlider,
    stopHeroSliderTimer,
    setGallerySlide,
    nextGallerySlide,
    prevGallerySlide,
    changeDetailQty,
    getDetailQty,
    directWhatsAppOrder,
    initHeroSwipe,
    initGallerySwipe,
    icons,
  };
})();

// Exposición global confiable para eventos y scripts
if (typeof window !== 'undefined') {
  window.Render = Render;
}

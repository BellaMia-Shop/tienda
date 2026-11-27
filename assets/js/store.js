/* ============================================
   BellaMia Shop — store.js 2.0
   Estado del carrito + localStorage
   WhatsApp: 78804382 | Moneda: Bs
   ============================================ */

const Store = (() => {
  const STORAGE_KEY = 'bellamia_cart';
  const WHATSAPP_NUMBER = '59178804382';
  const CURRENCY = 'Bs.';

  let cart = [];
  let listeners = [];

  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) cart = JSON.parse(saved);
    } catch (e) { cart = []; }
    notify();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    catch (e) { console.warn('No se pudo guardar el carrito:', e); }
  }

  function notify() { listeners.forEach(fn => fn(cart)); }

  function subscribe(fn) {
    listeners.push(fn);
    fn(cart);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }

  function addItem(product, qty = 1) {
    if (!product || product.agotado || product.stock === 0) return false;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        nombre: product.nombre,
        marca: product.marca,
        precio: product.precio,
        imagen: product.imagen,
        qty: qty
      });
    }
    save();
    notify();
    return true;
  }

  function updateQty(productId, newQty) {
    if (newQty <= 0) { removeItem(productId); return; }
    const item = cart.find(item => item.id === productId);
    if (item) { item.qty = newQty; save(); notify(); }
  }

  function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    save();
    notify();
  }

  function clearCart() { cart = []; save(); notify(); }
  function getCart() { return [...cart]; }

  function getTotalItems() {
    return cart.reduce((total, item) => total + item.qty, 0);
  }

  function getSubtotal() {
    return cart.reduce((total, item) => total + (item.precio * item.qty), 0);
  }

  function formatPrice(precio) {
    return `${CURRENCY} ${Number(precio).toFixed(2)}`;
  }

  function generateWhatsAppMessage() {
    if (cart.length === 0) return '';

    const itemsText = cart.map(item =>
      `• ${item.qty}x ${item.nombre} (${item.marca}) — ${CURRENCY} ${(item.precio * item.qty).toFixed(2)}`
    ).join('\n');

    const total = getSubtotal();

    return `Hola BellaMia, deseo realizar el siguiente pedido:\n\n${itemsText}\n\n*Total a pagar: ${CURRENCY} ${total.toFixed(2)}*\n\nPor favor indíquenme las formas de pago disponibles y tiempo estimado de entrega. Muchas gracias.`;
  }

  function sendToWhatsApp() {
    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega al menos un producto para enviar tu pedido por WhatsApp.');
      return;
    }
    const message = generateWhatsAppMessage();
    if (!message) return;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
  }

  function generateProductWhatsApp(product) {
    const msg = `Hola BellaMia, deseo consultar sobre el siguiente producto:\n\n*${product.nombre}*\nMarca: ${product.marca}\nPrecio: ${CURRENCY} ${product.precio.toFixed(2)}\n\n¿Tienen disponibilidad para envío inmediato?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  return {
    init,
    subscribe,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    getCart,
    getTotalItems,
    getSubtotal,
    formatPrice,
    sendToWhatsApp,
    generateProductWhatsApp,
    CURRENCY
  };
})();

// Exposición global confiable para eventos y scripts
if (typeof window !== 'undefined') {
  window.Store = Store;
}

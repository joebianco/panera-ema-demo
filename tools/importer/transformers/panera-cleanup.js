/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Panera Bread site-wide cleanup.
 *
 * Removes non-authorable, dynamic/runtime chrome from the Panera homepage so the
 * import contains only page-level authorable content (hero-promo, carousel-product,
 * cards-promo, cards-category, cards-benefit).
 *
 * Header (#iw-main-content > div.pds-header-container) and footer (#footer) are
 * migrated separately by the nav/footer orchestrators and are removed here so they
 * do not leak into block parsing.
 *
 * ALL selectors below were verified against migration-work/cleaned.html (line refs
 * in comments). None are guessed.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Dynamic/runtime elements that are NOT authored content. Removed before block
    // parsing so they do not pollute the cards/carousel cells the parsers build.
    WebImporter.DOMUtils.remove(element, [
      // NOTE: the order-setup bar (#order-setup-bar / op3694 swiper-slide) is now
      // migrated as the `order-setup` block, so it is intentionally NOT removed here.
      // Commerce Add / Customize action controls on every product placard
      // (cleaned.html L415, L470, L508, L563, etc.). iw-quick-add wraps the
      // Add (silo-button.iw-pgi-add) and Customize buttons.
      '.iw-quick-add',
      '.iw-pgi-actions',
      // Per-product live size selector (e.g. "Whole ▾") — runtime control
      // (cleaned.html L403, L734, L789).
      '.iw-pgi-select-size',
      // Carousel category live-filter tab controls (cleaned.html L348-L362):
      // Sandwiches / Salads / Soups & Mac / Beverages tab list drives runtime
      // re-filtering of the product grid.
      '.pds-tablist-container',
      '#category-nav',
      // Carousel runtime navigation arrows (cleaned.html L374).
      '.pc-nav-button',
      // Personalization / runtime drawer dialog (cleaned.html L959).
      '#category-action-palette-drawer',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome and trailing runtime/personalization elements.
    WebImporter.DOMUtils.remove(element, [
      // Header (handled by nav orchestrator) — cleaned.html L6.
      '.pds-header-container',
      'header.iw-site-header',
      // Footer (handled by footer orchestrator) — cleaned.html L1150.
      '#footer',
      // Sign-in / cart state widgets (cleaned.html L63 iw-up-sign-in,
      // L76 iw-cart-summary/iw-sh-cart, L77 iw-cs-cart-button). These live in the
      // header container above but are listed explicitly for safety.
      '.iw-up-sign-in',
      '.iw-cart-summary',
      '.iw-sh-cart',
      // Personalization overlays / dialogs / snackbars trailing the main content
      // (cleaned.html L1291 iw-overlays, L1292 fullscreen-overlay, L1302 alert
      // base-templates, L1332 snackbars, L972 pds-bg-overlay, L1291 announcer).
      '.iw-overlays',
      '.fullscreen-overlay',
      '.base-templates',
      '.snackbars',
      '.pds-bg-overlay',
      '#announcer',
      // Tracking / pixel iframes and beacons (cleaned.html L1347, L1357, L1359,
      // L1362, L1366).
      'iframe',
      '#batBeacon156435615202',
      // Safe non-authorable element types.
      'link',
      'noscript',
      'script',
      'source',
    ]);
  }
}

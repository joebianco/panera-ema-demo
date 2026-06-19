import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

const SEARCH_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, false);
      nav.querySelector('.nav-hamburger button').focus();
    }
  }
}

/**
 * Toggles the entire nav (mobile)
 * @param {Element} nav The container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (!expanded && !isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // sections: 0 = global banner, 1 = brand/logo, 2 = nav links, 3 = tools/actions
  const classes = ['banner', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Global banner: prepend the "Panera" / "Panera Catering" tab switcher (left)
  // alongside the promo message (right), matching the source utility bar.
  const navBanner = nav.querySelector('.nav-banner');
  if (navBanner) {
    const tabs = document.createElement('div');
    tabs.className = 'nav-banner-tabs';
    tabs.innerHTML = `<span class="nav-banner-tab nav-banner-tab-active">Panera</span>
      <a class="nav-banner-tab" href="https://catering.panerabread.com">Panera Catering</a>`;
    navBanner.prepend(tabs);
  }

  // Resolve relative image paths in the fragment against the nav fragment location
  // (e.g. "images/panera-logo.svg" -> "/content/images/panera-logo.svg").
  const navBase = new URL(navPath, window.location);
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.src = new URL(src, navBase).href;
    }
  });

  // Brand logo link cleanup
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.classList.add('nav-brand-link');
      brandLink.setAttribute('aria-label', 'Panera Bread Home');
    }
  }

  // Gift Cards promotional badge in the nav links
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll('a').forEach((a) => {
      if (a.textContent.trim() === 'Gift Cards') {
        const badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.textContent = '20% OFF';
        a.append(badge);
      }
    });
  }

  // Tools: turn search into an icon button, mark the Start an Order CTA, group sign-in row
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('a').forEach((a) => {
      const label = a.textContent.trim();
      if (label === 'Search Our Menu') {
        a.classList.add('nav-search');
        a.setAttribute('aria-label', 'Search Our Menu');
        a.innerHTML = SEARCH_ICON;
      } else if (label === 'Start an Order') {
        a.classList.add('nav-cta');
      } else if (label === 'Sign In') {
        a.classList.add('nav-signin');
      } else if (label === 'Join MyPanera') {
        a.classList.add('nav-join');
      }
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // reset mobile menu state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, isDesktop.matches);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

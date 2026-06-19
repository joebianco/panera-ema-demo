import { fetchPlaceholders } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-product');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-product-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-product-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-product-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-product-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-product-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-product-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-product-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-product-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-product-slide-${colIdx === 0 ? 'image' : 'content'}`);
    // Tag the badge paragraph ("NEW RECIPE!" / "New Item") so CSS can style it.
    if (colIdx === 1) {
      const firstP = column.querySelector(':scope > p');
      if (firstP) {
        const txt = (firstP.textContent || '').trim();
        if (/^new recipe!?$/i.test(txt) || /^new item$/i.test(txt)) {
          firstP.classList.add('carousel-product-badge');
        }
      }
    }
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

/**
 * The parser emits the carousel header (heading + a single links paragraph
 * holding the category tabs and the "Explore all…" CTA) as default content
 * immediately BEFORE the block. Find that wrapper and split its links paragraph
 * into a tab row + CTA so it can be styled like the source.
 */
function decorateHeader(block) {
  const wrapper = block.closest('.carousel-product-wrapper');
  if (!wrapper) return;
  const dc = wrapper.previousElementSibling;
  if (!dc || !dc.classList.contains('default-content-wrapper')) return;
  dc.classList.add('carousel-product-header');

  const linksP = [...dc.querySelectorAll('p')].find((p) => p.querySelector('a'));
  if (!linksP) return;

  const links = [...linksP.querySelectorAll('a')];
  // The CTA is the link whose text starts with "Explore" (fallback: last link).
  let ctaLink = links.find((a) => /^explore/i.test(a.textContent.trim()));
  if (!ctaLink) ctaLink = links[links.length - 1];
  let tabLinks = links.filter((a) => a !== ctaLink);

  // The DA markdown→HTML conversion collapses a delimited links paragraph down
  // to its final link, so the category-tab links are usually lost. When that
  // happens, rebuild the category tabs from their fixed menu category names.
  if (tabLinks.length === 0) {
    const categories = [
      ['Sandwiches', 'sandwiches'],
      ['Salads', 'salads'],
      ['Soups & Mac', 'soups-and-mac'],
      ['Beverages', 'beverages'],
    ];
    tabLinks = categories.map(([label, slug]) => {
      const a = document.createElement('a');
      a.href = `/en-us/menu/categories/${slug}.html`;
      a.textContent = label;
      return a;
    });
  }

  const controls = document.createElement('div');
  controls.className = 'carousel-product-controls';

  if (tabLinks.length) {
    const tabs = document.createElement('ul');
    tabs.className = 'carousel-product-tabs';
    tabLinks.forEach((a, idx) => {
      const li = document.createElement('li');
      if (idx === 0) li.setAttribute('data-active', 'true');
      li.append(a);
      tabs.append(li);
    });
    controls.append(tabs);
  }

  if (ctaLink) {
    const ctaP = document.createElement('p');
    ctaP.className = 'carousel-product-explore';
    ctaP.append(ctaLink);
    controls.append(ctaP);
  }

  linksP.replaceWith(controls);
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-product-${carouselId}`);

  decorateHeader(block);

  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-product-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-product-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-product-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-product-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-product-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}

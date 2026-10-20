(function () {
  "use strict";

  const grid = document.querySelector(".photo-gallery__grid");
  const filterWrap = document.querySelector(".photo-gallery__filter-wrap");
  const viewer = document.querySelector(".gallery-viewer");
  if (!grid || !filterWrap || !viewer || typeof viewer.showModal !== "function") return;

  const items = Array.from(grid.querySelectorAll(".photo-gallery__item"));
  const filters = Array.from(filterWrap.querySelectorAll("[data-filter]"));
  const image = viewer.querySelector(".gallery-viewer__image");
  const viewport = viewer.querySelector(".gallery-viewer__viewport");
  const counter = viewer.querySelector(".gallery-viewer__counter");
  const closeButton = viewer.querySelector(".gallery-viewer__close");
  const previous = viewer.querySelector(".gallery-viewer__previous");
  const next = viewer.querySelector(".gallery-viewer__next");
  const zoom = viewer.querySelector(".gallery-viewer__zoom");
  let visible = items;
  let current = 0;
  let opener = null;
  let previousOverflow = "";
  let touchStart = null;

  const header = document.querySelector(".site-header");
  if (header) {
    const updateHeaderHeight = () => {
      filterWrap.style.setProperty("--gallery-header-height", `${header.getBoundingClientRect().height}px`);
    };
    updateHeaderHeight();
    if ("ResizeObserver" in window) {
      new ResizeObserver(updateHeaderHeight).observe(header);
    } else {
      window.addEventListener("resize", updateHeaderHeight);
      window.addEventListener("scroll", updateHeaderHeight, { passive: true });
    }
  }

  function resetZoom() {
    viewport.classList.remove("is-zoomed");
    zoom.setAttribute("aria-pressed", "false");
    zoom.textContent = "Ampliar detalhes";
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
  }

  function updateZoomAvailability() {
    zoom.disabled = !(image.naturalWidth > image.clientWidth + 1 || image.naturalHeight > image.clientHeight + 1);
  }

  function showPhoto(index) {
    current = (index + visible.length) % visible.length;
    const item = visible[current];
    resetZoom();
    zoom.disabled = true;
    image.alt = item.querySelector("img").alt;
    image.src = item.href;
    counter.textContent = `${current + 1} de ${visible.length} — ${image.alt}`;
    if (image.complete) updateZoomAvailability();
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
      visible = items.filter((item) => button.dataset.filter === "todas" || item.dataset.category === button.dataset.filter);
      items.forEach((item) => { item.hidden = !visible.includes(item); });
      if (typeof grid.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        grid.animate([{ opacity: .7 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
      }
    });
  });

  grid.addEventListener("click", (event) => {
    const item = event.target.closest(".photo-gallery__item");
    if (!item || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = item;
    previousOverflow = document.body.style.overflow;
    showPhoto(visible.indexOf(item));
    viewer.showModal();
    document.body.style.overflow = "hidden";
    closeButton.focus();
    if (image.complete) updateZoomAvailability();
  });

  image.addEventListener("load", updateZoomAvailability);
  window.addEventListener("resize", () => {
    if (viewer.open && !viewport.classList.contains("is-zoomed")) updateZoomAvailability();
  });
  previous.addEventListener("click", () => showPhoto(current - 1));
  next.addEventListener("click", () => showPhoto(current + 1));
  closeButton.addEventListener("click", () => viewer.close());
  zoom.addEventListener("click", () => {
    const expanded = viewport.classList.toggle("is-zoomed");
    zoom.setAttribute("aria-pressed", String(expanded));
    zoom.textContent = expanded ? "Ajustar à tela" : "Ampliar detalhes";
    if (expanded) {
      viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
    }
  });

  viewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); showPhoto(current - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); showPhoto(current + 1); }
    if (event.key !== "Tab") return;
    const controls = [zoom, closeButton, previous, next].filter((control) => !control.disabled);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  viewport.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1 && !viewport.classList.contains("is-zoomed")) {
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
  }, { passive: true });
  viewport.addEventListener("touchend", (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) showPhoto(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  viewport.addEventListener("touchcancel", () => { touchStart = null; });

  viewer.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    resetZoom();
    if (opener) opener.focus({ preventScroll: true });
  });
  filterWrap.hidden = false;
})();

(function () {
    "use strict";
    const carousel = document.querySelector(".hero-carousel");
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll(".hero-carousel__slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const status = carousel.querySelector("[data-carousel-status]");
    const toggle = carousel.querySelector("[data-carousel-toggle]");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previous = carousel.querySelector("[data-carousel-previous]");
    const next = carousel.querySelector("[data-carousel-next]");
    const content = document.querySelector(".hero__content");
    const title = content.querySelector("[data-hero-title]");
    const description = content.querySelector("[data-hero-description]");
    const link = content.querySelector("[data-hero-link]");
    let activeIndex = 0;
    let touchStart = 0;
    let timer = null;
    let paused = motion.matches;
    let pointerInside = false;
    let focusInside = false;

    function updateToggle() {
        toggle.textContent = paused ? "?" : "?";
        toggle.setAttribute("aria-label", paused ? "Retomar apresenta??o autom?tica" : "Pausar apresenta??o autom?tica");
    }
    function scheduleRotation() {
        clearTimeout(timer);
        timer = null;
        if (paused || pointerInside || focusInside || document.hidden) return;
        timer = setTimeout(() => {
            timer = null;
            showSlide(activeIndex + 1);
            scheduleRotation();
        }, 5000);
    }
    function pauseForInteraction() {
        paused = true;
        updateToggle();
        scheduleRotation();
    }
    function showManualSlide(index) {
        pauseForInteraction();
        showSlide(index);
    }
    function animateSlide(slide) {
        slides.forEach((item) => item.classList.remove("is-animating"));
        content.classList.remove("is-animating");
        // Restart the entrance even when controls are used in quick succession.
        void content.offsetWidth;
        slide.classList.add("is-animating");
        content.classList.add("is-animating");
    }
    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, position) => {
            const active = position === activeIndex;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", String(!active));
        });
        dots.forEach((dot, position) => {
            const active = position === activeIndex;
            dot.classList.toggle("is-active", active);
            dot.setAttribute("aria-current", String(active));
        });
        status.textContent = `Slide ${activeIndex + 1} de ${slides.length}`;
        const activeSlide = slides[activeIndex];
        title.textContent = activeSlide.dataset.heroTitle;
        description.textContent = activeSlide.dataset.heroDescription;
        link.textContent = activeSlide.dataset.heroLinkLabel;
        link.href = activeSlide.dataset.heroLinkTarget;
        animateSlide(activeSlide);
    }
    animateSlide(slides[activeIndex]);
    toggle.hidden = false;
    updateToggle();
    toggle.addEventListener("click", () => {
        paused = !paused;
        updateToggle();
        scheduleRotation();
    });
    carousel.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        pointerInside = true;
        scheduleRotation();
    });
    carousel.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "touch") return;
        pointerInside = false;
        scheduleRotation();
    });
    carousel.addEventListener("focusin", () => { focusInside = true; scheduleRotation(); });
    carousel.addEventListener("focusout", (event) => {
        if (carousel.contains(event.relatedTarget)) return;
        focusInside = false;
        scheduleRotation();
    });
    document.addEventListener("visibilitychange", scheduleRotation);
    motion.addEventListener("change", (event) => {
        if (event.matches) pauseForInteraction();
    });
    scheduleRotation();
    previous.addEventListener("click", () => showManualSlide(activeIndex - 1));
    next.addEventListener("click", () => showManualSlide(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => showManualSlide(index)));
    carousel.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); showManualSlide(activeIndex - 1); }
        if (event.key === "ArrowRight") { event.preventDefault(); showManualSlide(activeIndex + 1); }
    });
    carousel.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    carousel.addEventListener("touchend", (event) => { const distance = event.changedTouches[0].clientX - touchStart; if (Math.abs(distance) > 40) showManualSlide(activeIndex + (distance < 0 ? 1 : -1)); }, { passive: true });
})();

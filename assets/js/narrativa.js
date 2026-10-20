(function () {
  "use strict";

  const story = document.querySelector(".story__inner");
  const line = story?.querySelector(".story__line");
  if (!story || !line || !("IntersectionObserver" in window)) return;

  const chapters = story.querySelectorAll("[data-story-chapter]");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pending = new Map();
  let observer;
  let frame = null;

  function updateLine() {
    frame = null;
    if (motion.matches) return;
    const rect = line.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.7 - rect.top) / (line.offsetHeight || 1)));
    line.style.setProperty("--story-progress", String(progress));
  }

  function requestUpdate() {
    if (!motion.matches && frame === null) frame = window.requestAnimationFrame(updateLine);
  }

  function reveal(element) {
    const animation = pending.get(element);
    if (!animation) return;
    pending.delete(element);
    element.closest("[data-story-chapter]").classList.add("is-revealed");
    animation.play();
  }

  function configureMotion() {
    if (observer) observer.disconnect();
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    if (motion.matches) {
      line.style.removeProperty("--story-progress");
      pending.forEach((animation) => animation.cancel());
      pending.clear();
      chapters.forEach((chapter) => { if (typeof chapter.getAnimations === "function") chapter.getAnimations({ subtree: true }).forEach((animation) => animation.cancel()); });
      return;
    }
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        reveal(entry.target);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -20% 0px" });
    chapters.forEach((chapter) => {
      chapter.querySelectorAll(".story__image, .story__copy").forEach((element) => {
        if (typeof element.animate !== "function" || element.dataset.storyRevealed) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) { element.dataset.storyRevealed = "true"; return; }
        const isCopy = element.classList.contains("story__copy");
        const animation = element.animate(
          [{ opacity: 0, transform: `translateY(${isCopy ? 16 : 24}px)` }, { opacity: 1, transform: "translateY(0)" }],
          { duration: isCopy ? 700 : 850, delay: isCopy ? 140 : 0, easing: "cubic-bezier(.22,.61,.36,1)", fill: "both" }
        );
        animation.pause();
        pending.set(element, animation);
        animation.onfinish = () => { element.dataset.storyRevealed = "true"; animation.cancel(); };
        observer.observe(element);
      });
    });
    requestUpdate();
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  story.addEventListener("focusin", (event) => {
    const copy = event.target.closest(".story__copy");
    if (copy) reveal(copy);
  });
  motion.addEventListener("change", configureMotion);
  configureMotion();
})();

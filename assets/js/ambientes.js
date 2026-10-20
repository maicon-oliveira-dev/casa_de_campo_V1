(function () {
  "use strict";

  const chapters = document.querySelectorAll("[data-visit-chapter]");
  const line = document.querySelector(".visit__line");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!chapters.length || !line || !("IntersectionObserver" in window)) return;

  const revealed = new WeakSet();
  let observer;
  let frame = 0;

  function updateLine() {
    frame = 0;
    if (motion.matches) return;
    const bounds = line.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * .7 - bounds.top) / (line.offsetHeight || 1)));
    line.style.setProperty("--visit-progress", progress);
  }

  function scheduleLine() {
    if (!frame) frame = requestAnimationFrame(updateLine);
  }

  function setup() {
    if (observer) observer.disconnect();
    if (motion.matches) {
      line.style.removeProperty("--visit-progress");
      chapters.forEach((chapter) => {
        chapter.classList.remove("is-active");
        if (typeof chapter.getAnimations === "function") {
          chapter.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
        }
      });
      return;
    }
    updateLine();
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const chapter = entry.target;
        chapter.classList.toggle("is-active", entry.isIntersecting);
        if (!entry.isIntersecting || revealed.has(chapter)) return;
        revealed.add(chapter);
        const photo = chapter.querySelector("img");
        const copy = chapter.querySelector(".visit__copy");
        const index = Array.prototype.indexOf.call(chapters, chapter);
        if (photo && typeof photo.animate === "function") {
          const start = index % 2 ? "inset(0 0 0 10%)" : "inset(0 10% 0 0)";
          photo.animate([
            { clipPath: start, opacity: .5, transform: "translateY(12px)" },
            { clipPath: "inset(0 0 0 0)", opacity: 1, transform: "translateY(0)" }
          ], { duration: 850, easing: "cubic-bezier(.2,.7,.2,1)" });
        }
        if (copy && typeof copy.animate === "function") {
          copy.animate([
            { opacity: .4, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" }
          ], { duration: 650, delay: 140, easing: "ease-out" });
        }
      });
    }, { threshold: .08 });
    chapters.forEach((chapter) => observer.observe(chapter));
  }

  window.addEventListener("scroll", scheduleLine, { passive: true });
  window.addEventListener("resize", scheduleLine);
  motion.addEventListener("change", setup);
  setup();
})();

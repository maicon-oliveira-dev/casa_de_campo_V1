(function () {
    "use strict";

    document.documentElement.classList.add("has-js");

    const header = document.querySelector(".site-header");
    const compactStart = 40;
    const compactEnd = 12;
    let isCompact = false;
    let isTicking = false;

    if (!header) {
        return;
    }

    function updateHeaderState() {
        const scrollPosition = window.scrollY;
        const shouldCompact = isCompact
            ? scrollPosition > compactEnd
            : scrollPosition > compactStart;

        if (shouldCompact !== isCompact) {
            isCompact = shouldCompact;
            header.classList.toggle("site-header--compact", isCompact);
        }
    }

    function requestHeaderUpdate() {
        if (isTicking) {
            return;
        }

        isTicking = true;
        window.requestAnimationFrame(() => {
            updateHeaderState();
            isTicking = false;
        });
    }

    window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
    window.addEventListener("resize", updateHeaderState);
    updateHeaderState();
})();

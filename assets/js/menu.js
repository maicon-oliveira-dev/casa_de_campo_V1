(function () {
    "use strict";

    const desktopMedia = window.matchMedia("(min-width: 48rem)");
    const menuButton = document.querySelector(".menu-button");
    const mobileMenu = document.querySelector("#mobile-menu");

    if (!menuButton || !mobileMenu) {
        return;
    }

    const menuLinks = Array.from(mobileMenu.querySelectorAll("a[href]"));
    const firstMenuItem = menuLinks[0];
    const lastMenuItem = menuLinks.at(-1);

    function isOpen() {
        return !mobileMenu.hidden;
    }

    function setMenuState(open, options = {}) {
        const { returnFocus = false, moveFocus = false } = options;

        mobileMenu.hidden = !open;
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        document.body.classList.toggle("menu-open", open);

        if (open && moveFocus) {
            firstMenuItem?.focus();
        }

        if (!open && returnFocus) {
            menuButton.focus();
        }
    }

    function toggleMenu() {
        setMenuState(!isOpen(), { moveFocus: !isOpen(), returnFocus: isOpen() });
    }

    function handleMenuKeydown(event) {
        if (!isOpen()) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            setMenuState(false, { returnFocus: true });
            return;
        }

        if (event.key !== "Tab" || !firstMenuItem || !lastMenuItem) {
            return;
        }

        if (event.shiftKey) {
            if (document.activeElement === firstMenuItem) {
                event.preventDefault();
                menuButton.focus();
            } else if (document.activeElement === menuButton) {
                event.preventDefault();
                lastMenuItem.focus();
            }
        } else if (document.activeElement === lastMenuItem) {
            event.preventDefault();
            menuButton.focus();
        } else if (document.activeElement === menuButton) {
            event.preventDefault();
            firstMenuItem.focus();
        }
    }

    menuButton.addEventListener("click", toggleMenu);

    mobileMenu.addEventListener("click", (event) => {
        if (event.target.closest("a[href]")) {
            setMenuState(false);
        }
    });

    document.addEventListener("keydown", handleMenuKeydown);

    desktopMedia.addEventListener("change", (event) => {
        if (event.matches && isOpen()) {
            setMenuState(false);
        }
    });

    setMenuState(false);
})();

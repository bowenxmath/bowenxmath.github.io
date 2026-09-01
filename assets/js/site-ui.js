(function () {

    /* =====================================================
       Find Navigation
    ====================================================== */

    const nav =
        document.querySelector("header nav");

    if (!nav) {
        return;
    }


    /* =====================================================
       Create Theme Button
    ====================================================== */

    const themeButton =
        document.createElement("button");

    themeButton.type =
        "button";

    themeButton.className =
        "theme-button";

    themeButton.setAttribute(
        "aria-label",
        "Toggle theme"
    );

    nav.appendChild(
        themeButton
    );


    /* =====================================================
       Theme Icons
    ====================================================== */

    const moonIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true">

            <path
                d="M20.5 14.2
                   A8.5 8.5 0 0 1
                   9.8 3.5
                   A8.5 8.5 0 1 0
                   20.5 14.2">
            </path>

        </svg>
    `;


    const sunIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true">

            <circle
                cx="12"
                cy="12"
                r="4">
            </circle>

            <line
                x1="12"
                y1="2"
                x2="12"
                y2="4">
            </line>

            <line
                x1="12"
                y1="20"
                x2="12"
                y2="22">
            </line>

            <line
                x1="4.93"
                y1="4.93"
                x2="6.34"
                y2="6.34">
            </line>

            <line
                x1="17.66"
                y1="17.66"
                x2="19.07"
                y2="19.07">
            </line>

            <line
                x1="2"
                y1="12"
                x2="4"
                y2="12">
            </line>

            <line
                x1="20"
                y1="12"
                x2="22"
                y2="12">
            </line>

            <line
                x1="4.93"
                y1="19.07"
                x2="6.34"
                y2="17.66">
            </line>

            <line
                x1="17.66"
                y1="6.34"
                x2="19.07"
                y2="4.93">
            </line>

        </svg>
    `;


    /* =====================================================
       System Theme
    ====================================================== */

    const systemDark =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    /* =====================================================
       Restore Saved Preference
    ====================================================== */

    const savedTheme =
        localStorage.getItem(
            "theme"
        );


    if (
        savedTheme === "light" ||
        savedTheme === "dark"
    ) {

        document.documentElement
            .setAttribute(
                "data-theme",
                savedTheme
            );
    }


    /* =====================================================
       Determine Current Theme
    ====================================================== */

    function getCurrentTheme() {

        const manualTheme =
            document.documentElement
                .getAttribute(
                    "data-theme"
                );


        if (
            manualTheme === "light" ||
            manualTheme === "dark"
        ) {

            return manualTheme;
        }


        return systemDark.matches
            ? "dark"
            : "light";
    }


    /* =====================================================
       Update Theme Button
    ====================================================== */

    function updateThemeButton() {

        const currentTheme =
            getCurrentTheme();


        if (
            currentTheme === "dark"
        ) {

            themeButton.innerHTML =
                sunIcon;

            themeButton.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeButton.setAttribute(
                "title",
                "Switch to light mode"
            );

        } else {

            themeButton.innerHTML =
                moonIcon;

            themeButton.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeButton.setAttribute(
                "title",
                "Switch to dark mode"
            );
        }
    }


    /* =====================================================
       Toggle Theme
    ====================================================== */

    themeButton.addEventListener(
        "click",
        function () {

            const currentTheme =
                getCurrentTheme();


            const newTheme =
                currentTheme === "dark"
                    ? "light"
                    : "dark";


            document.documentElement
                .setAttribute(
                    "data-theme",
                    newTheme
                );


            localStorage.setItem(
                "theme",
                newTheme
            );


            updateThemeButton();
        }
    );


    /* =====================================================
       Respond to System Theme Changes
    ====================================================== */

    systemDark.addEventListener(
        "change",
        function () {

            if (
                !localStorage.getItem(
                    "theme"
                )
            ) {

                updateThemeButton();
            }
        }
    );


    /* =====================================================
       Initial Theme Button State
    ====================================================== */

    updateThemeButton();


    /* =====================================================
       Create Back-to-Top Button
    ====================================================== */

    const backToTop =
        document.createElement(
            "button"
        );


    backToTop.type =
        "button";


    backToTop.id =
        "back-to-top";


    backToTop.className =
        "back-to-top";


    backToTop.setAttribute(
        "aria-label",
        "Back to top"
    );


    backToTop.setAttribute(
        "title",
        "Back to top"
    );


    backToTop.innerHTML = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true">

            <path
                d="M12 19V5">
            </path>

            <path
                d="M6.5 10.5L12 5l5.5 5.5">
            </path>

        </svg>
    `;


    document.body.appendChild(
        backToTop
    );


    /* =====================================================
       Show / Hide Back-to-Top Button
    ====================================================== */

    function updateBackToTop() {

        if (
            window.scrollY > 500
        ) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );
        }
    }


    /* =====================================================
       Back-to-Top Scroll Listener
    ====================================================== */

    window.addEventListener(
        "scroll",
        updateBackToTop,
        {
            passive: true
        }
    );


    /* =====================================================
       Back-to-Top Click
    ====================================================== */

    backToTop.addEventListener(
        "click",
        function () {

            const reduceMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;


            window.scrollTo({
                top: 0,
                behavior:
                    reduceMotion
                        ? "auto"
                        : "smooth"
            });

        }
    );


    /* =====================================================
       Initial Back-to-Top State
    ====================================================== */

    updateBackToTop();

})();

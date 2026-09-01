(function () {

    /* =====================================================
       Navigation
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

    themeButton.type = "button";

    themeButton.className =
        "theme-button";

    themeButton.setAttribute(
        "aria-label",
        "Toggle theme"
    );

    nav.appendChild(themeButton);


    /* =====================================================
       System Theme
    ====================================================== */

    const systemDark =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    /* =====================================================
       Determine Current Theme
    ====================================================== */

    function getCurrentTheme() {

        const manualTheme =
            document.documentElement
                .getAttribute("data-theme");


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


        if (currentTheme === "dark") {

            themeButton.textContent = "☀";

            themeButton.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeButton.setAttribute(
                "title",
                "Switch to light mode"
            );

        } else {

            themeButton.textContent = "☾";

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
       Restore Saved Theme
    ====================================================== */

    const savedTheme =
        localStorage.getItem("theme");


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
       Follow System Changes
       Only when user has not chosen manually
    ====================================================== */

    systemDark.addEventListener(
        "change",
        function () {

            if (!localStorage.getItem("theme")) {

                updateThemeButton();
            }
        }
    );


    updateThemeButton();

})();

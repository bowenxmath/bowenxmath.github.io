/* =========================================================
   Theme Management
========================================================= */

(function () {

    const themeToggle =
        document.getElementById("theme-toggle");

    const systemDark =
        window.matchMedia("(prefers-color-scheme: dark)");

    const savedTheme =
        localStorage.getItem("theme");


    /* -----------------------------------------------------
       Restore Manual Theme
    ----------------------------------------------------- */

    if (savedTheme === "light" ||
        savedTheme === "dark") {

        document.documentElement.setAttribute(
            "data-theme",
            savedTheme
        );
    }


    /* -----------------------------------------------------
       Determine Effective Theme
    ----------------------------------------------------- */

    function getCurrentTheme() {

        const manualTheme =
            document.documentElement.getAttribute(
                "data-theme"
            );

        if (manualTheme === "light" ||
            manualTheme === "dark") {

            return manualTheme;
        }

        return systemDark.matches
            ? "dark"
            : "light";
    }


    /* -----------------------------------------------------
       Update Button
    ----------------------------------------------------- */

    function updateButton() {

        if (!themeToggle) {
            return;
        }

        const currentTheme =
            getCurrentTheme();

        if (currentTheme === "dark") {

            themeToggle.textContent = "☀";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to light mode"
            );

        } else {

            themeToggle.textContent = "☾";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to dark mode"
            );
        }
    }


    /* -----------------------------------------------------
       Manual Toggle
    ----------------------------------------------------- */

    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            function () {

                const currentTheme =
                    getCurrentTheme();

                const newTheme =
                    currentTheme === "dark"
                        ? "light"
                        : "dark";

                document.documentElement.setAttribute(
                    "data-theme",
                    newTheme
                );

                localStorage.setItem(
                    "theme",
                    newTheme
                );

                updateButton();
            }
        );

    }


    /* -----------------------------------------------------
       Follow System if User Has Not Manually Chosen
    ----------------------------------------------------- */

    systemDark.addEventListener(
        "change",
        function () {

            if (!localStorage.getItem("theme")) {
                updateButton();
            }
        }
    );


    updateButton();

})();

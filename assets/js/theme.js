(function () {

    const toggle = document.getElementById("theme-toggle");
    const iconPath = document.getElementById("theme-icon-path");

    const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    const savedTheme = localStorage.getItem("theme");


    const moonPath =
        "M20 15.5A8 8 0 0 1 8.5 4 " +
        "8 8 0 1 0 20 15.5Z";


    const sunPath =
        "M12 4V2 " +
        "M12 22V20 " +
        "M4 12H2 " +
        "M22 12H20 " +
        "M5.64 5.64L4.22 4.22 " +
        "M19.78 19.78L18.36 18.36 " +
        "M18.36 5.64L19.78 4.22 " +
        "M4.22 19.78L5.64 18.36 " +
        "M16 12A4 4 0 1 1 8 12 " +
        "A4 4 0 0 1 16 12Z";


    if (savedTheme === "light" || savedTheme === "dark") {
        document.documentElement.setAttribute(
            "data-theme",
            savedTheme
        );
    }


    function getCurrentTheme() {

        const manualTheme =
            document.documentElement.getAttribute("data-theme");

        if (
            manualTheme === "light" ||
            manualTheme === "dark"
        ) {
            return manualTheme;
        }

        return systemDark.matches ? "dark" : "light";
    }


    function updateIcon() {

        if (!toggle || !iconPath) {
            return;
        }

        if (getCurrentTheme() === "dark") {

            iconPath.setAttribute("d", sunPath);

            toggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            toggle.setAttribute(
                "title",
                "Switch to light mode"
            );

        } else {

            iconPath.setAttribute("d", moonPath);

            toggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            toggle.setAttribute(
                "title",
                "Switch to dark mode"
            );
        }
    }


    if (toggle) {

        toggle.addEventListener("click", function () {

            const newTheme =
                getCurrentTheme() === "dark"
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

            updateIcon();
        });
    }


    systemDark.addEventListener("change", function () {

        if (!localStorage.getItem("theme")) {
            updateIcon();
        }
    });


    updateIcon();

})();

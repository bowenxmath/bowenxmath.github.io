(function () {

    /* =====================================================
       Navigation
    ====================================================== */

    const nav = document.querySelector("header nav");

    if (!nav) {
        return;
    }


    /* =====================================================
       Create Search Button
    ====================================================== */

    const searchButton =
        document.createElement("button");

    searchButton.type = "button";

    searchButton.className =
        "nav-control search-button";

    searchButton.setAttribute(
        "aria-label",
        "Search"
    );

    searchButton.setAttribute(
        "title",
        "Search"
    );


    /* =====================================================
       Create Theme Button
    ====================================================== */

    const themeButton =
        document.createElement("button");

    themeButton.type = "button";

    themeButton.className =
        "nav-control theme-button";

    themeButton.setAttribute(
        "aria-label",
        "Toggle theme"
    );


    nav.appendChild(searchButton);
    nav.appendChild(themeButton);


    /* =====================================================
       Theme
    ====================================================== */

    const systemDark =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    function getEffectiveTheme() {

        const manual =
            document.documentElement
                .getAttribute("data-theme");

        if (
            manual === "light" ||
            manual === "dark"
        ) {
            return manual;
        }

        return systemDark.matches
            ? "dark"
            : "light";
    }


    function updateThemeState() {

        const theme =
            getEffectiveTheme();

        document.documentElement
            .setAttribute(
                "data-effective-theme",
                theme
            );

        if (theme === "dark") {

            themeButton.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeButton.setAttribute(
                "title",
                "Switch to light mode"
            );

        } else {

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


    themeButton.addEventListener(
        "click",
        function () {

            const current =
                getEffectiveTheme();

            const next =
                current === "dark"
                    ? "light"
                    : "dark";

            document.documentElement
                .setAttribute(
                    "data-theme",
                    next
                );

            localStorage.setItem(
                "theme",
                next
            );

            updateThemeState();
        }
    );


    systemDark.addEventListener(
        "change",
        function () {

            if (
                !localStorage.getItem("theme")
            ) {
                updateThemeState();
            }
        }
    );


    updateThemeState();


    /* =====================================================
       Build Search Overlay
    ====================================================== */

    const overlay =
        document.createElement("div");

    overlay.className =
        "site-search-overlay";

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );


    const panel =
        document.createElement("div");

    panel.className =
        "site-search-panel";

    panel.setAttribute(
        "role",
        "dialog"
    );

    panel.setAttribute(
        "aria-modal",
        "true"
    );

    panel.setAttribute(
        "aria-label",
        "Search website"
    );


    const row =
        document.createElement("div");

    row.className =
        "site-search-row";


    const input =
        document.createElement("input");

    input.type = "search";

    input.className =
        "site-search-input";

    input.placeholder =
        "Search...";

    input.autocomplete =
        "off";

    input.setAttribute(
        "aria-label",
        "Search website"
    );


    const closeButton =
        document.createElement("button");

    closeButton.type =
        "button";

    closeButton.className =
        "site-search-close";

    closeButton.setAttribute(
        "aria-label",
        "Close search"
    );


    const results =
        document.createElement("div");

    results.className =
        "site-search-results";


    row.appendChild(input);
    row.appendChild(closeButton);

    panel.appendChild(row);
    panel.appendChild(results);

    overlay.appendChild(panel);

    document.body.appendChild(
        overlay
    );


    /* =====================================================
       Search Index
    ====================================================== */

    const pages = [
        {
            url: "index.html",
            name: "Home"
        },
        {
            url: "research.html",
            name: "Research"
        },
        {
            url: "teaching.html",
            name: "Teaching"
        },
        {
            url: "education.html",
            name: "Education"
        }
    ];


    let searchIndex = [];


    function cleanText(text) {

        return text
            .replace(/\s+/g, " ")
            .trim();
    }


    async function buildSearchIndex() {

        if (searchIndex.length > 0) {
            return;
        }


        const entries = [];


        for (const page of pages) {

            try {

                const response =
                    await fetch(page.url);

                if (!response.ok) {
                    continue;
                }


                const html =
                    await response.text();


                const parser =
                    new DOMParser();


                const doc =
                    parser.parseFromString(
                        html,
                        "text/html"
                    );


                const main =
                    doc.querySelector("main");


                if (!main) {
                    continue;
                }


                /* -----------------------------------------
                   Sections
                ------------------------------------------ */

                const sections =
                    main.querySelectorAll(
                        "section"
                    );


                sections.forEach(
                    function (section) {

                        const heading =
                            section.querySelector(
                                ":scope > h1, " +
                                ":scope > h2, " +
                                ":scope > h3"
                            );


                        const title =
                            heading
                                ? cleanText(
                                    heading.textContent
                                )
                                : page.name;


                        const text =
                            cleanText(
                                section.textContent
                            );


                        if (!text) {
                            return;
                        }


                        entries.push({
                            page: page.name,
                            url: page.url,
                            title: title,
                            text: text
                        });

                    }
                );


                /* -----------------------------------------
                   Research Projects
                ------------------------------------------ */

                const projects =
                    main.querySelectorAll(
                        ".research-project"
                    );


                projects.forEach(
                    function (project) {

                        const heading =
                            project.querySelector(
                                "h3"
                            );


                        const title =
                            heading
                                ? cleanText(
                                    heading.textContent
                                )
                                : "Research Project";


                        entries.push({
                            page: page.name,
                            url: page.url,
                            title: title,
                            text: cleanText(
                                project.textContent
                            )
                        });

                    }
                );


                /* -----------------------------------------
                   Whole Page
                ------------------------------------------ */

                entries.push({
                    page: page.name,
                    url: page.url,
                    title: page.name,
                    text: cleanText(
                        main.textContent
                    )
                });


            } catch (error) {

                console.error(
                    "Search indexing failed:",
                    page.url,
                    error
                );
            }
        }


        searchIndex =
            entries;
    }


    /* =====================================================
       Search Window
    ====================================================== */

    async function openSearch() {

        overlay.classList.add(
            "is-open"
        );

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "search-open"
        );

        input.value = "";

        results.innerHTML = "";

        input.focus();

        await buildSearchIndex();
    }


    function closeSearch() {

        overlay.classList.remove(
            "is-open"
        );

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "search-open"
        );

        input.value = "";

        results.innerHTML = "";
    }


    /* =====================================================
       Search Results
    ====================================================== */

    function makeSnippet(
        text,
        query
    ) {

        const lower =
            text.toLowerCase();


        const position =
            lower.indexOf(query);


        if (position === -1) {

            return text.slice(
                0,
                180
            );
        }


        const start =
            Math.max(
                0,
                position - 65
            );


        const end =
            Math.min(
                text.length,
                position +
                query.length +
                120
            );


        let snippet =
            text.slice(
                start,
                end
            );


        if (start > 0) {
            snippet =
                "…" + snippet;
        }


        if (end < text.length) {
            snippet += "…";
        }


        return snippet;
    }


    function runSearch() {

        const query =
            input.value
                .toLowerCase()
                .trim();


        if (query.length < 2) {

            results.innerHTML = "";

            return;
        }


        const matches =
            searchIndex
                .filter(
                    function (entry) {

                        return (
                            entry.title
                                .toLowerCase()
                                .includes(query)
                            ||
                            entry.text
                                .toLowerCase()
                                .includes(query)
                        );

                    }
                )
                .slice(
                    0,
                    12
                );


        results.innerHTML = "";


        if (
            matches.length === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "site-search-empty";

            empty.textContent =
                "No results found.";

            results.appendChild(
                empty
            );

            return;
        }


        matches.forEach(
            function (result) {

                const link =
                    document.createElement(
                        "a"
                    );

                link.className =
                    "site-search-result";

                link.href =
                    result.url;


                const title =
                    document.createElement(
                        "span"
                    );

                title.className =
                    "site-search-result-title";

                title.textContent =
                    result.title;


                const page =
                    document.createElement(
                        "span"
                    );

                page.className =
                    "site-search-result-page";

                page.textContent =
                    result.page;


                const text =
                    document.createElement(
                        "span"
                    );

                text.className =
                    "site-search-result-text";

                text.textContent =
                    makeSnippet(
                        result.text,
                        query
                    );


                link.appendChild(
                    title
                );

                link.appendChild(
                    page
                );

                link.appendChild(
                    text
                );


                results.appendChild(
                    link
                );

            }
        );
    }


    /* =====================================================
       Events
    ====================================================== */

    searchButton.addEventListener(
        "click",
        openSearch
    );


    closeButton.addEventListener(
        "click",
        closeSearch
    );


    input.addEventListener(
        "input",
        runSearch
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                overlay
            ) {
                closeSearch();
            }
        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                    "Escape"
                &&
                overlay.classList
                    .contains(
                        "is-open"
                    )
            ) {

                closeSearch();
            }


            if (
                event.key === "/"
                &&
                !overlay.classList
                    .contains(
                        "is-open"
                    )
                &&
                document
                    .activeElement
                    .tagName !==
                    "INPUT"
                &&
                document
                    .activeElement
                    .tagName !==
                    "TEXTAREA"
            ) {

                event.preventDefault();

                openSearch();
            }
        }
    );

})();

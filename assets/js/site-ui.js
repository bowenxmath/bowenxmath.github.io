(function () {

    /* =====================================================
       Helpers
    ====================================================== */

    function cleanText(text) {
        return (text || "")
            .replace(/\s+/g, " ")
            .trim();
    }


    function slugify(text) {

        return cleanText(text)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }


    function escapeRegExp(text) {
        return text.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }


    /* =====================================================
       Add Stable IDs to Sections and Projects
    ====================================================== */

    function assignSearchIds(doc) {

        const main = doc.querySelector("main");

        if (!main) {
            return;
        }


        /* -------------------------------------------------
           Sections
        -------------------------------------------------- */

        const sections =
            main.querySelectorAll("section");

        sections.forEach(function (section, index) {

            if (section.id) {
                return;
            }

            let heading = null;

            for (const child of section.children) {

                if (
                    child.tagName === "H1" ||
                    child.tagName === "H2" ||
                    child.tagName === "H3"
                ) {

                    heading = child;
                    break;
                }
            }


            if (heading) {

                const slug =
                    slugify(heading.textContent);

                if (slug) {
                    section.id = slug;
                }

            } else {

                section.id =
                    "section-" + (index + 1);
            }

        });


        /* -------------------------------------------------
           Research Projects
        -------------------------------------------------- */

        const projects =
            main.querySelectorAll(
                ".research-project"
            );

        projects.forEach(function (project, index) {

            if (project.id) {
                return;
            }

            const heading =
                project.querySelector("h3");

            if (heading) {

                const slug =
                    slugify(heading.textContent);

                if (slug) {
                    project.id = slug;
                }

            } else {

                project.id =
                    "research-project-" +
                    (index + 1);
            }
        });
    }


    /*
     * Do this immediately on the current page.
     */

    assignSearchIds(document);


    /* =====================================================
       Theme Controls
    ====================================================== */

    const nav =
        document.querySelector("header nav");

    if (!nav) {
        return;
    }


    /* -----------------------------------------------------
       Search Button
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       Theme Button
    ----------------------------------------------------- */

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
       Create Search Window
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
       Pages to Search
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


    /* =====================================================
       Build Search Index
    ====================================================== */

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


                /*
                 * Generate exactly the same section IDs
                 * that exist on the live page.
                 */

                assignSearchIds(doc);


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

                        let heading = null;


                        for (
                            const child
                            of section.children
                        ) {

                            if (
                                child.tagName === "H1" ||
                                child.tagName === "H2" ||
                                child.tagName === "H3"
                            ) {

                                heading =
                                    child;

                                break;
                            }
                        }


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

                            page:
                                page.name,

                            url:
                                page.url,

                            id:
                                section.id,

                            title:
                                title,

                            text:
                                text
                        });

                    }
                );


                /* -----------------------------------------
                   Individual Research Projects
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


                        const text =
                            cleanText(
                                project.textContent
                            );


                        entries.push({

                            page:
                                page.name,

                            url:
                                page.url,

                            id:
                                project.id,

                            title:
                                title,

                            text:
                                text
                        });

                    }
                );

            } catch (error) {

                console.error(
                    "Search indexing failed:",
                    page.url,
                    error
                );
            }
        }


        searchIndex = entries;
    }


    /* =====================================================
       Open / Close Search
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
       Snippet
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
                position - 70
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


    /* =====================================================
       Run Search
    ====================================================== */

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
                    15
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


                /*
                 * IMPORTANT:
                 *
                 * q = word to highlight
                 * #id = exact place to scroll to
                 */

                link.href =
                    result.url +
                    "?q=" +
                    encodeURIComponent(query) +
                    "#" +
                    encodeURIComponent(result.id);


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
       Highlight Search Result on Destination Page
    ====================================================== */

    function highlightText(
        root,
        query
    ) {

        if (!root || !query) {
            return;
        }


        const regex =
            new RegExp(
                "(" +
                escapeRegExp(query) +
                ")",
                "gi"
            );


        const walker =
            document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT
            );


        const nodes = [];


        while (
            walker.nextNode()
        ) {

            const node =
                walker.currentNode;


            const parent =
                node.parentElement;


            if (!parent) {
                continue;
            }


            /*
             * Do not modify scripts,
             * styles, inputs, buttons, etc.
             */

            if (
                parent.closest(
                    "script, style, " +
                    "input, textarea, " +
                    "button, mark"
                )
            ) {

                continue;
            }


            if (
                node.nodeValue &&
                node.nodeValue
                    .toLowerCase()
                    .includes(
                        query.toLowerCase()
                    )
            ) {

                nodes.push(node);
            }
        }


        nodes.forEach(
            function (node) {

                const fragment =
                    document.createDocumentFragment();


                const pieces =
                    node.nodeValue
                        .split(regex);


                pieces.forEach(
                    function (piece) {

                        if (
                            piece.toLowerCase() ===
                            query.toLowerCase()
                        ) {

                            const mark =
                                document.createElement(
                                    "mark"
                                );


                            mark.className =
                                "search-highlight";


                            mark.textContent =
                                piece;


                            fragment.appendChild(
                                mark
                            );

                        } else {

                            fragment.appendChild(
                                document.createTextNode(
                                    piece
                                )
                            );
                        }
                    }
                );


                node.parentNode.replaceChild(
                    fragment,
                    node
                );
            }
        );
    }


    /* =====================================================
       Scroll to Search Result on Page Load
    ====================================================== */

    function showSearchDestination() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const query =
            params.get("q");


        if (!query) {
            return;
        }


        let target = null;


        if (window.location.hash) {

            const id =
                decodeURIComponent(
                    window.location.hash
                        .substring(1)
                );


            target =
                document.getElementById(
                    id
                );
        }


        if (!target) {

            target =
                document.querySelector(
                    "main"
                );
        }


        if (!target) {
            return;
        }


        /*
         * Highlight matching words.
         */

        highlightText(
            target,
            query
        );


        /*
         * Brief visual indication of
         * the selected section.
         */

        target.classList.add(
            "search-target"
        );


        /*
         * Wait until layout is complete.
         */

        setTimeout(
            function () {

                target.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"
                });

            },
            150
        );


        /*
         * Remove section flash later,
         * but keep text highlighting.
         */

        setTimeout(
            function () {

                target.classList.remove(
                    "search-target"
                );

            },
            2200
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


    /* =====================================================
       Highlight Destination
    ====================================================== */

    showSearchDestination();

})();

/* =========================================================
   Simple Site Search
========================================================= */

(function () {

    const searchToggle =
        document.getElementById("search-toggle");

    const searchOverlay =
        document.getElementById("search-overlay");

    const searchClose =
        document.getElementById("search-close");

    const searchInput =
        document.getElementById("search-input");

    const searchResults =
        document.getElementById("search-results");


    if (
        !searchToggle ||
        !searchOverlay ||
        !searchClose ||
        !searchInput ||
        !searchResults
    ) {
        return;
    }


    /* -----------------------------------------------------
       Pages to Search
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       Build Search Index
    ----------------------------------------------------- */

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


                const sections =
                    main.querySelectorAll(
                        "h1, h2, h3"
                    );


                sections.forEach(
                    function (heading, index) {

                        let text = "";

                        let node =
                            heading.nextElementSibling;

                        while (
                            node &&
                            !/^H[1-3]$/.test(node.tagName)
                        ) {

                            text +=
                                " " +
                                node.textContent;

                            node =
                                node.nextElementSibling;
                        }


                        const title =
                            heading.textContent
                                .replace(/\s+/g, " ")
                                .trim();


                        const cleanText =
                            text
                                .replace(/\s+/g, " ")
                                .trim();


                        let id =
                            heading.id;

                        if (!id) {

                            id =
                                "search-heading-" +
                                index;
                        }


                        entries.push({
                            page: page.name,
                            url: page.url,
                            title: title,
                            text: cleanText
                        });

                    }
                );


                /*
                 * Also add the entire page so terms inside
                 * dynamically generated or non-heading
                 * sections can still be found.
                 */

                const fullText =
                    main.textContent
                        .replace(/\s+/g, " ")
                        .trim();

                entries.push({
                    page: page.name,
                    url: page.url,
                    title: page.name,
                    text: fullText
                });


            } catch (error) {

                console.error(
                    "Could not index:",
                    page.url,
                    error
                );

            }

        }

        searchIndex = entries;
    }


    /* -----------------------------------------------------
       Open Search
    ----------------------------------------------------- */

    async function openSearch() {

        searchOverlay.classList.add(
            "active"
        );

        document.body.classList.add(
            "search-open"
        );

        searchOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        searchInput.value = "";

        searchResults.innerHTML =
            '<p class="search-message">' +
            "Type to search the website." +
            "</p>";

        searchInput.focus();

        await buildSearchIndex();
    }


    /* -----------------------------------------------------
       Close Search
    ----------------------------------------------------- */

    function closeSearch() {

        searchOverlay.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "search-open"
        );

        searchOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        searchToggle.focus();
    }


    /* -----------------------------------------------------
       Search
    ----------------------------------------------------- */

    function runSearch() {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();


        if (query.length < 2) {

            searchResults.innerHTML =
                '<p class="search-message">' +
                "Type at least two characters." +
                "</p>";

            return;
        }


        const results =
            searchIndex
                .filter(function (entry) {

                    return (
                        entry.title
                            .toLowerCase()
                            .includes(query) ||

                        entry.text
                            .toLowerCase()
                            .includes(query)
                    );

                })
                .slice(0, 15);


        if (results.length === 0) {

            searchResults.innerHTML =
                '<p class="search-message">' +
                "No results found." +
                "</p>";

            return;
        }


        searchResults.innerHTML = "";


        results.forEach(
            function (result) {

                const link =
                    document.createElement("a");

                link.className =
                    "search-result";

                link.href =
                    result.url;


                const title =
                    document.createElement("span");

                title.className =
                    "search-result-title";

                title.textContent =
                    result.title;


                const page =
                    document.createElement("span");

                page.className =
                    "search-result-page";

                page.textContent =
                    result.page;


                const snippet =
                    document.createElement("span");

                snippet.className =
                    "search-result-text";


                const lowerText =
                    result.text.toLowerCase();

                const position =
                    lowerText.indexOf(query);


                if (position >= 0) {

                    const start =
                        Math.max(
                            0,
                            position - 70
                        );

                    const end =
                        Math.min(
                            result.text.length,
                            position + 150
                        );

                    let preview =
                        result.text.slice(
                            start,
                            end
                        );

                    if (start > 0) {
                        preview =
                            "…" + preview;
                    }

                    if (
                        end <
                        result.text.length
                    ) {
                        preview += "…";
                    }

                    snippet.textContent =
                        preview;

                } else {

                    snippet.textContent =
                        result.text.slice(
                            0,
                            180
                        );

                }


                link.appendChild(title);
                link.appendChild(page);

                if (snippet.textContent) {
                    link.appendChild(snippet);
                }

                searchResults.appendChild(
                    link
                );

            }
        );
    }


    /* -----------------------------------------------------
       Events
    ----------------------------------------------------- */

    searchToggle.addEventListener(
        "click",
        openSearch
    );

    searchClose.addEventListener(
        "click",
        closeSearch
    );

    searchInput.addEventListener(
        "input",
        runSearch
    );


    searchOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                searchOverlay
            ) {
                closeSearch();
            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                searchOverlay.classList.contains(
                    "active"
                )
            ) {
                closeSearch();
            }


            /*
             * Press "/" anywhere to search,
             * unless typing in an input.
             */

            if (
                event.key === "/" &&
                !searchOverlay.classList.contains(
                    "active"
                ) &&
                document.activeElement.tagName
                    !== "INPUT" &&
                document.activeElement.tagName
                    !== "TEXTAREA"
            ) {

                event.preventDefault();

                openSearch();
            }

        }
    );

})();

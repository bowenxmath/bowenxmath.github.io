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

                const response = await fetch(page.url);

                if (!response.ok) {
                    continue;
                }

                const html = await response.text();

                const parser = new DOMParser();

                const doc = parser.parseFromString(
                    html,
                    "text/html"
                );

                const main = doc.querySelector("main");

                if (!main) {
                    continue;
                }


                /*
                 * Add individual sections.
                 */

                const sections =
                    main.querySelectorAll("section");


                sections.forEach(function (section) {

                    const heading =
                        section.querySelector(
                            ":scope > h1, :scope > h2, :scope > h3"
                        );

                    const title = heading
                        ? cleanText(heading.textContent)
                        : page.name;

                    const text =
                        cleanText(section.textContent);

                    if (!text) {
                        return;
                    }

                    entries.push({
                        page: page.name,
                        url: page.url,
                        title: title,
                        text: text
                    });
                });


                /*
                 * Add research projects separately.
                 */

                const projects =
                    main.querySelectorAll(".research-project");

                projects.forEach(function (project) {

                    const heading =
                        project.querySelector("h3");

                    const title = heading
                        ? cleanText(heading.textContent)
                        : "Research Project";

                    const text =
                        cleanText(project.textContent);

                    entries.push({
                        page: page.name,
                        url: page.url,
                        title: title,
                        text: text
                    });
                });


                /*
                 * Add whole page as fallback.
                 */

                entries.push({
                    page: page.name,
                    url: page.url,
                    title: page.name,
                    text: cleanText(main.textContent)
                });


            } catch (error) {

                console.error(
                    "Search indexing failed for",
                    page.url,
                    error
                );
            }
        }


        searchIndex = entries;
    }


    async function openSearch() {

        searchOverlay.classList.add("active");

        searchOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add("search-open");

        searchInput.value = "";

        searchResults.innerHTML = "";

        searchInput.focus();

        await buildSearchIndex();
    }


    function closeSearch() {

        searchOverlay.classList.remove("active");

        searchOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove("search-open");

        searchInput.value = "";

        searchResults.innerHTML = "";
    }


    function createSnippet(text, query) {

        const lowerText = text.toLowerCase();

        const position =
            lowerText.indexOf(query);

        if (position === -1) {
            return text.slice(0, 180);
        }

        const start =
            Math.max(0, position - 70);

        const end =
            Math.min(
                text.length,
                position + query.length + 120
            );

        let snippet =
            text.slice(start, end);

        if (start > 0) {
            snippet = "…" + snippet;
        }

        if (end < text.length) {
            snippet += "…";
        }

        return snippet;
    }


    function runSearch() {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();


        /*
         * Show nothing until at least two characters.
         */

        if (query.length < 2) {

            searchResults.innerHTML = "";

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
                .slice(0, 12);


        searchResults.innerHTML = "";


        if (results.length === 0) {

            const message =
                document.createElement("div");

            message.className =
                "search-empty";

            message.textContent =
                "No results found.";

            searchResults.appendChild(
                message
            );

            return;
        }


        results.forEach(function (result) {

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

            snippet.textContent =
                createSnippet(
                    result.text,
                    query
                );


            link.appendChild(title);
            link.appendChild(page);
            link.appendChild(snippet);

            searchResults.appendChild(link);
        });
    }


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

            if (event.target === searchOverlay) {
                closeSearch();
            }
        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                searchOverlay.classList.contains("active")
            ) {

                closeSearch();
            }


            if (
                event.key === "/" &&
                !searchOverlay.classList.contains("active") &&
                document.activeElement.tagName !== "INPUT" &&
                document.activeElement.tagName !== "TEXTAREA"
            ) {

                event.preventDefault();

                openSearch();
            }
        }
    );

})();

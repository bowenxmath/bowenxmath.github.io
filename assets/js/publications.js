async function loadPublications() {

    const publishedContainer =
        document.getElementById("published-list");

    const preprintContainer =
        document.getElementById("preprint-list");

    const thesisContainer =
        document.getElementById("thesis-list");


    try {

        /*
         * Load BibTeX file
         */

        const response = await fetch(
            "assets/bib/publications.bib"
        );

        if (!response.ok) {
            throw new Error(
                "Could not load publications.bib: "
                + response.status
            );
        }

        const bibtex = await response.text();


        /*
         * Parse BibTeX
         */

        if (typeof bibtexParse === "undefined") {
            throw new Error(
                "BibTeX parser did not load."
            );
        }

        const rawEntries =
            bibtexParse.toJSON(bibtex);


        /*
         * Normalize BibTeX field names.
         *
         * Some parsers return AUTHOR, TITLE, YEAR, etc.
         * Others may return lowercase names.
         */

        const entries = rawEntries.map(entry => {

            const normalizedTags = {};

            for (const [key, value]
                 of Object.entries(entry.entryTags || {})) {

                normalizedTags[
                    key.toLowerCase()
                ] = value;

            }

            return {
                citationKey: entry.citationKey,
                entryType:
                    (entry.entryType || "").toLowerCase(),
                tags: normalizedTags
            };

        });


        /*
         * Sort newest year first.
         */

        entries.sort((a, b) => {

            const yearA =
                parseInt(a.tags.year || "0");

            const yearB =
                parseInt(b.tags.year || "0");

            return yearB - yearA;

        });


        /*
         * Separate categories
         */

        const published = [];
        const preprints = [];
        const theses = [];


        entries.forEach(entry => {

            const tags = entry.tags;

            let category =
                (tags.category || "").toLowerCase();


            /*
             * If category is missing, infer thesis
             * from BibTeX type.
             */

            if (!category) {

                if (
                    entry.entryType === "phdthesis" ||
                    entry.entryType === "mastersthesis"
                ) {

                    category = "thesis";

                } else {

                    category = "published";

                }

            }


            const html =
                formatPublication(tags);


            if (
                category === "preprint" ||
                category === "working" ||
                category === "workingpaper"
            ) {

                preprints.push(html);

            }

            else if (category === "thesis") {

                theses.push(html);

            }

            else {

                published.push(html);

            }

        });


        displayPublications(
            publishedContainer,
            published,
            "No publications currently listed."
        );

        displayPublications(
            preprintContainer,
            preprints,
            "No preprints or working papers currently listed."
        );

        displayPublications(
            thesisContainer,
            theses,
            "No theses currently listed."
        );

    }

    catch (error) {

        console.error(
            "Publication loading error:",
            error
        );


        publishedContainer.innerHTML =
            "<li>Unable to load publications.</li>";

        preprintContainer.innerHTML =
            "<li>Unable to load preprints and working papers.</li>";

        thesisContainer.innerHTML =
            "<li>Unable to load theses.</li>";

    }

}



function formatPublication(tags) {

    let html = "";


    /* --------------------------
       Authors
    --------------------------- */

    if (tags.author) {

        html += formatAuthors(tags.author);
        html += ". ";

    }


    /* --------------------------
       Title
    --------------------------- */

    if (tags.title) {

        html +=
            `“${cleanText(tags.title)}.” `;

    }


    /* --------------------------
       Journal
    --------------------------- */

    if (tags.journal) {

        html +=
            `<em>${cleanText(tags.journal)}</em>`;

        if (tags.volume) {
            html += ` ${cleanText(tags.volume)}`;
        }

        if (tags.number) {
            html += `(${cleanText(tags.number)})`;
        }

        if (tags.year) {
            html += ` (${cleanText(tags.year)})`;
        }

        if (tags.pages) {
            html += `: ${cleanText(tags.pages)}`;
        }

        html += ". ";

    }


    /* --------------------------
       Book / proceedings
    --------------------------- */

    else if (tags.booktitle) {

        html +=
            `<em>${cleanText(tags.booktitle)}</em>`;

        if (tags.year) {
            html += ` (${cleanText(tags.year)})`;
        }

        if (tags.pages) {
            html += `: ${cleanText(tags.pages)}`;
        }

        html += ". ";

    }


    /* --------------------------
       Thesis
    --------------------------- */

    else if (tags.school) {

        html += cleanText(tags.school);

        if (tags.year) {
            html += `, ${cleanText(tags.year)}`;
        }

        html += ". ";

    }


    /* --------------------------
       Preprint / working paper
    --------------------------- */

    else if (tags.year) {

        html += `${cleanText(tags.year)}. `;

    }


    /* --------------------------
       DOI
    --------------------------- */

    if (tags.doi) {

        html += `
            <a class="pub-link"
               href="https://doi.org/${cleanText(tags.doi)}"
               target="_blank"
               rel="noopener noreferrer">
               DOI
            </a>
        `;

    }


    /* --------------------------
       arXiv
    --------------------------- */

    if (tags.eprint) {

        html += `
            <a class="pub-link"
               href="https://arxiv.org/abs/${cleanText(tags.eprint)}"
               target="_blank"
               rel="noopener noreferrer">
               arXiv
            </a>
        `;

    }


    /* --------------------------
       URL
    --------------------------- */

    if (
        tags.url &&
        !tags.eprint
    ) {

        html += `
            <a class="pub-link"
               href="${cleanText(tags.url)}"
               target="_blank"
               rel="noopener noreferrer">
               Paper
            </a>
        `;

    }


    /* --------------------------
       Note / status
    --------------------------- */

    if (tags.note) {

        html += `
            <span class="pub-note">
                ${cleanText(tags.note)}
            </span>
        `;

    }


    return html;

}



function formatAuthors(authorString) {

    const authors =
        authorString.split(/\s+and\s+/i);


    const formatted =
        authors.map(author => {

            author = author.trim();

            let displayName = author;


            /*
             * Convert:
             *
             * Xie, Bowen
             *
             * into:
             *
             * Bowen Xie
             */

            if (author.includes(",")) {

                const pieces =
                    author.split(",");

                const last =
                    pieces[0].trim();

                const first =
                    pieces
                        .slice(1)
                        .join(" ")
                        .trim();

                displayName =
                    `${first} ${last}`;

            }


            /*
             * Bold Bowen Xie
             */

            const normalized =
                displayName
                    .replace(/[{}]/g, "")
                    .toLowerCase()
                    .trim();


            if (
                normalized === "bowen xie" ||
                normalized === "b. xie" ||
                normalized === "b xie"
            ) {

                return `<strong>${displayName}</strong>`;

            }


            return displayName;

        });


    if (formatted.length === 1) {

        return formatted[0];

    }


    if (formatted.length === 2) {

        return (
            formatted[0]
            + " and "
            + formatted[1]
        );

    }


    return (
        formatted.slice(0, -1).join(", ")
        + ", and "
        + formatted[formatted.length - 1]
    );

}



function cleanText(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .replace(/[{}]/g, "")
        .replace(/---/g, "—")
        .replace(/--/g, "–");

}



function displayPublications(
    container,
    publications,
    emptyMessage
) {

    if (publications.length === 0) {

        container.innerHTML =
            `<li>${emptyMessage}</li>`;

        return;

    }


    container.innerHTML =
        publications
            .map(pub => `<li>${pub}</li>`)
            .join("");

}



loadPublications();

async function loadPublications() {

    const publishedContainer =
        document.getElementById("published-list");

    const preprintContainer =
        document.getElementById("preprint-list");

    const thesisContainer =
        document.getElementById("thesis-list");


    try {

        /* =====================================================
           Load BibTeX file
        ===================================================== */

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


        /* =====================================================
           Check parser
        ===================================================== */

        if (typeof bibtexParse === "undefined") {
            throw new Error(
                "BibTeX parser did not load."
            );
        }


        /* =====================================================
           Parse BibTeX
        ===================================================== */

        const rawEntries =
            bibtexParse.toJSON(bibtex);


        /* =====================================================
           Normalize all BibTeX field names to lowercase
        ===================================================== */

        const entries = rawEntries.map(entry => {

            const normalizedTags = {};

            for (
                const [key, value]
                of Object.entries(
                    entry.entryTags || {}
                )
            ) {

                normalizedTags[
                    key.toLowerCase()
                ] = value;

            }

            return {

                citationKey:
                    entry.citationKey || "",

                entryType:
                    (entry.entryType || "")
                        .toLowerCase(),

                tags:
                    normalizedTags

            };

        });


        /* =====================================================
           Sort newest to oldest

           Optional:
           If two entries have the same year,
           use:
               order = {3}
               order = {2}
               order = {1}

           Higher order appears first.
        ===================================================== */

        entries.sort((a, b) => {

            const yearA =
                parseInt(
                    a.tags.year || "0",
                    10
                );

            const yearB =
                parseInt(
                    b.tags.year || "0",
                    10
                );


            if (yearA !== yearB) {

                return yearB - yearA;

            }


            const orderA =
                parseInt(
                    a.tags.order || "0",
                    10
                );

            const orderB =
                parseInt(
                    b.tags.order || "0",
                    10
                );


            return orderB - orderA;

        });


        /* =====================================================
           Separate categories
        ===================================================== */

        const published = [];
        const preprints = [];
        const theses = [];


        entries.forEach(entry => {

            const tags =
                entry.tags;


            let category =
                (tags.category || "")
                    .toLowerCase()
                    .trim();


            /* Infer category if missing */

            if (!category) {

                if (
                    entry.entryType === "phdthesis" ||
                    entry.entryType === "mastersthesis"
                ) {

                    category =
                        "thesis";

                }

                else {

                    category =
                        "published";

                }

            }


            const html =
                formatPublication(
                    tags,
                    entry.entryType,
                    category
                );


            if (
                category === "preprint" ||
                category === "working" ||
                category === "workingpaper" ||
                category === "working paper"
            ) {

                preprints.push(html);

            }

            else if (
                category === "thesis" ||
                category === "dissertation"
            ) {

                theses.push(html);

            }

            else {

                published.push(html);

            }

        });


        /* =====================================================
           Display all categories
        ===================================================== */

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
            "No dissertation currently listed."
        );

    }


    catch (error) {

        console.error(
            "Publication loading error:",
            error
        );


        if (publishedContainer) {

            publishedContainer.innerHTML =
                "<li>Unable to load publications.</li>";

        }


        if (preprintContainer) {

            preprintContainer.innerHTML =
                "<li>Unable to load preprints and working papers.</li>";

        }


        if (thesisContainer) {

            thesisContainer.innerHTML =
                "<li>Unable to load dissertation.</li>";

        }

    }

}



/* =========================================================
   Format one publication
========================================================= */

function formatPublication(
    tags,
    entryType,
    category
) {

    let html = "";


    /* =====================================================
       Authors
    ===================================================== */

    if (tags.author) {

        html +=
            formatAuthors(
                tags.author
            );

        html += ". ";

    }


    /* =====================================================
       Title
    ===================================================== */

    if (tags.title) {

        const title =
            cleanText(
                tags.title
            );


        if (
            category === "thesis" ||
            category === "dissertation"
        ) {

            html +=
                `<em>${title}</em>. `;

        }

        else {

            html +=
                `“${title}.” `;

        }

    }


    /* =====================================================
       Journal article
    ===================================================== */

    if (tags.journal) {

        html +=
            `<em>${cleanText(
                tags.journal
            )}</em>`;


        if (tags.volume) {

            html +=
                ` ${cleanText(
                    tags.volume
                )}`;

        }


        if (tags.number) {

            html +=
                `(${cleanText(
                    tags.number
                )})`;

        }


        if (tags.year) {

            html +=
                ` (${cleanText(
                    tags.year
                )})`;

        }


        if (tags.pages) {

            html +=
                `: ${cleanText(
                    tags.pages
                )}`;

        }


        html += ". ";

    }


    /* =====================================================
       Proceedings / conference paper
    ===================================================== */

    else if (tags.booktitle) {

        html +=
            `<em>${cleanText(
                tags.booktitle
            )}</em>`;


        if (tags.volume) {

            html +=
                ` ${cleanText(
                    tags.volume
                )}`;

        }


        if (tags.year) {

            html +=
                ` (${cleanText(
                    tags.year
                )})`;

        }


        if (tags.pages) {

            html +=
                `: ${cleanText(
                    tags.pages
                )}`;

        }


        html += ". ";

    }


    /* =====================================================
       Thesis / Dissertation
    ===================================================== */

    else if (tags.school) {

        if (
            entryType === "phdthesis"
        ) {

            html +=
                "Ph.D. Dissertation, ";

        }

        else if (
            entryType === "mastersthesis"
        ) {

            html +=
                "Master's Thesis, ";

        }


        html +=
            cleanText(
                tags.school
            );


        if (tags.year) {

            html +=
                `, ${cleanText(
                    tags.year
                )}`;

        }


        html += ". ";

    }


    /* =====================================================
       Preprint / Working Paper
    ===================================================== */

    else if (tags.year) {

        html +=
            `${cleanText(
                tags.year
            )}. `;

    }


    /* =====================================================
       Note / Status

       This comes BEFORE all links.
    ===================================================== */

    if (tags.note) {

        let note =
            cleanText(
                tags.note
            );


        /*
         * Add punctuation automatically
         * if the note has none.
         */

        if (
            !/[.!?]$/.test(note)
        ) {

            note += ".";

        }


        html +=
            `<span class="pub-note">${note}</span> `;

    }


    /* =====================================================
       Links

       These come AFTER citation and note.
    ===================================================== */

    let links = "";


    /* -----------------------------------------------------
       DOI
    ----------------------------------------------------- */

    if (tags.doi) {

        const doi =
            cleanText(
                tags.doi
            );

        links += `
            <a class="pub-link"
               href="https://doi.org/${encodeURIComponent(doi)}"
               target="_blank"
               rel="noopener noreferrer">
                DOI
            </a>
        `;

    }


    /* -----------------------------------------------------
       arXiv
    ----------------------------------------------------- */

    if (tags.eprint) {

        const eprint =
            cleanText(
                tags.eprint
            );

        links += `
            <a class="pub-link"
               href="https://arxiv.org/abs/${encodeURIComponent(eprint)}"
               target="_blank"
               rel="noopener noreferrer">
                arXiv
            </a>
        `;

    }


    /* -----------------------------------------------------
       Generic URL
    ----------------------------------------------------- */

    if (tags.url) {

        let linkText =
            "Paper";


        if (
            category === "thesis" ||
            category === "dissertation"
        ) {

            linkText =
                "Full Text";

        }

        else if (
            category === "published"
        ) {

            linkText =
                "Journal";

        }


        links += `
            <a class="pub-link"
               href="${escapeAttribute(
                   cleanText(tags.url)
               )}"
               target="_blank"
               rel="noopener noreferrer">
                ${linkText}
            </a>
        `;

    }


    /* =====================================================
       Add links after note
    ===================================================== */

    if (links) {

        html += `
            <span class="pub-links">
                ${links}
            </span>
        `;

    }


    return html;

}



/* =========================================================
   Format author names
========================================================= */

function formatAuthors(
    authorString
) {

    const authors =
        authorString.split(
            /\s+and\s+/i
        );


    const formatted =
        authors.map(author => {

            author =
                author.trim();


            let displayName =
                author;


            /* -------------------------------------------------
               Convert:

               Xie, Bowen

               to:

               Bowen Xie
            ------------------------------------------------- */

            if (
                author.includes(",")
            ) {

                const pieces =
                    author.split(",");


                const last =
                    pieces[0]
                        .trim();


                const first =
                    pieces
                        .slice(1)
                        .join(" ")
                        .trim();


                displayName =
                    `${first} ${last}`;

            }


            displayName =
                cleanText(
                    displayName
                );


            /* -------------------------------------------------
               Bold Bowen Xie
            ------------------------------------------------- */

            const normalized =
                displayName
                    .toLowerCase()
                    .replace(/\./g, "")
                    .replace(/\s+/g, " ")
                    .trim();


            if (
                normalized === "bowen xie" ||
                normalized === "b xie"
            ) {

                return (
                    `<strong>${displayName}</strong>`
                );

            }


            return displayName;

        });


    /* One author */

    if (
        formatted.length === 1
    ) {

        return formatted[0];

    }


    /* Two authors */

    if (
        formatted.length === 2
    ) {

        return (
            formatted[0]
            + " and "
            + formatted[1]
        );

    }


    /* Three or more authors */

    return (
        formatted
            .slice(0, -1)
            .join(", ")
        + ", and "
        + formatted[
            formatted.length - 1
        ]
    );

}



/* =========================================================
   Clean BibTeX text
========================================================= */

function cleanText(text) {

    if (!text) {
        return "";
    }


    return String(text)

        /*
         * Remove BibTeX braces
         */

        .replace(/[{}]/g, "")

        /*
         * Convert BibTeX dashes
         */

        .replace(/---/g, "—")
        .replace(/--/g, "–")

        /*
         * Common LaTeX symbols
         */

        .replace(/\\&/g, "&")
        .replace(/\\%/g, "%")
        .replace(/\\_/g, "_")

        /*
         * Collapse whitespace
         */

        .replace(/\s+/g, " ")

        .trim();

}



/* =========================================================
   Escape URL attributes
========================================================= */

function escapeAttribute(text) {

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/"/g, "&quot;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;");

}



/* =========================================================
   Display publication list
========================================================= */

function displayPublications(
    container,
    publications,
    emptyMessage
) {

    if (!container) {
        return;
    }


    if (
        publications.length === 0
    ) {

        container.innerHTML =
            `<li>${emptyMessage}</li>`;

        return;

    }


    container.innerHTML =
        publications
            .map(
                publication =>
                    `<li>${publication}</li>`
            )
            .join("");

}



/* =========================================================
   Start
========================================================= */

loadPublications();

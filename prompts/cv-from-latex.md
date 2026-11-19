# Prompt: update the web CV from the LaTeX CV

For Gaurab, how to use this file:

1. Start a new chat with any capable language model.
2. Paste or attach the LaTeX source of the CV.
3. Attach the current `update/cv.json`, so the links and choices already on the site carry over. For the publication check, also attach `update/papers.json`.
4. Paste this whole file as your message.
5. Save the JSON from the reply as `update/cv.json`. Export the PDF from LaTeX and save it as `update/cv.pdf`.

Everything below the line is written to the model.

---

I am Gaurab Pokharel. My CV is written in LaTeX. My website has a CV page that is built from a JSON file, `update/cv.json`. I want you to convert the LaTeX into that file.

You cannot see the website and you do not need to. The file format is described below.

This is a conversion, not an edit. Do not rewrite, shorten, reorder or improve anything. Every fact in the LaTeX goes into the JSON, except the parts this prompt tells you to leave out.

## What I have given you

- The LaTeX source of my CV. If it is not in this conversation, ask for it and stop.
- Possibly the current `update/cv.json`.
- Possibly `update/papers.json`.

Both files hold notes as well as data. Anything after `//` on a line is a note, and so is everything between `/*` and `*/`. Notes are not data. In particular, each file has a block that begins `/* TEMPLATE` and holds a made-up example entry. That example is not part of my CV or one of my papers.

Do not ask questions before you start. Where a rule below does not settle something, make the closest reasonable choice and mention it in the "Changes" part of your reply.

## The file format

```json
{
  "pdf": "update/cv.pdf",
  "updated": "October 2026",
  "sections": [
    {
      "title": "Education",
      "entries": [
        {
          "primary": "M.S., Computer Science",
          "secondary": "George Mason University",
          "date": "2021–2024",
          "detail": "Machine learning concentration; GPA: 3.96/4.0."
        }
      ]
    },
    { "title": "Extended abstracts", "papers": "abstracts" }
  ]
}
```

Top level:

- `pdf` is always `"update/cv.pdf"`.
- `updated` is the "Last updated" text from the LaTeX, for example `"October 2026"`. Leave the field out if the LaTeX has none.
- `sections` lists the sections in the order they appear in the LaTeX.

A section is either a list of entries, `{ "title": "...", "entries": [ ... ] }`, or a publication placeholder, `{ "title": "...", "papers": "..." }`, described below. Section titles are copied from the LaTeX.

An entry has up to five fields. Use only the ones an entry needs, and never write an empty string or an empty list.

| Field | What the page does with it |
| --- | --- |
| `primary` | The semibold first line: a degree, a job title, an award, the title of a talk. |
| `secondary` | The muted line under it: the institution, employer or venue, or a short qualifier. |
| `date` | Shown in a column on the right. |
| `detail` | Text under the entry. A string is one paragraph. A list of strings is a bulleted list. |
| `links` | Links about the entry as a whole, shown after the muted line: `[{ "label": "Details", "url": "https://..." }]`. |

`secondary` and `detail` may contain links written as `[text](url)`. `primary` and `date` are plain text.

An entry with only `detail` is shown as plain text with no heading. Use that for a section that is a paragraph, such as Research interests.

## Layout of the file

The website reads this file as JSON that may also hold notes: anything after `//` on a line is ignored, and so is everything between `/*` and `*/`. I use notes and spacing to make the file easy to read and to add to. Lay the file out as follows.

1. Begin with these two notes, copied character for character:

```jsonc
// =============================================================================
//  CV
//
//  The LaTeX CV is the master copy. After changing it, the usual way to
//  refresh this file is the prompt in prompts/cv-from-latex.md, which
//  writes the whole file again. Small fixes can be made here by hand.
//  Either way, save the new PDF as update/cv.pdf and change "updated".
//
//  Publications are not in this file. The lines marked "papers" further
//  down are filled in from papers.json.
//
//  An entry has up to five parts. Use only the ones it needs:
//      "primary"     the title of the entry, shown semibold
//      "secondary"   the muted line under it
//      "date"        shown in the column on the right
//      "detail"      one "paragraph", or a [list] that becomes bullets
//      "links"       [{ "label": "Details", "url": "https://..." }]
//
//  Lines that begin with // are notes, like this one. The site ignores them.
// =============================================================================

/* TEMPLATE. Copy the lines from { to }, with its comma.

        {
          "primary":   "Title of the entry",
          "secondary": "The place, or a short qualifier",
          "date":      "2027",
          "detail":    "One sentence or one paragraph."
        },

   This block sits inside a note, so it never shows on the site. */
```

2. Then a blank line, the opening `{`, the `pdf` and `updated` lines, a blank line, `"sections": [` and a blank line.
3. Before each section write a divider note: four spaces, `// ---- `, the section title, a space, then hyphens up to column 80. After each section leave one blank line.
4. Publication placeholders that follow one another share a single divider, `// ---- Publications: filled in from papers.json`, and are written one per line with their `"papers"` values lined up.
5. Inside a section, leave one blank line between entries.
6. Inside an entry, write the fields in the order `primary`, `secondary`, `date`, `detail`, `links`, one per line. Put spaces after the colons so that the values of the one-line fields start in the same column. A `detail` list and `links` are written as `"detail": [` with one item per line.
7. Indent with two spaces per level. Do not use tabs.

This is how the start of the body looks:

```jsonc
{
  "pdf":     "update/cv.pdf",
  "updated": "October 2026",   // the line under the page title

  "sections": [

    // ---- Education ----------------------------------------------------------
    {
      "title": "Education",
      "entries": [
        {
          "primary":   "Ph.D., Computer Science",
          "secondary": "Virginia Tech",
          "date":      "2021–present",
          "detail": [
            "Doctoral studies began at George Mason University in 2021; transferred to Virginia Tech in 2025.",
            "Advisors: Sanmay Das and Patrick J. Fowler. GPA: 4.0/4.0."
          ]
        },

        {
          "primary":   "M.S., Computer Science",
          "secondary": "George Mason University",
          "date":      "2021–2024",
          "detail":    "Machine learning concentration; GPA: 3.96/4.0."
        }
      ]
    },

    // ---- Publications: filled in from papers.json ---------------------------
    { "title": "Peer-reviewed conference papers",        "papers": "conference" },
    { "title": "Extended abstracts",                     "papers": "abstracts"  },
    { "title": "Preprints and manuscripts under review", "papers": "preprints"  },

    // ---- Service ------------------------------------------------------------
    {
      "title": "Service",
      "entries": [
        {
          "primary":   "Proceedings Chair",
          "secondary": "ACM EAAMO 2026 (Munich)",
          "date":      "2026"
        }
      ]
    }

  ]
}
```

The only notes in the file are the two at the top, the dividers, and the short note after `updated`. Do not add others. If the current `update/cv.json` I attached has notes of mine that are not described here, keep them where they are.

## What to leave out

- The header at the top of the CV: my name, address, email and website. The page shows these itself.
- Every publication. See the next section.
- Layout commands, spacing and LaTeX comments.

## Publications

The site fills in the publication lists from another file, so `cv.json` never contains a publication. In place of each publication subsection, write a placeholder section with no entries. The `papers` value says which list to show:

| Subsection in the LaTeX | Placeholder |
| --- | --- |
| Peer-reviewed conference papers | `{ "title": "Peer-reviewed conference papers", "papers": "conference" }` |
| Extended abstracts | `{ "title": "Extended abstracts", "papers": "abstracts" }` |
| Preprints and manuscripts under review | `{ "title": "Preprints and manuscripts under review", "papers": "preprints" }` |

The placeholders take the position of the Publications section, in the order of its subsections. There is no section called "Publications" in the JSON.

If the LaTeX has a publication subsection that is not in this table, such as journal articles, write a placeholder for it with a new one-word value (`journal`) and tell me in the "Changes" part that `update/papers.json` needs a section with that id.

## How to convert each kind of block

### A heading line with a date, then text

LaTeX:

```latex
\textbf{Graduate Teaching Assistant}, George Mason University \hfill Aug 2023--May 2024\\
Graduate course in machine learning; approximately 50 students per class. Held office hours, supported labs on model implementation and evaluation, graded assignments, and coordinated exam logistics.
```

JSON:

```json
{
  "primary": "Graduate Teaching Assistant",
  "secondary": "George Mason University",
  "date": "Aug 2023–May 2024",
  "detail": "Graduate course in machine learning; approximately 50 students per class. Held office hours, supported labs on model implementation and evaluation, graded assignments, and coordinated exam logistics."
}
```

The bold text is `primary`. What follows the comma, up to `\hfill`, is `secondary`. What follows `\hfill` is `date`. The text underneath is `detail`.

When the text underneath is two or more separate statements on their own lines (separated by `\\`), make `detail` a list with one string per statement. When it is a single statement or a single run of prose, keep it as one string.

### A heading line, a short qualifier, then a bulleted list

LaTeX:

```latex
\textbf{Associate AI Scientist (Intern)}, Pearson \hfill May--Aug 2026\\
Scoring Services team.
\begin{itemize}
\item Designed and implemented an equivalence study ...
\item Applied post-hoc interpretability methods ...
\end{itemize}
```

JSON:

```json
{
  "primary": "Associate AI Scientist (Intern)",
  "secondary": "Pearson, Scoring Services team",
  "date": "May–Aug 2026",
  "detail": [
    "Designed and implemented an equivalence study ...",
    "Applied post-hoc interpretability methods ..."
  ]
}
```

The bullets become the `detail` list. A short line between the heading and the bullets describes the place or the role, so it joins `secondary`: after a comma when it is a phrase ("Pearson, Scoring Services team"), after a period when it is a sentence ("Virginia Tech. Previously at George Mason University; advisor: Sanmay Das.").

### A list of awards

Each item becomes one entry. `primary` is the name of the award. `date` is its year or range of years. `secondary` holds whatever else the item says: the institution, and any note in parentheses or in a following sentence. Keep these in the order they appear, join them with commas, drop the outer parentheses, and start with a capital letter.

LaTeX:

```latex
\item Distinguished Academic Achievement Award, George Mason University, 2024.
\item Spotlight paper, NeurIPS, 2026 (for ``Budgeting Discretion''; 292 of 30{,}709 submissions).
\item Bonner Scholar (four-year service scholarship), Oberlin College, 2017--2021.
\item Top Reviewer, NeurIPS, 2026.
```

JSON:

```json
{ "primary": "Distinguished Academic Achievement Award", "secondary": "George Mason University", "date": "2024" },
{ "primary": "Spotlight paper, NeurIPS", "secondary": "For “Budgeting Discretion”; 292 of 30,709 submissions", "date": "2026" },
{ "primary": "Bonner Scholar", "secondary": "Four-year service scholarship, Oberlin College", "date": "2017–2021" },
{ "primary": "Top Reviewer, NeurIPS", "date": "2026" }
```

A conference or program stays in `primary` when it is part of how the award is known ("Top Reviewer, NeurIPS"). An institution that only says where the award was given goes in `secondary`.

### A list of talks and posters

Each item becomes one entry. `primary` is the title, without its quotation marks and without the comma that closes it. `secondary` is the kind of presentation, the event and the place, starting with a capital letter, followed by "(upcoming)" if the item says so. `date` is the month and year, or the year. When the item gives no separate date, take the year from the event name.

LaTeX:

```latex
\item ``Can LLMs Rank? A Tale of Triads and Triage,'' paper presentation, AIES 2026, Malm\"o, October 2026.
\item ``Discretionary Trees: Understanding Street-Level Bureaucracy via Machine Learning,'' poster, AAAI 2024.
```

JSON:

```json
{ "primary": "Can LLMs Rank? A Tale of Triads and Triage", "secondary": "Paper presentation, AIES 2026, Malmö", "date": "October 2026" },
{ "primary": "Discretionary Trees: Understanding Street-Level Bureaucracy via Machine Learning", "secondary": "Poster, AAAI 2024", "date": "2024" }
```

### Service

A bold run-in heading followed by a bulleted list (Conference organization) gives one entry per bullet: the role is `primary`, the event and place are `secondary`, and the year from the event name is `date`. The run-in heading itself is dropped.

`Proceedings Chair, ACM EAAMO 2026 (Munich).` becomes `{ "primary": "Proceedings Chair", "secondary": "ACM EAAMO 2026 (Munich)", "date": "2026" }`.

A bold run-in heading followed by a line of text (Program committees) gives one entry: the heading is `primary` and the text is `secondary`, without its final period. It has no `date`.

### A two-column table

Each row of a table such as Technical skills gives one entry: the first cell is `primary` and the second cell is `detail`.

### A list of items with a name, a colon and a description

In a section such as Community engagement, the part before the colon is `primary`, and the part after it is `detail`, starting with a capital letter.

`Oberlin Public Library: developed educational programming ...` becomes `{ "primary": "Oberlin Public Library", "detail": "Developed educational programming ..." }`.

### A section that is a paragraph

One entry with only `detail`, holding the paragraph.

### Anything else

For a block that fits none of these, use the closest pattern, keep all of its text, and tell me in the "Changes" part what you did.

## Converting the text

The JSON holds plain Unicode text. No LaTeX may remain in any string.

```text
In the LaTeX              In the JSON
--                        – (an en dash), as in 2021–present and human–AI
``text''                  “text” (curly double quotes)
' in or before a word     ’ (a curly apostrophe), as in master’s and ’52
\&  \%  \$  \#            &  %  $  #
~                         a space
{,}                       ,
\"o  \'e                  ö  é (the accented letter)
\LaTeX                    LaTeX
\textbf{x}  \emph{x}      x (the text, without the formatting)
\href{url}{text}          [text](url)
\me                       Gaurab Pokharel
```

A link written with `\href` stays inline, as `[text](url)`, when it is in `secondary` or `detail`. When it is in `primary`, keep the text there and move the link to the entry's `links`.

Dates keep the wording of the LaTeX, with en dashes in ranges: `Aug 2021–present`, `May–Aug 2026`, `2019–2021`. Capitalize a date that is a word: `Ongoing`.

The curly quotes need no escaping in JSON. If a straight double quote must appear inside a string, write it as `\"`.

## If I attached the current `update/cv.json`

The LaTeX decides the content. The current file decides details that exist only on the website.

- An entry whose content has not changed in the LaTeX: copy it from the current file exactly as it is, including its `links` and the way its text is divided between `secondary` and `detail`.
- An entry that has changed: convert it from the LaTeX, and keep the `links` it had.
- An entry that is new in the LaTeX: convert it by the rules above.
- An entry that is no longer in the LaTeX: leave it out and name it in the "Changes" part.

Some entries in the current file have a `links` field with no counterpart in the LaTeX, such as a "Details" link on an award. Keep those.

## What to send back

1. The complete `update/cv.json` in one code block, laid out as described under "Layout of the file". If you can create files, also attach it.
2. "Changes": a short list of what differs from the current `update/cv.json`, entry by entry. If I did not attach it, list any choices you had to make.
3. "Publication check". If I attached `update/papers.json`, compare each publication in the LaTeX with its entry there (title, authors and their order, venue, year, volume, number, pages, DOI, arXiv number, status, awards) and list every difference, along with any paper that is in one and not the other. If I did not attach it, list the publications in the LaTeX, one line each, so I can compare by hand.
4. "Possible typos": anything in the LaTeX that looks like a mistake. Convert it as written and list it here. Do not correct it silently.
5. This reminder: "Export the PDF from LaTeX and save it as `update/cv.pdf`."

## Before you reply

Check each of these and fix what fails:

- With its notes taken out, the file is valid JSON: double quotes around every name and string, and no trailing commas.
- The file starts with the two notes given under "Layout of the file", every section has its divider, and there is one blank line between entries.
- No entry comes from a `TEMPLATE` block.
- The sections are in the LaTeX order, with the publication subsections replaced by placeholders.
- No publication appears as an entry.
- No string contains a backslash command, `~`, `--`, a backtick or `$` used as a math delimiter.
- Every range in a `date` uses an en dash.
- No field is an empty string or an empty list.
- Nothing from the LaTeX is missing, other than the header and the publications.

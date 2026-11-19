# How to update the site

Everything you edit is in this folder. When your news, papers, projects or CV
change, nothing else in the repository needs to be touched.

| I want to | Edit |
| --- | --- |
| Add a news item | `news.json` |
| Add a paper, or mark one as accepted | `papers.json` |
| Add a project | `projects.json` and a new folder in `projects/` |
| Update the CV | `cv.json` and `cv.pdf` |
| Change the headline, intro, job-market box or links | `site.json` |
| Replace the portrait | `profile.jpg` |

Adding a whole new tab, such as "My lab", takes a few files outside this
folder as well. The steps are under "Adding a tab" in the main `README.md`.

## Check a change before pushing

From the repository root:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. If a file in this folder has a typo, a banner
at the top of the page names the file and the problem. Visitors to the live
site never see that banner. If a change does not seem to apply, hard-refresh
the page (Ctrl+Shift+R, or Cmd+Shift+R on a Mac).

The rules that cause most mistakes: use double quotes around names and text,
and put a comma between items. A comma after the last item of a list does no
harm.

## How the files are laid out

The five `.json` files are arranged the same way, so that the place to add
something is easy to find:

- A boxed note at the top says what the file is and how to add to it.
- Under it is a template to copy: paste it where the note says and change
  the text. (`site.json` is a single block, so it has no template.)
- Divider lines mark the parts of the file: each section of papers, current
  and past projects, each year of news, each section of the CV.
- Entries are separated by one blank line. Their fields are in the same
  order in every entry, and the values line up.

Lines that begin with `//` are notes, and so is anything between `/*` and
`*/`. The site ignores notes, so you can add your own wherever they help, for
example a reminder next to a paper that is under review:

```jsonc
"status": "to appear",   // replace with volume, number and pages in December
```

Because of the notes these files are not strict JSON, and some editors
underline the notes as mistakes. The repository includes settings that stop
VS Code and GitHub from doing that. The examples below leave the notes out.

## News: `news.json`

One object per item. Put new items at the top.

```json
{
  "date": "2026-09-24",
  "text": "[Budgeting Discretion](project.html?id=modeling-discretion) was accepted to NeurIPS 2026 as a spotlight."
}
```

`date` is `YYYY-MM-DD`. `text` is one or two sentences and may contain
`[links](url)`, `**bold**` and `*italic*`. The home page shows the newest four
and folds the rest under "Older news". The number is set in `site.json`.

## Papers: `papers.json`

Each paper is entered once. That one entry feeds the Papers tab, the recent
papers on the home page, the publication lists on the CV tab, and the authors,
venue, links and BibTeX citation on the paper's project page.

The file has sections (`conference`, `preprints`, `abstracts`, and an unlisted
`theses` section used only by project pages). Sections and entries appear in
file order, so put a new entry at the top of its section.

```json
{
  "title": "Can LLMs Rank? A Tale of Triads and Triage",
  "authors": ["Gaurab Pokharel", "Shafkat Farabi", "Patrick J. Fowler", "Sanmay Das"],
  "venue": "Proceedings of the AAAI/ACM Conference on AI, Ethics, and Society",
  "abbr": "AIES 2026",
  "year": "2026",
  "place": "Malmö, Sweden",
  "volume": "9",
  "number": "3",
  "pages": "2105–2117",
  "doi": "10.1609/aies.v9i3.43292",
  "arxiv": "2606.30412",
  "project": "can-llms-rank",
  "funding": "This work was supported by NSF Award 2533162."
}
```

| Field | Needed | What it is |
| --- | --- | --- |
| `title` | yes | Full title, as on the paper. |
| `authors` | yes | Names in paper order. Write your own name exactly as in `site.json`. |
| `year` | yes | Four digits, in quotes. |
| `venue` | published papers | Full venue name without the abbreviation. Leave it out for an arXiv-only preprint. |
| `abbr` | with `venue` | Short label with the year, for example `NeurIPS 2026`. |
| `extra` | no | Shown after the venue, for example `AI for Social Impact track`. |
| `place` | no | City and country. |
| `volume`, `number`, `pages` | no | Shown as `9(3):2105–2117`, or `pp. 280–320` when there is no volume. |
| `status` | no | For example `to appear`. |
| `note` | no | Shown as a small teal label, for example `Spotlight`. |
| `arxiv` | no | The arXiv number only. The link is built from it. |
| `doi` | no | The DOI only. The link is built from it. |
| `links` | no | Any other links: `[{ "label": "Code", "url": "https://..." }]`. |
| `project` | no | The `id` of the paper's project page. |
| `equal` | no | Names of equal-contribution authors. They get an asterisk. |
| `funding` | no | One sentence shown under the citation on the project page. |
| `affiliations` | no | `{ "Name": "Place" }` for this paper only. Otherwise affiliations come from `site.json`. |
| `bibtype`, `bibkey` | no | Override the generated BibTeX entry type (`inproceedings` when there is a venue, otherwise `misc`) or key. |

### When a preprint is accepted

1. Move its entry from `preprints` to the top of `conference`.
2. Add `venue`, `abbr` and, until the proceedings are out, `"status": "to appear"`.
3. Later, replace `status` with `volume`, `number`, `pages` and `doi`.
4. Add a line to `news.json`.

The Papers tab, home page, CV tab and project page all pick the change up.
The LaTeX CV is separate and still needs its own edit.

## Projects: `projects.json` and `projects/<id>/`

A project is one entry in `projects.json` plus one folder.

```
projects/modeling-discretion/
  writeup.md       the write-up shown on the project page
  thumbnail.png    the picture on the Projects tab, 1200 x 750
  fig1.png         figures used in the write-up
```

The picture can also be an SVG, which is what `prompts/project-thumbnail.md`
produces. Save it as `thumbnail.svg` and add `"thumbnail": "thumbnail.svg"` to
the project's entry.

```json
{
  "id": "modeling-discretion",
  "title": "Budgeting Discretion",
  "period": "2026",
  "status": "current",
  "summary": "One sentence that says what the project is and what it found.",
  "tags": ["Dynamic programming", "Resource allocation", "Discretion"]
}
```

| Field | Needed | What it is |
| --- | --- | --- |
| `id` | yes | Lowercase words joined by hyphens. Must match the folder name. Never change it once the page is public, since it is part of the address. |
| `title` | yes | Short project title. |
| `period` | yes | A year or a range, for example `2026` or `2025–2026`. |
| `status` | yes | `current` or `past`. Current projects are listed first. |
| `summary` | yes | One sentence, shown on the card and under the page title. |
| `tags` | yes | Topics. The card shows the first two; the project page shows all. |
| `links` | no | Links that do not belong to a paper: `[{ "label": "Code", "url": "https://..." }]`. |
| `thumbnail` | no | File name if it is not `thumbnail.png`, for example `thumbnail.svg`. |
| `writeup` | no | Set to `false` for a project with no write-up. |

To add a project:

1. Choose an `id` and create `projects/<id>/`.
2. Put `writeup.md`, the thumbnail and the figures in it.
3. Add the entry at the top of `projects.json`.
4. If the project has a paper, set `"project": "<id>"` on the paper's entry in
   `papers.json`. The project page then shows the authors, venue, links and
   citation from that entry.

An LLM can do most of this. `prompts/project-writeup.md` turns a paper PDF or
a description into the write-up and both JSON entries, and
`prompts/project-thumbnail.md` draws the picture.

Rules for `writeup.md`:

- Start with a `##` heading. The page already shows the title, authors, venue
  and links, so do not repeat them, and do not add a citation section.
- Name figures by file name only, for example `src="fig1.png"`.
- A blockquote (`> **Key takeaway:** ...`) becomes the tinted takeaway box.
- There is no math renderer. Write math in plain Unicode, for example `T(τ, k)`.

## CV: `cv.json` and `cv.pdf`

The LaTeX CV stays the master copy.

1. Export the PDF and save it here as `cv.pdf`.
2. Open `prompts/cv-from-latex.md`, give it to an LLM together with your
   LaTeX and the current `cv.json`, and save the result as `cv.json`.

`cv.json` holds every section except the publication lists. Those are written
as placeholders such as `{ "title": "Extended abstracts", "papers": "abstracts" }`
and are filled from `papers.json`, so a new paper never needs a CV edit here.

An entry has up to five parts, all optional:

```json
{
  "primary": "Ph.D., Computer Science",
  "secondary": "Virginia Tech",
  "date": "2021–present",
  "detail": ["First bullet.", "Second bullet."],
  "links": [{ "label": "Details", "url": "https://..." }]
}
```

`primary` is the semibold title, `secondary` the muted line under it, `date`
the right-hand column. `detail` is one paragraph when it is a string and
bullets when it is a list. `secondary` and `detail` may contain `[links](url)`.
An entry with only `detail` is shown as plain text, which is how Research
interests is written.

## Site details: `site.json`

| Field | What it is |
| --- | --- |
| `name` | Your name, used in the header, footer, and to bold you in author lists. |
| `role` | The small line above the home headline. |
| `email` | Used for the footer icon and the Email link in the job-market box. |
| `photo` | Path to the portrait. |
| `headline` | The large sentence on the home page. |
| `intro` | One or more paragraphs under the headline. |
| `jobMarket` | The highlighted box. Set `"show": false` to hide it. |
| `home` | How many recent papers and news items the home page shows. |
| `social` | GitHub, LinkedIn and Google Scholar addresses for the footer icons. |
| `affiliations` | Each co-author's affiliation, shown on project pages. Add a line for a new co-author. |

## Where each file shows up

| File | Home | Papers | Projects | Project page | CV |
| --- | --- | --- | --- | --- | --- |
| `site.json` | headline, intro, job box | | | affiliations | |
| `news.json` | news | | | | |
| `papers.json` | recent papers | all | | authors, venue, links, citation | publication lists |
| `projects.json` | | | cards | title, summary, topics | |
| `projects/<id>/` | | | thumbnail | write-up, figures | |
| `cv.json`, `cv.pdf` | | | | | everything else, download |

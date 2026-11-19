# Prompt: add a project page

For Gaurab, how to use this file:

1. Start a new chat with any capable language model.
2. Attach the paper PDF, or paste a description of the project.
3. If you can, also attach `update/projects.json` and `update/papers.json`. With them the model can avoid an id that is already taken and can tell whether the paper is already listed.
4. Paste this whole file as your message.
5. Follow the install checklist at the end of the reply. Then make the picture for the project card with `project-thumbnail.md`.

Everything below the line is written to the model.

---

I am Gaurab Pokharel, a PhD candidate in computer science at Virginia Tech. I am adding one research project to my personal website, gpokharel.com, and I want you to write the content for it.

You cannot see the website and you do not need to. This prompt describes every file format and rule you need. You write content only: one Markdown file and a few small pieces of JSON. Do not write HTML pages, CSS or JavaScript, and do not suggest changes to how the site works.

## What I have given you

- The paper as a PDF, or a description of the project in my own words. This is your only source of facts about the project.
- Possibly my current `update/projects.json` and `update/papers.json`.

My data files hold notes as well as data. Anything after `//` on a line is a note, and so is everything between `/*` and `*/`. Notes are not data, so ignore them when you read the files. In particular, each file has a block that begins `/* TEMPLATE` and holds a made-up example entry. That example is not one of my projects or papers.

If neither a PDF nor a description is in this conversation, ask me for one and stop. Otherwise do not ask questions before you start. Make the most reasonable choice and list what you were unsure of in part I of your reply.

Accuracy matters more than polish. Use only what the source says. Do not invent results, numbers, venues, dates, page numbers, DOIs, arXiv numbers, links, co-authors or funding. When a detail is not in the source, leave the field out and say so in part I.

## How a project page is put together

The site is static and is assembled in the browser from data files. A project page draws on three of them:

1. An entry in `update/projects.json` supplies the title, year, status, one-sentence summary and topics. The same entry makes the project's card on the Projects tab.
2. An entry in `update/papers.json`, if the project has a paper, supplies the authors and affiliations, the venue line, the links, a BibTeX citation and the funding note. The same entry lists the paper on the Papers tab, the home page and the CV tab.
3. `update/projects/<id>/writeup.md` is the body of the page. Its figures are image files in the same folder.

The page shows these in a fixed order: the title and summary, a details block (authors, venue, topics, links), the write-up, then the citation and funding note. The write-up therefore repeats none of that.

## What to send back

Reply with parts A to J below, in this order, each under a heading with its letter and name. Put every file and snippet in a fenced code block so I can copy it exactly. If you are able to create downloadable files, also attach `writeup.md`.

### A. Project id

A short id for the project: two or three lowercase words joined by hyphens, taken from the short title. Letters, digits and hyphens only. Examples: `discretionary-trees`, `can-llms-rank`.

The id becomes the folder name and part of the page address (`project.html?id=<id>`), so it must not match an existing one. If I attached `update/projects.json`, check against it. Otherwise, these ids were in use when this prompt was written: `can-llms-rank`, `modeling-discretion`, `eviction-prediction`, `stochastic-merit`, `street-level-ai`, `discretionary-trees`, `two-sided-matching`, `value-of-info`.

### B. The write-up: `update/projects/<id>/writeup.md`

The complete file. It follows every rule in the section "Rules for the write-up" further down.

### C. Entry for `update/projects.json`

One JSON object, like this one:

```json
{
  "id":        "modeling-discretion",
  "title":     "Budgeting Discretion",
  "period":    "2026",
  "status":    "current",
  "summary":   "A model of caseworker discretion as a limited budget of overrides, with evidence from homelessness services that caseworkers ration overrides against capacity and timing.",
  "tags":      ["Discretion", "Resource allocation", "Dynamic programming", "Heavy tails"],
  "thumbnail": "thumbnail.svg"
}
```

Write the fields in this order, one per line, with spaces after the colons so that the values line up, as above. My files are laid out that way. The same goes for the entries in parts D and F.

| Field | Rule |
| --- | --- |
| `id` | The id from part A. |
| `title` | A short project title, usually the paper title up to the colon. Keep the paper's capitalization. |
| `period` | The year of the work, or a range with an en dash: `2026`, `2025–2026`. For a published paper, the publication year. |
| `status` | `current` if I am still working on it or it is not yet published. `past` if it is published and finished. If you cannot tell, use `current` and say so in part I. |
| `summary` | One line of 15 to 30 words that says what the project is and what it found. A full sentence or a noun phrase like the one above both work. It appears on the project's card and under the page title. Plain words, no term that needs a definition. It ends with a period. |
| `tags` | Three to six topic labels. Capitalize only the first word, plus proper nouns and acronyms: `Resource allocation`, `LLMs`. The card shows the first two, so put the two most telling labels first. Reuse a label from the list below when it fits, so one topic is not spelled two ways. |
| `links` | Optional. Only for links that do not belong to the paper, such as code, data, slides or a poster: `[{ "label": "Code", "url": "https://..." }]`. Include a link only if its full address is in the source. Paper, arXiv and DOI links come from the paper entry, so they never go here. |
| `thumbnail` | Always `"thumbnail.svg"`. The picture is made separately. |

Labels already in use: LLMs; Ranking; Pairwise comparisons; Consistency; Triage; Resource allocation; Dynamic programming; Discretion; Invariance; Heavy tails; Temporal splits; Feature engineering; Model evaluation; Reproducibility; Long-run fairness; Feedback loops; Stochastic processes; Meritocratic selection; Dynamics; Human-AI decision-making; Homelessness services; Robustness; Interpretable ML; Street-level bureaucracy; Procedural justice; Matching markets; Bandits; Decentralized learning; Stable matching; UCB; Thompson sampling; POMDPs; Online planning; Value of information; POMCP; Entropy.

### D. Entry for `update/papers.json`

Three cases:

- The project has no public paper (work in progress, software, a dataset). Write "No paper entry." The project page then shows the topics and any links from part C.
- I attached `update/papers.json` and the paper is already in it. Do not rewrite the entry. Tell me which entry it is and give me the one line to add to it: `"project": "<id>"`.
- Otherwise, write one JSON object and tell me which section it goes in.

A published paper looks like this:

```json
{
  "title":   "Can LLMs Rank? A Tale of Triads and Triage",
  "authors": ["Gaurab Pokharel", "Shafkat Farabi", "Patrick J. Fowler", "Sanmay Das"],
  "venue":   "Proceedings of the AAAI/ACM Conference on AI, Ethics, and Society",
  "abbr":    "AIES 2026",
  "year":    "2026",
  "place":   "Malmö, Sweden",
  "volume":  "9",
  "number":  "3",
  "pages":   "2105–2117",
  "doi":     "10.1609/aies.v9i3.43292",
  "arxiv":   "2606.30412",
  "project": "can-llms-rank",
  "funding": "This work was supported by NSF Award 2533162."
}
```

A preprint that is only on arXiv looks like this:

```json
{
  "title":   "Converging to Stability in Two-Sided Bandits: The Case of Unknown Preferences on Both Sides of a Matching Market",
  "authors": ["Gaurab Pokharel", "Sanmay Das"],
  "year":    "2023",
  "arxiv":   "2302.06176",
  "project": "two-sided-matching"
}
```

Leave out any field you have no value for. Do not write empty strings. Keep the fields in this order: `title`, `authors`, `equal`, `venue`, `abbr`, `year`, `extra`, `place`, `volume`, `number`, `pages`, `status`, `note`, `doi`, `arxiv`, `links`, `project`, `funding`, `affiliations`, `bibtype`, `bibkey`.

| Field | Needed | Rule |
| --- | --- | --- |
| `title` | yes | The full paper title, exactly as printed. |
| `authors` | yes | Full names in the paper's order, each written as on the paper. My name is always written `Gaurab Pokharel`. |
| `year` | yes | Four digits, in quotes. |
| `venue` | published or accepted papers | The full name of the proceedings or journal, without its abbreviation and without the year. Leave it out for a preprint that is only on arXiv. |
| `abbr` | with `venue` | The short name with the year: `NeurIPS 2026`. |
| `extra` | no | A track, or the workshop where a preprint was presented: `AI for Social Impact track`. |
| `place` | no | City and country of the conference: `Montreal, Canada`. |
| `volume`, `number`, `pages` | no | As printed in the proceedings. Page ranges use an en dash: `2105–2117`. |
| `status` | no | `to appear` for a paper that is accepted but not yet published. Otherwise leave it out. |
| `note` | no | An award or presentation type the source states: `Spotlight`, `Oral`, `Best Paper Award`. The site shows it as a small label. |
| `arxiv` | no | The arXiv number only, without a version and without the address: `2602.10039`. The site builds the link. |
| `doi` | no | The DOI only, without `https://doi.org/`: `10.1609/aies.v9i3.43292`. The site builds the link. |
| `links` | no | Other links for the paper, such as code: `[{ "label": "Code", "url": "https://..." }]`. |
| `project` | yes | The id from part A. This is what connects the paper to the project page. |
| `equal` | no | The names of authors marked as equal contributors, spelled as in `authors`. |
| `funding` | no | The funding sentence from the acknowledgments, copied as written. Grants only, not thanks to people. |
| `affiliations` | no | See part E. Use it only when an author's affiliation on this paper differs from the one I have on file. |
| `bibtype` | no | The site writes the BibTeX entry itself: `@inproceedings` when there is a `venue`, `@misc` otherwise. Set `"bibtype": "article"` for a journal article and `"bibtype": "misc"` for a thesis or technical report. Otherwise leave it out. |

The file has these sections. Say which one the entry belongs in. It goes at the top of that section's `entries` list.

- `conference`: accepted or published at a peer-reviewed conference.
- `preprints`: on arXiv and not yet accepted anywhere with proceedings. A preprint presented at a workshop without proceedings stays here, with the workshop in `extra`.
- `abstracts`: extended abstracts and doctoral consortium papers.
- `theses`: a thesis. This section feeds the project page only.

If the paper is a journal article, or fits none of these, say so in part I.

Full venue names I have used, so they stay consistent:

- NeurIPS: `Advances in Neural Information Processing Systems`
- AAAI: `Proceedings of the AAAI Conference on Artificial Intelligence`
- AIES: `Proceedings of the AAAI/ACM Conference on AI, Ethics, and Society`
- FAccT: `Proceedings of the ACM Conference on Fairness, Accountability, and Transparency`

For any other venue use the official name of its proceedings.

For reference, the site builds the venue line from these fields as `venue (abbr), extra, place, volume(number):pages, status`. The published example above is shown as "Proceedings of the AAAI/ACM Conference on AI, Ethics, and Society (AIES 2026), Malmö, Sweden, 9(3):2105–2117". With no `volume`, pages are shown as "pp. 280–320". With no `venue`, the line starts with "arXiv:" and the number.

### E. Co-author affiliations for `update/site.json`

The project page shows each author's affiliation. It reads them from one list in `update/site.json`. I already have these:

- Gaurab Pokharel, Sanmay Das, Shafkat Farabi: Virginia Tech
- Patrick J. Fowler: Washington University in St. Louis
- Diptangshu Sen, Juba Ziani: Georgia Tech

For each author of this paper who is not in that list, give me one line in this form, using the institution's short common name as printed on the paper:

```json
"Full Name": "Institution"
```

If an author who is in my list has a different affiliation on this paper, leave the list alone and add this to the paper entry in part D instead: `"affiliations": { "Full Name": "Institution" }`.

Write "None" if there is nothing to add.

### F. News line for `update/news.json`

One JSON object announcing the project. One sentence, two at most, in my voice, with the project title linked to its page:

```json
{
  "date": "2026-09-24",
  "text": "[Budgeting Discretion](project.html?id=modeling-discretion) was accepted to NeurIPS 2026 as a spotlight."
}
```

For a new preprint, the pattern is "New preprint: [Title](project.html?id=<id>) ..." followed by what the paper does, in a few words. `date` is today's date as `YYYY-MM-DD`. If you do not know today's date, write `YYYY-MM-DD` and remind me to fill it in.

### G. Figures to export

A table with one row for each figure used in the write-up:

| File name | Source | Notes |
| --- | --- | --- |
| the name used in `src` | figure number and page in the paper | for example "panel (a) only" |

I export these from the PDF myself, as PNG files about 1600 pixels wide, and save them in the project folder. If you can extract the figures and attach them as files with these names, do that as well, cropped to the figure without its caption.

### H. Thumbnail brief

Three or four plain sentences that I will paste into a separate prompt that draws the picture for the project's card. Say what the project's central idea is as something that could be drawn: a mechanism, a structure, a before and after. Name the objects involved and which one is the focus. Do not mention colors, style or layout.

### I. Open questions

A short list of anything you guessed, anything the entries would normally have that the source did not give (venue details, a DOI, an arXiv number, funding, an affiliation), and anything in the source that looked inconsistent. Write "None" if there is nothing.

### J. Install checklist

End your reply by repeating this checklist with the real id and file names filled in:

1. Create the folder `update/projects/<id>/`.
2. Save part B in it as `writeup.md`.
3. Export the figures listed in part G into the same folder, with those file names.
4. Paste part C into `update/projects.json` above the first project, and put a comma after it. (If its status is `past`, paste it above the first past project instead.)
5. Paste part D into `update/papers.json` as the first entry of the named section, straight after that section's `"entries": [` line, and put a comma after it. (Or add the one line, if the paper was already listed.)
6. Add the lines from part E to `affiliations` in `update/site.json`.
7. Optional: paste part F into `update/news.json` above the first item, and put a comma after it.
8. Make the picture with `prompts/project-thumbnail.md` and save it as `update/projects/<id>/thumbnail.svg`.
9. Run `python3 -m http.server 8000` in the repository folder and open `http://localhost:8000/project.html?id=<id>`, then the Projects and Papers tabs. If a file has a mistake, a banner at the top of the page names it.

## Rules for the write-up

### Purpose and reader

The write-up is a short account of the project for someone who will not read the paper: a researcher in another area of computer science, a member of a hiring committee, someone who works in policy or social services. In about three minutes they should understand the problem, what we did and what we found.

It is not the abstract and it is not a section-by-section summary of the paper. Leave out related work, proofs, experimental details that do not change the reading of the results, and anything else that reader would skip.

### Length and shape

Write 450 to 800 words, not counting figure blocks. If the source is a short description that does not support that much, write less. Never pad.

1. `## Overview` comes first. In two or three short paragraphs, say what the problem is in concrete terms (who decides what, and what makes it hard) and what we did about it. End the section with the key takeaway, written as a blockquote that starts with `**Key takeaway:**` and runs one or two sentences. The site draws a blockquote as a tinted box, so the takeaway is the only blockquote in the file.
2. One to three middle sections cover the approach and the findings. Name each for what it contains, for example "The model", "Data and setting", "What we found". Use `###` subsections only when a section has clearly separate parts. A short bulleted list works for findings: each item is one full sentence that states one result, with the number when the paper gives one.
3. The last section says what follows from the work for practice or for other research. Call it "Why this matters", or something more specific such as "Implications for decision support". One or two paragraphs. It has to add something, so do not restate the overview, do not start with "In conclusion", and do not promise future work unless the source says what the next step is.

### Format

- GitHub-flavored Markdown. No front matter. The first line of the file is a `##` heading.
- Headings are `##` and `###` only, in sentence case, with no bold and no numbering. Never use a single `#` heading, because the page title is already the top heading.
- Do not include the paper title, author names, affiliations, the venue, the year, links to the paper or code, a citation, BibTeX, acknowledgments or funding. The site adds all of these from the data entries.
- Allowed: paragraphs, bulleted lists with `-`, numbered lists, `*italic*`, links, inline code, fenced code blocks, simple tables, the figure block below and the one blockquote.
- Not allowed: horizontal rules (`---`), Markdown images (`![...](...)`), raw HTML other than the figure block, footnotes, emoji, headings deeper than `###`.
- Links to other sites use the full `https://` address. A link to another project page on my site is written `project.html?id=<its id>`.

### Figures

Use one to four figures from the paper where they carry a result. If I gave you a description without figures, write the page without them.

Write each figure with this exact block, with a blank line before and after it:

```html
<figure>
  <img src="fig-thresholds.png"
       alt="Heatmap of override thresholds by remaining time and remaining budget"
       width="800" loading="lazy" />
  <figcaption><strong>Figure 1.</strong> What the figure shows, in one or two sentences.</figcaption>
</figure>
```

- `src` is a file name only, with no folder and no address. The file sits in the same folder as `writeup.md`. Use lowercase letters, digits and hyphens, ending in `.png`.
- `alt` is one sentence that describes literally what is drawn, for a reader who cannot see it.
- `width` is 800 for a wide or multi-panel figure and 500 to 600 for a single plot.
- Markdown is not read inside the block, so use `<strong>` and `<em>` in the caption. Add no `style` or `class` attributes.
- Number the figures 1, 2, 3 in the order they appear, and refer to each one in the text near it.
- The caption says what to look at. It does not repeat the paper's caption word for word if that caption depends on notation the write-up has not introduced.

### Math

The site has no math renderer. Do not write LaTeX and do not use the `$` character. Write the few symbols you need in plain Unicode: Greek letters such as α, ε and τ, subscripts such as K₁, and forms such as `T(τ, k)`, ≤, ≥, × and →. Use at most one or two formulas and explain everything else in words.

### Writing style

These rules describe how I write. Follow them in the write-up, the summary and the news line.

- Write as the authors: "we" for joint work, "I" for work with one author.
- Use plain language. Prefer short sentences that state one thing. Explain each technical term the first time it appears, and spell out each acronym once.
- Use "is" and "are". Do not replace them with "serves as", "stands as", "represents", "boasts", "offers" or "features".
- Do not use these words: delve, intricate, vibrant, robust, testament, crucial, underscore, tapestry, showcase, pivotal, enduring, meticulous, seamless, garner, realm, landscape, leverage, foster, novel, groundbreaking, cutting-edge. The one exception is a word that is a technical term in the paper, such as "robust" in "robust optimization".
- Do not use em dashes. Use a comma, parentheses or two sentences. An en dash appears only in number ranges.
- Bold appears once, on the words "Key takeaway:". Do not bold phrases for emphasis, and do not start list items with a bolded label followed by a colon.
- No constructions of the form "not just X, but Y" or "not only X but also Y". No rhetorical questions. No groups of three chosen for rhythm.
- Do not end a sentence with an "-ing" phrase that announces importance, such as "highlighting the need for" or "underscoring the role of". Say the specific thing instead, or stop.
- Use the same word for the same thing throughout. If the first section says "override", later sections do not switch to "deviation" or "exception".
- State results at the strength the paper supports. Give the paper's numbers where they help, rounded sensibly, and never a number that is not in the source.
- Use straight quotation marks.
- No closing paragraph that summarizes the page.

### An example of the form

This is a shortened write-up for one of my existing projects. Copy its form and tone, not its content. The figure file name is only an example.

```markdown
## Overview

Caseworkers, triage nurses and other street-level bureaucrats apply policy rules to individual cases. They usually have the authority to override what a rule recommends, but they cannot do it every time. An override used today is one that is not available tomorrow.

We model this as budgeted discretion. An agent has a fixed number of overrides to spend over a fixed period, sees cases one at a time, and wants to spend the overrides where they improve outcomes the most.

> **Key takeaway:** The best policy is a threshold rule. When the gains from overriding are fat-tailed, meaning a few cases have very large gains, the agent should hold overrides back for those rare cases. When gains are more even, the agent should spend overrides more routinely.

## What the model predicts

For a broad class of gain distributions (location-scale families), the rate at which the best policy spends overrides does not depend on how large the gains are. It depends only on the shape of the distribution, in particular on how heavy its tail is. Measuring gains in dollars or in thousands of dollars changes the numerical thresholds but leaves the probability of an override in any given state unchanged (Figure 1).

<figure>
  <img src="fig-spending.png"
       alt="Two panels: override spending over time for several scale parameters, and spending over time for fat-tailed and thin-tailed gains"
       width="800" loading="lazy" />
  <figcaption><strong>Figure 1.</strong> (a) Spending over time is identical across scale parameters. (b) Spending over time under fat-tailed gains (a patient policy) and thin-tailed gains (an aggressive policy).</figcaption>
</figure>

## Evidence from homelessness services

We test the model on records from the St. Louis Homeless Management Information System for 2008 to 2014. A decision tree recovers the baseline rule that caseworkers appear to follow, and we count a case as an override when the caseworker's decision departs from that rule.

- Caseworkers move more clients from scarce housing back to shelter when shelter exits open up beds, and fewer when housing exits free up units.
- Overrides peak on Mondays and fall on weekends, when intake is mostly closed.
- Overrides are more frequent early in the federal fiscal year, which starts in October.

## Why this matters

Decision-support tools usually ask which cases deserve an override. Our results show that caseworkers also have to decide when to use one, given how much capacity is left and which cases may arrive later. Tools built for this setting should help with both decisions.
```

## Before you reply

Check each of these and fix what fails:

- The id is not already in use, and the same id appears in the folder path, the project entry, the `project` field of the paper entry and the news link.
- `writeup.md` starts with a `##` heading and contains no `#` heading, no front matter, no `$`, no `---` rule and no `style=`.
- `writeup.md` contains no author names, venue, citation or funding text.
- There is exactly one blockquote, and it starts with `**Key takeaway:**`.
- Figures are numbered in order, each is mentioned in the text, and each `src` is a file name that appears in part G.
- There is no em dash and no word from the avoid list in the write-up, the summary or the news line.
- Each JSON block you wrote is valid: double quotes, no trailing commas, no notes, no empty strings.
- Nothing in your reply comes from a `TEMPLATE` block in my files.
- Every claim and number can be found in the source I gave you.

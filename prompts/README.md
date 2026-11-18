# Prompts

Each file in this folder is a complete prompt for a language model. The model does not need to see the website or the repository. Every rule, file format and example it needs is written into the prompt.

| I want to | Prompt | What to give the model |
| --- | --- | --- |
| Add a project page | `project-writeup.md` | The paper PDF, or a description of the project |
| Make the picture for a project card | `project-thumbnail.md` | A few sentences on the project's main idea |
| Refresh the web CV after editing the LaTeX CV | `cv-from-latex.md` | The LaTeX source and the current `update/cv.json` |

## How to use one

1. Start a new chat with any capable model.
2. Attach or paste what the table lists.
3. Paste the whole prompt file as your message, or attach it and say "follow this prompt".
4. Save what comes back into `update/`. Each prompt ends its reply by saying where every piece goes.

The top of each prompt has the same steps, with the optional extra files worth attaching.

## Adding a project from start to finish

1. Run `project-writeup.md` with the paper PDF. It returns the write-up, the entries for `update/projects.json` and `update/papers.json`, a news line, the list of figures to export and a short brief for the picture.
2. Run `project-thumbnail.md` with that brief. It returns an SVG.
3. Put the write-up, the figures and the picture in `update/projects/<id>/`, and paste the entries into the JSON files.
4. Preview with `python3 -m http.server 8000` and open the new project page.

## What the prompts do not cover

A news item, a paper with no project page, and a paper that moves from preprint to accepted are each a few lines of JSON. `update/README.md` shows how to write them by hand.

## If the site changes

The prompts repeat the file formats described in `update/README.md`. If a field is added or renamed there, make the same change in `project-writeup.md` or `cv-from-latex.md`. The colors in `project-thumbnail.md` are the design tokens at the top of `assets/css/main.css`.

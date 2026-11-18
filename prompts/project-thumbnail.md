# Prompt: draw the picture for a project card

For Gaurab, how to use this file:

1. Start a new chat with any capable language model.
2. Paste the "Thumbnail brief" from the reply to `project-writeup.md`. A few sentences about the project, its abstract or the paper PDF also work.
3. Paste this whole file as your message.
4. Save the SVG from the reply as `update/projects/<id>/thumbnail.svg`. The project's entry in `update/projects.json` needs the line `"thumbnail": "thumbnail.svg"`, which the write-up prompt already adds.

A PNG also works. Save it as `thumbnail.png`, 1200 by 750 pixels, and remove the `"thumbnail"` line from the entry.

Everything below the line is written to the model.

---

I am Gaurab Pokharel, a PhD candidate in computer science at Virginia Tech. The Projects page of my website, gpokharel.com, shows each research project as a card with a small picture above its title. I want you to draw that picture for one project, as an SVG file.

You cannot see the website and you do not need to. The style is fully described below, with two finished pictures to work from.

## What I have given you

A description of the project: a short brief, an abstract or the paper itself. If nothing in this conversation describes the project, ask me for a description and stop. Otherwise do not ask questions. Choose an idea and draw it.

## What the picture is for

The pictures on the page form a set. Each is a small diagram without words that shows the central mechanism of one project. A visitor scanning the page should be able to tell the projects apart, and after reading a title should see why its picture fits.

A picture is shown about 330 pixels wide on a laptop and about 110 pixels wide on a phone. It has to read at that size, which means a few large shapes and thick lines.

The eight pictures already in the set:

- A decision tree with one path highlighted and a dashed arrow that redirects to a different leaf. The project is about caseworkers overriding a rule.
- A row of short bars on a baseline, with two tall bars that cross a dashed threshold. The project is about saving scarce overrides for the cases with the largest gains.
- Two wavy paths that leave one point, cross each other a few times, then separate for good. The project is about small random leads that become permanent.
- Three circles joined by arrows into a cycle, with a fourth circle off to the side. The project is about rankings that contradict themselves.
- Two short ranked lists joined by crossing dashed lines, under a small four-pointed star. The project is about a language model whose ranking disagrees with a reference ranking.
- Two columns of circles joined by lines, some solid and crossing, some faint and dashed. The project is about matching two sides of a market.
- A corridor with a side room, and a dashed path that detours into the room before continuing. The project is about gathering information before acting.
- A row of houses on a ground line, cut by a dashed vertical line, with markers above the last two. The project is about predicting evictions from data before a cutoff date.

Your picture should look like the ninth member of this set. It must not reuse one of these eight motifs.

## Step 1: choose the idea

Find the one mechanism or structure at the center of the project and state it in a single sentence. The picture shows that and nothing else.

A good idea comes from the structure of the work:

- a comparison: two things side by side that differ in one way
- a process over time: a path, a sequence, something that grows or splits
- a selection: many quiet items and one or two that are chosen
- a relation: nodes and the links between them
- a boundary: a line that some things cross and others do not

Do not draw a general symbol of the field. That rules out brains, robots, chips, gears, light bulbs, clouds, magnifying glasses, shields, scales of justice and a generic network of dots.

If you cannot describe the picture in one sentence, it is too complicated. Most pictures in the set use between 8 and 20 shapes.

## Step 2: draw it to this specification

### Canvas

- The root element is `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">`.
- The first element inside it is the background: `<rect width="1200" height="750" fill="#fbfaf8"/>`.

### Colors

Use these eight colors and no others.

| Color | Role |
| --- | --- |
| `#fbfaf8` | The background. |
| `#6b6b64` | Structure: outlines, axes, baselines, and connecting lines that are not the point of the picture. |
| `#e7e3dc` | Quiet elements: things that are present but inactive, such as bars that do not matter or options not taken. |
| `#ffffff` | The fill of outlined shapes such as nodes and boxes, so that lines passing behind them are hidden. |
| `#e7f0ee` | A soft fill for a shape that belongs to the accent idea. |
| `#14655b` | The accent. It marks the one idea the picture is about and is used for nothing else. |
| `#0e4a43` | A darker accent for a second part of the same idea, such as a dashed arrow. Optional. |
| `#1b1b1a` | A small dark dot, such as a starting point. Optional and rare. |

Most of the canvas stays background. Gray and quiet shapes give the context. The accent goes on the idea, and the eye should land on it first. If everything is accent-colored, nothing is.

### Lines and shapes

- Stroke width is 8 for structure, 10 for accent lines and 6 for dashed guide lines. Nothing is thinner than 6.
- Every stroke has `stroke-linecap="round"` and `stroke-linejoin="round"`.
- Dashed lines use `stroke-dasharray="20 16"`. A long straight guide line may use `24 12`, and a dashed outline around a small circle `14 12`.
- A circle used as a node has a radius of 30 to 40, a white fill, and a stroke of 8 (structure) or 10 (accent).
- Rectangles have rounded corners with a radius of 16 to 26.
- A bar is a thick line with round caps, 30 to 34 wide.
- An arrowhead is a small filled triangle drawn as a `<path>`, in the same color as its line. Do not use `<marker>` elements.
- Fills are flat.

### Layout

- Keep every shape, including its stroke, inside the area from x = 130 to 1070 and y = 110 to 640. The empty margin is part of the look.
- Center the drawing. The middle of its bounding box should be within about 30 pixels of (600, 375).
- Leave at least 40 pixels between objects that are not meant to touch.
- Draw connecting lines first and nodes after them, so that nodes sit on top and lines end cleanly at their edges.
- Do not let lines cross unless the crossing is the idea.

### Not allowed

Text of any kind, including single letters, digits and symbols such as +, =, ? or a check mark. Logos. Icons from an icon set. People or faces. Photographs or embedded images. Gradients. Shadows, blur or any other filter. Opacity or transparency. Patterns. Perspective or 3D effects. Animation. Scripts. Links to outside files or fonts. `<style>` blocks and CSS classes: put `fill`, `stroke` and the other presentation attributes directly on elements or on `<g>` groups.

## Step 3: check it

Before you reply, go through the SVG and confirm each of these:

1. Every `fill` and `stroke` value is one of the eight colors or `none`.
2. No shape reaches outside x = 130 to 1070 or y = 110 to 640. Count the stroke width and the radius of circles.
3. Lines meet nodes where you intend. Work out the coordinates instead of estimating them.
4. Nothing overlaps by accident.
5. The accent is on the idea and only on the idea.
6. There is no text.
7. The file is well-formed: every tag is closed and every attribute value is quoted.

If you can run code, render the SVG and look at the result at 1200 by 750 and again at 220 by 138. Fix anything that does not read at the small size. Either of these renders it:

```
rsvg-convert -w 1200 -h 750 thumbnail.svg -o thumbnail.png
```

```
python3 -c "import cairosvg; cairosvg.svg2png(url='thumbnail.svg', write_to='thumbnail.png', output_width=1200, output_height=750)"
```

## What to send back

1. One sentence that states the idea the picture shows.
2. The complete SVG in one code block. If you can create files, also attach it as `thumbnail.svg`, and attach `thumbnail.png` if you rendered one.
3. This note, with the project id filled in if I gave it: "Save as `update/projects/<id>/thumbnail.svg`. The project's entry in `update/projects.json` needs the line `"thumbnail": "thumbnail.svg"`."

Send one picture, not a set of alternatives.

## Two pictures from the set

These are two of the existing pictures, written the way I want yours written. Study how few shapes they use, how the accent is limited to the idea, and how the comments name the role of each group. Do not copy their motifs.

The decision tree with an override:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <!-- Idea: a decision tree recommends one leaf; a caseworker overrides it and sends the case to another. -->
  <rect width="1200" height="750" fill="#fbfaf8"/>

  <!-- Structure: branches the rule does not take -->
  <g fill="none" stroke="#6b6b64" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M600 170L385 350"/>
    <path d="M385 350L255 545"/>
    <path d="M385 350L515 545"/>
    <path d="M815 350L685 545"/>
  </g>

  <!-- Accent: the path the rule recommends -->
  <g fill="none" stroke="#14655b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
    <path d="M600 170L815 350"/>
    <path d="M815 350L945 545"/>
  </g>

  <!-- Darker accent: the override, a dashed arrow to a different leaf -->
  <path d="M812 392C800 470 786 478 742 470C680 458 628 470 584 502" fill="none" stroke="#0e4a43" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20 16"/>
  <path d="M560 520L588 488L597 514Z" fill="#0e4a43"/>

  <!-- Nodes, drawn last so they sit on top of the branches -->
  <g fill="#ffffff" stroke="#6b6b64" stroke-width="8">
    <circle cx="385" cy="350" r="34"/>
    <circle cx="255" cy="545" r="34"/>
    <circle cx="685" cy="545" r="34"/>
  </g>
  <g stroke="#14655b" stroke-width="10">
    <circle cx="600" cy="170" r="38" fill="#ffffff"/>
    <circle cx="815" cy="350" r="34" fill="#ffffff"/>
    <circle cx="945" cy="545" r="34" fill="#e7f0ee"/>
  </g>
  <circle cx="515" cy="545" r="34" fill="#e7f0ee" stroke="#0e4a43" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 12"/>
</svg>
```

The bars and the threshold:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <!-- Idea: most cases stay under the threshold; overrides are spent on the two that clear it. -->
  <rect width="1200" height="750" fill="#fbfaf8"/>

  <!-- Quiet elements: ordinary cases, drawn as short bars -->
  <g fill="none" stroke="#e7e3dc" stroke-width="30" stroke-linecap="round">
    <path d="M150 575V525"/>
    <path d="M232 575V475"/>
    <path d="M314 575V540"/>
    <path d="M395 575V450"/>
    <path d="M477 575V510"/>
    <path d="M641 575V520"/>
    <path d="M723 575V480"/>
    <path d="M805 575V535"/>
    <path d="M968 575V500"/>
    <path d="M1050 575V530"/>
  </g>

  <!-- Accent: the two cases worth an override -->
  <g fill="none" stroke="#14655b" stroke-width="34" stroke-linecap="round">
    <path d="M559 573V267"/>
    <path d="M886 573V292"/>
  </g>
  <circle cx="559" cy="206" r="18" fill="#14655b"/>
  <circle cx="886" cy="231" r="18" fill="#14655b"/>

  <!-- Structure: the dashed threshold and the baseline -->
  <path d="M138 355H1062" fill="none" stroke="#6b6b64" stroke-width="6" stroke-linecap="round" stroke-dasharray="24 12"/>
  <path d="M140 590H1060" fill="none" stroke="#6b6b64" stroke-width="8" stroke-linecap="round"/>
</svg>
```

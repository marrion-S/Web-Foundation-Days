# QuickNotes

QuickNotes is a small note-taking web app built with plain HTML, CSS and JavaScript. You type a note, pick a category (Personal, Work or Study) and add it to your list. Each note appears as a colour-coded card with its category, the date and time it was created and a Delete button. Your notes are saved in the browser, so they are still there after you refresh the page, and a search box lets you find them quickly.

## Features

- Add notes with a category: Personal, Work or Study
- Each note shows its text, a category label, the date and time it was created, and a Delete button
- Colour-coded cards: teal for Personal, dark red for Work and blue for Study
- Validation: empty notes and notes over 200 characters show an error message
- Delete any single note
- Live search that filters notes as you type (not case-sensitive), with a "No notes match your search." message
- Note count that reads correctly for none, one or many notes
- Notes saved to `localStorage`, so they survive a page refresh
- "Clear all" button that asks for confirmation before deleting every note
- Responsive layout: the form stacks vertically on screens 600px wide or narrower

## How to run locally

1. Clone the repository:
   ```
   git clone https://github.com/marrion-S/quicknotes-app.git
   ```
2. Open the `quicknotes-app` folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server** (install the Live Server extension first if you do not have it). You can also double-click `index.html` to open it in your browser.

No installation or build step is needed.

## What I learned

- How to structure a page with semantic HTML (`header`, `main`, `section`, `footer`) and connect every input to a `label` using matching `for` and `id` values.
- How to lay out a form with Flexbox and use a `@media (max-width: 600px)` rule to make it stack on small screens.
- How to keep my data in an array of objects and write a `render()` function that rebuilds the list from that array, so the screen always matches the data.
- Why user text should be added with `textContent` and `createElement` instead of `innerHTML`: it stops pasted HTML from running as code.
- How `localStorage` works with `JSON.stringify` and `JSON.parse` to save and load data, and why loading should be wrapped in `try/catch` in case the saved data is broken.
- How to work in small steps and make a separate Git commit after each task, so the history shows how the project grew.

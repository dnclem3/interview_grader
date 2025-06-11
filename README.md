# Interview Feedback Helper

A lightweight tool to run quick mock interview sessions. It provides a small question bank, a simple evaluation rubric, and a session summary that can be copied for sharing.
The question bank in `docs/script.js` uses an object keyed by category so each session can filter questions easily.

## Usage

Install dependencies with `npm install` and open `docs/index.html` in a browser. React is loaded from a CDN so no build step is required. You can also run `npm start` to serve the `docs` folder locally and `npm run deploy` to publish it to GitHub Pages.

1. Select a category and number of questions.
2. The rubric adapts to the question type (e.g., STAR for behavioral questions).
3. Score each response from 1–5 and add notes if desired.
4. View the session summary and copy it to share feedback.

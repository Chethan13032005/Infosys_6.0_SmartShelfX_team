# SmartShelfX - Installation Guide

This guide ensures you can run SmartShelfX on your local machine without errors.

> **Note:** "Google Antigravity" is a search engine easter egg. This guide uses standard industry tools (Node.js & Vite) to run your application.

## Prerequisites

1.  **Node.js**: Install the "LTS" version from [nodejs.org](https://nodejs.org/).
2.  **Git**: Install from [git-scm.com](https://git-scm.com/) (to push your code later).

---

## Step 1: Local Setup

1.  Download all the project files into a folder named `smartshelfx`.
2.  Open your terminal (Command Prompt or Terminal) in this folder.
3.  Install the required dependencies by running:
    ```bash
    npm install
    ```
    *(This uses the `package.json` file I created to download React, Lucide Icons, Google AI SDK, etc.)*

## Step 2: Configure API Key

1.  Create a new file in the root folder named `.env` (no name, just the extension).
2.  Open it and paste your Google Gemini API Key:
    ```env
    API_KEY=your_actual_key_starting_with_AIzaSy...
    ```
    *(Get a free key at https://aistudio.google.com/)*

## Step 3: Run the App

1.  In your terminal, run:
    ```bash
    npm run dev
    ```
2.  The terminal will show a link, usually `http://localhost:5173`.
3.  Click that link to open the app in your browser.

---

## How to "Push to Git" (GitHub)

If you want to save this online or share it:

1.  Create an account at [GitHub.com](https://github.com).
2.  Create a **New Repository**.
3.  In your local terminal (inside the `smartshelfx` folder), run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of SmartShelfX"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

## Troubleshooting

*   **Error: "vite is not recognized"**: Ensure you ran `npm install` first.
*   **Blank Screen**: Check the browser console (F12). If it mentions "process is not defined", ensure you are using the `vite.config.ts` file provided in this update.
*   **AI Not Working**: Ensure your `.env` file exists and has the correct `API_KEY`. Restart the server (`Ctrl+C`, then `npm run dev`) after changing the `.env` file.

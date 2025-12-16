# SmartShelfX - Local Setup & Deployment Guide

This guide will help you set up the SmartShelfX application on your local machine from scratch.

## Prerequisites

1.  **Node.js:** (Version 18 or higher recommended). Download from [nodejs.org](https://nodejs.org/).
2.  **npm:** (Included with Node.js).
3.  **Google Gemini API Key:** Get one for free at [aistudio.google.com](https://aistudio.google.com/).

---

## Step 1: Create the Project

Open your terminal or command prompt and run the following commands:

```bash
# Create a new Vite project (faster than Create React App)
npm create vite@latest smartshelfx -- --template react-ts

# Navigate into the project directory
cd smartshelfx

# Install dependencies
npm install
```

## Step 2: Install Required Libraries

Install the specific packages used in this project:

```bash
# Routing, Icons, Charts, AI SDK, and CSS utilities
npm install react-router-dom lucide-react recharts @google/genai clsx tailwind-merge
```

## Step 3: Configure Tailwind CSS

1.  **Install Tailwind dependencies:**
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```

2.  **Update `tailwind.config.js`:**
    Replace the content of `tailwind.config.js` with:
    ```javascript
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          fontFamily: {
             sans: ['Inter', 'sans-serif'],
          },
          animation: {
            'fade-in': 'fadeIn 0.4s ease-out forwards',
            'scale-up': 'scaleUp 0.2s ease-out forwards',
            'slide-in': 'slideInRight 0.3s ease-out forwards',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            scaleUp: {
              '0%': { opacity: '0', transform: 'scale(0.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
            },
            slideInRight: {
              '0%': { transform: 'translateX(100%)', opacity: '0' },
              '100%': { transform: 'translateX(0)', opacity: '1' },
            }
          }
        },
      },
      plugins: [],
    }
    ```

3.  **Update `src/index.css`:**
    Add the Tailwind directives to the top of the file:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    body {
      background-color: #f8fafc; /* Slate-50 */
    }
    ```

## Step 4: Add Project Files

1.  **Structure:** Create the following folders inside `src/`:
    *   `components/`
    *   `context/`
    *   `pages/`
    *   `services/`

2.  **Copy Code:** Copy the code provided in the project files into their respective locations (e.g., `App.tsx` goes to `src/App.tsx`, `Inventory.tsx` goes to `src/pages/Inventory.tsx`).

## Step 5: Configure Environment Variables (API Key)

For security, we do not hardcode the API key.

1.  Create a file named `.env` in the **root** folder (next to `package.json`).
2.  Add your Google Gemini API key:

```env
VITE_API_KEY=your_actual_google_api_key_here
```

3.  **Important Code Adjustment:**
    Since Vite uses `import.meta.env` instead of `process.env`, you may need to update `services/geminiService.ts`:

    *Change:*
    `const API_KEY = process.env.API_KEY || '';`
    
    *To:*
    `const API_KEY = import.meta.env.VITE_API_KEY || '';`

    *(Note: If you are using Create-React-App or Webpack, use `REACT_APP_API_KEY` and `process.env.REACT_APP_API_KEY`).*

## Step 6: Run the Application

Now you are ready to launch!

```bash
npm run dev
```

1.  The terminal will show a local URL (usually `http://localhost:5173`).
2.  Open that URL in your browser.
3.  **Login Credentials (Demo):**
    *   **Admin:** `admin@smartshelfx.com`
    *   **Manager:** `manager@smartshelfx.com`
    *   **Vendor:** `sales@techsolutions.com`

---

## Deployment (Optional)

To deploy this online (e.g., via Vercel or Netlify):

1.  **Build:** Run `npm run build`. This creates a `dist` folder.
2.  **Deploy:** Upload this folder to your hosting provider.
3.  **Environment:** Ensure you add your `API_KEY` in the hosting provider's "Environment Variables" settings.


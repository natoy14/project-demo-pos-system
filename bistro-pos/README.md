# Bistro POS

A single-file React demo of a Point of Sale app for small restaurants/cafes —
menu grid, live cart, tax/discount calc, and a checkout + receipt flow.
Built with React, Tailwind CSS, and lucide-react icons.

The whole app lives in **`src/BistroPOS.jsx`**. Everything else in this repo
is just the minimal Vite scaffold needed to run and deploy that one file.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Put it on GitHub

```bash
cd bistro-pos
git init
git add .
git commit -m "Bistro POS demo"
git branch -M main
git remote add origin https://github.com/<your-username>/project-demo-pos-system.git
git push -u origin main
```

## Get a live URL

You have three easy options — pick one.

### Option A: GitHub Pages (free, uses the included workflow)

1. Push to GitHub (above).
2. In your repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push to `main` (or re-run the "Deploy to GitHub Pages" action under the **Actions** tab).
4. Your app will be live at `https://<your-username>.github.io/project-demo-pos-system/`.

> Note: `vite.config.js` sets `base: "/project-demo-pos-system/"` to match GitHub Pages'
> subpath. If you rename the repo, update that value to match
> (`/your-repo-name/`).

### Option B: Vercel (free, fastest, auto-deploys on every push)

1. Push to GitHub (above).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Vite**. Leave build settings as default.
4. Deploy — you'll get a URL like `https://bistro-pos.vercel.app`.

### Option C: Netlify (free, drag-and-drop or GitHub-connected)

1. Push to GitHub (above).
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**.
3. Build command: `npm run build`, publish directory: `dist`.
4. Deploy — you'll get a URL like `https://bistro-pos.netlify.app`.

## Project structure

```
bistro-pos/
├── src/
│   ├── BistroPOS.jsx   # the entire POS app (this is the file to edit)
│   ├── main.jsx        # React entry point, just mounts BistroPOS
│   └── index.css       # Tailwind directives
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .github/workflows/deploy.yml   # auto-deploy to GitHub Pages on push
```

# 🚀 Portfolio Deployment Guide — Sahukari Varshitha

This guide provides step-by-step instructions to deploy your portfolio website live on the internet for free using **GitHub Pages**, **Vercel**, or **Netlify**.

---

## Option 1: Deploy with GitHub Pages (Recommended - 2 Minutes)

GitHub Pages is free, built into GitHub, and automatically updates every time you push code.

### Step 1: Initialize Git and Push to GitHub
Open your terminal in `EVproject` directory and run:

```bash
# 1. Initialize Git repository
git init

# 2. Add files and commit
git add .
git commit -m "Initial commit: Sahukari Varshitha Portfolio with Consistent Hashing Visualizer"

# 3. Rename branch to main
git branch -M main

# 4. Link your remote GitHub repository (replace with your repo link if creating a new one e.g. portfolio)
git remote add origin https://github.com/varshitha-sahukari/portfolio.git

# 5. Push to GitHub
git push -u origin main
```

*(Note: If you haven't created the repository on GitHub yet, go to [github.com/new](https://github.com/new) and create a repository named `portfolio` or `varshitha-sahukari.github.io`)*

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub: `https://github.com/varshitha-sahukari/portfolio`
2. Click on **Settings** (top navigation tab).
3. On the left sidebar, click **Pages**.
4. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
5. Under **Branch**, select **`main`** and folder `/ (root)`.
6. Click **Save**.

🎉 **Your website will be live in ~60 seconds** at:
`https://varshitha-sahukari.github.io/portfolio/`

*(If named `varshitha-sahukari.github.io`, it will be live directly at `https://varshitha-sahukari.github.io/`)*

---

## Option 2: Deploy with Vercel (1 Click / Zero Config)

Vercel provides ultra-fast global CDN hosting and custom domain support.

### Method A: Via Vercel Web Dashboard
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.
3. Import your GitHub repository (`portfolio` or `EVproject`).
4. Keep framework preset as **Other / Static HTML**.
5. Click **Deploy**.

### Method B: Via Terminal CLI
Run in terminal:
```bash
npx vercel
```
Follow the interactive prompts and accept defaults.

🎉 Your site will be live instantly with a free `.vercel.app` URL!

---

## Option 3: Deploy with Netlify

1. Go to [app.netlify.com](https://app.netlify.com/).
2. Drag and drop your project folder (`EVproject` or `portfolio`) into the Netlify dashboard upload box.
3. Your site is live instantly!

---

## 🌟 What's Included in your Refined Portfolio:
- **Interactive Consistent Hashing Ring**: Test server additions/removals, key tracing (`user_123`), and Virtual Nodes ($V_n$) overlay.
- **Dark / Light Mode Toggle**: Remembers user choice via `localStorage`.
- **Modern Responsive Design**: Crafted with Bricolage Grotesque & Plus Jakarta Sans typography.
- **Copy Email Toast**: Instant clipboard feedback button.
- **Project Filter Tabs**: Filter by Backend, Distributed Systems, and ML.
- **SEO & Social Cards**: Pre-configured JSON-LD structured data and OpenGraph tags.

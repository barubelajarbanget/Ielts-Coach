# IELTS Coach (GitHub Pages edition)

Free, static web app. Works on iPhone and Android as an installable web app (PWA).

## Files
- `index.html` – the app
- `shim.js` – connects the app to the question bank, an optional Gemini key, browser speech input and downloads
- `data/questions.json` – question bank (starts small, grows daily)
- `scripts/generate.mjs` + `.github/workflows/update-questions.yml` – GitHub Action that adds new AI-written questions every day
- `manifest.webmanifest`, `sw.js`, `icons/` – make the app installable and available offline

## Publish (about 10 minutes)
1. Create a free GitHub account, then a **public** repository named `ielts-coach` (GitHub Pages on the free plan needs a public repo).
2. Upload every file and folder from this package. If your browser cannot drag the hidden `.github` folder, use **Add file > Create new file**, type `.github/workflows/update-questions.yml` as the name and paste the file's contents.
3. Open **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. After a minute your app is live at `https://YOUR-USERNAME.github.io/ielts-coach/`.

## Turn on daily AI questions (optional, free tier)
1. Create a free API key in Google AI Studio.
2. In your repo: **Settings > Secrets and variables > Actions > New repository secret**. Name `GEMINI_API_KEY`, paste the key.
3. Open the **Actions** tab, choose **Update question bank**, press **Run workflow**. It then runs every day by itself.
4. If the run reports model errors, check the current model name in AI Studio and set `GEMINI_MODEL` in the workflow file.

Never put an API key inside any file in the repo. The repo is public.

## Install on a phone
- iPhone (Safari): Share button > **Add to Home Screen**.
- Android (Chrome): menu > **Install app** or **Add to Home screen**.

## Notes
- Progress is saved on each device. Use **Export / Import progress** in Settings to back up or move it.
- Writing and Speaking scoring needs an AI key. Each learner can paste their own free Gemini key in Settings (stored only in their browser). Without a key the app still gives practice questions from the bank.
- Free-tier limits and model names change. Check them before you launch.

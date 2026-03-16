# ✦ Inspiration — Quote App

Discover inspiring quotes in **English**, **Hindi** (Kavita, Dohe, Muhavare), **Sanskrit** (Shlokas with Hindi translations), and **Urdu** (Shayari in Hindi).

## Features

- 🔄 **Rotate Button** — Get a new quote every time
- ❤️ **Like / 👎 Dislike** — Rate quotes to train the AI
- 🤖 **Smart Recommendations** — The engine learns your taste over time
- 🏷️ **Category Word Map** — Filter by specific categories
- 📝 **Notion Integration** — Every quote auto-saves to your Notion database
- 📱 **PWA Support** — Install on iPhone/iPad as a native-feeling app

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
cd quote-inspiration-app
git init
git add .
git commit -m "Initial commit — Inspiration Quote App"
gh repo create quote-inspiration-app --public --push --source .
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and click **"Add New... → Project"**
2. Import your `quote-inspiration-app` GitHub repo
3. Add these **Environment Variables** in Vercel project settings:
   - `NOTION_API_KEY` — Your Notion integration token
   - `NOTION_DATABASE_ID` — `025667d68ca144fd9099ecb76822b59e`
4. Click **Deploy**

### Step 3: Set up Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a new integration — name it "Quote App"
3. Copy the **Internal Integration Secret** → paste as `NOTION_API_KEY` in Vercel
4. Go to your **"Quote Collection - Nitesh"** database in Notion
5. Click **•••** → **Connections** → Add your "Quote App" integration

### Step 4: Install as App on iPhone/iPad

1. Open the Vercel URL in Safari on your device
2. Tap the **Share** button (square with arrow)
3. Tap **"Add to Home Screen"**
4. Now it works like a native app!

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

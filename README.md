# Autonomous Content Factory

---

## Project Title
**Autonomous Content Factory** — AI-Powered Multi-Platform Content Generation Pipeline

---

## The Problem

Marketing teams waste hours manually rewriting the same content for every platform — once for a blog, once for LinkedIn, once for a newsletter. Every rewrite introduces factual errors and tone inconsistencies, and every product launch gets delayed waiting for platform-specific content to be ready.

---

## The Solution

A three-agent AI pipeline where a single source document is first verified for facts, transformed into platform-specific content, and then quality-checked by an editorial agent — automatically and consistently.

**Agent 1 — Fact-Check & Research ("The Analytical Brain")**
Reads the raw source document and extracts a verified Fact-Sheet (JSON) with product name, features, target audience, value proposition, and flags any unclear statements. This becomes the single source of truth.

**Agent 2 — Creative Copywriter ("The Voice")**
Reads only the verified Fact-Sheet and generates three content formats simultaneously:
- ✍️ 500-word Blog Post (professional tone, markdown formatted)
- 🔗 5-post Social Media Thread (punchy, under 280 chars each)
- 📧 1-paragraph Email Teaser (warm, direct, 60–100 words)

Agent 2 cannot invent features — it is strictly grounded in the Fact-Sheet, ensuring zero factual drift across all platforms.

**Agent 3 — Editor-in-Chief ("The Gatekeeper")**
Reviews all drafts produced by Agent 2 against the original Fact-Sheet:
- Runs hallucination checks — flags invented statistics or unsupported claims
- Audits tone for each content type
- If content is rejected, sends correction notes back to Agent 2
- Feedback loop runs up to 2 revision cycles automatically
- Provides a quality score (0–100) per content type

```
Source Doc
    ↓
[Agent 1: Fact-Check] → Fact-Sheet (JSON)
    ↓
[Agent 2: Copywriter] → Blog + Social + Email (drafts)
    ↓
[Agent 3: Editor-in-Chief] → Quality Check + Scores
    ↓ (if rejected, correction notes sent back to Agent 2)
[Agent 2: Revision] → Revised drafts (up to 2 cycles)
    ↓
Final Verified Content
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Language** | JavaScript |
| **Framework** | React 18 + Vite 5 |
| **Styling** | Custom CSS (Bebas Neue + JetBrains Mono + Outfit fonts) |
| **AI API** | Anthropic Claude API (`/v1/messages`) |
| **Model** | `claude-sonnet-4-20250514` |
| **State Management** | React Hooks (`useState`) |
| **Build Tool** | Vite |
| **Database** | None |

---

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- An Anthropic API key — get one free at [console.anthropic.com](https://console.anthropic.com)

### Step 1 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/autonomous-content-factory.git
cd autonomous-content-factory
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Add your API key
Create a `.env` file in the root directory:
```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then open `src/services/api.js` and update the headers:
```js
'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
```

### Step 4 — Run the project
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 5 — Use the app
1. Paste any product brief or source document into the text area
2. Click **Run Pipeline**
3. Watch Agent 1 extract the Fact-Sheet, Agent 2 generate all three content formats, and Agent 3 review and score the output
4. Switch between Blog Post, Social Thread, and Email Teaser tabs
5. Click **Copy** to copy any output

> ⚠️ Never commit your `.env` file or API key to GitHub. It is already listed in `.gitignore`.

---


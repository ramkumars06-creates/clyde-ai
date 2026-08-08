# Clyde AI Chatbot & Canvas Workspace 🚀

**Clyde** is a modern, high-aesthetic AI chatbot web application inspired by Anthropic's Claude. It features Claude's iconic warm serif design language, dynamic **Artifacts** split-screen canvas, **Projects & Workspaces** knowledge base, multi-model engine (Sonnet, Haiku, Opus, Thinking), and math/code rendering.

---

## 🌟 Key Features

- 🎨 **Claude Warm & Obsidian Design System**: Custom theme switcher supporting Warm Sand Light Mode (`#fbf9f6`) & Obsidian Charcoal Dark Mode (`#181816`).
- ⚡ **Artifacts Split-Screen Canvas**: Interactive side panel rendering live HTML web applications, SVG graphics, and Mermaid sequence diagrams.
- 🧠 **Multi-Model Engine**:
  - **Clyde 3.5 Sonnet**: Default for complex reasoning and web app creation.
  - **Clyde Thinking**: Exposes step-by-step inner reasoning monologue inside a collapsible drawer before answering.
  - **Clyde 3.5 Haiku & Clyde 3 Opus**: Fast responses and deep creative writing.
- 📁 **Projects & Workspaces**: Create dedicated workspaces with custom system instructions and document knowledge base.
- 📐 **Math & Code Rendering**: KaTeX LaTeX math equation parsing (`\(...\)` and `\[...\]`) and syntax-highlighted code blocks with copy/download buttons.
- 🔑 **Flexible Backend**: Works out of the box with the built-in Clyde Simulator Engine, plus optional live Gemini or OpenAI API Key support.

---

## 📦 How to Deploy to GitHub Pages (Free Public Hosting)

Deploying Clyde to GitHub Pages takes less than 1 minute:

### Option A: Via GitHub Web Interface (Drag & Drop / Upload)

1. Go to [GitHub.com](https://github.com) and click **New Repository**.
2. Name your repository `clyde-ai` (or any name you prefer) and set visibility to **Public**.
3. Upload all files from this folder (`index.html`, `index.css`, `app.js`, `clyde-engine.js`, `artifacts-panel.js`, `README.md`).
4. Go to **Repository Settings** -> **Pages**.
5. Under **Build and deployment** -> **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
6. GitHub will generate your live public link in ~30 seconds:
   `https://<your-username>.github.io/clyde-ai/`

---

## 🚀 Running Locally

If you want to run Clyde locally on your machine:

```bash
# Python 3
python -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.

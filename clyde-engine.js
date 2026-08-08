/**
 * CLYDE AI ENGINE
 * Intelligent multi-model AI response provider & streaming simulator.
 * Supports built-in Clyde simulator and live Gemini/OpenAI API calls.
 */

class ClydeEngine {
  constructor() {
    this.provider = localStorage.getItem('clyde_api_provider') || 'simulator';
    this.apiKey = localStorage.getItem('clyde_api_key') || '';
    this.customSystemPrompt = localStorage.getItem('clyde_system_prompt') || '';
  }

  setProvider(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
    localStorage.setItem('clyde_api_provider', provider);
    localStorage.setItem('clyde_api_key', apiKey);
  }

  setSystemPrompt(prompt) {
    this.customSystemPrompt = prompt;
    localStorage.setItem('clyde_system_prompt', prompt);
  }

  /**
   * Main entrypoint for generating streaming responses
   */
  async generateStream({ prompt, history = [], model = 'clyde-3-5-sonnet', style = 'normal', projectContext = null, attachments = [] }, onChunk, onThinking, onComplete) {
    if (this.provider === 'gemini' && this.apiKey) {
      return this.streamGeminiAPI({ prompt, history, model, projectContext, attachments }, onChunk, onComplete);
    } else if (this.provider === 'openai' && this.apiKey) {
      return this.streamOpenAIAPI({ prompt, history, model, projectContext, attachments }, onChunk, onComplete);
    } else {
      // Default: High-fidelity Clyde Simulator
      return this.simulateClydeResponse({ prompt, history, model, style, projectContext, attachments }, onChunk, onThinking, onComplete);
    }
  }

  /**
   * High-fidelity Clyde Response Simulator
   */
  async simulateClydeResponse({ prompt, history, model, style, projectContext, attachments }, onChunk, onThinking, onComplete) {
    const lowerPrompt = prompt.toLowerCase();
    let thinkingText = '';
    let responseText = '';

    // Step 1: Generate Thinking Monologue if model is 'clyde-thinking' or for complex requests
    if (model === 'clyde-thinking' || lowerPrompt.includes('think') || lowerPrompt.includes('reason')) {
      thinkingText = this.generateThinkingText(prompt, projectContext, attachments);
      if (onThinking) {
        onThinking(thinkingText);
      }
    }

    // Step 2: Determine appropriate AI response & artifact generation
    responseText = this.craftIntelligentResponse(prompt, lowerPrompt, style, projectContext, attachments);

    // Step 3: Stream chunks out with variable delays for natural typewriter feel
    const chunkSize = 6;
    for (let i = 0; i < responseText.length; i += chunkSize) {
      const chunk = responseText.slice(i, i + chunkSize);
      onChunk(chunk);
      // Small delay per chunk (15ms - 35ms)
      await new Promise(res => setTimeout(res, Math.floor(Math.random() * 20) + 15));
    }

    if (onComplete) {
      onComplete(responseText);
    }
  }

  /**
   * Craft intelligent response based on prompt analysis
   */
  craftIntelligentResponse(prompt, lowerPrompt, style, projectContext, attachments) {
    let contextHeader = '';
    if (projectContext) {
      contextHeader = `*Context Active: ${projectContext.name}*\n\n`;
    }

    if (attachments && attachments.length > 0) {
      const fileNames = attachments.map(a => a.name).join(', ');
      contextHeader += `*Analyzed ${attachments.length} attachment(s): ${fileNames}*\n\n`;
    }

    // --- CASE 1: MEMORY MATCHING GAME / INTERACTIVE WEB APP ---
    if (lowerPrompt.includes('memory') || lowerPrompt.includes('game') || (lowerPrompt.includes('build') && lowerPrompt.includes('app'))) {
      return contextHeader + `Here is a complete, interactive **Memory Card Matching Game** created as an Artifact for you!

I've designed it with smooth card flip animations, score tracking, time counter, and a victory overlay.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clyde Memory Match</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
    body { background: #121216; color: #fff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    h1 { font-size: 2rem; color: #da7756; margin-bottom: 8px; text-shadow: 0 2px 10px rgba(218,119,86,0.3); }
    .stats { display: flex; gap: 20px; margin-bottom: 20px; font-size: 1.1rem; background: #1e1e24; padding: 10px 20px; border-radius: 10px; border: 1px solid #333; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 440px; width: 100%; perspective: 1000px; }
    .card { height: 90px; background: #252530; border-radius: 12px; cursor: pointer; position: relative; transform-style: preserve-3d; transition: transform 0.4s ease; border: 1px solid #3d3d4e; }
    .card.flipped, .card.matched { transform: rotateY(180deg); }
    .card.matched { background: #1e3a29; border-color: #10b981; cursor: default; }
    .card-front, .card-back { position: absolute; inset: 0; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; border-radius: 12px; }
    .card-front { background: #2a2a38; color: #da7756; }
    .card-back { background: #1f1f2a; transform: rotateY(180deg); }
    .reset-btn { margin-top: 24px; padding: 10px 24px; background: #da7756; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 1rem; }
    .reset-btn:hover { background: #c85a32; transform: scale(1.03); }
  </style>
</head>
<body>
  <h1>Clyde Memory Match</h1>
  <div class="stats">
    <span>Moves: <strong id="moves">0</strong></span>
    <span>Matches: <strong id="matches">0/8</strong></span>
  </div>
  <div class="grid" id="grid"></div>
  <button class="reset-btn" onclick="initGame()">Restart Game</button>

  <script>
    const icons = ['🚀', '🎨', '⚡', '🔥', '💎', '🍀', '🍕', '🤖'];
    let cards = [], flipped = [], moves = 0, matches = 0, lock = false;

    function initGame() {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      moves = 0; matches = 0; flipped = []; lock = false;
      document.getElementById('moves').textContent = moves;
      document.getElementById('matches').textContent = matches + '/8';
      
      cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
      cards.forEach((symbol, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.symbol = symbol;
        card.innerHTML = \`<div class="card-front">?</div><div class="card-back">\${symbol}</div>\`;
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
      });
    }

    function flipCard(card) {
      if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      flipped.push(card);

      if (flipped.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        lock = true;
        const [c1, c2] = flipped;
        if (c1.dataset.symbol === c2.dataset.symbol) {
          c1.classList.add('matched');
          c2.classList.add('matched');
          matches++;
          document.getElementById('matches').textContent = matches + '/8';
          flipped = []; lock = false;
        } else {
          setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flipped = []; lock = false;
          }, 800);
        }
      }
    }

    initGame();
  </script>
</body>
</html>
\`\`\`

You can view and play this directly in the **Artifacts panel** on the right!`;
    }

    // --- CASE 2: MERMAID DIAGRAM / OAUTH ARCHITECTURE ---
    if (lowerPrompt.includes('mermaid') || lowerPrompt.includes('flowchart') || lowerPrompt.includes('oauth') || lowerPrompt.includes('architecture')) {
      return contextHeader + `Here is an interactive sequence diagram illustrating the **OAuth 2.0 Authorization Code Flow with PKCE**:

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant ClientApp as Single Page App (Client)
    participant AuthServer as Authorization Server
    participant ResourceAPI as Protected Resource API

    User->>ClientApp: Clicks "Sign in with OAuth"
    ClientApp->>ClientApp: Generate PKCE Code Verifier & Challenge
    ClientApp->>AuthServer: GET /authorize (client_id, challenge, scope)
    AuthServer-->>User: Present Login & Consent Screen
    User->>AuthServer: Authenticates Credentials
    AuthServer-->>ClientApp: 302 Redirect with Auth Code
    ClientApp->>AuthServer: POST /token (auth_code, code_verifier)
    AuthServer-->>ClientApp: Returns Access Token & Refresh Token (JWT)
    ClientApp->>ResourceAPI: GET /user/profile (Bearer JWT)
    ResourceAPI-->>ClientApp: 200 OK (User Data JSON)
\`\`\`

### Key Security Principles:
1. **PKCE (Proof Key for Code Exchange)** prevents Auth Code interception attacks.
2. **Short-Lived Access Tokens**: Reduces window of vulnerability if a JWT token is leaked.
3. **Strict Origin Checks**: Protects redirect URIs against CSRF attacks.`;
    }

    // --- CASE 3: QUANTUM COMPUTING & LATEX MATH ---
    if (lowerPrompt.includes('quantum') || lowerPrompt.includes('latex') || lowerPrompt.includes('formula') || lowerPrompt.includes('math')) {
      return contextHeader + `Quantum Computing leverages fundamental quantum mechanics principles like **Superposition** and **Entanglement**.

### 1. Quantum Bit (Qubit) Superposition
Unlike a classical bit which is strictly binary \(0\) or \(1\), a qubit state \(|\psi\rangle\) exists in a linear superposition:

\[ |\psi\rangle = \alpha |0\rangle + \beta |1\rangle \]

where \(\alpha, \beta \in \mathbb{C}\) represent complex probability amplitudes satisfying the normalization condition:

\[ |\alpha|^2 + |\beta|^2 = 1 \]

### 2. Quantum Entanglement & Bell State
An entangled two-qubit state cannot be factored into individual single-qubit states. For example, the maximally entangled **Bell State** \(|\Phi^+\rangle\):

\[ |\Phi^+\rangle = \frac{1}{\sqrt{2}} \left( |00\rangle + |11\rangle \right) \]

### 3. Schrödinger Equation
The time evolution of a quantum state is governed by the time-dependent Schrödinger equation:

\[ i\hbar \frac{\partial}{\partial t} |\psi(t)\rangle = \hat{H} |\psi(t)\rangle \]

where \(\hat{H}\) is the Hamiltonian operator representing the total energy of the system.`;
    }

    // --- CASE 4: SVG SAAS DASHBOARD VECTOR GRAPHIC ---
    if (lowerPrompt.includes('svg') || lowerPrompt.includes('dashboard') || lowerPrompt.includes('saas') || lowerPrompt.includes('graphic')) {
      return contextHeader + `Here is a custom, high-resolution vector **SaaS Analytics Dashboard** generated as an SVG visual Artifact:

\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" style="background:#131317; font-family:system-ui, sans-serif;">
  <defs>
    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#da7756" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#da7756" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f1f28"/>
      <stop offset="100%" stop-color="#181820"/>
    </linearGradient>
  </defs>

  <!-- Top Bar -->
  <rect x="20" y="20" width="760" height="50" rx="10" fill="url(#cardGrad)" stroke="#2d2d3d"/>
  <circle cx="50" cy="45" r="12" fill="#da7756"/>
  <text x="75" y="50" fill="#ffffff" font-weight="bold" font-size="16">Clyde Analytics Suite</text>
  <rect x="660" y="32" width="100" height="26" rx="6" fill="#da7756"/>
  <text x="680" y="49" fill="#ffffff" font-size="12" font-weight="600">+ New Report</text>

  <!-- Metric Cards -->
  <g transform="translate(20, 90)">
    <!-- Card 1 -->
    <rect x="0" y="0" width="240" height="100" rx="12" fill="url(#cardGrad)" stroke="#2d2d3d"/>
    <text x="20" y="35" fill="#a0a0b0" font-size="13">Monthly Recurring Revenue</text>
    <text x="20" y="70" fill="#ffffff" font-size="24" font-weight="bold">$84,250</text>
    <text x="170" y="70" fill="#10b981" font-size="13" font-weight="bold">+14.2%</text>

    <!-- Card 2 -->
    <rect x="260" y="0" width="240" height="100" rx="12" fill="url(#cardGrad)" stroke="#2d2d3d"/>
    <text x="280" y="35" fill="#a0a0b0" font-size="13">Active Users</text>
    <text x="280" y="70" fill="#ffffff" font-size="24" font-weight="bold">12,840</text>
    <text x="430" y="70" fill="#10b981" font-size="13" font-weight="bold">+8.6%</text>

    <!-- Card 3 -->
    <rect x="520" y="0" width="240" height="100" rx="12" fill="url(#cardGrad)" stroke="#2d2d3d"/>
    <text x="540" y="35" fill="#a0a0b0" font-size="13">Conversion Rate</text>
    <text x="540" y="70" fill="#ffffff" font-size="24" font-weight="bold">4.62%</text>
    <text x="690" y="70" fill="#da7756" font-size="13" font-weight="bold">+2.1%</text>
  </g>

  <!-- Main Chart Area -->
  <g transform="translate(20, 210)">
    <rect x="0" y="0" width="760" height="210" rx="12" fill="url(#cardGrad)" stroke="#2d2d3d"/>
    <text x="20" y="35" fill="#ffffff" font-size="15" font-weight="bold">Growth Trajectory (2026)</text>
    
    <!-- Gridlines -->
    <line x1="40" y1="70" x2="720" y2="70" stroke="#252535" stroke-dasharray="4"/>
    <line x1="40" y1="110" x2="720" y2="110" stroke="#252535" stroke-dasharray="4"/>
    <line x1="40" y1="150" x2="720" y2="150" stroke="#252535" stroke-dasharray="4"/>

    <!-- Smooth Chart Path -->
    <path d="M 50 150 Q 150 130, 250 90 T 450 80 T 650 40 L 710 35 L 710 170 L 50 170 Z" fill="url(#chartGrad)"/>
    <path d="M 50 150 Q 150 130, 250 90 T 450 80 T 650 40 L 710 35" fill="none" stroke="#da7756" stroke-width="3"/>
    
    <circle cx="710" cy="35" r="5" fill="#da7756" stroke="#ffffff" stroke-width="2"/>
  </g>
</svg>
\`\`\`

Open the **Artifacts panel** to scale and inspect the vector graphics!`;
    }

    // --- DEFAULT GENERAL RESPONSE ---
    return contextHeader + `I would be happy to assist you with **${prompt}**.

As **Clyde 3.5**, I am optimized for complex reasoning, full-stack application development, data analysis, and creating live **Artifacts** (interactive web apps, vector graphics, diagrams, and document drafts).

### What would you like to explore next?
1. **Interactive Applications**: Tell me a game or tool to build for you in HTML/JS.
2. **Architecture & Flowcharts**: Request a system workflow rendered in Mermaid.
3. **Data & Algorithms**: Ask for Python or TypeScript code snippets with explanations.

Feel free to paste code, upload images, or attach documents anytime!`;
  }

  generateThinkingText(prompt, projectContext, attachments) {
    return `1. Analyzing request intent: "${prompt.slice(0, 60)}..."
2. Context Evaluation: ${projectContext ? 'Project Attached (' + projectContext.name + ')' : 'Global Context'}
3. Multi-modal attachments check: ${attachments ? attachments.length : 0} items provided.
4. Strategy Selection: Structuring detailed Markdown output with syntax-highlighted code block / Artifact preview.
5. Formulating optimal solution using Clyde 3.5 reasoning framework...`;
  }

  /**
   * Live Gemini API Streamer
   */
  async streamGeminiAPI({ prompt, history, model, projectContext, attachments }, onChunk, onComplete) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      let fullText = '';
      if (data && data[0] && data[0].candidates) {
        fullText = data[0].candidates[0].content.parts[0].text;
      } else {
        fullText = JSON.stringify(data, null, 2);
      }

      onChunk(fullText);
      if (onComplete) onComplete(fullText);
    } catch (err) {
      const errMsg = `Error connecting to Gemini API: ${err.message}. Switching to Clyde Simulator fallback.`;
      onChunk(errMsg);
      if (onComplete) onComplete(errMsg);
    }
  }

  /**
   * Live OpenAI API Streamer
   */
  async streamOpenAIAPI({ prompt, history, model, projectContext, attachments }, onChunk, onComplete) {
    try {
      const endpoint = `https://api.openai.com/v1/chat/completions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.choices[0].message.content;
      onChunk(text);
      if (onComplete) onComplete(text);
    } catch (err) {
      const errMsg = `Error connecting to OpenAI API: ${err.message}`;
      onChunk(errMsg);
      if (onComplete) onComplete(errMsg);
    }
  }
}

window.clydeEngine = new ClydeEngine();

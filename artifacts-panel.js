/**
 * CLYDE ARTIFACTS PANEL MANAGER
 * Handles split-screen canvas rendering for HTML interactive web apps,
 * SVG graphics, Mermaid diagrams, and code inspection.
 */

class ArtifactsPanelManager {
  constructor() {
    this.panel = document.getElementById('artifacts-panel');
    this.badgeName = document.getElementById('artifact-type-name');
    this.title = document.getElementById('artifact-title');
    this.iframe = document.getElementById('artifact-iframe');
    this.mermaidContainer = document.getElementById('artifact-mermaid-render');
    this.svgContainer = document.getElementById('artifact-svg-render');
    this.markdownContainer = document.getElementById('artifact-markdown-render');
    this.codeContainer = document.getElementById('artifact-code-container');
    this.previewContainer = document.getElementById('artifact-preview-container');
    this.codeBlock = document.getElementById('artifact-code-block');

    this.tabPreview = document.getElementById('artifact-tab-preview');
    this.tabCode = document.getElementById('artifact-tab-code');
    this.copyBtn = document.getElementById('artifact-copy-btn');
    this.downloadBtn = document.getElementById('artifact-download-btn');
    this.expandBtn = document.getElementById('artifact-expand-btn');
    this.closeBtn = document.getElementById('artifact-close-btn');

    this.currentArtifact = null;
    this.initEventListeners();
  }

  initEventListeners() {
    this.tabPreview.addEventListener('click', () => this.switchView('preview'));
    this.tabCode.addEventListener('click', () => this.switchView('code'));
    this.closeBtn.addEventListener('click', () => this.close());
    this.expandBtn.addEventListener('click', () => this.toggleFullscreen());
    this.copyBtn.addEventListener('click', () => this.copyCode());
    this.downloadBtn.addEventListener('click', () => this.downloadFile());
  }

  openArtifact({ title = 'Artifact Preview', type = 'html', code = '', language = 'html' }) {
    this.currentArtifact = { title, type, code, language };
    
    // Set Header Info
    this.title.textContent = title;
    this.badgeName.textContent = type.toUpperCase() + ' Application';

    // Populate Code View
    this.codeBlock.className = `language-${language}`;
    this.codeBlock.textContent = code;
    if (window.hljs) {
      delete this.codeBlock.dataset.highlighted;
      hljs.highlightElement(this.codeBlock);
    }

    // Populate Preview View based on type
    this.renderPreview(type, code);

    // Open Panel
    this.panel.classList.add('open');
    this.switchView('preview');

    // Notify Canvas badge in navbar
    const dot = document.getElementById('canvas-badge-dot');
    if (dot) dot.classList.remove('hidden');
  }

  renderPreview(type, code) {
    // Reset preview elements
    this.iframe.classList.add('hidden');
    this.mermaidContainer.classList.add('hidden');
    this.svgContainer.classList.add('hidden');
    this.markdownContainer.classList.add('hidden');

    if (type === 'html' || type === 'javascript' || code.includes('<!DOCTYPE html>') || code.includes('<html')) {
      this.iframe.classList.remove('hidden');
      const doc = this.iframe.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
    } else if (type === 'mermaid') {
      this.mermaidContainer.classList.remove('hidden');
      this.mermaidContainer.innerHTML = `<div class="mermaid">${code}</div>`;
      if (window.mermaid) {
        mermaid.contentLoaded();
      }
    } else if (type === 'svg') {
      this.svgContainer.classList.remove('hidden');
      this.svgContainer.innerHTML = code;
    } else if (type === 'markdown' || type === 'md') {
      this.markdownContainer.classList.remove('hidden');
      this.markdownContainer.innerHTML = window.marked ? marked.parse(code) : code;
    } else {
      // Default to code view fallback
      this.switchView('code');
    }
  }

  switchView(view) {
    if (view === 'preview') {
      this.tabPreview.classList.add('active');
      this.tabCode.classList.remove('active');
      this.previewContainer.classList.add('active');
      this.codeContainer.classList.remove('active');
    } else {
      this.tabCode.classList.add('active');
      this.tabPreview.classList.remove('active');
      this.codeContainer.classList.add('active');
      this.previewContainer.classList.remove('active');
    }
  }

  close() {
    this.panel.classList.remove('open');
    this.panel.classList.remove('fullscreen');
  }

  toggleFullscreen() {
    this.panel.classList.toggle('fullscreen');
  }

  copyCode() {
    if (!this.currentArtifact) return;
    navigator.clipboard.writeText(this.currentArtifact.code);
    if (window.showToast) window.showToast('Artifact code copied to clipboard!');
  }

  downloadFile() {
    if (!this.currentArtifact) return;
    const blob = new Blob([this.currentArtifact.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = this.currentArtifact.type === 'html' ? 'html' : this.currentArtifact.type === 'svg' ? 'svg' : 'txt';
    a.download = `clyde-artifact-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('Artifact file downloaded!');
  }
}

window.artifactsPanel = new ArtifactsPanelManager();

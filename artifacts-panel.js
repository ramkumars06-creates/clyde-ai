/**
 * CLYDE ARTIFACTS PANEL MANAGER
 * Handles 3-column right panel switching for live HTML web apps,
 * SVG graphics, Mermaid diagrams, and code inspection.
 */

class ArtifactsPanelManager {
  constructor() {
    this.defaultInfoPanel = document.getElementById('info-panel-default');
    this.canvasContainer = document.getElementById('artifacts-canvas-container');

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
    this.closeBtn = document.getElementById('artifact-close-btn');

    this.currentArtifact = null;
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.tabPreview) this.tabPreview.addEventListener('click', () => this.switchView('preview'));
    if (this.tabCode) this.tabCode.addEventListener('click', () => this.switchView('code'));
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.copyBtn) this.copyBtn.addEventListener('click', () => this.copyCode());
    if (this.downloadBtn) this.downloadBtn.addEventListener('click', () => this.downloadFile());
  }

  openArtifact({ title = 'Artifact Preview', type = 'html', code = '', language = 'html' }) {
    this.currentArtifact = { title, type, code, language };
    
    // Set Header Info
    if (this.title) this.title.textContent = title;
    if (this.badgeName) this.badgeName.textContent = type.toUpperCase() + ' App';

    // Populate Code View
    if (this.codeBlock) {
      this.codeBlock.className = `language-${language}`;
      this.codeBlock.textContent = code;
      if (window.hljs) {
        delete this.codeBlock.dataset.highlighted;
        hljs.highlightElement(this.codeBlock);
      }
    }

    // Populate Preview View
    this.renderPreview(type, code);

    // Switch Right Panel from Info to Artifact Canvas
    if (this.defaultInfoPanel) this.defaultInfoPanel.classList.add('hidden');
    if (this.canvasContainer) this.canvasContainer.classList.remove('hidden');
    this.switchView('preview');
  }

  renderPreview(type, code) {
    if (this.iframe) this.iframe.classList.add('hidden');
    if (this.mermaidContainer) this.mermaidContainer.classList.add('hidden');
    if (this.svgContainer) this.svgContainer.classList.add('hidden');
    if (this.markdownContainer) this.markdownContainer.classList.add('hidden');

    if (type === 'html' || type === 'javascript' || code.includes('<!DOCTYPE html>') || code.includes('<html')) {
      if (this.iframe) {
        this.iframe.classList.remove('hidden');
        const doc = this.iframe.contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
      }
    } else if (type === 'mermaid') {
      if (this.mermaidContainer) {
        this.mermaidContainer.classList.remove('hidden');
        this.mermaidContainer.innerHTML = `<div class="mermaid">${code}</div>`;
        if (window.mermaid) mermaid.contentLoaded();
      }
    } else if (type === 'svg') {
      if (this.svgContainer) {
        this.svgContainer.classList.remove('hidden');
        this.svgContainer.innerHTML = code;
      }
    } else if (type === 'markdown' || type === 'md') {
      if (this.markdownContainer) {
        this.markdownContainer.classList.remove('hidden');
        this.markdownContainer.innerHTML = window.marked ? marked.parse(code) : code;
      }
    } else {
      this.switchView('code');
    }
  }

  switchView(view) {
    if (view === 'preview') {
      if (this.tabPreview) this.tabPreview.classList.add('active');
      if (this.tabCode) this.tabCode.classList.remove('active');
      if (this.previewContainer) this.previewContainer.classList.add('active');
      if (this.codeContainer) this.codeContainer.classList.remove('active');
    } else {
      if (this.tabCode) this.tabCode.classList.add('active');
      if (this.tabPreview) this.tabPreview.classList.remove('active');
      if (this.codeContainer) this.codeContainer.classList.add('active');
      if (this.previewContainer) this.previewContainer.classList.remove('active');
    }
  }

  close() {
    if (this.canvasContainer) this.canvasContainer.classList.add('hidden');
    if (this.defaultInfoPanel) this.defaultInfoPanel.classList.remove('hidden');
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

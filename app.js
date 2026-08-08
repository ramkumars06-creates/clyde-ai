/**
 * CLYDE MAIN APPLICATION CONTROLLER
 * Handles UI interactions, chat management, projects, message rendering,
 * attachments, math parsing, themes, and persistence.
 */

class ClydeApp {
  constructor() {
    this.chats = JSON.parse(localStorage.getItem('clyde_chats')) || [];
    this.projects = JSON.parse(localStorage.getItem('clyde_projects')) || [];
    this.activeChatId = localStorage.getItem('clyde_active_chat') || null;
    this.activeProjectId = null;

    this.activeModel = 'clyde-3-5-sonnet';
    this.activeStyle = 'normal';
    this.attachments = [];
    this.isGenerating = false;

    this.initDOM();
    this.initTheme();
    this.initEventListeners();
    this.loadState();
    this.render();
  }

  initDOM() {
    this.sidebar = document.getElementById('sidebar');
    this.toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    this.expandSidebarBtn = document.getElementById('expand-sidebar-btn');
    this.newChatBtn = document.getElementById('new-chat-btn');

    this.modelPickerBtn = document.getElementById('model-picker-btn');
    this.modelDropdown = document.getElementById('model-dropdown');
    this.selectedModelTitle = document.getElementById('selected-model-title');

    this.welcomeScreen = document.getElementById('welcome-screen');
    this.messagesFeed = document.getElementById('messages-feed');
    this.messagesContainer = document.getElementById('messages-container');

    this.chatInput = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-btn');
    this.uploadBtn = document.getElementById('upload-btn');
    this.fileUploadInput = document.getElementById('file-upload-input');
    this.attachmentsBar = document.getElementById('attachments-preview-bar');
    this.tokenCounter = document.getElementById('token-counter');

    this.historyList = document.getElementById('chat-history-list');
    this.projectsList = document.getElementById('projects-list');
    this.chatSearchInput = document.getElementById('chat-search-input');

    this.activeProjectIndicator = document.getElementById('active-project-indicator');
    this.activeProjectName = document.getElementById('active-project-name');
    this.detachProjectBtn = document.getElementById('detach-project-btn');

    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.themeIcon = document.getElementById('theme-icon');

    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsBtns = document.querySelectorAll('#close-settings-btn, #cancel-settings-btn');
    this.saveSettingsBtn = document.getElementById('save-settings-btn');
    this.apiProviderSelect = document.getElementById('api-provider');
    this.apiKeyInput = document.getElementById('api-key-input');
    this.apiKeyGroup = document.getElementById('api-key-group');
    this.customSystemPromptInput = document.getElementById('custom-system-prompt');
    this.clearDataBtn = document.getElementById('clear-data-btn');
    this.exportChatsBtn = document.getElementById('export-chats-btn');

    this.createProjectBtn = document.getElementById('create-project-btn');
    this.projectModal = document.getElementById('project-modal');
    this.closeProjectBtns = document.querySelectorAll('#close-project-btn, #cancel-project-btn');
    this.saveProjectBtn = document.getElementById('save-project-btn');
    this.projectNameInput = document.getElementById('project-name-input');
    this.projectDescInput = document.getElementById('project-desc-input');
    this.projectInstructionsInput = document.getElementById('project-instructions-input');

    this.toggleCanvasBtn = document.getElementById('toggle-canvas-btn');
  }

  initTheme() {
    const savedTheme = localStorage.getItem('clyde_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  updateThemeIcon(theme) {
    if (this.themeIcon) {
      this.themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) lucide.createIcons();
    }
  }

  initEventListeners() {
    // Sidebar Toggles
    this.toggleSidebarBtn.addEventListener('click', () => this.sidebar.classList.add('collapsed'));
    this.expandSidebarBtn.addEventListener('click', () => this.sidebar.classList.remove('collapsed'));
    this.newChatBtn.addEventListener('click', () => this.createNewChat());

    // Sidebar Navigation Tabs (Chats / Projects)
    document.querySelectorAll('.sidebar-nav-tabs .nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-nav-tabs .nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sidebar-content-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.getElementById(`${target}-panel`).classList.add('active');
      });
    });

    // Model Picker Dropdown
    this.modelPickerBtn.addEventListener('click', () => {
      this.modelPickerBtn.parentElement.classList.toggle('open');
    });

    document.querySelectorAll('.model-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        this.activeModel = opt.dataset.model;
        this.selectedModelTitle.textContent = opt.querySelector('.model-option-name').childNodes[0].textContent.trim();
        this.modelPickerBtn.parentElement.classList.remove('open');
      });
    });

    // Close model picker if clicked outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.model-picker-wrapper')) {
        this.modelPickerBtn.parentElement.classList.remove('open');
      }
    });

    // Starter Prompt Cards
    document.querySelectorAll('.starter-card').forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.dataset.prompt;
        this.chatInput.value = prompt;
        this.sendMessage();
      });
    });

    // Style Chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeStyle = chip.dataset.style;
      });
    });

    // Input Handling & Send
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.chatInput.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 200) + 'px';
      this.updateTokenCounter();
    });

    this.sendBtn.addEventListener('click', () => this.sendMessage());

    // File Upload Attachment
    this.uploadBtn.addEventListener('click', () => this.fileUploadInput.click());
    this.fileUploadInput.addEventListener('change', (e) => this.handleFileUpload(e));

    // Canvas Toggle Button
    this.toggleCanvasBtn.addEventListener('click', () => {
      if (window.artifactsPanel) {
        window.artifactsPanel.panel.classList.toggle('open');
      }
    });

    // Theme Toggle
    this.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('clyde_theme', next);
      this.updateThemeIcon(next);
    });

    // Search History Filter
    this.chatSearchInput.addEventListener('input', (e) => {
      this.filterChatHistory(e.target.value);
    });

    // Settings Modal
    this.settingsBtn.addEventListener('click', () => {
      this.apiProviderSelect.value = localStorage.getItem('clyde_api_provider') || 'simulator';
      this.apiKeyInput.value = localStorage.getItem('clyde_api_key') || '';
      this.customSystemPromptInput.value = localStorage.getItem('clyde_system_prompt') || '';
      this.toggleApiKeyVisibility();
      this.settingsModal.classList.remove('hidden');
    });

    this.apiProviderSelect.addEventListener('change', () => this.toggleApiKeyVisibility());

    this.closeSettingsBtns.forEach(btn => {
      btn.addEventListener('click', () => this.settingsModal.classList.add('hidden'));
    });

    this.saveSettingsBtn.addEventListener('click', () => {
      const provider = this.apiProviderSelect.value;
      const key = this.apiKeyInput.value.trim();
      const prompt = this.customSystemPromptInput.value.trim();
      window.clydeEngine.setProvider(provider, key);
      window.clydeEngine.setSystemPrompt(prompt);
      this.settingsModal.classList.add('hidden');
      this.showToast('Settings saved successfully!');
    });

    this.clearDataBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all chats and workspace data?')) {
        localStorage.clear();
        this.chats = [];
        this.projects = [];
        this.activeChatId = null;
        this.createNewChat();
        this.settingsModal.classList.add('hidden');
        this.showToast('All local storage cleared.');
      }
    });

    this.exportChatsBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.chats, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `clyde-chats-export-${Date.now()}.json`;
      a.click();
      this.showToast('Chats exported to JSON file!');
    });

    // Project Workspace Modal
    this.createProjectBtn.addEventListener('click', () => this.projectModal.classList.remove('hidden'));
    this.closeProjectBtns.forEach(btn => btn.addEventListener('click', () => this.projectModal.classList.add('hidden')));

    this.saveProjectBtn.addEventListener('click', () => {
      const name = this.projectNameInput.value.trim();
      const desc = this.projectDescInput.value.trim();
      const instructions = this.projectInstructionsInput.value.trim();
      if (!name) return alert('Please enter a project name.');

      const newProj = { id: 'proj_' + Date.now(), name, desc, instructions, files: [] };
      this.projects.push(newProj);
      this.saveProjects();
      this.renderProjectsList();
      this.projectModal.classList.add('hidden');
      this.projectNameInput.value = '';
      this.projectDescInput.value = '';
      this.projectInstructionsInput.value = '';
      this.showToast(`Workspace project "${name}" created!`);
    });

    this.detachProjectBtn.addEventListener('click', () => {
      this.activeProjectId = null;
      this.activeProjectIndicator.classList.add('hidden');
      this.showToast('Left project context');
    });

    // Global Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        this.chatSearchInput.focus();
      }
    });
  }

  toggleApiKeyVisibility() {
    if (this.apiProviderSelect.value !== 'simulator') {
      this.apiKeyGroup.classList.remove('hidden');
    } else {
      this.apiKeyGroup.classList.add('hidden');
    }
  }

  loadState() {
    if (!this.activeChatId && this.chats.length > 0) {
      this.activeChatId = this.chats[0].id;
    }
    if (!this.activeChatId) {
      this.createNewChat();
    }
  }

  saveChats() {
    localStorage.setItem('clyde_chats', JSON.stringify(this.chats));
    localStorage.setItem('clyde_active_chat', this.activeChatId);
  }

  saveProjects() {
    localStorage.setItem('clyde_projects', JSON.stringify(this.projects));
  }

  createNewChat() {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: 'New Chat',
      model: this.activeModel,
      style: this.activeStyle,
      createdAt: new Date().toISOString(),
      messages: []
    };
    this.chats.unshift(newChat);
    this.activeChatId = newChat.id;
    this.saveChats();
    this.render();
    this.chatInput.focus();
  }

  getActiveChat() {
    return this.chats.find(c => c.id === this.activeChatId);
  }

  sendMessage() {
    const text = this.chatInput.value.trim();
    if ((!text && this.attachments.length === 0) || this.isGenerating) return;

    const chat = this.getActiveChat();
    if (!chat) return;

    // Set title on first message
    if (chat.messages.length === 0) {
      chat.title = text.slice(0, 30) || 'Attachment Analysis';
    }

    // Create User Message
    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      attachments: [...this.attachments],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chat.messages.push(userMsg);
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    this.attachments = [];
    this.renderAttachmentsPreview();
    this.renderMessagesFeed();

    // Prepare Clyde AI Response placeholder
    const clydeMsgId = 'msg_' + (Date.now() + 1);
    const clydeMsg = {
      id: clydeMsgId,
      role: 'clyde',
      model: this.activeModel,
      content: '',
      thinking: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chat.messages.push(clydeMsg);

    this.isGenerating = true;
    this.sendBtn.classList.add('generating');
    this.sendBtn.innerHTML = `<i data-lucide="square"></i>`;
    if (window.lucide) lucide.createIcons();

    // Scroll to bottom
    this.scrollToBottom();

    // Call Engine Stream
    const projectContext = this.projects.find(p => p.id === this.activeProjectId);

    window.clydeEngine.generateStream(
      {
        prompt: text,
        history: chat.messages,
        model: this.activeModel,
        style: this.activeStyle,
        projectContext,
        attachments: userMsg.attachments
      },
      // On Chunk
      (chunk) => {
        clydeMsg.content += chunk;
        this.updateClydeMessageBubble(clydeMsgId, clydeMsg.content, clydeMsg.thinking);
        this.scrollToBottom();
      },
      // On Thinking
      (thinkingText) => {
        clydeMsg.thinking = thinkingText;
        this.updateClydeMessageBubble(clydeMsgId, clydeMsg.content, clydeMsg.thinking);
      },
      // On Complete
      (fullText) => {
        this.isGenerating = false;
        this.sendBtn.classList.remove('generating');
        this.sendBtn.innerHTML = `<i data-lucide="arrow-up"></i>`;
        if (window.lucide) lucide.createIcons();
        this.saveChats();
        this.renderHistoryList();

        // Check if response contains an Artifact to auto-extract
        this.checkForArtifactsInMessage(fullText);
      }
    );
  }

  updateClydeMessageBubble(msgId, content, thinking) {
    let msgEl = document.getElementById(msgId);
    if (!msgEl) {
      this.renderMessagesFeed();
      return;
    }

    const bubble = msgEl.querySelector('.message-bubble');
    if (!bubble) return;

    let html = '';

    // Render Collapsible Thinking Accordion if present
    if (thinking) {
      html += `
        <div class="thinking-accordion open">
          <div class="thinking-header" onclick="this.parentElement.classList.toggle('open')">
            <i data-lucide="brain"></i> Thought Process & Logic
          </div>
          <div class="thinking-body">${thinking}</div>
        </div>
      `;
    }

    // Parse Markdown text
    const parsedMarkdown = window.marked ? marked.parse(content) : content;
    html += parsedMarkdown;

    bubble.innerHTML = html;

    // Highlight code blocks
    bubble.querySelectorAll('pre code').forEach(block => {
      if (window.hljs && !block.dataset.highlighted) {
        hljs.highlightElement(block);
      }
    });

    // Render KaTeX Math
    if (window.renderMathInElement) {
      renderMathInElement(bubble, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ]
      });
    }

    if (window.lucide) lucide.createIcons();
  }

  checkForArtifactsInMessage(text) {
    // Detect HTML, SVG, or Mermaid code blocks
    const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
    const svgMatch = text.match(/```svg\n([\s\S]*?)\n```/);
    const mermaidMatch = text.match(/```mermaid\n([\s\S]*?)\n```/);

    if (htmlMatch && window.artifactsPanel) {
      window.artifactsPanel.openArtifact({
        title: 'Interactive Web Application',
        type: 'html',
        code: htmlMatch[1],
        language: 'html'
      });
    } else if (svgMatch && window.artifactsPanel) {
      window.artifactsPanel.openArtifact({
        title: 'SVG Vector Visualizer',
        type: 'svg',
        code: svgMatch[1],
        language: 'xml'
      });
    } else if (mermaidMatch && window.artifactsPanel) {
      window.artifactsPanel.openArtifact({
        title: 'System Architecture Flowchart',
        type: 'mermaid',
        code: mermaidMatch[1],
        language: 'mermaid'
      });
    }
  }

  render() {
    this.renderHistoryList();
    this.renderProjectsList();
    this.renderMessagesFeed();
    if (window.lucide) lucide.createIcons();
  }

  renderHistoryList() {
    this.historyList.innerHTML = '';
    if (this.chats.length === 0) {
      this.historyList.innerHTML = `<div style="padding: 12px; font-size:12px; color:var(--text-muted);">No chat history yet.</div>`;
      return;
    }

    const groupTitle = document.createElement('div');
    groupTitle.className = 'chat-history-group-title';
    groupTitle.textContent = 'Recent Conversations';
    this.historyList.appendChild(groupTitle);

    this.chats.forEach(chat => {
      const item = document.createElement('button');
      item.className = `chat-item ${chat.id === this.activeChatId ? 'active' : ''}`;
      item.innerHTML = `
        <i data-lucide="message-square" style="width:15px;height:15px;"></i>
        <span class="chat-title">${chat.title}</span>
        <div class="chat-item-actions">
          <span class="chat-action-btn delete-chat-btn" title="Delete Chat">&times;</span>
        </div>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-chat-btn')) {
          e.stopPropagation();
          this.deleteChat(chat.id);
        } else {
          this.activeChatId = chat.id;
          this.saveChats();
          this.render();
        }
      });

      this.historyList.appendChild(item);
    });
  }

  filterChatHistory(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.chat-item').forEach(item => {
      const text = item.querySelector('.chat-title').textContent.toLowerCase();
      item.style.display = text.includes(q) ? 'flex' : 'none';
    });
  }

  deleteChat(chatId) {
    this.chats = this.chats.filter(c => c.id !== chatId);
    if (this.activeChatId === chatId) {
      this.activeChatId = this.chats.length > 0 ? this.chats[0].id : null;
    }
    this.saveChats();
    this.render();
    this.showToast('Chat deleted.');
  }

  renderProjectsList() {
    this.projectsList.innerHTML = '';
    if (this.projects.length === 0) {
      this.projectsList.innerHTML = `<div style="padding:12px; font-size:12px; color:var(--text-muted);">No workspace projects. Create one above!</div>`;
      return;
    }

    this.projects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card-name"><i data-lucide="folder"></i> ${proj.name}</div>
        <div class="project-card-desc">${proj.desc || 'Custom workspace instructions & files'}</div>
      `;

      card.addEventListener('click', () => {
        this.activeProjectId = proj.id;
        this.activeProjectName.textContent = proj.name;
        this.activeProjectIndicator.classList.remove('hidden');
        this.showToast(`Switched context to project "${proj.name}"`);
      });

      this.projectsList.appendChild(card);
    });
  }

  renderMessagesFeed() {
    const chat = this.getActiveChat();
    if (!chat || chat.messages.length === 0) {
      this.welcomeScreen.classList.remove('hidden');
      this.messagesFeed.innerHTML = '';
      return;
    }

    this.welcomeScreen.classList.add('hidden');
    this.messagesFeed.innerHTML = '';

    chat.messages.forEach(msg => {
      const row = document.createElement('div');
      row.className = `message-row ${msg.role}`;
      row.id = msg.id;

      const avatarSymbol = msg.role === 'user' ? 'U' : 'C';

      let innerContent = '';
      if (msg.role === 'user') {
        innerContent = `<div class="message-bubble">${msg.content}</div>`;
      } else {
        let thinkingHtml = '';
        if (msg.thinking) {
          thinkingHtml = `
            <div class="thinking-accordion">
              <div class="thinking-header" onclick="this.parentElement.classList.toggle('open')">
                <i data-lucide="brain"></i> Thought Process & Logic
              </div>
              <div class="thinking-body">${msg.thinking}</div>
            </div>
          `;
        }
        const parsedMarkdown = window.marked ? marked.parse(msg.content) : msg.content;
        innerContent = `<div class="message-bubble">${thinkingHtml}${parsedMarkdown}</div>`;
      }

      row.innerHTML = `
        <div class="message-avatar">${avatarSymbol}</div>
        <div class="message-content-wrapper">
          <div class="message-author">
            ${msg.role === 'user' ? 'You' : 'Clyde'}
            <span class="message-time">${msg.timestamp || ''}</span>
          </div>
          ${innerContent}
          <div class="message-actions">
            <button class="action-icon-btn copy-msg-btn" title="Copy Text"><i data-lucide="copy"></i> Copy</button>
            <button class="action-icon-btn thumb-msg-btn" title="Good Response"><i data-lucide="thumbs-up"></i></button>
          </div>
        </div>
      `;

      // Copy Action
      row.querySelector('.copy-msg-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(msg.content);
        this.showToast('Message copied to clipboard');
      });

      this.messagesFeed.appendChild(row);
    });

    // Re-highlight & render math
    document.querySelectorAll('.message-bubble pre code').forEach(block => {
      if (window.hljs) hljs.highlightElement(block);
    });

    if (window.renderMathInElement) {
      renderMathInElement(this.messagesFeed, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ]
      });
    }

    if (window.lucide) lucide.createIcons();
    this.scrollToBottom();
  }

  handleFileUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.attachments.push({
          name: file.name,
          type: file.type,
          content: event.target.result
        });
        this.renderAttachmentsPreview();
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  renderAttachmentsPreview() {
    this.attachmentsBar.innerHTML = '';
    if (this.attachments.length === 0) {
      this.attachmentsBar.classList.add('hidden');
      return;
    }

    this.attachmentsBar.classList.remove('hidden');
    this.attachments.forEach((att, idx) => {
      const card = document.createElement('div');
      card.className = 'attachment-preview-card';
      card.innerHTML = `
        <i data-lucide="${att.type.startsWith('image/') ? 'image' : 'file-text'}" style="width:14px;height:14px;"></i>
        <span>${att.name}</span>
        <span class="remove-attach-btn" data-idx="${idx}">&times;</span>
      `;

      card.querySelector('.remove-attach-btn').addEventListener('click', (e) => {
        this.attachments.splice(idx, 1);
        this.renderAttachmentsPreview();
      });

      this.attachmentsBar.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
  }

  updateTokenCounter() {
    const text = this.chatInput.value;
    const tokens = Math.ceil(text.length / 4);
    const estCost = (tokens * 0.000003).toFixed(5);
    this.tokenCounter.textContent = `${tokens} tokens (~$${estCost})`;
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="info" style="width:16px;height:16px;color:var(--accent-color);"></i> <span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(toast);
    if (window.lucide) lucide.createIcons();
    setTimeout(() => toast.remove(), 3000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.clydeApp = new ClydeApp();
});

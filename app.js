/**
 * CLYDE MAIN APPLICATION CONTROLLER
 * 3-Column Floating Panel Layout Implementation.
 */

class ClydeApp {
  constructor() {
    this.chats = JSON.parse(localStorage.getItem('clyde_chats')) || [];
    this.activeChatId = localStorage.getItem('clyde_active_chat') || null;

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
    this.chatSearchInput = document.getElementById('chat-search-input');

    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.themeIcon = document.getElementById('theme-icon');

    this.navSettingsBtn = document.getElementById('nav-settings-btn');
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsBtns = document.querySelectorAll('#close-settings-btn, #cancel-settings-btn');
    this.saveSettingsBtn = document.getElementById('save-settings-btn');
    this.apiProviderSelect = document.getElementById('api-provider');
    this.apiKeyInput = document.getElementById('api-key-input');
    this.apiKeyGroup = document.getElementById('api-key-group');
    this.customSystemPromptInput = document.getElementById('custom-system-prompt');
    this.clearDataBtn = document.getElementById('clear-data-btn');
    this.exportChatsBtn = document.getElementById('export-chats-btn');

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
    // New Chat Button
    if (this.newChatBtn) this.newChatBtn.addEventListener('click', () => this.createNewChat());

    // Navigation Tabs
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (tab.id === 'nav-settings-btn') {
          this.openSettingsModal();
        }
      });
    });

    // Model Picker Dropdown
    if (this.modelPickerBtn) {
      this.modelPickerBtn.addEventListener('click', () => {
        this.modelPickerBtn.parentElement.classList.toggle('open');
      });
    }

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
        if (this.modelPickerBtn) this.modelPickerBtn.parentElement.classList.remove('open');
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
      this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 140) + 'px';
      this.updateTokenCounter();
    });

    if (this.sendBtn) this.sendBtn.addEventListener('click', () => this.sendMessage());

    // File Upload Attachment
    if (this.uploadBtn) this.uploadBtn.addEventListener('click', () => this.fileUploadInput.click());
    if (this.fileUploadInput) this.fileUploadInput.addEventListener('change', (e) => this.handleFileUpload(e));

    // Toggle Right Panel Canvas
    if (this.toggleCanvasBtn) {
      this.toggleCanvasBtn.addEventListener('click', () => {
        if (window.artifactsPanel) {
          if (window.artifactsPanel.canvasContainer.classList.contains('hidden')) {
            window.artifactsPanel.defaultInfoPanel.classList.add('hidden');
            window.artifactsPanel.canvasContainer.classList.remove('hidden');
          } else {
            window.artifactsPanel.canvasContainer.classList.add('hidden');
            window.artifactsPanel.defaultInfoPanel.classList.remove('hidden');
          }
        }
      });
    }

    // Theme Toggle
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('clyde_theme', next);
        this.updateThemeIcon(next);
      });
    }

    // Search History Filter
    if (this.chatSearchInput) {
      this.chatSearchInput.addEventListener('input', (e) => {
        this.filterChatHistory(e.target.value);
      });
    }

    // Settings Modal
    if (this.closeSettingsBtns) {
      this.closeSettingsBtns.forEach(btn => btn.addEventListener('click', () => this.settingsModal.classList.add('hidden')));
    }

    if (this.saveSettingsBtn) {
      this.saveSettingsBtn.addEventListener('click', () => {
        const provider = this.apiProviderSelect.value;
        const key = this.apiKeyInput.value.trim();
        const prompt = this.customSystemPromptInput.value.trim();
        window.clydeEngine.setProvider(provider, key);
        window.clydeEngine.setSystemPrompt(prompt);
        this.settingsModal.classList.add('hidden');
        this.showToast('Settings saved!');
      });
    }

    if (this.clearDataBtn) {
      this.clearDataBtn.addEventListener('click', () => {
        if (confirm('Clear all chats and data?')) {
          localStorage.clear();
          this.chats = [];
          this.activeChatId = null;
          this.createNewChat();
          this.settingsModal.classList.add('hidden');
          this.showToast('All data cleared.');
        }
      });
    }

    if (this.exportChatsBtn) {
      this.exportChatsBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.chats, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `clyde-chats-${Date.now()}.json`;
        a.click();
        this.showToast('Chats exported to JSON file!');
      });
    }
  }

  openSettingsModal() {
    this.apiProviderSelect.value = localStorage.getItem('clyde_api_provider') || 'simulator';
    this.apiKeyInput.value = localStorage.getItem('clyde_api_key') || '';
    this.customSystemPromptInput.value = localStorage.getItem('clyde_system_prompt') || '';
    this.settingsModal.classList.remove('hidden');
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

    if (chat.messages.length === 0) {
      chat.title = text.slice(0, 26) || 'Attachment Analysis';
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create User Message
    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      attachments: [...this.attachments],
      timestamp: timeStr
    };

    chat.messages.push(userMsg);
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    this.attachments = [];
    this.renderAttachmentsPreview();
    this.renderMessagesFeed();

    // Create Clyde AI Response placeholder
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
    this.sendBtn.innerHTML = `<i data-lucide="square"></i>`;
    if (window.lucide) lucide.createIcons();

    this.scrollToBottom();

    window.clydeEngine.generateStream(
      {
        prompt: text,
        history: chat.messages,
        model: this.activeModel,
        style: this.activeStyle,
        attachments: userMsg.attachments
      },
      (chunk) => {
        clydeMsg.content += chunk;
        this.updateClydeMessageBubble(clydeMsgId, clydeMsg.content, clydeMsg.thinking);
        this.scrollToBottom();
      },
      (thinkingText) => {
        clydeMsg.thinking = thinkingText;
        this.updateClydeMessageBubble(clydeMsgId, clydeMsg.content, clydeMsg.thinking);
      },
      (fullText) => {
        this.isGenerating = false;
        this.sendBtn.innerHTML = `<i data-lucide="send"></i>`;
        if (window.lucide) lucide.createIcons();
        this.saveChats();
        this.renderHistoryList();
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
    if (thinking) {
      html += `
        <div class="thinking-accordion open">
          <div class="thinking-header" onclick="this.parentElement.classList.toggle('open')">
            <i data-lucide="brain" style="width:14px;height:14px;color:#8b5cf6;"></i> Thought Process & Logic
          </div>
          <div class="thinking-body">${thinking}</div>
        </div>
      `;
    }

    const parsedMarkdown = window.marked ? marked.parse(content) : content;
    html += parsedMarkdown;
    bubble.innerHTML = html;

    bubble.querySelectorAll('pre code').forEach(block => {
      if (window.hljs && !block.dataset.highlighted) {
        hljs.highlightElement(block);
      }
    });

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
    this.renderMessagesFeed();
    if (window.lucide) lucide.createIcons();
  }

  renderHistoryList() {
    this.historyList.innerHTML = '';
    if (this.chats.length === 0) {
      this.historyList.innerHTML = `<div style="padding: 10px; font-size:12px; color:var(--text-muted);">No chat history yet.</div>`;
      return;
    }

    const mockTimes = ['10:30 AM', 'Yesterday', '2 Days ago', '3 Days ago', '5 Days ago'];

    this.chats.forEach((chat, idx) => {
      const item = document.createElement('div');
      item.className = `recent-chat-item ${chat.id === this.activeChatId ? 'active' : ''}`;
      
      const timeTag = mockTimes[idx % mockTimes.length];

      item.innerHTML = `
        <div class="recent-chat-left">
          <i data-lucide="message-square"></i>
          <span class="recent-chat-title">${chat.title}</span>
        </div>
        <span class="recent-chat-time">${timeTag}</span>
      `;

      item.addEventListener('click', () => {
        this.activeChatId = chat.id;
        this.saveChats();
        this.render();
      });

      this.historyList.appendChild(item);
    });
  }

  filterChatHistory(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.recent-chat-item').forEach(item => {
      const text = item.querySelector('.recent-chat-title').textContent.toLowerCase();
      item.style.display = text.includes(q) ? 'flex' : 'none';
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

      let bubbleContent = '';
      let metaRow = '';

      if (msg.role === 'user') {
        bubbleContent = `<div class="message-bubble">${msg.content}</div>`;
        metaRow = `
          <div class="message-meta-row">
            <span class="message-time">${msg.timestamp || '10:30 AM'}</span>
            <span class="read-receipt" title="Delivered & Read">✓✓</span>
          </div>
        `;
        row.innerHTML = `
          <div class="message-bubble-wrapper">
            ${bubbleContent}
            ${metaRow}
          </div>
        `;
      } else {
        let thinkingHtml = '';
        if (msg.thinking) {
          thinkingHtml = `
            <div class="thinking-accordion">
              <div class="thinking-header" onclick="this.parentElement.classList.toggle('open')">
                <i data-lucide="brain" style="width:14px;height:14px;color:#8b5cf6;"></i> Thought Process & Logic
              </div>
              <div class="thinking-body">${msg.thinking}</div>
            </div>
          `;
        }
        const parsedMarkdown = window.marked ? marked.parse(msg.content) : msg.content;
        bubbleContent = `<div class="message-bubble">${thinkingHtml}${parsedMarkdown}</div>`;
        
        metaRow = `
          <div class="message-meta-row">
            <div class="msg-actions-toolbar">
              <button class="msg-action-btn copy-btn" title="Copy"><i data-lucide="copy"></i></button>
              <button class="msg-action-btn thumb-up-btn" title="Like"><i data-lucide="thumbs-up"></i></button>
              <button class="msg-action-btn thumb-down-btn" title="Dislike"><i data-lucide="thumbs-down"></i></button>
            </div>
            <span class="message-time" style="margin-left:auto;">${msg.timestamp || '10:31 AM'}</span>
          </div>
        `;

        row.innerHTML = `
          <div class="message-avatar">C</div>
          <div class="message-bubble-wrapper">
            ${bubbleContent}
            ${metaRow}
          </div>
        `;

        // Copy button listener
        row.querySelector('.copy-btn').addEventListener('click', () => {
          navigator.clipboard.writeText(msg.content);
          this.showToast('Copied to clipboard');
        });
      }

      this.messagesFeed.appendChild(row);
    });

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
      card.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 8px;background:var(--bg-card-inner);border-radius:6px;font-size:12px;';
      card.innerHTML = `
        <i data-lucide="file-text" style="width:14px;height:14px;"></i>
        <span>${att.name}</span>
        <span class="remove-btn" style="cursor:pointer;margin-left:4px;">&times;</span>
      `;

      card.querySelector('.remove-btn').addEventListener('click', () => {
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
    this.tokenCounter.textContent = `${tokens} tokens`;
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
    setTimeout(() => toast.remove(), 2500);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.clydeApp = new ClydeApp();
});

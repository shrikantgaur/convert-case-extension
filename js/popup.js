document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const copyBtn = document.getElementById('copyBtn');
  const conversionButtons = document.getElementById('conversionButtons');
  const themeToggle = document.getElementById('themeToggle');
  const charCount = document.getElementById('charCount');
  const wordCount = document.getElementById('wordCount');
  const sentenceCount = document.getElementById('sentenceCount');
  const lineCount = document.getElementById('lineCount');
  const historyItems = document.getElementById('historyItems');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const exportTxtBtn = document.getElementById('exportTxt');
  const exportJsonBtn = document.getElementById('exportJson');

  let conversionHistory = [];

  chrome.storage.local.get(['inputText', 'activeConversion', 'theme', 'conversionHistory'], (result) => {

    if (result.conversionHistory) {
      conversionHistory = result.conversionHistory;
    }

    if (result.inputText) {
      inputText.value = result.inputText;
      updateStats(result.inputText);
      convertText(result.activeConversion || 'UPPER CASE');
    }
    
    const theme = result.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(theme);
    
    const activeMethod = result.activeConversion || 'UPPER CASE';
    document.querySelectorAll('.button-grid button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === activeMethod);
    });

    renderConversionButtons(activeMethod);

    renderHistory();

  });

  function renderConversionButtons(activeMethod) {
    conversionButtons.innerHTML = '';

    const icons = {
      'UPPER CASE': 'fa-solid fa-arrow-up-a-z',
      'lower case': 'fa-solid fa-arrow-down-a-z',
      'Title Case': 'fa-solid fa-text-height',
      'Sentence case': 'fa-solid fa-paragraph',
      'camelCase': 'fa-solid fa-code',
      'PascalCase': 'fa-solid fa-code-branch',
      'snake_case': 'fa-solid fa-ellipsis',
      'kebab-case': 'fa-solid fa-grip-lines',
      'iNvErSe CaSe': 'fa-solid fa-exchange-alt',
      'RaNdOm CaSe': 'fa-solid fa-shuffle'
    };

    Object.keys(conversionMethods).forEach(method => {
      const button = document.createElement('button');
      button.dataset.method = method;
      button.innerHTML = `<i class="${icons[method]}"></i> ${method}`;

      if (method === activeMethod) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        document.querySelectorAll('.button-grid button').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        
        convertText(method);
        chrome.storage.local.set({ activeConversion: method });
      });
      
      conversionButtons.appendChild(button);
    });
  }

  function renderHistory() {
    historyItems.innerHTML = '';
    
    if (!conversionHistory || conversionHistory.length === 0) {
      historyItems.innerHTML = '<div class="history-empty">No conversions yet</div>';
      return;
    }
    
    conversionHistory.forEach((item) => {
      if (!item || !item.method || !item.converted) return;
      
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <span class="history-method">${item.method}</span>
        <span class="history-text" title="${item.converted.replace(/"/g, '&quot;')}">
          ${item.converted.length > 50 ? item.converted.substring(0, 50) + '...' : item.converted}
        </span>
      `;
      
      historyItem.addEventListener('click', () => {
        inputText.value = item.original || '';
        outputText.value = item.converted;
        updateStats(item.original || '');
        copyBtn.disabled = false;
        
        document.querySelectorAll('.button-grid button').forEach(btn => {
          btn.classList.remove('active');
          if (btn.dataset.method === item.method) {
            btn.classList.add('active');
            chrome.storage.local.set({ activeConversion: item.method });
          }
        });
        
        const hasText = item.converted.trim().length > 0;
        // exportTxtBtn.disabled = !hasText;
        // exportJsonBtn.disabled = !hasText;
      });
      
      historyItems.appendChild(historyItem);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    conversionHistory = [];
    chrome.storage.local.set({ conversionHistory: [] });
    renderHistory();
  });

  exportTxtBtn.addEventListener('click', () => {
    exportAsFile(outputText.value || inputText.value, 'txt');
  });

  exportJsonBtn.addEventListener('click', () => {
    const data = {
      original: inputText.value,
      converted: outputText.value,
      stats: {
        characters: inputText.value.length,
        words: inputText.value.trim() ? inputText.value.trim().split(/\s+/).length : 0,
        lines: inputText.value.trim() ? inputText.value.split('\n').length : 0
      },
      timestamp: new Date().toISOString()
    };
    exportAsFile(JSON.stringify(data, null, 2), 'json');
  });

  function exportAsFile(content, format) {
    if (!content) {
      showMessage('No content to export');
      return;
    }
    
    try {
      const blob = new Blob([content], { type: `text/${format}` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `text-conversion-${new Date().toISOString().slice(0,10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      showMessage('Export failed');
    }
  }

  function addToHistory(original, converted, method) {
    if (!original || !converted) return;
    
    const isDuplicate = conversionHistory.some(item => 
      item.original === original && 
      item.converted === converted && 
      item.method === method
    );
    
    if (!isDuplicate) {
      conversionHistory.unshift({
        original,
        converted, 
        method,
        timestamp: new Date().toISOString()
      });
      
      if (conversionHistory.length > 5) {
        conversionHistory.pop();
      }
      
      chrome.storage.local.set({ conversionHistory });
      renderHistory();
    }
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
  });
  
  inputText.addEventListener('input', () => {
    updateStats(inputText.value);
    convertText();
    chrome.storage.local.set({ inputText: inputText.value });
  });
  
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    copyBtn.disabled = true;
    exportTxtBtn.disabled = true;
    exportJsonBtn.disabled = true;
    updateStats('');
    chrome.storage.local.set({ inputText: '' });
    inputText.focus();
  });
  
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
      updateStats(text);
      convertText();
      chrome.storage.local.set({ inputText: text });
    } catch (err) {
      console.error('Failed to read clipboard: ', err);
      showMessage('Could not access clipboard. Please paste manually.');
    }
  });
  
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputText.value);
      showMessage('Copied!');
      
      const activeMethod = document.querySelector('.button-grid button.active')?.dataset.method || 'UPPER CASE';
      addToHistory(inputText.value, outputText.value, activeMethod);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showMessage('Could not copy text to clipboard.');
    }
  });
  
  function convertText(method) {
    const activeMethod = method || 
      document.querySelector('.button-grid button.active')?.dataset.method || 
      'UPPER CASE';
    
    const text = inputText.value;
    
    if (text) {
      const converter = conversionMethods[activeMethod];
      outputText.value = converter(text);
      copyBtn.disabled = false;
      exportTxtBtn.disabled = false;
      exportJsonBtn.disabled = false;
    } else {
      outputText.value = '';
      copyBtn.disabled = true;
      exportTxtBtn.disabled = true;
      exportJsonBtn.disabled = true;
    }
  }
  
  function updateStats(text) {
    charCount.textContent = text.length;
    
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    wordCount.textContent = words.length;
    
    const sentences = text.trim() ? text.split(/[.!?]+/) : [];
    sentenceCount.textContent = sentences.filter(s => s.trim().length > 0).length;
    
    const lines = text.trim() ? text.split('\n') : [];
    lineCount.textContent = lines.length;
  }
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const icon = themeToggle.querySelector('i');

    if (theme === 'dark') {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      icon.style.color = '#ffffff';
    } else {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      icon.style.color = '#1C74A4';
    }
  }
  
  function showMessage(msg) {
    const msgElement = document.createElement('div');
    msgElement.className = 'message';
    msgElement.textContent = msg;
    document.body.appendChild(msgElement);
    
    setTimeout(() => {
      msgElement.remove();
    }, 2000);
  }
});
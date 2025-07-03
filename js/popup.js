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
  
  chrome.storage.local.get(['inputText', 'activeConversion', 'theme'], (result) => {
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
  });
  
  Object.keys(conversionMethods).forEach(method => {
    const button = document.createElement('button');
    button.textContent = method;
    button.dataset.method = method;
    
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
    } else {
      outputText.value = '';
      copyBtn.disabled = true;
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
    
    const icon = themeToggle.querySelector('svg');

    if (theme === 'dark') {
      icon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      icon.style.stroke = '#ffffff'; 
    } else {
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M12 1v2"></path>
        <path d="M12 21v2"></path>
        <path d="M4.22 4.22l1.42 1.42"></path>
        <path d="M18.36 18.36l1.42 1.42"></path>
        <path d="M1 12h2"></path>
        <path d="M21 12h2"></path>
        <path d="M4.22 19.78l1.42-1.42"></path>
        <path d="M18.36 5.64l1.42-1.42"></path>
      `;
      icon.style.stroke = '';
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
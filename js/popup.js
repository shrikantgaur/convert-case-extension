document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const copyBtn = document.getElementById('copyBtn');
  const conversionButtons = document.getElementById('conversionButtons');
  
  // Initialize with saved data or defaults
  chrome.storage.local.get(['inputText', 'activeConversion'], (result) => {
    if (result.inputText) {
      inputText.value = result.inputText;
      convertText(result.activeConversion || 'UPPER CASE');
    }
    
    // Set active button
    const activeMethod = result.activeConversion || 'UPPER CASE';
    document.querySelectorAll('.button-grid button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === activeMethod);
    });
  });
  
  // Create all conversion buttons
  Object.keys(conversionMethods).forEach(method => {
    const button = document.createElement('button');
    button.textContent = method;
    button.dataset.method = method;
    
    button.addEventListener('click', () => {
      // Update active button
      document.querySelectorAll('.button-grid button').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      
      convertText(method);
      chrome.storage.local.set({ activeConversion: method });
    });
    
    conversionButtons.appendChild(button);
  });
  
  // Convert text on input
  inputText.addEventListener('input', () => {
    convertText();
    chrome.storage.local.set({ inputText: inputText.value });
  });
  
  // Clear input
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    copyBtn.disabled = true;
    chrome.storage.local.set({ inputText: '' });
    inputText.focus();
  });
  
  // Paste from clipboard
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
      convertText();
      chrome.storage.local.set({ inputText: text });
    } catch (err) {
      console.error('Failed to read clipboard: ', err);
      showMessage('Could not access clipboard. Please paste manually.');
    }
  });
  
  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputText.value);
      showMessage('Copied!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showMessage('Could not copy text to clipboard.');
    }
  });
  
  // Conversion function
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
  
  // Show temporary message
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
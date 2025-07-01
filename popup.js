document.addEventListener('DOMContentLoaded', async function() {
  const currentDomainEl = document.getElementById('currentDomain');
  const statusEl = document.getElementById('status');
  const statusTextEl = document.getElementById('statusText');
  const toggleCurrentEl = document.getElementById('toggleCurrent');
  const domainInputEl = document.getElementById('domainInput');
  const addButtonEl = document.getElementById('addButton');
  const domainListEl = document.getElementById('domainList');
  
  let currentDomain = '';
  let blockedDomains = [];
  
  // Get current tab domain
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentDomain = new URL(tab.url).hostname;
    currentDomainEl.textContent = currentDomain;
  } catch (error) {
    currentDomainEl.textContent = 'Unable to detect domain';
  }
  
  // Load blocked domains
  async function loadBlockedDomains() {
    const result = await chrome.storage.sync.get(['blockedDomains']);
    blockedDomains = result.blockedDomains || [];
    updateUI();
  }
  
  // Save blocked domains
  async function saveBlockedDomains() {
    await chrome.storage.sync.set({ blockedDomains });
    updateUI();
  }
  
  // Check if current domain is blocked
  function isCurrentDomainBlocked() {
    return blockedDomains.some(domain => {
      if (domain.startsWith('*.')) {
        const baseDomain = domain.substring(2);
        return currentDomain.endsWith(baseDomain);
      }
      return currentDomain === domain || currentDomain.endsWith('.' + domain);
    });
  }
  
  // Update UI
  function updateUI() {
    const isBlocked = isCurrentDomainBlocked();
    
    toggleCurrentEl.checked = isBlocked;
    
    if (isBlocked) {
      statusEl.className = 'status enabled';
      statusTextEl.textContent = '🛡️ Tracker blocked on this domain';
    } else {
      statusEl.className = 'status disabled';
      statusTextEl.textContent = '⚠️ Tracker active on this domain';
    }
    
    // Update domain list
    domainListEl.innerHTML = '';
    if (blockedDomains.length === 0) {
      domainListEl.innerHTML = '<div style="text-align: center; color: #666; padding: 16px;">No domains blocked</div>';
    } else {
      blockedDomains.forEach(domain => {
        const item = document.createElement('div');
        item.className = 'domain-item';
        item.innerHTML = `
          <span>${domain}</span>
          <span class="remove-btn" data-domain="${domain}">×</span>
        `;
        domainListEl.appendChild(item);
      });
    }
  }
  
  // Toggle current domain
  toggleCurrentEl.addEventListener('change', async function() {
    if (this.checked) {
      if (!blockedDomains.includes(currentDomain)) {
        blockedDomains.push(currentDomain);
        await saveBlockedDomains();
      }
    } else {
      blockedDomains = blockedDomains.filter(domain => domain !== currentDomain);
      await addToRemovedDomains(currentDomain);
      await saveBlockedDomains();
    }
  });
  
  // Add domain
  addButtonEl.addEventListener('click', async function() {
    const domain = domainInputEl.value.trim();
    if (domain && !blockedDomains.includes(domain)) {
      blockedDomains.push(domain);
      await saveBlockedDomains();
      domainInputEl.value = '';
    }
  });
  
  // Handle enter key in input
  domainInputEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addButtonEl.click();
    }
  });
  
  // Add domain to removed list for cleanup
  async function addToRemovedDomains(domain) {
    const result = await chrome.storage.sync.get(['removedDomains']);
    const removedDomains = result.removedDomains || [];
    if (!removedDomains.includes(domain)) {
      removedDomains.push(domain);
      await chrome.storage.sync.set({ removedDomains });
    }
  }

  // Remove domain
  domainListEl.addEventListener('click', async function(e) {
    if (e.target.classList.contains('remove-btn')) {
      const domain = e.target.getAttribute('data-domain');
      blockedDomains = blockedDomains.filter(d => d !== domain);
      await addToRemovedDomains(domain);
      await saveBlockedDomains();
    }
  });
  
  // Initialize
  await loadBlockedDomains();
});
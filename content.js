(function() {
  'use strict';

  async function checkAndDisableTracker() {
    try {
      const currentDomain = window.location.hostname;
      const result = await chrome.storage.sync.get(['blockedDomains']);
      const blockedDomains = result.blockedDomains || [];
      
      const shouldBlock = blockedDomains.some(domain => {
        if (domain.startsWith('*.')) {
          const baseDomain = domain.substring(2);
          return currentDomain.endsWith(baseDomain);
        }
        return currentDomain === domain || currentDomain.endsWith('.' + domain);
      });
      
      if (shouldBlock) {
        localStorage.setItem('disable_omnimetrix', 'true');
        console.log(`Omnimetrix tracker disabled on ${currentDomain}`);
      }
    } catch (error) {
      console.error('Tracker blocker error:', error);
    }
  }
  
  checkAndDisableTracker();
})();
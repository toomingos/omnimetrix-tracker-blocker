(function() {
  'use strict';

  async function checkAndManageTracker() {
    try {
      const currentDomain = window.location.hostname;
      const result = await chrome.storage.sync.get(['blockedDomains', 'removedDomains']);
      const blockedDomains = result.blockedDomains || [];
      const removedDomains = result.removedDomains || [];
      
      // Check if this domain was recently removed and needs cleanup
      const needsCleanup = removedDomains.some(domain => {
        if (domain.startsWith('*.')) {
          const baseDomain = domain.substring(2);
          return currentDomain.endsWith(baseDomain);
        }
        return currentDomain === domain || currentDomain.endsWith('.' + domain);
      });
      
      if (needsCleanup) {
        localStorage.removeItem('disable_omnimetrix');
        console.log(`Omnimetrix tracker re-enabled on ${currentDomain} (cleanup)`);
        
        // Remove this domain from the cleanup list
        const updatedRemovedDomains = removedDomains.filter(domain => {
          if (domain.startsWith('*.')) {
            const baseDomain = domain.substring(2);
            return !currentDomain.endsWith(baseDomain);
          }
          return currentDomain !== domain && !currentDomain.endsWith('.' + domain);
        });
        
        if (updatedRemovedDomains.length !== removedDomains.length) {
          await chrome.storage.sync.set({ removedDomains: updatedRemovedDomains });
        }
        return;
      }
      
      // Check if domain should be blocked
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
      } else {
        // If not blocked and no cleanup needed, remove the flag if it exists
        if (localStorage.getItem('disable_omnimetrix')) {
          localStorage.removeItem('disable_omnimetrix');
          console.log(`Omnimetrix tracker re-enabled on ${currentDomain}`);
        }
      }
    } catch (error) {
      console.error('Tracker blocker error:', error);
    }
  }
  
  checkAndManageTracker();
})();
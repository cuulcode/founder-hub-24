// Background service worker for Project Hub Chrome Extension
self.addEventListener('install', () => {
  console.log('Project Hub extension installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Project Hub extension activated');
  self.clients.claim();
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Try to open side panel (Chrome 114+)
    if (chrome.sidePanel) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } else {
      // Fallback: open in new tab
      chrome.tabs.create({ url: chrome.runtime.getURL('fullpage.html') });
    }
  } catch (error) {
    console.error('Error opening side panel:', error);
    // Fallback to full page
    chrome.tabs.create({ url: chrome.runtime.getURL('fullpage.html') });
  }
});

// Handle messages from extension pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'GET_EXTENSION_INFO') {
    sendResponse({ 
      from: 'background', 
      extension: true,
      version: chrome.runtime.getManifest().version
    });
    return true;
  }
  
  if (message?.type === 'OPEN_FULLPAGE') {
    chrome.tabs.create({ url: chrome.runtime.getURL('fullpage.html') });
    sendResponse({ success: true });
    return true;
  }
  
  if (message?.type === 'OPEN_SIDEPANEL') {
    chrome.sidePanel?.open({ windowId: sender.tab?.windowId })
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Context menu for opening in different modes
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'open-fullpage',
    title: 'Open in Full Page',
    contexts: ['action']
  });
  
  chrome.contextMenus.create({
    id: 'open-sidepanel',
    title: 'Open in Side Panel',
    contexts: ['action']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'open-fullpage') {
    chrome.tabs.create({ url: chrome.runtime.getURL('fullpage.html') });
  } else if (info.menuItemId === 'open-sidepanel' && chrome.sidePanel) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

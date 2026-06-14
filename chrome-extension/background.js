chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verify-trinetra",
    title: "Verify claim with Trinetra AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "verify-trinetra" && info.selectionText) {
    // Save selected text to storage and open popup
    chrome.storage.local.set({ targetClaim: info.selectionText }, () => {
      chrome.action.openPopup();
    });
  }
});

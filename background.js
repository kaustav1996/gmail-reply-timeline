chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
  
    // Check if timeline exists
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!document.getElementById("reply-timeline")
    }, ([result]) => {
      if (result.result) {
        // If already present → remove it
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const el = document.getElementById("reply-timeline");
            if (el) el.remove();
          }
        });
      } else {
        // Otherwise → inject content.js
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["d3.v7.min.js", "content.js"]
        });
      }
    });
  });
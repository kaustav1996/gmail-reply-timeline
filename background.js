chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.__timelineEnabled
    }, ([result]) => {
      const isVisible = result?.result;
  
      if (isVisible) {
        // 🔻 Disable timeline
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            window.__timelineEnabled = false;
            document.getElementById("reply-timeline")?.remove();
            document.querySelector(".timeline-tooltip")?.remove();
          }
        });
      } else {
        // ✅ Re-enable flag + inject scripts
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => { window.__timelineEnabled = true; }
        }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["d3.v7.min.js"]
          }, () => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content.js"]
            });
          });
        });
      }
    });
  });
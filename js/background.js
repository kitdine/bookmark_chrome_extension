chrome.tabs.onCreated.addListener((tab) => {
    checkUrlMarked(tab.id);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(tab.active) 
        checkUrlMarked(tabId);
});
chrome.tabs.onActivated.addListener((activeInfo) => {
    checkUrlMarked(activeInfo.tabId);
});

// when bookmark event changed
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    chrome.tabs.query({ active: true }, function (tabs) {
        if (bookmark.url == tabs[0].url) {
            changeIconToMarked(tabs[0].id);
        }
    });
});

chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    chrome.tabs.query({ active: true }, function (tabs) {
        if (removeInfo.node.url == tabs[0].url) {
            changeIconToUnMarked(tabs[0].id);
        }
    });
    chrome.storage.local.remove("bookmark_id_" + id, () => {});
})

function checkUrlMarked(tabId) {
    chrome.tabs.get(tabId, (tab) => {
      chrome.bookmarks.search({ url: tab.url }, node => {
        if (node.length > 0) {
            changeIconToMarked(tab.id);
        } else {
            changeIconToUnMarked(tab.id);
        }
      });
    });
}

function changeIconToMarked(tabId) {
    chrome.browserAction.setIcon({ path: "../images/marked.png" });
    chrome.browserAction.setTitle({
        title: "Edit bookmark for this page",
        tabId: tabId
    });
}

function changeIconToUnMarked(tabId) {
    chrome.browserAction.setIcon({ path: "../images/un_mark.png" });
    chrome.browserAction.setTitle({
      title: "Bookmark this page",
      tabId: tabId
    });
}

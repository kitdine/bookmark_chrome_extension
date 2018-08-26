//监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getImgUrl") {
    let array = document.getElementsByTagName("img");
    if (array.length > 0) {
        for(let i = 0; i< array.length; i++) {
            if (array[i].src.startsWith("http")) {
                sendResponse(array[i].src);
            }
        }
    } else {
      sendResponse();
    }
  }
});
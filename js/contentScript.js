//监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getImgUrl") {
    let array = document.getElementsByTagName("img");
    if (array.length > 0) {
      let img = array[0].src;
      if(img.startsWith("//")) {
        img = request.url.substring("//") + img;
      }
      sendResponse(img);
    } else {
      sendResponse();
    }
  }
});
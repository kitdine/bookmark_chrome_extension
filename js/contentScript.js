//监听消息
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    alert("step into content script")
    if (request.action === "getImgUrl") {
        let array = document.getElementsByName("img");
        alert(array.length);
        if(array.length > 0) {
            alert(array[0].src);
            sendResponse(array[0].src);
        } else {
            sendResponse();
        }
    }
});
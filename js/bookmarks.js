// chrome.tabs.query({ active: true }, addBookmarksAndUpdateIcon);
addBookmarksAndUpdateIcon();

function addBookmarksAndUpdateIcon() {
    chrome.tabs.query({ active: true }, (tabs) => {
        let tab = tabs[0];
        chrome.bookmarks.search({ url: tab.url }, (node) => {
            if (node.length == 0) {
                chrome.bookmarks.create({
                    title: tab.title,
                    url: tab.url
                }, (addNode) => {
                    showTitleAndFolder(tab, addNode);
                })
            } else {
                showTitleAndFolder(tab, node[0]);
            }
        });
    });
}

function showTitleAndFolder(tab, bookmark) {
    chrome.storage.local.get(['bookmark_id_'+bookmark.id], function (result) {
        if(result.key) {
            document
              .getElementById("favIconImg")
              .setAttribute("src", result.key);
        } else {
            chrome.tabs.sendMessage( tab.id,  { action: "getImgUrl" }, (response)=>{
                let key = "bookmark_id_" + bookmark.id;
                chrome.storage.local.set( { key: response }, () => { 
                        document
                          .getElementById("favIconImg")
                          .setAttribute(
                            "src",
                            response
                          );
                    }
                );
            });
        }
    });
    
    document
        .getElementById("span_title")
        .setAttribute("value", tab.title);
    chrome.bookmarks.getTree((array)=> {
        document.getElementById("folders").innerHTML = createSelectedTree(array[0].children);
        document.getElementById(bookmark.parentId).selected = true;
        document
          .getElementById("folders")
          .addEventListener("change", changeFolder);
    });
    document
      .getElementById("bookmarkId")
      .setAttribute("value", bookmark.id);
    // document.getElementById("folders").setAttribute("value", bookmark.parentId);
    // document.getElementById(bookmark.parentId).selected = true;
}

function createSelectedTree(tree) {
    let options = "";
    tree.forEach(node => {
        if (node.url === undefined ) {
            if (node.children.length) {
                options += "<option id='" + node.id + "' value='" + node.id + "'>" + node.title + "</option>";
                options += createSelectedTree(node.children);
            } else {
                options += "<option id='" + node.id + "' value='" + node.id + "'>" + node.title + "</option>";
            }
        }
    });
    return options;
}


function changeFolder() {
    let parentId = document.getElementById("folders").value;
    let id = document.getElementById("bookmarkId").getAttribute("value");
    chrome.bookmarks.move(id, { parentId: parentId }, (node)=>{
        document.getElementById(node.id).selected = true;
    });
}

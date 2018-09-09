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
                        document.getElementById("favIconImg").setAttribute("src",response);
                    }
                );
            });
        }
    });
    
    $("#bookmark_title").html(tab.title);
    chrome.bookmarks.get(bookmark.parentId, (book_fodler)=> {
        $("#book_folder").text(book_fodler[0].title);
        $("#book_folder_id").val(book_fodler[0].id);
    });
    chrome.bookmarks.getTree((array)=> {
        $("#bookmark_folder").append(createSelectedTree2(createBookmarkFolders(array[0].children)));
        $(".change_folder").on("click", {}, changeFolder2);
    });
    document
      .getElementById("bookmarkId")
      .setAttribute("value", bookmark.id);
    document
        .getElementById("cancel")
        .addEventListener("click", cancelBookmark);
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

function createSelectedTree2(tree) {
    let uls = "";
    tree.forEach(node => {
        if (node.children !== undefined) {
            uls += "<li><div class='link'><span class='change_folder'>" + node.title + "</span><input type='hidden' value='" + node.id + "' /><i class='fa fa-chevron-down' class='click'></i></div><ul class='submenu'>";
            // uls += "<li><div href='#' class='link'><span class='change_folder'>" + node.title + "</span><input type='hidden' value='" + node.id + "' /><i class='fa fa-chevron-down' class='click'></i></div>";
            uls += createSelectedTree2(node.children);
            
            uls += " </ul></li>";
        } else {
            uls += "<li><div href='#' class='link'><span class='change_folder'>" + node.title + "</span><input type='hidden' value='" + node.id + "' /></div></li>";
        }
    });
    return uls;
}

function createBookmarkFolders(tree) {
    let folders = [];
    tree.forEach(node => {
        if(node.url === undefined) {
            if (node.children.length) {
                let folder = { id: node.id, title: node.title};
                let array = createBookmarkFolders(node.children);
                if(array.length > 0) {
                    folder.children = array;
                }
                // folder.children.push(createBookmarkFolders(node.children));
                folders.push(folder);
            } else {
                let folder = { id: node.id, title: node.title};
                folders.push(folder);
            }
        }
    })
    return folders;
}


function changeFolder() {
    let parentId = document.getElementById("folders").value;
    let id = document.getElementById("bookmarkId").getAttribute("value");
    chrome.bookmarks.move(id, { parentId: parentId }, (node)=>{
        document.getElementById(node.id).selected = true;
    });
}

function changeFolder2() {
    $this = $(this).parent();
    let id = document.getElementById("bookmarkId").getAttribute("value");
    chrome.bookmarks.move(
      id,
      { parentId: $this.find("input").val() },
      node => {
          $("#book_folder").text($this.find("span").text());
          $("#book_folder_id").val($this.find("input").val());
          showBookmarkFolders();
      }
    );
}

function cancelBookmark() {
    let id = document.getElementById("bookmarkId").getAttribute("value");
    if(id === "" || id === undefined || id === null) {
        return ;
    }
    chrome.bookmarks.remove(id, () => {
        document.getElementById("bookmarkId").setAttribute("value", "");
    });
}

function showBookmarkFolders() {
    $("#bookmark_folder_now").toggleClass("open");
    if($("#bookmark_folder").css('display') === 'none') {
        $("#bookmark_folder").css("display", "block");
    } else {
        $("#bookmark_folder").css("display","none");
        $("#bookmark_folder")
            .find(".submenu")
            .slideUp()
            .parent()
            .removeClass("open");
    }
}

$(function () {
    var BookmarkFolder = function (el, multiple) {
        this.el = el || {};
        this.multiple = multiple || true;
        // Variables privadas
        var i_clicks = this.el.find('i');
        // Evento
        i_clicks.on("click", { el: this.el, multiple: this.multiple }, this.dropdown);
    };

    BookmarkFolder.prototype.dropdown = function(e) {
        var $el = e.data.el,
        $this = $(this).parent();
        $next = $this.next();

      $next.slideToggle();
      $this.parent().toggleClass("open");

      if (!e.data.multiple) {
        $el
          .find(".submenu")
          .not($next)
          .slideUp()
          .parent()
          .removeClass("open");
      }
    };

    String.prototype.endWith = function (endStr) {
        var d = this.length - endStr.length;
        return (d >= 0 && this.lastIndexOf(endStr) == d)
    }

    var bookmark_folder = new BookmarkFolder($("#bookmark_folder"), false);

    $("#bookmark_folder_now").find("i").on("click",{}, showBookmarkFolders);
});
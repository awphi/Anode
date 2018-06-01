const SearchSort = {
    open: false
}

SearchSort.openPanel = function() {
    SearchSort.open = true;
    Animation.pause();
    const div = document.createElement("div");
    div.id = "searchsort";
    div.style.width = div.style.height = "100%";
    $("body").append(div);
}

SearchSort.closePanel = function() {
    SearchSort.open = false;
    Animation.unpause();
    $("#searchsort").remove();
}
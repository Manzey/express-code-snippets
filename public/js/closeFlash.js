let flashClose = document.getElementById("closeFlash")
flashClose.addEventListener("click", function() {
    flashClose.parentNode.parentNode.removeChild(flashClose.parentNode)
})
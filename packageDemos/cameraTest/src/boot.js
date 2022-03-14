const video = document.getElementById("video")
// video.width = window.screen.width
// video.height = window.screen.height
navigator.mediaDevices.getUserMedia({ video: {facingMode:"user"} })
.then( stream => {
    video.srcObject = stream
    video.play()
})
.catch( err => {
    debugger;
})
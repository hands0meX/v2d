const video = document.getElementById("video")

navigator.mediaDevices.getUserMedia({ video: {width: 500, height: 500,facingMode:"user"} })
.then( stream => {
    video.srcObject = stream
    video.play()
})
.catch( err => {
    debugger;
})
const startCamera = () => {
    const video:any = document.getElementById("video")
    navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            }
        })
        .then(stream => {
            video.srcObject = stream
            video?.play()
        })
        .catch(err => {
            debugger;
        })
}
startCamera()
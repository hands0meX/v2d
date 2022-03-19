export default class Camera {
    constructor() {
        // this.init()
    }

    static init() {
        const video:any = document.getElementById("video")
        navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width:window.innerWidth,
                    height:window.innerHeight
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
}
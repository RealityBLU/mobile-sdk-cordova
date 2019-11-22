var PlatformHandler = {
    oldUrlHandler: function (param) {
        if (param && param !== "") {
            AnalyticsPart.sendUrlEvent(param);
            //for iOS
            //AR.context.openInBrowser(str, true);
            //for android
            if (param.indexOf("tel:") !== -1) {
                NativeBridge.tellNativeToPhoneCall(param);
            } else {
                let ext = this.getExt(param).toLowerCase();
                if ([".mov", ".mp4", ".m4v", "3gp"].indexOf(ext) > -1) {
                    AR.context.startVideoPlayer(param);
                } else {
                    NativeBridge.handleButtonActionInNative(Constants.BTN_ACTION_MODE_URL, param);
                    // AR.context.openInBrowser(param, true);
                }
            }
        }
    },
    getExt: function (url) {
        return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split('#')[0].substr(url.lastIndexOf("."))
    },
    platformString: function () {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(userAgent)) {
            return "android";
        }
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "ios";
        }
        return "unknown";
    },
    isOrientationLandscape: function () {
        let platform = PlatformHandler.platformString();
        let angle = (platform === "ios") ? Math.abs(window.orientation) : Math.abs(screen.orientation.angle);
        return !(angle === 0 || angle === 180);
    },
    applicationDirectoryPath: function () {
        let platform = PlatformHandler.platformString();
        if (platform === "unknown") return;
        if (platform === "ios") {
            let iosBundleRegEx = new RegExp("^file:\/\/\/private\/var\/containers\/Bundle\/Application\/.+?(?=\/)\/.+?(?=\/)\/");
            return location.href.match(iosBundleRegEx);
        } else {
            return "assets/android_asset/customization";
        }
    },
};
let jsonImage = {};

function sendSpinnerFrames() {
    let currentFrames = jsonImage.markerbased !== undefined ? jsonImage.markerbased["loading-spinner-frames"] : 48;
    let spinnerFrames = [];
    if (currentFrames) {
        for (let i = 0; i < currentFrames; i++) {
            spinnerFrames.push(i);
        }
        return spinnerFrames;
    }
}

function sendLoadingSpinner() {
    if (jsonImage.markerbased !== undefined && jsonImage.markerbased["loading-spinner"]) return PlatformHandler.applicationDirectoryPath() + '/markerbased' + jsonImage.markerbased["loading-spinner"];
    else return "assets/img/spinner_sprite.png";
}

function customizationIcons() {
    if (jsonImage.markerbased !== undefined && jsonImage.markerbased["scanning-spinner"]) document.getElementById('loading_image').src = PlatformHandler.applicationDirectoryPath() + '/markerbased' + jsonImage.markerbased["scanning-spinner"];
    if (jsonImage.markerbased !== undefined && jsonImage.markerbased["scanning-spinner-text-svg"]) document.getElementsByClassName('scanning-text-container').src = PlatformHandler.applicationDirectoryPath() + '/markerbased' + jsonImage.markerbased["scanning-spinner-text-svg"];
    if (jsonImage.markerbased !== undefined && jsonImage.markerbased["camera-switch"]) document.getElementsByClassName('flip-camera-button').src = PlatformHandler.applicationDirectoryPath() + '/markerbased' + jsonImage.markerbased["camera-switch"];
    if (jsonImage.markerbased !== undefined && jsonImage.markerbased["lock-screen-on"]) document.getElementById('lock-camera-button-container').src = PlatformHandler.applicationDirectoryPath() + '/markerbased' + jsonImage.markerbased["lock-screen-on"];
    if (jsonImage.markerbased !== undefined && jsonImage.markerbased["lock-screen-off"]) document.getElementById('unlock-camera-button-container').src = PlatformHandler.applicationDirectoryPath() + '/markerbased' + jsonImage.markerbased["lock-screen-off"];
    if (jsonImage.markerbased !== undefined && jsonImage.markerbased["qr-button"]) document.getElementById('tracking-qr-scan-button-container').src = PlatformHandler.applicationDirectoryPath() + '/markerbased' + jsonImage.markerbased["qr-button"];
    if (jsonImage.common !== undefined && jsonImage.common["back-button"]) document.getElementById('tracking-model-back-button-container').src = PlatformHandler.applicationDirectoryPath() + '/common' + jsonImage.common["back-button"];
    if (jsonImage.common !== undefined && jsonImage.common['flight-off']) document.getElementById('flightOff-button-container').src = PlatformHandler.applicationDirectoryPath() + '/common' + jsonImage.common['flight-off'];
    if (jsonImage.common !== undefined && jsonImage.common['flight-on']) document.getElementById('flightOn-button-container').src = PlatformHandler.applicationDirectoryPath() + '/common' + jsonImage.common['flight-on'];
}
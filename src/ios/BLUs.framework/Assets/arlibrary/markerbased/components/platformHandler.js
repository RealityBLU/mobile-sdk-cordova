var PlatformHandler = {
    oldUrlHandler: function (param) {
        if (param && param !== "") {
            AnalyticsPart.sendUrlEvent(param);

            if (param.indexOf("tel:") !== -1) {
                NativeBridge.tellNativeToPhoneCall(param);
            } else {
                if (PlatformHandler.platformString() === "ios") {
                    NativeBridge.handleButtonActionInNative(Constants.BTN_ACTION_MODE_URL, param);
                    return;
                }
                let ext = this.getExt(param).toLowerCase();
                if ([".mov", ".mp4", ".m4v", ".3gp", ".mp3"].indexOf(ext) > -1) {
                    NativeBridge.handleButtonActionInNative(Constants.BTN_ACTION_MODE_VIDEO, param);
                } else {
                    NativeBridge.handleButtonActionInNative(Constants.BTN_ACTION_MODE_URL, param);
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
        if (/iPad|iPhone|iPod|Macintosh/.test(userAgent) && !window.MSStream) {
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
            let iosBundleRegEx = new RegExp("file:\/\/\/*((private)|())\/var\/containers\/Bundle\/Application\/.+?(?=\/)\/.+?(?=\/)");
            return location.href.match(iosBundleRegEx)[0];
        } else {
            return "file:///android_asset";
        }
    },
};
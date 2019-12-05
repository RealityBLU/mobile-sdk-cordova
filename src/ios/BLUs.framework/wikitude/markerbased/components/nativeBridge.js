var NativeBridge = {
    init: function (value) {
        isSingleScanEnabled = value;
        uiUtil.hideAndStartAnimate();
    },

    onResume: function () {
        SceneBuilder.onResume();
    },

    onPause: function () {
        SceneBuilder.onPause();
    },

    tellNativeToPhoneCall: function sendPhoneCallToNativeFn(str) {
        var jsonMessage = {action: "phoneCall", telstring: str};
        AR.platform.sendJSONObject(jsonMessage);
    },

    requestClientDataFromNative: function () {
        var jsonMessage = {action: "ClientData"};
        AR.platform.sendJSONObject(jsonMessage);
    },

    setupClientData: function (value) {
        if (value === undefined) {
            World.clientToken = "";
            World.targetCollectionID = "";
        } else {
            var clientDataArray = value.split(",");
            World.clientToken = clientDataArray[0];
            World.targetCollectionID = clientDataArray[1];
            World.groupId = clientDataArray[2];
            World.endpoint = clientDataArray[3];
        }
        Tracker.createTracker();
    },

    setLastLocation: function (latitude, longitude) {
        World.currentLatitude = latitude;
        World.currentLongitude = longitude;
    },

    enableProofing: function (value) {
        World.arLog("PROOFING QRCODE DETECTED>>>> " + value + "<<--");
        var scannedText = JSON.parse(value);
        SceneBuilder.proofingData = scannedText;
        World.setDropdownProofing(scannedText);
        SceneBuilder.isProofing = true;
        SceneBuilder.clearScene();
        uiUtil.hideAndStartAnimate();
        uiUtil.setQRScanVisible();
    },

    onFilesLoadingComplete: function () { //called from native code
        isDownloading = false;
        if (cachedItemsCount === objectsToDownload) { //if we have all files cached, don't use timer before showing scene
            SceneBuilder.startStreamingDrawables();
        } else {
            setTimeout(function () {
                SceneBuilder.startStreamingDrawables();
            }, progressBarAnimationDuration);
        }
    },

    onCachedUrlsReady: function (value) {
        var localItems = JSON.parse(value).localItems;
        if (localItems) {
            cachedItemsCount = localItems.length;
            localItems.forEach(i => {
                loadedItems.push(i);
            });
        }
    },

    onNextFileLoaded: function (value) { //called from native code
        loadedItems.push(JSON.parse(value).loadedItem);
        downloadedObjectsCount = downloadedObjectsCount + 1;
    },

    onPersonalVideoLoaded: function (id, videoUrl) {
        Videos.onNextPersonalVideoLoaded(id, videoUrl);
    },

    tellNativeToDownloadSceneData: function (argMarker, argObj, argButton, argVideo, argImage, argExpId, argSnapped) {
        World.arLog("--------------tellNativeTocDownloadSceneData: *** marker: " + JSON.stringify(argMarker) + ", *** 3D: " +
            +JSON.stringify(argObj) + ", *** btn: " + JSON.stringify(argButton) + ", *** img: " + JSON.stringify(argImage));//qqq
        var jsonMessage = {
            action: "SceneDownload",
            markers: [argMarker], //native needs Array here (legacy, remove array in native, because marker always only one)
            models: argObj,
            buttons: argButton,
            video: argVideo,
            images: argImage,
            expId: argExpId,
            snapped: argSnapped,
        };
        AR.platform.sendJSONObject(jsonMessage);
    },

    tellNativeToDownloadPersonalVideo: function (personalVideos) {
        var jsonMessage = {
            action: "PersonalVideo",
            experience_id: SceneBuilder.experience_id,
            personal_videos: personalVideos //array
        };
        World.arLog("---------tellNativeToDownloadPersonalVideo: " + JSON.stringify(jsonMessage));
        AR.platform.sendJSONObject(jsonMessage);
    },

    sendLogMessageToNative: function (messageString) {
        var jsonMessage = {name: "LogMessageFromWikitudeJS", description: messageString};
        AR.platform.sendJSONObject(jsonMessage);
    },

    handleButtonActionInNative: function (btnActionMode, btnActionParam) {
        var jsonMessage = {
            action: "btn_action",
            mode: btnActionMode, //Int
            param: btnActionParam, //Any
        };
        AR.platform.sendJSONObject(jsonMessage);
    },

    backToGallery: function () {
        SceneBuilder.clearScene();
        AR.platform.sendJSONObject({action: "back_to_gallery"});
    },

    scanQR: function () {
        AR.platform.sendJSONObject({action: "scan_qr_code"});
    },

    sendMarkerRecognized: function (markerId, expId) {
        var jsonMessage = {
            action: "markerRecognized",
            markerId: markerId, //int
            expId: expId, //int
        };
        AR.platform.sendJSONObject(jsonMessage);
    },

    sendExperiencePlayStart: function (expId) {
        var jsonMessage = {
            action: "experiencePlayStart",
            param: expId, //Int
        };
        AR.platform.sendJSONObject(jsonMessage);
    },

    sendExperiencePlayStop: function () {
        var jsonMessage = {
            action: "experiencePlayStop",
        };
        AR.platform.sendJSONObject(jsonMessage);
    },

    createJson: function (expId, type, id, name, value) {
        if (value === undefined) value = "";
        return {
            action: "experienceAction",
            param: {
                expId: expId,
                type: type,
                id: id,
                name: name,
                value: value,
            }
        };
    },

    sendExperienceActionEvent: function (expId, type, id, name, value) {
        if (value && value.length > 100) {
            value = value.substring(0, 45) + "....." + value.substring(value.length - 50, value.length);
        }
        AR.platform.sendJSONObject(this.createJson(expId, type, id, name, value));
    },

    setTrial: function () {
        PlaceHolder.showTrial(true);
    },

    captureScreen: function () {
        AR.platform.sendJSONObject({
            action: "capture_screen"
        });
    },

    endTrial: function () {
        var jsonMessage = {
            action: "end_trial",
        };
        AR.platform.sendJSONObject(jsonMessage);
    },

    showTutorial: function (value) {
        var jsonMessage = {
            action: "showTutorial",
            param: value,
        };
        AR.platform.sendJSONObject(jsonMessage);
    },

    fullScreen: function (url) {
        AR.platform.sendJSONObject({action: "fullScreen", param: url});
    },

    fullScreenVideoFinished: function () {
        Videos.fullScreenVideoFinished()
    }
};
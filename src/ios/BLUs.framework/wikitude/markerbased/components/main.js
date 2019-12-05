let globalResponse = null;
let isMarkerLost = true;
let loadedItems = [];
let markerItemJson = null;
let lastRecognizedMarkerJSON = null;
let objectsToDownload = 0;
let downloadedObjectsCount = 0;
let cachedItemsCount = 0;
let itemsOnScene = new Map();
let animator = new Animator();
let isLockHide = false;
let visibleList = null;
let isSingleScanEnabled = false;

function checkInitialLogic(check) {
    check ? document.querySelector('.swiper-container').style.visibility = 'visible' : uiUtil.hideAndStartAnimate();
}

function backToGallery() {
    NativeBridge.backToGallery();
}

function scanQR() {
    if (SceneBuilder.snapped) SceneBuilder.clearScene();
    NativeBridge.scanQR();
}

window.addEventListener('click', (event) => {
    if (!visibleList) return;
    event.preventDefault();
    event.stopPropagation();
    uiUtil.changeDropDown();
}, false);

function printScreen() {
    NativeBridge.captureScreen();
}

function singleScan() {
    Tracker.scanOnce();
}

function sendHideTutorialInformation() {
    NativeBridge.showTutorial(!document.getElementById('show-screen-tutorial-again-container').checked);
}

const World = {
    currentLatitude: 0,
    currentLongitude: 0,
    clientToken: "",
    endpoint: "",
    targetCollectionID: "",
    groupId: "",
    rotating: false,
    previousDragValue: {x: 0, y: 0},
    cloudRecognitionService: null,
    pixelsPerCell: 72,
    calc: null,
    intervalRecognition: 750,

    init: function () {
        AR.context.onExit = function () {
            World.arLog("+++++++++++++ >>>>>   AR Context Exit   <<<<< +++++++++++++");
            SceneBuilder.clearAllItemsOnScene();
        };
        World.setupEventListeners();
        SceneBuilder.resetItemsOnSceneMap();
        HardwareHelper.addRotateScreenListener();
        World.setupServerLocation();
        NativeBridge.requestClientDataFromNative();
        uiCustomization.customize();
    },

    setupServerLocation: function () {
        AR.context.setCloudRecognitionServerRegion(AR.CONST.CLOUD_RECOGNITION_SERVER_REGION.AMERICAS);
    },

    setupEventListeners: function () {
        document.getElementById("trial-button").addEventListener('touchstart', function () {
            PlaceHolder.showEndTrialPopup();
        }, false);
    },

    toggleSnappingOld: function () {
        let result = PlaceHolder.reverseLockAndScan();
        if (!result) return;
        Tracker.trackable.snapToScreen.enabled = SceneBuilder.snapped;
        uiUtil.invertToggleButton();
        if (isMarkerLost) {
            if (!SceneBuilder.snapped) {
                Videos.pauseAllVideos();
                Sounds.pauseAutoSound();
            }
        }
    },

    toggleSnappingNew: function () {
        uiUtil.setDisabledLock(true);
        if (SceneBuilder.snapped) {
            SceneBuilder.snapped = !SceneBuilder.snapped;
            SceneBuilder.snappedChangingOrientation = false;
            uiUtil.onLoading();
            isLockHide = true;
        } else {
            SceneBuilder.snapped = !SceneBuilder.snapped;
            let result = PlaceHolder.reverseLockAndScan();
            if (!result) return;
        }
        if (SceneBuilder.compareLayouts()) {
            World.toggleSnappingOld();
        } else {
            uiUtil.visibleFlipCamera();
            if (!isLockHide) {
                uiUtil.invertToggleButton();
            }
            isLockHide = false;
            if (SceneBuilder.snapped) {
                Tracker.stopRecognition();
                SceneBuilder.snappingScenes2D();
            } else {
                if (!isSingleScanEnabled) Tracker.startRecognition(World.intervalRecognition);
                if (isMarkerLost) {
                    SceneBuilder.isClearLockScreen = true;
                    SceneBuilder.clearAllItemsOnScene();
                    NativeBridge.sendExperiencePlayStop();
                } else {
                    SceneBuilder.createScene3D();
                }
            }
        }
    },

    setDropdownProofing: function (data) {
        uiUtil.dropDownProofing(data);
    },

    arLog: function (message) {
        AR.logger.warning("BL> " + message);
        NativeBridge.sendLogMessageToNative("-->> ARLOG: " + message);
    },
};
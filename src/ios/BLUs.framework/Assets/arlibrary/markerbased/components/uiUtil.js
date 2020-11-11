const unlockCamera = document.getElementById('unlock-camera-button-container');
const lockCamera = document.getElementById('lock-camera-button-container');
const scanBtn = document.getElementById('scan-button');
const flipCameraBtn = document.getElementById('flip-camera-button-container');
const loadingMsgIcon = document.getElementById("loadingMessage");
const printScreenBtn = document.getElementById("printScreen-camera-button-container");
const flightOffBtn = document.getElementById('flightOff-button-container');
const flightOnBtn = document.getElementById('flightOn-button-container');
const lock = document.querySelector('.lock-camera-button');
const unlock = document.querySelector('.unlock-camera-button');
const dropdownProofing = document.getElementById('dropdown_proofing_list_container');
const qrScanBtn = document.getElementById('tracking-qr-scan-button-container');
const swiperContainer = document.querySelector('.swiper-container');
const dropdownContent = document.querySelector('.dropdown_exp_list_content');
const dropdownBtn = document.querySelector('.dropdown_exp_list_button');
const poorConnection = document.getElementById("poor-connection-view");
const scanningSpinner = document.getElementById("loading_image");
const scanningSpinnerText = document.getElementsByClassName("scanning-text-container")[0];
const cameraSwitch = document.getElementsByClassName("flip-camera-button")[1];
const backBtn = document.getElementById("tracking-model-back-button-container");
const iconSize = document.getElementsByClassName("small-icon");
const backToGalleryBtn = document.getElementById("tracking-model-back-to-gallery-button-container");
const snapshotBtn = document.getElementById("tracking-model-capture-button-container");
const backMarkerlessBtn = document.getElementById("tracking-model-start-stop-button-container");


const uiUtil = {

    defaultLoadingSpinnerAssetPath: "assets/img/spinner_sprite.png",
    defaultLoadingSpinnerTextAssetPath: "assets/loading.wt3",
    defaultSurfaceSpinnerSearchAssetPath: "assets/sprite_color.png",
    defaultSurfaceSpinnerReadyAssetPath: "assets/sprite_white.png",

    defaultLoadingSpinnerFrames: function () {
        let frames = [];
        for (let i = 0; i < 48; i++) frames.push(i);
        return frames;
    },

    invertToggleButton: function () {
        if (SceneBuilder.snapped) {
            unlockCamera.style.display = 'none';
            lockCamera.style.display = 'block';
            scanBtn.style.display = 'none';
            flipCameraBtn.style.display = 'none';
        } else {
            lockCamera.style.display = 'none';
            unlockCamera.style.display = 'block';
            flipCameraBtn.style.display = 'block';
        }
    },

    showProgressBar: function () {
        SceneBuilder.snapped ? loadingMsgIcon.style.visibility = "hidden" : loadingMsgIcon.style.visibility = "visible";
    },

    hideProgressBar: function () {
        loadingMsgIcon.style.visibility = "hidden";
    },

    onLoading: function () {
        uiUtil.hideLock();
        if (SceneBuilder.snapped) printScreenBtn.style.visibility = "visible";
        else {
            printScreenBtn.style.visibility = "hidden";
            flipCameraBtn.style.visibility = "visible";
        }
        uiUtil.showProgressBar();
    },

    showLock: function (opened) {
        scanBtn.style.display = 'none';
        if (SceneBuilder.isEmpty2D()) return;
        if (opened) {
            unlockCamera.style.display = 'none';
            lockCamera.style.display = 'block';
        } else {
            lockCamera.style.display = 'none';
            unlockCamera.style.display = 'block';
        }
    },

    hideLock: function () {
        if (isSingleScanEnabled) scanBtn.style.display = 'block';
        unlockCamera.style.display = 'none';
        lockCamera.style.display = 'none';
    },

    setQRScanVisible: function () {
        let isApplePlatform = (PlatformHandler.platformString() === "ios")

        qrScanBtn.style.display = isApplePlatform ? 'none' : 'block';
        dropdownProofing.style.display = 'block';
    },

    showTutorial: function () {
        loadingMsgIcon.style.visibility = 'hidden';
        swiperContainer.style.visibility = 'visible';
        flipCameraBtn.style.display = "block";
        flipCameraBtn.style.visibility = 'visible';
        flightOffBtn.style.visibility = 'visible';
    },

    hideAndStartAnimate: function () {
        flipCameraBtn.style.display = "block";
        flipCameraBtn.style.visibility = 'visible';
        printScreenBtn.style.visibility = 'hidden';
        flightOffBtn.style.visibility = 'visible';
        swiperContainer.style.visibility = 'hidden';
        scanBtn.style.display = 'block';
        unlockCamera.style.display = "none";
        lockCamera.style.display = "none";
        if (!isSingleScanEnabled) {
            scanBtn.style.display = 'none';
            loadingMsgIcon.style.visibility = 'visible';
        } else {
            scanBtn.style.display = 'block';
            loadingMsgIcon.style.visibility = 'hidden';
        }
        World.init();
    },

    printScreenCameraVisible: function () {
        printScreenBtn.style.visibility = "visible";
        flipCameraBtn.style.visibility = "hidden";
    },

    setDisabledLock: function (check) {
        if (check) {
            if (!lock.classList.contains('disabled')) {
                lock.classList.add('disabled');
            }
            if (!unlock.classList.contains('disabled')) {
                unlock.classList.add('disabled');
            }
        } else {
            if (lock.classList.contains('disabled')) {
                lock.classList.remove('disabled');
            }
            if (unlock.classList.contains('disabled')) {
                unlock.classList.remove('disabled');
            }
        }
    },

    flipScreenHidden: function() {
        printScreenBtn.style.visibility = "visible";
        flipCameraBtn.style.visibility = "hidden";
    },

    visibleFlipCamera: function () {
        flipCameraBtn.style.display = 'block';
        flipCameraBtn.style.visibility = "visible";
    },

    toggleDropDown: function (dropDown, button) {
        if (dropDown.style.display === 'block') {
            dropDown.style.display = 'none';
            button.firstElementChild.classList.add('fa-angle-down');
            button.firstElementChild.classList.remove('fa-angle-up');
        } else {
            dropDown.style.display = 'block';
            button.firstElementChild.classList.remove('fa-angle-down');
            button.firstElementChild.classList.add('fa-angle-up');
        }
    },

    dropDownProofing: function (data) {
        let name = 'Exp:';
        const title = data.title;
        switch (data.state === undefined ? data.name : data.state) {
            case 'pSubExpId':
                name = 'Sub:';
                break;
            case 'pCampaignId':
                name = 'Camp:';
                break;
        }
        let currentItem = [{name, title, id: +data.id, state: true}];
        SceneBuilder.currentProofingExp = {
            name: data.state === undefined ? data.name : data.state,
            title: data.title,
            id: data.id,
        };
        visibleList = [{name, title, id: +data.id, state: true}];
        if (data.value) {
            data.value.forEach((res) => {
                const resData = res.split(';');
                visibleList.push({
                    name: resData[0].charAt(0).toUpperCase() + resData[0].slice(1) + ':',
                    title: resData[2], id: +resData[1], state: false,
                });
            });
        }
        if (dropdownContent && dropdownContent.children && dropdownContent.children.length > 0) {
            while (dropdownContent.firstElementChild) {
                dropdownContent.firstElementChild.remove();
            }
        }
        dropdownBtn.children[1].innerHTML = `${name} ${title}`;
        dropdownBtn.firstElementChild.classList.remove('fa-angle-down');
        if (visibleList.length > 1) {
            visibleList.sort((name1, name2) => {
                if (name1.name < name2.name) {
                    return -1;
                }
                if (name1.name > name2.name) {
                    return 1;
                }
                return 0;
            });
            dropdownBtn.firstElementChild.classList.add('fa-angle-down');
            dropdownBtn.ontouchstart = (event) => {
                event.cancelable = true;
                if (event.cancelable) {
                    event.preventDefault();
                }
                uiUtil.toggleDropDown(dropdownContent, dropdownBtn);
            };
            visibleList.forEach((res) => {
                const elDiv = document.createElement('div');
                elDiv.classList.add('child-dropdown');
                elDiv.attributes.name = res.name;
                elDiv.attributes.id = res.id;
                elDiv.attributes.title = res.title;
                const elIcon = document.createElement('i');
                const elSpan = document.createElement('span');
                elDiv.appendChild(elIcon);
                elDiv.appendChild(elSpan);
                elIcon.classList.add('fa');
                elSpan.classList.add('big-text-child');
                elSpan.innerHTML = `${res.name} ${res.title}`;
                if (res.state) {
                    elIcon.classList.add('fa-check');
                    elDiv.classList.add('active');
                }
                if (res.name === 'Sub:') {
                    elDiv.style.paddingLeft = '15px';
                }
                dropdownContent.appendChild(elDiv);
                elDiv.ontouchstart = (event) => {
                    this.hideLock();
                    event.cancelable = true;
                    if (event.cancelable) {
                        event.preventDefault();
                    }
                    if (event.currentTarget.attributes.id !== currentItem.id && event.currentTarget.attributes.title !== currentItem.title) {
                        for (let i = 0; i < event.currentTarget.parentElement.children.length; i++) {
                            event.currentTarget.parentElement.children[i].classList.remove('active');
                            event.currentTarget.parentElement.children[i].firstElementChild.classList.remove('fa-check');
                        }
                        currentItem = {
                            name: event.currentTarget.attributes.name,
                            title: event.currentTarget.attributes.title,
                            id: event.currentTarget.attributes.id, state: true,
                        };
                        dropdownContent.style.display = 'none';
                        document.getElementById('loadingMessage').style.visibility = 'visible';
                        dropdownBtn.firstElementChild.classList.add('fa-angle-down');
                        dropdownBtn.firstElementChild.classList.remove('fa-angle-up');
                        event.currentTarget.classList.add('active');
                        event.currentTarget.firstElementChild.classList.add('fa-check');
                        dropdownBtn.children[1].innerHTML = `${currentItem.name} ${currentItem.title}`;
                        SceneBuilder.clearScene();
                        if (!isSingleScanEnabled) Tracker.startRecognition(World.intervalRecognition);
                        SceneBuilder.currentProofingExp = currentItem;
                    }
                };
            });
        }
    },

    changeDropDown: function () {
        if (dropdownContent && dropdownBtn) {
            dropdownContent.style.display = 'none';
            if (visibleList.length > 1) {
                dropdownBtn.firstElementChild.classList.add('fa-angle-down');
                dropdownBtn.firstElementChild.classList.remove('fa-angle-up');
            }
        }
    },

    poorConnection: function () {
        poorConnection.classList.remove("anim-poor_connection");
        setTimeout(function () {
            poorConnection.classList.add("anim-poor_connection");
        }, 100);
    },

    trialMode: function (isTrial) {
        let element = document.body;
        if (isTrial) {
            element.classList.remove("normal-mode");
            setTimeout(function () {
                element.classList.add("trial-mode");
            }, 100);
            PlaceHolder.showEndTrialButton(true);
        } else {
            element.classList.remove("trial-mode");
            setTimeout(function () {
                element.classList.add("normal-mode");
            }, 100);
            PlaceHolder.showEndTrialButton(false);
        }
    }
};

function flipCamera() {
    HardwareHelper.flashlight(false);
    HardwareHelper.flipCamera();
    if (AR.hardware.camera.position == AR.CONST.CAMERA_POSITION.FRONT) {
        flightOnBtn.style.visibility = 'hidden';
        flightOffBtn.style.visibility = 'hidden';
    } else {
        flightOnBtn.style.visibility = 'hidden';
        flightOffBtn.style.visibility = 'visible';
    }
}

function checkFlight(check) {
    if (check) {
        flightOffBtn.style.visibility = 'hidden';
        flightOnBtn.style.visibility = 'visible';
    } else {
        flightOnBtn.style.visibility = 'hidden';
        flightOffBtn.style.visibility = 'visible';
    }
    HardwareHelper.flashlight(check);
}


const uiCustomization = {

    resourceAbsolutePath: PlatformHandler.applicationDirectoryPath() + "/BLUcustomization",

    customizationJson: null,

    loadingSpinnerAssetPath: null,
    loadingSpinnerTextAssetPath: null,
    loadingSpinnerFrames: null,

    surfaceSpinnerSearchPath: null,
    surfaceSpinnerReadyPath: null,

    spinnerSize: null,
    iconsSize: null,

    customize: function () {
        if (!this.customizationJson) return;
        const json = this.customizationJson;

        if (json.markerbased !== undefined) {
            this.checkCustomizationFile(Object.keys({scanningSpinner})[0], json.markerbased["scanning-spinner"]);
            this.checkCustomizationFile(Object.keys({scanningSpinnerText})[0], json.markerbased["scanning-spinner-text-svg"]);
            this.checkCustomizationFile(Object.keys({flipCameraBtn})[0], json.markerbased["camera-switch"]);
            this.checkCustomizationFile(Object.keys({lockCamera})[0], json.markerbased["lock-screen-on"]);
            this.checkCustomizationFile(Object.keys({unlockCamera})[0], json.markerbased["lock-screen-off"]);
            this.checkCustomizationFile(Object.keys({qrScanBtn})[0], json.markerbased["qr-button"]);
            this.checkCustomizationFile(Object.keys({backBtn})[0], json.markerbased["back-button"]);
        }

        if (json.markerless !== undefined) {
            this.checkCustomizationFile(Object.keys({backToGalleryBtn})[0], json.markerless["back-to-gallery"]);
            this.checkCustomizationFile(Object.keys({snapshotBtn})[0], json.markerless["snapshot"]);
            this.checkCustomizationFile(Object.keys({backMarkerlessBtn})[0], json.markerless["back-button"]);
        }

        if (json.common !== undefined) {
            this.checkCustomizationFile(Object.keys({flightOffBtn})[0], json.common["flight-off"]);
            this.checkCustomizationFile(Object.keys({flightOnBtn})[0], json.common["flight-on"]);
            this.checkCustomizationFile(Object.keys({printScreenBtn})[0], json.common["snapshot"]);
            if (json.common["icons-size"]) {
                this.iconsSize = json.common["icons-size"];
                if (PlatformHandler.isOrientationLandscape()) this.updateIconSizeLandscape();
                else this.updateIconSizePortrait();
            }
        }

        this.customizeLoadingSpinner();
        this.customizeScanningSpinnerSize();
        this.customizeSurfaceSpinner();
    },

    customizeSurfaceSpinner: async function () {
        if (!this.customizationJson) return;
    
        const json = this.customizationJson;
        if (json.markerless !== undefined) {
            if (PlatformHandler.platformString() === "ios") {
                this.surfaceSpinnerSearchPath = json.markerless["surface-spinner-sprite-search"];
                this.surfaceSpinnerReadyPath = json.markerless["surface-spinner-sprite-ready"];
            } else {
                this.checkCustomizationFile("surfaceSpinnerSearch", json.markerless["surface-spinner-sprite-search"]);
                this.checkCustomizationFile("surfaceSpinnerReady", json.markerless["surface-spinner-sprite-ready"]);
            }
        }
    },

    customizeLoadingSpinner: function () {
        if (!this.customizationJson) return;
        const json = this.customizationJson;
        if (json.markerbased !== undefined) {
            if (PlatformHandler.platformString() === "ios") {
                this.loadingSpinnerAssetPath = json.markerbased["loading-spinner"];
                this.loadingSpinnerTextAssetPath = json.markerbased["loading-spinner-text"];
            } else {
                this.checkCustomizationFile("loadingSpinner", json.markerbased["loading-spinner"]);
                this.checkCustomizationFile("loadingSpinnerText", json.markerbased["loading-spinner-text"]);
            }
            if (json.markerbased["loading-spinner-frames"]) {
                const loadingSpinnerFramesCount = json.markerbased["loading-spinner-frames"];
                this.loadingSpinnerFrames = [];
                for (let i = 0; i < loadingSpinnerFramesCount; i++) this.loadingSpinnerFrames.push(i);
            }
        }
    },

    customizeScanningSpinnerSize: function () {
        if (!this.customizationJson) return;
        const json = this.customizationJson;
        if (json.markerbased !== undefined) {
            if (json.markerbased["scanning-spinner-size"]) {
                this.spinnerSize = json.markerbased["scanning-spinner-size"];
                if (scanningSpinner) { 
                    PlatformHandler.isOrientationLandscape() ? this.updateUiWithLandscape() : this.updateUiWithPortrait();
                }
            }
        }
    },

    updateUiWithLandscape: function () {
        if (scanningSpinner) { scanningSpinner.style.height = this.spinnerSize + "vh"; }
    },

    updateUiWithPortrait: function () {
        if (scanningSpinner) { scanningSpinner.style.height = this.spinnerSize + "vw"; }
    },

    updateIconSizeLandscape: function () {
        if (flipCameraBtn) flipCameraBtn.style.height = this.iconsSize + "vh";;
        if (lockCamera) lockCamera.style.height = this.iconsSize + "vh";;
        if (unlockCamera) unlockCamera.style.height = this.iconsSize + "vh";;
        if (qrScanBtn) qrScanBtn.style.height = this.iconsSize + "vh";;
        if (flightOffBtn) flightOffBtn.style.height = this.iconsSize + "vh";;
        if (flightOnBtn) flightOnBtn.style.height = this.iconsSize + "vh";;
        if (printScreenBtn) printScreenBtn.style.height = this.iconsSize + "vh";;
        if (backToGalleryBtn) {
            backToGalleryBtn.style.height = this.iconsSize + "vh";;
            backToGalleryBtn.style.width = this.iconsSize + "vh";;
        }
        if (snapshotBtn) snapshotBtn.style.height = this.iconsSize + "vh";;
    },

    updateIconSizePortrait: function () {
        if (flipCameraBtn) flipCameraBtn.style.height = this.iconsSize + "vw";
        if (lockCamera) lockCamera.style.height = this.iconsSize + "vw";
        if (unlockCamera) unlockCamera.style.height = this.iconsSize + "vw";
        if (qrScanBtn) qrScanBtn.style.height = this.iconsSize + "vw";
        if (flightOffBtn) flightOffBtn.style.height = this.iconsSize + "vw";
        if (flightOnBtn) flightOnBtn.style.height = this.iconsSize + "vw";
        if (printScreenBtn) printScreenBtn.style.height = this.iconsSize + "vw";
        if (backToGalleryBtn) { 
            backToGalleryBtn.style.height = this.iconsSize + "vw";
            backToGalleryBtn.style.width = this.iconsSize + "vw";
        }
        if (snapshotBtn) snapshotBtn.style.height = this.iconsSize + "vw";
    },

    customizeElements: function (element, path) {
        const filePath = (PlatformHandler.platformString() === "ios") ? path : (this.resourceAbsolutePath + path);
        switch (element) {
            case "scanningSpinner": 
                if (!scanningSpinner) break;
                scanningSpinner.src = filePath; break;
            case "scanningSpinnerText": 
                if (!scanningSpinnerText) break;
                scanningSpinnerText.src = filePath; break;
            case "flipCameraBtn": 
                if (!flipCameraBtn) break;
                flipCameraBtn.src = filePath; break;
            case "lockCamera": 
                if (!lockCamera) break;
                lockCamera.src = filePath; break;
            case "unlockCamera": 
                if (!unlockCamera) break;
                unlockCamera.src = filePath; break;
            case "qrScanBtn": 
                if (!qrScanBtn) break;
                qrScanBtn.src = filePath; break;
            case "backBtn": 
                if (!backBtn) break;
                backBtn.src = filePath; break;
            case "flightOffBtn": 
                if (!flightOffBtn) break;
                flightOffBtn.src = filePath;
                break;
            case "flightOnBtn": 
                if (!flightOnBtn) break;
                flightOnBtn.src = filePath; break;
            case "printScreenBtn": 
                if (!printScreenBtn) break;
                printScreenBtn.src = filePath; break;
            case "loadingSpinner": this.loadingSpinnerAssetPath = filePath; break;
            case "loadingSpinnerText": this.loadingSpinnerTextAssetPath = filePath; break;
            case "backToGalleryBtn": 
                if (!backToGalleryBtn) break;
                backToGalleryBtn.src = filePath; break;
            case "snapshotBtn": 
                if (!snapshotBtn) break;
                snapshotBtn.src = filePath; break;
            case "backMarkerlessBtn": 
                if (!backMarkerlessBtn) break;
                backMarkerlessBtn.src = filePath; break;
            case "surfaceSpinnerSearch": this.surfaceSpinnerSearchPath = filePath; break;
            case "surfaceSpinnerReady": this.surfaceSpinnerReadyPath = filePath; break;
        }
    },

    checkCustomizationFile: function (element, path) {
        var jsonMessage = {
            action: "customization",
            element: element, //Int
            path: path, //Any
        };
        AR.platform.sendJSONObject(jsonMessage);
    }
};
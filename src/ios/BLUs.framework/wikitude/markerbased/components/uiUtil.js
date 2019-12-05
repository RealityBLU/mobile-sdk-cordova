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


const uiUtil = {

    defaultLoadingSpinnerAssetPath: "assets/img/spinner_sprite.png",
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

    showLock: function () {
        scanBtn.style.display = 'none';
        if (SceneBuilder.isEmpty2D()) return;
        unlockCamera.style.display = 'block';
        lockCamera.style.display = 'none';
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
                    elDiv.style.paddingLeft = '20px';
                }
                dropdownContent.appendChild(elDiv);
                elDiv.ontouchstart = (event) => {
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

    uiCustomization().loadingSpinnerAssetPath
}



const uiCustomization = {

    customizationFolderName: "/BLUcustomization",

    customizationJSON: null,

    loadingSpinnerAssetPath: null,
    loadingSpinnerFrames: null,

    surfaceSpinnerSearch: null,
    surfaceSpinnerReady: null,

    init: async function () {
        const filePath =
            PlatformHandler.applicationDirectoryPath() +
            this.customizationFolderName +
            "/customization.json";

        const fileData = await FileUtil.readTextFile(filePath);

        if (fileData) this.customizationJSON = JSON.parse(fileData);
    },

    customize: async function () {
        await this.init();

        if (!this.customizationJSON) return;

        const json = this.customizationJSON;

        if (json.markerbased !== undefined) {
            this.customizeElement(scanningSpinner, json.markerbased["scanning-spinner"]);
            this.customizeElement(scanningSpinnerText, json.markerbased["scanning-spinner-text-svg"]);
            this.customizeElement(cameraSwitch, json.markerbased["camera-switch"]);
            this.customizeElement(lockCamera, json.markerbased["lock-screen-on"]);
            this.customizeElement(unlockCamera, json.markerbased["lock-screen-off"]);
            this.customizeElement(qrScanBtn, json.markerbased["qr-button"]);
        }

        if (json.common !== undefined) {
            this.customizeElement(backBtn, json.common["back-button"]);
            this.customizeElement(flightOffBtn, json.common["flight-off"]);
            this.customizeElement(flightOnBtn, json.common["flight-on"]);
            this.customizeElement(printScreenBtn, json.common["snapshot"]);
        }

        this.customizeLoadingSpinner();
        // this.customizeSurfaceSpinner();
    },

    customizeElement: async function (element, resourcePath) {
        if (!resourcePath) return;

        const resourceAbsolutePath =
            PlatformHandler.applicationDirectoryPath() +
            this.customizationFolderName +
            resourcePath;
        if (await FileUtil.fileExist(resourceAbsolutePath)) {
            element.src = resourceAbsolutePath;
        }
    },

    customizeSurfaceSpinner: async function () {
        if (!this.customizationJSON) return;

        const json = this.customizationJSON;
        if (json.markerless !== undefined) {
            const surfaceSpinnerSearchPath =
                PlatformHandler.applicationDirectoryPath() +
                this.customizationFolderName +
                json.markerless["surface-spinner-sprite-search"];
            if (await FileUtil.fileExist(surfaceSpinnerSearchPath)) this.surfaceSpinnerSearch = surfaceSpinnerSearchPath;

            const surfaceSpinnerReadyPath =
                PlatformHandler.applicationDirectoryPath() +
                this.customizationFolderName +
                json.markerless["surface-spinner-sprite-ready"];
            if (await FileUtil.fileExist(surfaceSpinnerReadyPath)) this.surfaceSpinnerReady = surfaceSpinnerReadyPath;
        }
    },

    customizeLoadingSpinner: async function () {
        if (!this.customizationJSON) return;

        const json = this.customizationJSON;
        if (json.markerbased !== undefined) {
            const loadingSpinnerPath =
                PlatformHandler.applicationDirectoryPath() +
                this.customizationFolderName +
                json.markerbased["loading-spinner"];
            if (await FileUtil.fileExist(loadingSpinnerPath)) {
                this.loadingSpinnerAssetPath = loadingSpinnerPath;

                if (json.markerbased["loading-spinner-frames"]) {
                    const loadingSpinnerFramesCount = json.markerbased["loading-spinner-frames"];
                    this.loadingSpinnerFrames = [];
                    for (let i = 0; i < loadingSpinnerFramesCount; i++) this.loadingSpinnerFrames.push(i);
                }
            }
        }
    }
}
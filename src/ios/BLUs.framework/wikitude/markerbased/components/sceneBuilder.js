var SceneBuilder = {
    snapped: false,
    snappedChangingOrientation: false,
    experience_id: null,
    scene3d: null,
    scene2dPortrait: null,
    scene2dLandscape: null,
    sceneMarker: null,
    alertMessageWithTimer: null,
    isMediaLoaded: false,
    lastData: null,
    isClearLockScreen: false,
    isProofing: false,
    proofingData: null,
    currentProofingExp: null,
    isLockScreenDefault: false,
    isFirstLockScreenStarted: false,

    isValidUrl: function (str) {
        try {
            new URL(str);
            return true;
        } catch (_) {
            World.arLog("url isn't valid, url=" + str);
            return false;
        }
    },
    getDataFromServer: function (response) {
        let request = new XMLHttpRequest();
        let jsonUrl = "";
        let url;
        response.metadata.new_json && SceneBuilder.isValidUrl(response.metadata.new_json) ? jsonUrl = response.metadata.new_json : jsonUrl = World.endpoint + "getExpByIdForMobile/0/";
        !this.isProofing ? url = jsonUrl + World.currentLongitude + "/" + World.currentLatitude : url = jsonUrl + World.currentLongitude + "/" + World.currentLatitude + SceneBuilder.getProofingQuery(response.metadata);
        World.arLog("RECOGNIZED getDataFromServer final URL>>>> " + url + "<<--");
        request.open('GET', url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.overrideMimeType("application/json");
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let data = JSON.parse(this.responseText);
                if (SceneBuilder.isSuccessResponseFromServer(response, data)) {
                    SceneBuilder.parseScenes(data);
                }
            }
        };
        request.send(null);
    },
    getProofingQuery: function (metadata) {
        let proofing = "?proofing=" + this.isProofing + "&";
        let marker = "pMarkerId=" + metadata.m_id + "&";
        if (SceneBuilder.currentProofingExp.name === "Exp:") SceneBuilder.currentProofingExp.name = "pExperienceId";
        if (SceneBuilder.currentProofingExp.name === "Sub:") SceneBuilder.currentProofingExp.name = "pSubExpId";
        if (SceneBuilder.currentProofingExp.name === "Camp:") SceneBuilder.currentProofingExp.name = "pCampaignId";
        if (SceneBuilder.currentProofingExp.name === undefined) SceneBuilder.currentProofingExp.name = this.proofingData.state;
        let dynamic = SceneBuilder.currentProofingExp.name + "=" + SceneBuilder.currentProofingExp.id;
        return proofing + marker + dynamic;
    },
    isSuccessResponseFromServer: function (response, json) {
        if (TextUtils.isEmpty(json.message)) {
            World.arLog("new_json response is empty");
            World.arLog("app will try to use old json");
            SceneBuilder.getDataOldApproach(response);
            //SceneBuilder.showAlertWithTimer("new_json response is empty");
            return false;
        } else if (json.message !== "success") {
            SceneBuilder.showAlertWithTimer(JSON.stringify(json));
            return false;
        } else {
            return true;
        }
    },
    getMarkerId: function (item) {
        if (!TextUtils.isEmpty(item.marker_id)) {
            return item.marker_id;
        } else if (!TextUtils.isEmpty(item.serverID)) {
            return item.serverID;
        } else {
            return -1;
        }
    },
    getLayout2D: function () {
        if (PlatformHandler.isOrientationLandscape()) {
            return SceneBuilder.scene2dLandscape;
        } else {
            return SceneBuilder.scene2dPortrait;
        }
    },
    isEmpty2D: function () {
        let layout2d = SceneBuilder.getLayout2D();
        return TextUtils.isEmpty(layout2d);
    },
    parseScenes: function (json) {
        let expObject = json.scenes.experience.object;
        this.isLockScreenDefault = expObject.isLockScreenDefault !== undefined ? expObject.isLockScreenDefault : false;
        SceneBuilder.experience_id = SceneBuilder.defineExpId(json.experience_id);
        SceneBuilder.scene3d = json.scenes.experience;
        SceneBuilder.scene2dPortrait = json.scenes.portrait;
        SceneBuilder.scene2dLandscape = json.scenes.landscape;
        SceneBuilder.sceneMarker = { //todo: legacy: url and file_path not used, we can use just json.marker but need to change logic in native SDK
            url: json.marker.url,
            file_path: null,
            item: json.marker,
        };
        if (!this.isLockScreenDefault) {
            SceneBuilder.createScene3D()
        } else {
            if (this.isFirstLockScreenStarted && !this.isProofing) SceneBuilder.createScene3D();
            else {
                this.isFirstLockScreenStarted = true;
                World.toggleSnappingNew();
            }
        }
    },
    parseScenesOldApproach: function (experience_id, json) {
        SceneBuilder.experience_id = SceneBuilder.defineExpId(experience_id);
        SceneBuilder.scene3d = json;
        SceneBuilder.scene2dPortrait = null;
        SceneBuilder.scene2dLandscape = null;
        SceneBuilder.createScene3D();
    },
    defineExpId: function (value) {
        return TextUtils.isUndefined(value) ? -1 : value;
    },
    createScene3D: function () {
        SceneBuilder.fillData(SceneBuilder.experience_id, SceneBuilder.scene3d);
    },
    compareLayouts: function () {
        return JSON.stringify(SceneBuilder.scene3d) === JSON.stringify(SceneBuilder.getLayout2D());
    },
    snappingScenes2D: function () {
        SceneBuilder.fillData(SceneBuilder.experience_id, SceneBuilder.getLayout2D());
    },
    displaySceneData: function () {
        if (isMarkerLost) {
            if (!isSingleScanEnabled) uiUtil.showProgressBar();
        } else {
            uiUtil.hideProgressBar();
        }
        if (loadedItems) {
            loadedItems.forEach(loadedItem => {
                if (loadedItem.type === "models") {
                    Models3D.addLoadedModel(loadedItem.data.name, loadedItem.data.uniqueID, loadedItem.data.file_path_1)
                } else if (loadedItem.type === "buttons") {
                    Buttons.addLoadedButton(loadedItem.data.name, loadedItem.data.uniqueID, loadedItem.data.file_path_1)
                } else if (loadedItem.type === "images") {
                    Images.addLoadedImage(loadedItem.data.name, loadedItem.data.uniqueID, loadedItem.data.file_path_1)
                }
            });
            loadedItems = [];
        }
        PlaceHolder.destroyProgressBar3D();
        animator.parseAnimations(Models3D.modelsOnScene());
        if (SceneBuilder.snapped) {
            SceneBuilder.startStreamingDrawables();
        } else {
            if (isMarkerLost) {
                SceneBuilder.stopStreamingDrawables();
            }
        }
        animator.autoPlayOnStart();
        uiUtil.setDisabledLock(false);
    },
    getDataOldApproach: function (response) {
        let markerJson = SceneBuilder.chooseLocationBasedJson(response.metadata);
        let request = new XMLHttpRequest();
        request.open('GET', markerJson[1].childrenJson, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.overrideMimeType("application/json");
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let data = JSON.parse(this.responseText);
                fillMarker(markerJson, data);
            }
        };
        request.send(null);

        function fillMarker(markerJson, data) {
            if (markerJson[0].defaultJson !== markerJson[1].childrenJson) {
                let request = new XMLHttpRequest();
                request.open('GET', markerJson[0].defaultJson, true);
                request.setRequestHeader('Content-Type', 'application/json');
                request.overrideMimeType("application/json");
                request.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        let mainJson = JSON.parse(this.responseText);
                        markerItemJson = SceneBuilder.getMarkerItem(mainJson);
                        data.object.children.push(markerItemJson);
                        SceneBuilder.parseScenesOldApproach(response.metadata.exp_id, data);
                    }
                };
                request.send(null);
            } else {
                SceneBuilder.parseScenesOldApproach(response.metadata.exp_id, data);
            }
        }
    },
    fillData: function (expId, data) {
        let isSame = JSON.stringify(data) === SceneBuilder.lastData;
        if (!isSame) {
            SceneBuilder.lastData = JSON.stringify(data);
            SceneBuilder.getData(data);
        } else {
        	uiUtil.showLock();
        }
    },
    getUniqueId: function (inputUniqueId) {
        if (!TextUtils.isEmpty(inputUniqueId)) {
            return inputUniqueId;
        } else {
            return Math.floor(Math.random() * (1000000 - 10000) + 10000);
        }
    },
    getData: function (item) {
        let argObj = [];
        let argButton = [];
        let argImage = [];
        let argVideo = [];
        Buttons.clearItemButtons();
        Models3D.clearItemModels();
        Videos.clearItemVideos();
        Images.clearItemImages();
        Sounds.cleanSounds();
        World.arLog("------JSON------>>>> " + JSON.stringify(item) + "<<<<<<------");//qqq
        for (let i = 0; i < item.object.children.length; i++) {
            switch (item.object.children[i].type) {
                case "Marker":
                    if (TextUtils.isEmpty(SceneBuilder.sceneMarker)) {
                        SceneBuilder.sceneMarker = {
                            url: item.object.children[i].url,
                            file_path: null,
                            item: item.object.children[i],
                        }
                    }
                    break;
                case "3D object":
                    formatBackwardCompatibility(item.object.children[i], "objectID");
                    argObj.push({
                        uniqueID: item.object.children[i].uniqueID,
                        url: item.object.children[i].url,
                        file_path: null,
                        item: item.object.children[i]
                    });
                    itemModel.push(item.object.children[i]);
                    break;
                case "Social":
                case "Toggle":
                    if (!TextUtils.isEmpty(item.object.children[i].url_pressed)) {
                        let str = item.object.children[i].url_pressed.replace("https://blu-files-stage.realityblu.com", "https://blu-files-stage.s3.amazonaws.com");
                        str = str.replace("https://blu-files.realityblu.com", "https://blu-files-prod.s3.amazonaws.com");
                        item.object.children[i].url_pressed = str;
                    }
                    formatBackwardCompatibility(item.object.children[i], "GeneratingUniqueId");
                    argButton.push({
                        uniqueID: item.object.children[i].uniqueID,
                        url: item.object.children[i].url,
                        url_pressed: item.object.children[i].url_pressed,
                        file_path: null,
                        file_path_pressed: null,
                        item: item.object.children[i]
                    });
                    itemButton.push(item.object.children[i]);
                    break;
                case "Button":
                    formatBackwardCompatibility(item.object.children[i], "GeneratingUniqueId");
                    argButton.push({
                        uniqueID: item.object.children[i].uniqueID,
                        url: item.object.children[i].url,
                        file_path: null,
                        item: item.object.children[i]
                    });
                    itemButton.push(item.object.children[i]);
                    break;
                case "Video":
                    formatBackwardCompatibility(item.object.children[i], "videoID");
                    argVideo.push({
                        uniqueID: item.object.children[i].uniqueID,
                        url: item.object.children[i].url,
                        file_path: null,
                        item: item.object.children[i]
                    });
                    itemVideo.push(item.object.children[i]);
                    break;
                case "Audio":
                    formatBackwardCompatibility(item.object.children[i], "audioID");
                    Sounds.addSound(item.object.children[i]);
                    break;
                case "Image":
                    formatBackwardCompatibility(item.object.children[i], "GeneratingUniqueId");
                    argImage.push({
                        uniqueID: item.object.children[i].uniqueID,
                        url: item.object.children[i].url,
                        file_path: null,
                        item: item.object.children[i]
                    });
                    itemImage.push(item.object.children[i]);
                    break;
            }
        }
        startDownload();

        function formatBackwardCompatibility(value, alternativeProperty) {
            let legacyId = value[alternativeProperty];
            if (!TextUtils.isEmpty(legacyId)) {
                value.uniqueID = legacyId;
                return;
            }
            //prevent from undefine and set NEW uniqueId
            if (TextUtils.isEmpty(value.uniqueID)) {
                value.uniqueID = SceneBuilder.getUniqueId(value.uniqueID);
            }
        }

        function startDownload() {
            if (!isDownloading) {
                Tracker.stopRecognition();
                isDownloading = true;
                objectsToDownload = argObj.length + argButton.length + argImage.length;
                downloadedObjectsCount = 0;
                World.arLog(" RECOGNIZED, [" + SceneBuilder.sceneMarker.name + "] "
                    + argObj.length + " models, " + argButton.length + " btns, " + argVideo.length + " videos, " + argImage.length + " imgs.");
                SceneBuilder.clearAllItemsOnScene();
                PlaceHolder.showPlaceHolderDrawables(SceneBuilder.sceneMarker, argButton, argVideo, argImage, argObj);
                NativeBridge.tellNativeToDownloadSceneData(SceneBuilder.sceneMarker, argObj, argButton, argVideo, argImage,
                    SceneBuilder.experience_id, SceneBuilder.snapped);
            }
        }
    },
    startStreamingDrawables() {
        if (!SceneBuilder.isMediaLoaded) {
            SceneBuilder.isMediaLoaded = true;
            Videos.autoVideos();
            Sounds.autoSounds();
        } else {
        }
    },
    stopStreamingDrawables() {
        Videos.pauseAllVideos();
        Sounds.pauseAutoSound();
        Sounds.pauseManualSound(soundManualCurrent);
    },
    getMarkerItem: function (defaultJson) {
        let markerParent = null;
        for (let i = 0; i < defaultJson.object.children.length; i++) {
            let item = defaultJson.object.children[i];
            if (item.type === 'Marker') {
                markerParent = item;
                break;
            }
        }
        return markerParent;
    },
    chooseLocationBasedJson: function (markerData) {
        let defaultJson = markerData.json;
        let childrenArray = markerData.children;
        let resultItem = [{defaultJson: defaultJson}, {childrenJson: null}];
        if (World.currentLatitude === 0 && World.currentLongitude === 0) {
            resultItem[1].childrenJson = defaultJson;
            return resultItem;
        }
        if (typeof childrenArray !== 'undefined' && childrenArray.length > 0) {
            let resultJson = defaultJson;
            childrenArray.sort(SceneBuilder.compareSubexperiences);
            for (let i = 0; i < childrenArray.length; i++) {
                let lt = childrenArray[i].lt;
                let ln = childrenArray[i].ln;
                let radius = childrenArray[i].radius_value;
                let jsonFile = childrenArray[i].json_file;
                if (Math.abs(World.calc.earthDistanceFrom(lt, ln)) < radius) {
                    resultJson = jsonFile;
                    //   AR.logger.warning("BL> location based json: lt=" + lt + ",ln=" + ln);
                    break;
                }
            }
            SceneBuilder.allowNewDownloadingIfPossible(resultJson);
            resultItem[1].childrenJson = resultJson;
            return resultItem;
        } else {
            SceneBuilder.allowNewDownloadingIfPossible(defaultJson);
            resultItem[1].childrenJson = defaultJson;
            return resultItem;
        }
    },
    allowNewDownloadingIfPossible: function (recognizedMarkerJSON) {
        if (lastRecognizedMarkerJSON === recognizedMarkerJSON) {
            World.arLog(" >>> GOT json same as previous, ignore... " + lastRecognizedMarkerJSON);
        } else {
            lastRecognizedMarkerJSON = recognizedMarkerJSON;
            isDownloading = false; //setting this to false will allow new download to start
            World.arLog(" >>> GOT json new, allow downloading! " + lastRecognizedMarkerJSON);
        }
    },
    compareSubexperiences: function (a, b) {
        if (a.rang < b.rang)
            return -1;
        if (a.rang > b.rang)
            return 1;
        return 0;
    },
    showAlertWithTimer: function (message) {
        let isSame = JSON.stringify(SceneBuilder.alertMessageWithTimer) === JSON.stringify(message);
        if (JSON.stringify(message).includes("Experience not found")) return;
        if (!isSame) {
            SceneBuilder.alertMessageWithTimer = message;
            setTimeout(function () {
                SceneBuilder.alertMessageWithTimer = null;
            }, 3000);
            SceneBuilder.showAlert(SceneBuilder.alertMessageWithTimer);
        } else {
        }
    },
    showAlert: function (message) {
        World.arLog(message);
        alert(message);
    },
    sleep: function (milliseconds) {
        let start = new Date().getTime();
        for (let i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    },
    clearAllItemsOnScene: function () {
        if (Tracker.trackable !== undefined) {
            SceneBuilder.isMediaLoaded = false;
            PlaceHolder.destroyProgressBar3D();
            Models3D.destroyModels();
            Buttons.destroyButton();
            PlaceHolder.destroyAllPlaceholders();
            Videos.destroyVideos();
            for (let i = 0; i < Images.imagesOnScene().length; i++) {
                Tracker.trackable.drawables.removeCamDrawable(Images.imagesOnScene()[i]);
                Images.imagesOnScene()[i].destroy();
            }
            SceneBuilder.resetItemsOnSceneMap();
            animator.cleanAnimatedObjects();
            if (!SceneBuilder.snappedChangingOrientation && !SceneBuilder.isClearLockScreen) {
                Tracker.trackable.destroy();
                Tracker.trackable = undefined;
            }
        }
    },
    clearScene: function () {
        this.clearAllItemsOnScene();
        Buttons.clearItemButtons();
        Models3D.clearItemModels();
        Videos.clearItemVideos();
        Images.clearItemImages();
        Sounds.cleanSounds();
    },
    resetItemsOnSceneMap: function () {
        Buttons.resetItemsOnSceneButton();
        itemsOnScene.set('images', []);
        PlaceHolder.clearItemOnScenePlaceholder();
        Sounds.resetItemsOnSceneSound();
        Models3D.resetItemsOnSceneModels3d();
        Videos.resetItemsOnSceneVideo();
    },

    pauseAllResources: function () {
        Sounds.pauseAllSounds();
        Videos.pauseAllVideos();
        animator.pauseAllAnimations();
    },

    onResume: function () {
        // if (!SceneBuilder.snapped && !isMarkerLost) {
            Videos.resumeAfterPause();
            Sounds.resumeAfterPause();
            animator.resumeAfterPause()
        // }
    },

    onPause: function () {
        // if (!SceneBuilder.snapped) {
            this.pauseAllResources();
        // }
        World.arLog("OnPause() from js");
    }
};


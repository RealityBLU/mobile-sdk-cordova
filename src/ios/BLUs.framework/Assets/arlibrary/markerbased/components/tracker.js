var Tracker = {
    tracker: null,
    createTracker: function () {
        World.cloudRecognitionService = new AR.CloudRecognitionService(World.clientToken, World.groupId, World.targetCollectionID,
            {
                isRecognizeNow: false,
                onInitialized: function () {
                    if (!isSingleScanEnabled) Tracker.startRecognition(World.intervalRecognition); // default was 750
                },
                onError: function (errorMessage) {
                    // errorCode always null in this part of init
                    const exp = new Exception(Exception.TYPE.ClOUD_RECOGNITION, errorMessage);
                    exp.code = -1000;
                    exp.showAlert();
                }
            });
        Tracker.tracker = new AR.ImageTracker(World.cloudRecognitionService, {
            onTargetsLoaded: Tracker.onTargetsLoaded,
            onError: function (errorMessage) {
                new Exception(Exception.TYPE.IMAGE_TRACKER, errorMessage).showAlert();
            }
        });
    },

    trackerImage: function (cam) {
        Tracker.trackable = new AR.ImageTrackable(Tracker.tracker, globalResponse.targetInfo.name, {
            drawables: {
                cam: cam
            },
            snapToScreen: {
                snapContainer: document.getElementById("snapContainer"),
                enabled: SceneBuilder.snapped
            },
            onImageRecognized: function onImageRecognizedFn(targetName) {
                isMarkerLost = false;
                if (SceneBuilder.isClearLockScreen) {
                    SceneBuilder.isClearLockScreen = false;
                    NativeBridge.sendExperiencePlayStart(SceneBuilder.experience_id);
                    SceneBuilder.createScene3D();
                    return;
                }
                if (!SceneBuilder.snapped) {
                    NativeBridge.sendExperiencePlayStart(SceneBuilder.experience_id);
                    Videos.resumeAfterPause();
                    Sounds.resumeAfterPause();
                    animator.resumeAfterPause();
                    PlaceHolder.onComplete();
                    uiUtil.flipScreenHidden();
                    isSingleScanEnabled ? uiUtil.printScreenCameraVisible() : document.querySelector('.scan-button').style.display = 'none';
                }
            },
            onImageLost: function onImageLostFn(targetName) {
                isMarkerLost = true;
                if (!SceneBuilder.snapped) {
                    SceneBuilder.stopStreamingDrawables();
                    uiUtil.onLoading();
                    NativeBridge.sendExperiencePlayStop();
                }
                if (!SceneBuilder.snapped) {
                    !isSingleScanEnabled ? Tracker.startRecognition(World.intervalRecognition) : document.querySelector('.scan-button').style.display = 'block';
                }
            },
            onTargetsLoaded: function () {
            },
            onError: function (errorMessage) {
                World.arLog("  onError  " + errorMessage);
                new Exception(Exception.TYPE.IMAGE_TRACKABLE, errorMessage).showAlert();
            }
        });
    },

    scanOnce: function () {
        uiUtil.showProgressBar();
        World.cloudRecognitionService.startContinuousRecognition(World.intervalRecognition, this.onSingleInterruption, this.onRecognition, this.onRecognitionError);
        setTimeout(this.stopRecognition, 5000);
    },

    startRecognition: function (interval) {
        if (!isSingleScanEnabled && !World.cloudRecognitionService.isRecognizeNow) {
            World.cloudRecognitionService.startContinuousRecognition(interval, this.onInterruption, this.onRecognition, this.onRecognitionError);
            World.cloudRecognitionService.isRecognizeNow = true;
        }
    },

    stopRecognition: function () {
        if (isSingleScanEnabled) uiUtil.hideProgressBar();
        World.cloudRecognitionService.stopContinuousRecognition();
        World.cloudRecognitionService.isRecognizeNow = false;
    },

    onRecognitionError: function (errorCode, errorMessage) {
        const exp = new Exception(Exception.TYPE.ClOUD_RECOGNITION, errorMessage);
        exp.code = errorCode;
        exp.showAlert();
    },

    onSingleInterruption: function (suggestedInterval) {
        Tracker.stopRecognition();
        Tracker.startRecognition(suggestedInterval);
    },

    onInterruption: function (suggestedInterval) {
        SceneBuilder.intervalRecognition = suggestedInterval;
        Tracker.stopRecognition();
        Tracker.startRecognition(suggestedInterval);
    },

    onRecognition: function (recognized, response) {
        if (recognized && World.cloudRecognitionService.isRecognizeNow) {
            SceneBuilder.isClearLockScreen = false;
            if (SceneBuilder.snapped) {
                if (SceneBuilder.isProofing) {
                    SceneBuilder.snapped = false;
                    SceneBuilder.snappedChangingOrientation = false;
                } else {
                    return
                }
            }
            globalResponse = response;
            World.arLog("RECOGNIZED getDataFromServer>>>> " + JSON.stringify(response) + "<<--");
            SceneBuilder.getDataFromServer(response);
        } else {
        }
    }
};
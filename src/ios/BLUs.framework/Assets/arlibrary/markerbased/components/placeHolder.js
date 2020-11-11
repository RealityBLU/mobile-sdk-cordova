const progressBarAnimationDuration = 1500;
const placeholder3DScale = 0.01;
const progressBar3DScale = 0.04;
let progressBarLoading = null;
let progressBarNew = null;
let isDownloading = false;
const PlaceHolder = {

    isSmallLoadingSpinner:false,

    createProgressbar3D: function () {
        let loadingSpinnerTextPath = uiCustomization.loadingSpinnerTextAssetPath || uiUtil.defaultLoadingSpinnerTextAssetPath
        if (loadingSpinnerTextPath.includes(".wt3")) {
            progressBarLoading = new AR.Model(loadingSpinnerTextPath, {
                mirrored: allMirrored,
                scale: {
                    x: progressBar3DScale,
                    y: progressBar3DScale,
                    z: progressBar3DScale
                },
                translate: {
                    x: 0,
                    y: 0,
                    z: -0.32
                },
                rotate: {
                    x: 0,
                    y: 0,
                    z: -90
                },
            });
        } else {
            let spinnerText = new AR.ImageResource(loadingSpinnerTextPath);
            progressBarLoading = new AR.ImageDrawable(spinnerText, 0.05, {
                translate: {
                    x: -0.03,
                    y: 0.03
                },
            });
        }

        let imageSpinner = new AR.ImageResource(uiCustomization.loadingSpinnerAssetPath || uiUtil.defaultLoadingSpinnerAssetPath);
        if (!PlaceHolder.isSmallLoadingSpinner) {
            progressBarNew = new AR.AnimatedImageDrawable(imageSpinner, 1, 512, 512);
            progressBarNew.animate(uiCustomization.loadingSpinnerFrames || uiUtil.defaultLoadingSpinnerFrames(), 40, -1);
        } else {
            progressBarNew = new AR.AnimatedImageDrawable(imageSpinner, 1, 512, 512, {
                scale: {
                    x: 0.41,
                    y: 0.41,
                    z: 0.41
                },
                translate: {
                    x: -0.04,
                    y: 0.04,
                    z: 0
                }
            });
            progressBarNew.animate(uiCustomization.loadingSpinnerFrames || uiUtil.defaultLoadingSpinnerFrames(), 40, -1);
        }
    },

    createPlaceHolder3D: function (m) {
        let key = PlaceHolder.getPlaceholderKey(m.item);
        let holderDrawable3D = new AR.Model("assets/placeholder_3d_ddddddddddddddddddddddddddddddd.wt3", {
            mirrored: allMirrored,
            scale: {
                x: placeholder3DScale,
                y: placeholder3DScale,
                z: placeholder3DScale
            },
            translate: {
                x: World.calc.defineTranslate(m.item.position[0], false),
                y: World.calc.defineTranslate(m.item.position[2], true),
                z: World.calc.defineTranslate(m.item.position[1], false)
            }
        });
        let placeHolderWithKey = {key: key, holder: holderDrawable3D};
        PlaceHolder.placeHoldersOnScene().push(placeHolderWithKey);
        holderDrawable3D.rotationAnimation = new AR.PropertyAnimation(holderDrawable3D, "rotate.z", -25, 335, 10000);
        holderDrawable3D.rotationAnimation.start(-1);
        return holderDrawable3D;
    },

    getPlaceholderKey: function (item) {
        let key = null;
        if (item.uniqueID) {
            key = item.uniqueID;
        } else if (item.name) {
            key = item.name;
        } else {
            key = item.url;
        }
        return key;
    },

    onComplete: function () {
        uiUtil.showLock(SceneBuilder.snapped);
        uiUtil.hideProgressBar();
    },

    placeHoldersOnScene: function () {
        return itemsOnScene.get("placeholders");
    },

    showPlaceHolderDrawables: function (marker, argButton, argVideo, argImage, argObject) {
        let coef = marker.item.height * 1.0 / World.pixelsPerCell;
        World.calc = new Calculator(coef);
        let cam = [];
        PlaceHolder.createProgressbar3D();
        cam.push(progressBarLoading);
        cam.push(progressBarNew);
        if (argButton.length > 0) {
            argButton.forEach(b => {
                cam.push(PlaceHolder.createPlaceHolder3D(b));
            });
        }
        if (argVideo.length > 0) {
            argVideo.forEach(v => {
                if (Videos.videoIsAutomatic(v)) {
                    cam.push(PlaceHolder.createPlaceHolder3D(v));
                }
            });
        }
        if (argImage.length > 0) {
            argImage.forEach(i => {
                cam.push(PlaceHolder.createPlaceHolder3D(i));
            });
        }
        if (argObject.length > 0) {
            argObject.forEach(i => {
                cam.push(PlaceHolder.createPlaceHolder3D(i));
            });
        }
        if (SceneBuilder.snappedChangingOrientation) {
            SceneBuilder.snappedChangingOrientation = false;
            Tracker.trackable.drawables.cam = cam;
            return;
        }
        Tracker.trackerImage(cam);
        uiUtil.setDisabledLock(true);
    },

    showPoorConnection: function () {
        uiUtil.poorConnection();
    },

    showTrial: function (isTrial) {
        uiUtil.trialMode(isTrial);
    },

    showEndTrialButton: function (value) {
        value ? document.getElementById('trial-button').style.visibility = 'visible' : document.getElementById('trial-button').style.visibility = 'hidden';
    },

    showEndTrialPopup: function () {
        new SimpleAlert("Trial mode", "Return the app to standard operation or continue in trial mode")
            .addLeftButton(new SimpleButtonHandler("Cancel", function () {
            }))
            .addRightButton(new SimpleButtonHandler("Leave", function () {
                NativeBridge.endTrial();
                NativeBridge.backToGallery();
            }))
            .showAlert();
    },

    showSimpleAlert: function (title, text) {
        new SimpleAlert(title, text)
            .addLeftButton(new SimpleButtonHandler("OK", function () {
            }))
            .showAlert();
    },

    hidePlaceholderForItem: function (item) {
        let key = PlaceHolder.getPlaceholderKey(item);
        let phs = PlaceHolder.placeHoldersOnScene();
        for (let p = 0; p < phs.length; p++) {
            if (phs[p].key === key) {
                if (phs[p].holder) {
                    VisiabilityHelper.hide(phs[p].holder);
                    break;
                }
            }
        }
    },

    reverseLockAndScan: function () {
        if (isDownloading) {
            return false;
        }
        isMarkerLost ? uiUtil.onLoading() : PlaceHolder.onComplete();
        return true;
    },

    destroyProgressBar3D: function () {
        if (progressBarLoading !== null) {
            Tracker.trackable.drawables.removeCamDrawable(progressBarLoading);
            progressBarLoading.destroy();
            progressBarLoading = null;
        }
        if (progressBarNew !== null) {
            //progressBar3D.dismissAnidm.start(1);
            Tracker.trackable.drawables.removeCamDrawable(progressBarNew);
            progressBarNew.destroy();
            progressBarNew = null;
        }
    },

    destroyAllPlaceholders: function () {
        let phs = PlaceHolder.placeHoldersOnScene();
        for (let p = 0; p < phs.length; p++) {
            if (phs[p].holder) {
                Tracker.trackable.drawables.removeCamDrawable(phs[p].holder);
                phs[p].holder.destroy();
                phs[p].holder = null;
            }
        }
        itemsOnScene.set("placeholders", []);
    },

    destroyPlaceholderForItem: function (item) {
        let key = PlaceHolder.getPlaceholderKey(item);
        let phs = PlaceHolder.placeHoldersOnScene();
        for (let p = 0; p < phs.length; p++) {
            if (phs[p].key === key) {
                if (phs[p].holder) {
                    Tracker.trackable.drawables.removeCamDrawable(phs[p].holder);
                    phs[p].holder.destroy();
                    phs[p].holder = null;
                    break;
                }
            }
        }
    },

    clearItemOnScenePlaceholder: function () {
        itemsOnScene.set("placeholders", []);
    }
};
var HardwareHelper = {
    flipCamera: function () {
        AR.hardware.camera.position == AR.CONST.CAMERA_POSITION.FRONT ? AR.hardware.camera.position = AR.CONST.CAMERA_POSITION.BACK : AR.hardware.camera.position = AR.CONST.CAMERA_POSITION.FRONT;
    },
    addRotateScreenListener: function () {
        window.addEventListener("orientationchange", function () {
            if (SceneBuilder.snapped) {
                SceneBuilder.snappedChangingOrientation = true;
                SceneBuilder.snappingScenes2D();
            }
        });
    },
    flashlight: function (value) {
        AR.hardware.camera.flashlightAvailable ? AR.hardware.camera.flashlight = value : World.arLog("Flashlight is unavailable");
    }
};
var AnalyticsPart = {
    buttonActionId: null,
    sendVideoEvent: function (video) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, Constants.BTN_ACTION_MODE_VIDEO,
            this.buttonActionId, video.name, video.getUri());
    },
    sendAudioEvent: function (audio) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, Constants.BTN_ACTION_MODE_AUDIO,
            this.buttonActionId, audio.name, audio.uri);
    },
    sendAnimationEvent: function (animationSkeletal) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, Constants.BTN_ACTION_MODE_ANIMATION,
            this.buttonActionId, animationSkeletal.model3d.name, animationSkeletal.nameAnimation);
    },
    sendUrlEvent: function (value) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, Constants.BTN_ACTION_MODE_URL,
            this.buttonActionId, "", value);
    },
    sendBusinessEvent: function (type, value) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, type,
            this.buttonActionId, "", value);
    },
    sendShowHideEvent: function (type, value, name) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, type,
            this.buttonActionId, name, value);
    },
    sendButtonEvent: function (type, button) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, type,
            button.uniqueID, button.name, "");
        this.buttonActionId = button.uniqueID;
    },
    sendToggleEvent: function (toggle, value) {
        NativeBridge.sendExperienceActionEvent(SceneBuilder.experience_id, Constants.INPUT_TYPE_TOGGLE,
            toggle.uniqueID, toggle.name, value, null);
        this.buttonActionId = toggle.uniqueID;
    }
};
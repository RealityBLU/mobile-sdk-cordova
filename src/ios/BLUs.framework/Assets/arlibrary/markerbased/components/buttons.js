var itemButton = null;
var Buttons = {
    buttonsOnScene: function () {
        return itemsOnScene.get('buttons');
    },
    createButtonDrawable: function (b) {
        let btnInput = b.item;
        let resNormal = new AR.ImageResource(b.file_path);
        let resClicked = resNormal;
        let isToggle = btnInput.type === 'Toggle';
        if (isToggle && btnInput.url_pressed) {
            resClicked = new AR.ImageResource(btnInput.url_pressed);
        }
        let btn = new AR.ImageDrawable(resNormal, btnInput.height * 1.0 / World.pixelsPerCell, DrawableHelper.imageDrawables2DOptions(btnInput));
        btn.isChecked = false;
        btn.uniqueID = btnInput.uniqueID ? btnInput.uniqueID : 0;
        btn.name = btnInput.name;
        Buttons.buttonsOnScene().push(btn);
        let actions = btnInput.actions;
        if (TextUtils.isEmpty(actions)) {
            if (btnInput.action_mode === Constants.BTN_ACTION_MODE_ANIMATION) {
                let modelId = btnInput.action_param.uniqueID ? btnInput.action_param.uniqueID : btnInput.action_param.id;
                animator.addAnimatedObject(btn, new AnimationSkeletal(modelId, btnInput.action_param.name_animation, false));
            }
        } else {
            actions.forEach(action => {
                if (action.id === Constants.BTN_ACTION_MODE_ANIMATION) {
                    let modelId = action.value.uniqueID;
                    let nameAnimation = action.value.name_animation;
                    animator.addAnimatedObject(btn, new AnimationSkeletal(modelId, nameAnimation, false));
                }
            });
        }

        function timeoutFunc() {
            btn.isClicked = false;
            clearTimeout(timeoutFunc)
        }
        btn.isClicked = false;

        btn.onClick = function () {
            if (btn.isClicked) {
                return;
            } else {
                btn.isClicked = true;
                setTimeout(timeoutFunc, 500)
            }
            if (isToggle) {
                AnalyticsPart.sendToggleEvent(btn, btn.isChecked);
                btn.isChecked = !btn.isChecked;
                btn.isChecked ? btn.imageResource = resClicked : btn.imageResource = resNormal;
            } else if (!TextUtils.isEmpty(btnInput.urlSocial)) {
                AnalyticsPart.sendButtonEvent(Constants.INPUT_TYPE_SOCIAL, btn);
            } else {
                AnalyticsPart.sendButtonEvent(Constants.INPUT_TYPE_BUTTON, btn);
            }
            let actions = btnInput.actions;
            if (TextUtils.isEmpty(actions)) {
                World.arLog("BTN CLICK WARNING: no actions for this button (" + resNormal + "), trying single action approach");
                if (!TextUtils.isEmpty(btnInput.action_param) && !TextUtils.isEmpty(btnInput.action_mode)) {
                    let action = {id: btnInput.action_mode, value: btnInput.action_param};
                    Buttons.performActionOnClick(btn, btnInput, action);
                } else if (!TextUtils.isEmpty(btnInput.urlSocial)) {
                    let action = {id: Constants.BTN_ACTION_MODE_URL, value: btnInput.urlSocial};
                    Buttons.performActionOnClick(btn, btnInput, action);
                }
            } else {
                let sortedActions = Buttons.sortByMode(actions);
                let isNeedDelay = false;
                for (let i = 0; i < sortedActions.length; i++) {
                    if (isNeedDelay) SceneBuilder.sleep(300);
                    Buttons.isExternalAction(sortedActions[i]) ? isNeedDelay = true : isNeedDelay = false;
                    Buttons.performActionOnClick(btn, btnInput, sortedActions[i]);
                }
            }
            return true;
        };
        return btn;
    },

    isExternalAction: function (action) {
        switch (action.id) {
            case Constants.BTN_ACTION_MODE_CALENDAR:
            case Constants.BTN_ACTION_MODE_VCARD:
            case Constants.BTN_ACTION_MODE_PHONE:
            case Constants.BTN_ACTION_MODE_EMAIL:
            case Constants.BTN_ACTION_MODE_URL:
                return true;
            default:
                return false;
        }
    },
    sortByMode: function (actionsArray) {
        let actionsSorted = [];
        let modesArray = [Constants.BTN_ACTION_MODE_SHOW_HIDE,
            Constants.BTN_ACTION_MODE_VIDEO,
            Constants.BTN_ACTION_MODE_AUDIO,
            Constants.BTN_ACTION_MODE_ANIMATION,
            Constants.BTN_ACTION_MODE_CALENDAR,
            Constants.BTN_ACTION_MODE_VCARD,
            Constants.BTN_ACTION_MODE_PHONE,
            Constants.BTN_ACTION_MODE_EMAIL,
            Constants.BTN_ACTION_MODE_URL
        ];
        modesArray.forEach(mode => {
            actionsArray.forEach(action => {
                if (action.id === mode) {
                    actionsSorted.push(action);
                }
            });
        });
        return actionsSorted;
    },
    performActionOnClick: function (buttonDrawable, buttonItem, action) {
        let param = action.value;
        switch (action.id) {
            case Constants.BTN_ACTION_MODE_URL:
                PlatformHandler.oldUrlHandler(param);
                break;
            case Constants.BTN_ACTION_MODE_VIDEO:
                Videos.buttonClick(param);
                break;
            case Constants.BTN_ACTION_MODE_AUDIO:
                Sounds.buttonClick(param);
                break;
            case Constants.BTN_ACTION_MODE_ANIMATION:
                animator.toggleAnimation(buttonDrawable);
                break;
            case Constants.BTN_ACTION_MODE_PHONE:
                if (typeof param === 'string' || param instanceof String) {
                    AnalyticsPart.sendBusinessEvent(action.id, param);
                    NativeBridge.handleButtonActionInNative(action.id, param);
                } else {
                    World.arLog('BTN CLICK ERROR: phone type is incorrect: ' + param);
                }
                break;
            case Constants.BTN_ACTION_MODE_EMAIL:
                AnalyticsPart.sendBusinessEvent(action.id, param);
                NativeBridge.handleButtonActionInNative(action.id, param);
                break;
            case Constants.BTN_ACTION_MODE_CALENDAR:
                AnalyticsPart.sendBusinessEvent(action.id, param.title);
                NativeBridge.handleButtonActionInNative(action.id, param);
                break;
            case Constants.BTN_ACTION_MODE_VCARD:
                AnalyticsPart.sendBusinessEvent(action.id, param.name);
                NativeBridge.handleButtonActionInNative(action.id, param);
                break;
            case Constants.BTN_ACTION_MODE_SHOW_HIDE:
                Buttons.findAndToggleDrawableVisibility(param);
                break;
            default:
                let legacyAction = buttonItem.urlAction;
                let legacySocial = buttonItem.urlSocial;
                if (legacyAction && legacyAction !== '') {
                    PlatformHandler.oldUrlHandler(legacyAction);
                } else if (legacySocial && legacySocial !== '') {
                    PlatformHandler.oldUrlHandler(legacySocial);
                }
                break;
        }
    },
    findAndToggleDrawableVisibility: function (drawableId) { //uniqueID
        let itemFound = false;
        Buttons.buttonsOnScene().forEach(button => {
            if (drawableId === button.uniqueID) {
                button.enabled = !button.enabled;
                itemFound = true;
                AnalyticsPart.sendShowHideEvent(Constants.BTN_ACTION_MODE_SHOW_HIDE, this.getShowHideValue(button.enabled), button.name);
            }
        });
        if (itemFound) return;
        Images.imagesOnScene().forEach(img => {
            if (drawableId === img.uniqueID) {
                img.enabled = !img.enabled;
                itemFound = true;
                AnalyticsPart.sendShowHideEvent(Constants.BTN_ACTION_MODE_SHOW_HIDE, this.getShowHideValue(img.enabled), img.name);
            }
        });
        if (itemFound) return;
        Models3D.modelsOnScene().forEach(model => {
            if (drawableId === model.uniqueID) {
                model.enabled = !model.enabled;
                itemFound = true;
                AnalyticsPart.sendShowHideEvent(Constants.BTN_ACTION_MODE_SHOW_HIDE, this.getShowHideValue(model.enabled), model.name);
            }
        });
    },
    getShowHideValue: function (bool) {
        if (bool) return "show";
        else return "hide"
    },
    addLoadedButton: function (name, id, file_path) {
        if (itemButton) {
            itemButton.forEach(button => {
                let isDrawable = false;
                if (!TextUtils.isEmpty(id)) {
                    isDrawable = id === button.uniqueID;
                } else {
                    isDrawable = button.name === name;
                    if (!isDrawable) isDrawable = button.url === name;
                }
                if (isDrawable) {
                    let itemDrawable = {url: button.url, file_path: file_path, item: button};
                    let btn = Buttons.createButtonDrawable(itemDrawable);
                    Tracker.trackable.drawables.addCamDrawable(btn);
                    PlaceHolder.destroyPlaceholderForItem(button);
                }
            });
        }
    },
    clearItemButtons: function () {
        itemButton = [];
    },
    destroyButton: function () {
        for (let b = 0; b < Buttons.buttonsOnScene().length; b++) {
            Tracker.trackable.drawables.removeCamDrawable(Buttons.buttonsOnScene()[b]);
            Buttons.buttonsOnScene()[b].destroy();
        }
        this.resetItemsOnSceneButton();
    },
    resetItemsOnSceneButton: function () {
        itemsOnScene.set('buttons', []);
    }
};
/*How to use
----------
1.Create Animator object
2.Fill to any model fields 'uniqueID'=int and 'countPlayback'=int
3.Will Create AnimationSkeletal object for any source of animation and register with method addAnimatedObject
4.In the end of preparing scene before play animation you must use call parseAnimations method (input - list of all models)
5.For manage animations use methods: continueAnimation playAutoAnimation autoPlayOnStart toggleAnimation
6.In the end life of scene use cleanAnimatedObjects */

function AnimationSkeletal(idModel, nameAnimation, isAuto) {
    this.idModel = idModel;
    this.nameAnimation = nameAnimation;
    this.isAuto = isAuto;
    this.animationOfModel3d = null;
    this.model3d = null;
}

function Animator() {
    let isInit = false;
    let objectList = new Map(); // Key is source of animation (model3d, button, toggle and etc),
                                // Value is AnimationSkeletal object

    this.addAnimatedObject = function (objectSource, animationSkeletal) {
        if (TextUtils.isEmpty(animationSkeletal.nameAnimation)) return;
        objectList.set(objectSource, animationSkeletal);
    };
    this.cleanAnimatedObjects = function () {
        objectList = new Map();
        isInit = false;
    };
    this.createAnimation = function (keyObject, valueObject, model3d, animator) {
        let anim = new AR.ModelAnimation(model3d, valueObject.nameAnimation,
            {
                onStart: function () {
                },
                onFinish: function () {
                    if (model3d.countPlayback !== -1) {
                        this.isPlaying = false;
                        this.isAnimationStarted = false;
                        this.anim.isSuspended = false;
                        this.pause();
                    }
                }
            });
        anim.isPlaying = false;
        anim.isSuspended = false;
        anim.isAnimationStarted = false;
        return anim;
    };
    this.fillItem = function (key, value, map) {
        let keyObject = key;
        let valueObject = value;
        let isObjectModel = valueObject.idModel < 0;
        let isAnimationStarted = false;
        let isPlaying = false;
        let isSuspended = false;
        try {
            isAnimationStarted = valueObject.animationOfModel3d.isAnimationStarted;
            isPlaying = valueObject.animationOfModel3d.isPlaying;
            isSuspended = valueObject.animationOfModel3d.isSuspended;
        } catch (e) {}
        if (isObjectModel) {
            valueObject.animationOfModel3d = this.createAnimation(keyObject, valueObject, keyObject, this);
            valueObject.model3d = keyObject;
            valueObject.animationOfModel3d.isPlaying = isAnimationStarted;
            valueObject.animationOfModel3d.isAnimationStarted = isPlaying;
            valueObject.animationOfModel3d.isSuspended = isSuspended;
        } else {
            let list3dmodel = map.list3dModel;
            for (let m = 0; m < list3dmodel.length; m++) {
                let model3d = list3dmodel[m];
                if (model3d.uniqueID === valueObject.idModel) {
                    if (!isAnimationStarted) {
                        valueObject.animationOfModel3d = this.createAnimation(keyObject, valueObject, model3d, this);
                        valueObject.model3d = model3d;
                        valueObject.animationOfModel3d.isPlaying = isAnimationStarted;
                        valueObject.animationOfModel3d.isAnimationStarted = isPlaying;
                        valueObject.animationOfModel3d.isSuspended = isSuspended;
                    }
                    break;
                }
            }
        }
    };
    this.parseAnimations = function (modelList) {
        objectList.list3dModel = modelList;
        for (let [key, value] of objectList.entries()) {
            this.fillItem(key, value, objectList);
        }
        objectList.list3dModel = null;
        isInit = true;
    };

    // media controller part
    this.continueAnimation = function () {
        if (!isInit) return;
        objectList.forEach((animationSkeletal) => {
            if (!TextUtils.isEmpty(animationSkeletal.animationOfModel3d) && animationSkeletal.animationOfModel3d.isPlaying) {
                if (animationSkeletal.animationOfModel3d.isAnimationStarted) animationSkeletal.animationOfModel3d.resume();
                else animationSkeletal.animationOfModel3d.start(animationSkeletal.model3d.countPlayback);
            }
        });
    };
    this.autoPlayOnStart = function () {
        objectList.forEach((animationSkeletal, key) => {
            if (animationSkeletal.isAuto) {
                this.playAutoAnimation(key);
            }
        });
    };
    this.playAutoAnimation = function (object) {
        let animationSkeletal = objectList.get(object);
        let animation = animationSkeletal.animationOfModel3d;
        if (TextUtils.isEmpty(animation)) return;
        if (animation.isAnimationStarted) animation.resume();
        else animation.start(animationSkeletal.model3d.countPlayback);
        animation.isPlaying = true;
        animation.isSuspended = false;
        animation.isAnimationStarted = true;
    };
    this.pauseAnimation = function (object, suspended) {
        let animationSkeletal = objectList.get(object);
        if (TextUtils.isEmpty(animationSkeletal)) return;
        let animation = animationSkeletal.animationOfModel3d;
        if (TextUtils.isEmpty(animation)) return;
        animation.pause();
        animation.isPlaying = false;
        if (suspended) animation.isSuspended = true;
    };
    this.resumeAnimation = function (object) {
        let animationSkeletal = objectList.get(object);
        if (TextUtils.isEmpty(animationSkeletal)) return;
        let animation = animationSkeletal.animationOfModel3d;
        if (TextUtils.isEmpty(animation)) return;
        if (animation.isAnimationStarted && animation.isSuspended) {
            animation.resume();
            animation.isPlaying = true;
            animation.isSuspended = false;
            animation.isAnimationStarted = true;
        }
    };
    this.toggleAnimation = function (object) {
        let animationSkeletal = objectList.get(object);
        if (TextUtils.isEmpty(animationSkeletal)) return;
        let animation = animationSkeletal.animationOfModel3d;
        if (TextUtils.isEmpty(animation)) return;
        AnalyticsPart.sendAnimationEvent(animationSkeletal);
        if (animation.isPlaying) {
            animation.isPlaying = false;
            animation.pause();
        } else {
            if (animation.isAnimationStarted) animation.resume();
            else animation.start(animationSkeletal.model3d.countPlayback);
            animation.isPlaying = true;
            animation.isAnimationStarted = true;
        }
        animation.isSuspended = false;
    };

    this.resumeAfterPause = function () {
        objectList.forEach((animationSkeletal, key) => {
            if (!TextUtils.isEmpty(animationSkeletal.animationOfModel3d)) {
                this.resumeAnimation(key);
            }
        });
    };

    this.pauseAllAnimations = function () {
        objectList.forEach((animationSkeletal, key) => {
            if (!TextUtils.isEmpty(animationSkeletal.animationOfModel3d) && animationSkeletal.animationOfModel3d.isPlaying) {
                this.pauseAnimation(key, true);
            }
        });
    };
}







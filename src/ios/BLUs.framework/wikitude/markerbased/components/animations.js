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
    var isLastAnimationFinished = false;
    let isInit = false;
    let objectList = new Map(); // Key is source of animation (model3d, button, toggle and etc),
                                // Value is AnimationSkeletal object
    let modelList = new Map(); //for last animation (in future we can pause last animation of model before start new animation)

    this.addAnimatedObject = function (objectSource, animationSkeletal) {
        if (TextUtils.isEmpty(animationSkeletal.nameAnimation)) return;
        objectList.set(objectSource, animationSkeletal);
    };
    this.cleanAnimatedObjects = function () {
        objectList = new Map();
        modelList = new Map();
        isInit = false;
    };
    this.createAnimation = function (keyObject, valueObject, model3d, animator) {
        let anim = new AR.ModelAnimation(model3d, valueObject.nameAnimation,
            {
                onStart: function () {
                },
                onFinish: function () {
                    if (model3d.countPlayback !== -1) {
                        animator.pauseAnimation(keyObject);
                        isLastAnimationFinished = true
                    }
                }
            });
        anim.isPlaying = false;
        anim.isAnimationStarted = false;
        return anim;
    };
    this.fillItem = function (key, value, map) {
        let keyObject = key;
        let valueObject = value;
        let isObjectModel = valueObject.idModel < 0;
        let isAnimationStarted = false;
        let isPlaying= false;
        try {
            isAnimationStarted = valueObject.animationOfModel3d.isAnimationStarted;
            isPlaying= valueObject.animationOfModel3d.isPlaying;
        } catch (e) {}
        if (isObjectModel) {
            valueObject.animationOfModel3d = this.createAnimation(keyObject, valueObject, keyObject, this);
            valueObject.model3d = keyObject;
            valueObject.animationOfModel3d.isPlaying = isAnimationStarted;
            valueObject.animationOfModel3d.isAnimationStarted = isPlaying;
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
                    }
                    break;
                }
            }
        }
    };
    this.parseAnimations = function (modelList) {
        if (isLastAnimationFinished) return;
        objectList.list3dModel = modelList;
        for (let [key, value] of objectList.entries()) {
            this.fillItem(key, value, objectList);
        }
        objectList.list3dModel = null;
        isInit = true;
    };

    // state handler part
    function saveLastAnimationOfModel(model3d, animation) {
        modelList.set(model3d, animation);
    }

    function getLastAnimationOfModel(model3d) {
        return modelList.get(model3d);
    }

    function pauseLastAnimationOfModel(model3d) {
        let lastAnimation = getLastAnimationOfModel(model3d);
        let isUndefined = TextUtils.isUndefined(lastAnimation);
        if (!isUndefined) {
            lastAnimation.isPlaying = false;
            lastAnimation.pause();
        }
    }

    function handleAction(animationSkeletal) {
        pauseLastAnimationOfModel(animationSkeletal.model3d);
        saveLastAnimationOfModel(animationSkeletal.model3d, animationSkeletal.animationOfModel3d)
    }

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
            if (isLastAnimationFinished) return;
            if (animationSkeletal.isAuto) {
                this.playAutoAnimation(key);
            }
        });
    };
    this.playAutoAnimation = function (object) {
        let animationSkeletal = objectList.get(object);
        let animation = animationSkeletal.animationOfModel3d;
        if (TextUtils.isEmpty(animation)) return;
        handleAction(animationSkeletal);
        if (animation.isAnimationStarted) animation.resume();
        else animation.start(animationSkeletal.model3d.countPlayback);
        animation.isPlaying = true;
        animation.isAnimationStarted = true;
    };
    this.pauseAnimation = function (object) {
        let animationSkeletal = objectList.get(object);
        let animation = animationSkeletal.animationOfModel3d;
        if (TextUtils.isEmpty(animation)) return;
        handleAction(animationSkeletal);
        animation.isPlaying = false;
        animation.pause();
    };
    this.toggleAnimation = function (object) {
        let animationSkeletal = objectList.get(object);
        if (TextUtils.isEmpty(animationSkeletal)) return;
        let animation = animationSkeletal.animationOfModel3d;
        if (TextUtils.isEmpty(animation)) return;
        let lastAnimation = getLastAnimationOfModel(animationSkeletal.model3d);
        let isSame = Object.is(lastAnimation, animation);
        if (!isSame) {
            let isUndefined = TextUtils.isUndefined(lastAnimation);
            if (!isUndefined) {
                lastAnimation.isPlaying = false;
                lastAnimation.pause();
            }
        }
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
        saveLastAnimationOfModel(animationSkeletal.model3d, animation);
    };

    this.resumeAfterPause = function () {
        objectList.forEach((animationSkeletal) => {
            if (!TextUtils.isEmpty(animationSkeletal.animationOfModel3d) && animationSkeletal.animationOfModel3d.isPlaying) {
                animationSkeletal.animationOfModel3d.resume();
            }
        });
    };

    this.pauseAllAnimations = function () {
        objectList.forEach((animationSkeletal) => {
            if (!TextUtils.isEmpty(animationSkeletal.animationOfModel3d) && animationSkeletal.animationOfModel3d.isPlaying) {
                this.pauseAnimation(animationSkeletal.animationOfModel3d);
            }
        });
    };
}







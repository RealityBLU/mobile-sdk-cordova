var itemModel = null;
var modelsScalesPrevious = [];
var modelsScalesInitial = [];
var modelsRotationsPrevious = [];
var modelsRotationsInitial = [];
var Models3D = {
    changeSnapping: function () {
        for (let m = 0; m < Models3D.modelsOnScene().length; m++) {
            let scaleValue = modelsScalesInitial[m];
            modelsScalesPrevious[m] = scaleValue;
            Models3D.modelsOnScene()[m].scale = {x: scaleValue, y: scaleValue, z: scaleValue};
            Models3D.modelsOnScene()[m].rotate = {
                x: modelsRotationsInitial[m].x,
                y: modelsRotationsInitial[m].y,
                z: modelsRotationsInitial[m].z
            };
        }
    },
    addLoadedModel: function (name, id, file_path) {
        if (itemModel) {
            itemModel.forEach(item => {
                let isDrawable = false;
                if (!TextUtils.isEmpty(id)) {
                    isDrawable = id === item.uniqueID;
                } else {
                    isDrawable = item.name === name;//TextUtils.nameFromUrlNoExtension(b.url) === TextUtils.nameNoExtension(name);
                    if (!isDrawable) isDrawable = item.url === name;
                }
                if (isDrawable) {
                    let itemDrawable = {url: item.url, file_path: file_path, item: item};
                    let model = Models3D.createModelDrawable(itemDrawable);
                    Tracker.trackable.drawables.addCamDrawable(model);
                    PlaceHolder.destroyPlaceholderForItem(item);
                }
            });
        }
    },
    createModelDrawable: function (model) {
        let modelIndex = modelsScalesPrevious.length;
        let model3D = new AR.Model(model.file_path, {
            mirrored: allMirrored,
            enabled: model.item.visibility,
            onLoaded: function () {
            },
            onScaleBegan: function () {
            },
            onScaleChanged: function () {
            },
            onDragChanged: function (x, y) {
                if (SceneBuilder.snapped) {
                    let movement = {x: 0, y: 0};
                    /* Calculate the touch movement between this event and the last one */
                    movement.x = World.previousDragValue.x - x;
                    movement.y = World.previousDragValue.y - y;
                    let zRotation = World.calc.degreesToRadians(this.rotate.z);
                    let zCos = Math.cos(zRotation);
                    let zSin = Math.sin(zRotation);
                    /* Rotate the car model accordingly to the calculated movement values and the current orientation of the model. */
                    this.rotate.y += (zCos * movement.x * -1 + zSin * movement.y) * 180;
                    this.rotate.x += (zCos * movement.y + zSin * movement.x) * -180;
                    World.previousDragValue.x = x;
                    World.previousDragValue.y = y;
                }
            },
            onDragEnded: function () {
                if (SceneBuilder.snapped) {
                    World.previousDragValue.x = 0;
                    World.previousDragValue.y = 0;
                }
            },
            onRotationChanged: function (angleInDegrees) {
            },
            onRotationEnded: function () {
            },
            scale: {
                x: World.calc.definePositiveScale(model.item.scale[0]),
                y: World.calc.definePositiveScale(model.item.scale[2]),
                z: World.calc.definePositiveScale(model.item.scale[1])
            },
            rotate: {
                x: World.calc.defineRotate(model.item.rotation[0]),
                y: -1 * World.calc.defineRotate(model.item.rotation[2]),
                z: World.calc.defineRotate(model.item.rotation[1])
            },
            translate: {
                x: World.calc.defineTranslate(model.item.position[0], false),
                y: World.calc.defineTranslate(model.item.position[2], true),
                z: World.calc.defineTranslate(model.item.position[1], false)
            }
        });
        model3D.name = model.item.name;
        model3D.uniqueID = model.item.uniqueID;
        model3D.countPlayback = model.item.countPlayback ? model.item.countPlayback : -1;
        if (model.item.model_animation) {
            animator.addAnimatedObject(model3D, new AnimationSkeletal(-1, model.item.model_animation, true));
        }
        Models3D.modelsOnScene().push(model3D);
        modelsScalesInitial.push(model3D.scale.x);
        modelsScalesPrevious.push(model3D.scale.x);
        modelsRotationsInitial.push({x: model3D.rotate.x, y: model3D.rotate.y, z: model3D.rotate.z});
        modelsRotationsPrevious.push(model3D.rotate.z);
        model3D.onLoaded = function () {
            // World.startAutomaticAnimationForObject(m.item.objectID);
        };
        model3D.onScaleBegan = function () {
            if (SceneBuilder.snapped) {
                modelsScalesPrevious[modelIndex] = model3D.scale.x;
            }
        };
        model3D.onScaleChanged = function (scale) {
            if (SceneBuilder.snapped) {
                let scaleValue = modelsScalesPrevious[modelIndex] * scale;
                model3D.scale = {x: scaleValue, y: scaleValue, z: scaleValue};
            }
        };
        model3D.onRotationChanged = function (angleInDegrees) {
            model3D.rotate.z = modelsRotationsPrevious[modelIndex] - angleInDegrees;
        };
        model3D.onRotationEnded = function () {
            modelsRotationsPrevious[modelIndex] = model3D.rotate.z;
        };
        model3D.onClick = function () {
            animator.toggleAnimation(model3D);
        };
        return model3D;
    },
    modelsOnScene: function () {
        return itemsOnScene.get('models');
    },
    clearItemModels: function () {
        itemModel = [];
    },
    resetItemsOnSceneModels3d: function () {
        itemsOnScene.set('models', []);
        modelsScalesInitial = [];
        modelsScalesPrevious = [];
        modelsRotationsInitial = [];
        modelsRotationsPrevious = [];
    },
    destroyModels: function () {
        for (let m = 0; m < Models3D.modelsOnScene().length; m++) {
            Tracker.trackable.drawables.removeCamDrawable(Models3D.modelsOnScene()[m]);
            Models3D.modelsOnScene()[m].destroy();
        }
    }
};
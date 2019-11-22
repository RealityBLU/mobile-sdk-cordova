const allMirrored = false;
var DrawableHelper = {
    imageDrawables2DOptions: function (item) {
        return {
            enabled: item.visibility,
            mirrored: allMirrored,
            scale: {
                x: World.calc.definePositiveScale(item.scale[0]),
                y: World.calc.definePositiveScale(item.scale[2]),
                z: World.calc.definePositiveScale(item.scale[1])
            },
            rotate: {
                x: -1 * World.calc.defineRotate(item.rotation[0]),
                y: World.calc.defineRotate(item.rotation[2]),
                z: -1 * World.calc.defineRotate(item.rotation[1])
            },
            translate: {
                x: World.calc.defineTranslate(item.position[0], false),
                y: World.calc.defineTranslate(item.position[2], true),
                z: World.calc.defineTranslate(item.position[1], false)
            },
            isTransparent: false
        }
    }
};
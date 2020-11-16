let itemImage = null;
var Images = {
    createImageDrawable: function (i) {
        let imgResource = new AR.ImageResource(i.file_path);
        let image = new AR.ImageDrawable(imgResource, i.item.height * 1.0 / World.pixelsPerCell, DrawableHelper.imageDrawables2DOptions(i.item));
        image.uniqueID = i.item.uniqueID ? i.item.uniqueID : 0;
        image.name = i.item.name;
        Images.imagesOnScene().push(image);
        return image;
    },
    addLoadedImage: function (name, id, file_path) {
        if (itemImage) {
            itemImage.forEach(image => {
                let isDrawable = false;
                if (!TextUtils.isEmpty(id)) {
                    isDrawable = id === image.uniqueID;
                } else {
                    isDrawable = image.name === name;
                    if (!isDrawable) isDrawable = image.url === name;
                }
                if (isDrawable) {
                    let itemDrawable = {url: image.url, file_path: file_path, item: image};
                    let img = Images.createImageDrawable(itemDrawable);
                    Tracker.trackable.drawables.addCamDrawable(img);
                    PlaceHolder.destroyPlaceholderForItem(image);
                }
            });
        }
    },
    imagesOnScene: function () {
        return itemsOnScene.get('images');
    },
    replaceImage: function (source, event, src) {
        source.onerror = null;
        event.target.src = src;
    },
    clearItemImages: function () {
        itemImage = [];
    }
};
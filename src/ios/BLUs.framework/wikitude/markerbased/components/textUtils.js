var TextUtils = {
    isUndefined: function (value) {
        return value === undefined;
    },
    isNull: function (value) {
        return value === null;
    },
    isEmpty: function (value) {
        return value === null || value === undefined || value.length === 0;
    },
    isExist: function (value) {
        return typeof value !== 'undefined'
    },
    isNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    nameFromUrlNoExtension: function (url) {
        return url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
    },
    nameNoExtension: function (name) {
        return name.substring(0, name.lastIndexOf("."));
    }
};
let realOffsetIgnoringMarkerHeight = 23.75;

let Calculator = function (dpiMultiplier) {
    this.dpiMultiplier = dpiMultiplier;
};

Calculator.prototype.definePositiveScale = function (value) {
    return Math.abs(value / this.defineRealOffSet());
};

Calculator.prototype.defineRealOffSet = function () {
    let builder = window['SceneBuilder'] || null; //todo test properly in Scan AR
    return (builder && builder.snapped) ? realOffsetIgnoringMarkerHeight : this.dpiMultiplier;
};

Calculator.prototype.defineRotate = function (value) {
    return this.radiansToDegrees(value);
};

Calculator.prototype.defineTranslate = function (value, shouldInverse) {
    if (shouldInverse) {
        return (-1) * (value / this.defineRealOffSet());
    }
    return value / this.defineRealOffSet();
};

Calculator.prototype.radiansToDegrees = function (value) {
    return value * 57.29578;//180 / Math.PI;
};

Calculator.prototype.degreesToRadians = function (value) {
    return value * 0.01745329252;
};

Calculator.prototype.earthDistanceFrom = function (lat2, lng2) {
    let lat1 = World.currentLatitude;
    let lng1 = World.currentLongitude;
    const earthRadius = 6371000; //Earth radius in m
    var dLat = (function (x) {
        return x * Math.PI / 180;
    })(lat2 - lat1);
    var dLng = (function (x) {
        return x * Math.PI / 180;
    })(lng2 - lng1);
    let sindLat = Math.sin(0.5 * dLat);
    let sindLng = Math.sin(0.5 * dLng);
    var val = Math.pow(sindLat, 2) + Math.pow(sindLng, 2) * Math.cos(/* toRadians */ (function (x) {
        return x * Math.PI / 180;
    })(lat1)) * Math.cos(/* toRadians */ (function (x) {
        return x * Math.PI / 180;
    })(lat2));
    let coef = 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
    let dist = earthRadius * coef;
    return dist;
};

function BLU() {};

BLU.prototype.init = function(key, success, error) {
    cordova.exec(
        (result) => {
            if(typeof success  === 'function') {
                success(result)
            }
        },
        (result) => {
            if(typeof error  === 'function') {
                error(result);
            }
        },
        'BLU',
        'init', 
        [key]
    );
}

BLU.prototype.getMarkerbasedMarkers = function(success, error) {
    cordova.exec(
        (result) => {
            if(typeof success  === 'function') {
                success(JSON.parse(result))
            }
        },
        (result) => {
            if(typeof error  === 'function') {
                error(result);
            }
        }, 
        'BLU', 
        'getMarkerbasedMarkers'
    );
}

BLU.prototype.getMarkerlessGroups = function(success, error) {
    cordova.exec(
        (result) => {
            if(typeof success  === 'function') {
                success(JSON.parse(result))
            }
        },
        (result) => {
            if(typeof error  === 'function') {
                error(result);
            }
        }, 
        'BLU', 
        'getMarkerlessGroups'
    );
}

BLU.prototype.getMarkerlessExperiences = function(groupId, success, error) {
    cordova.exec(
        (result) => {
            if(typeof success  === 'function') {
                success(JSON.parse(result))
            }
        },
        (result) => {
            if(typeof error  === 'function') {
                error(result);
            }
        }, 
        'BLU', 
        'getMarkerlessExperiences', 
        [groupId]
    );
}

BLU.prototype.startMarkerbased = function(settings, success, error) {
    cordova.exec(
        (result) => {
            if(typeof success  === 'function') {
                success(result)
            }
        },
        (result) => {
            if(typeof error  === 'function') {
                error(result);
            }
        },
        'BLU', 
        'startMarkerbased', 
        [settings]
    );
}

BLU.prototype.startMarkerless = function(markers, success, error) {
    cordova.exec(
        (result) => {
            if(typeof success  === 'function') {
                success(result)
            }
        },
        (result) => {
            if(typeof error  === 'function') {
                error(result);
            }
        },
        'BLU', 
        'startMarkerless', 
        markers
    );
}

BLU.install = function() {
    if (!window.blu) {
        window.blu = new BLU();
    }
    return window.blu;
};

cordova.addConstructor(BLU.install);
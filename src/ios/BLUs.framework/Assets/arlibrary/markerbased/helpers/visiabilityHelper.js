var VisiabilityHelper = {
    show: function (view) {
        view.translate.z = view.translate.z_old;
    },
    hide: function (view) {
        if (view.translate.z === 100) { //attempt to hide twice we should ignore
            return;
        }
        view.translate.z_old = view.translate.z;
        view.translate.z = 100;
    }
};
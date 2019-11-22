function Exception(type, message) {
    this.type = type;
    this.message = message;
    this.showAlert = function () {
        switch (this.type) {
            case Exception.TYPE.ClOUD_RECOGNITION:
                /*
                 codes:
                 -1000 without code from cloudRegognitionService
                 1001 connection troubles
                 */
                World.arLog("--->from JS -> " + type.source + ", code=" + this.code + ", message=" + this.message);
                let messageText = JSON.stringify(this.message);
                if ((this.code === -1000 && messageText.indexOf("connection") !== -1) //"Network connection could not be established..."
                    || (this.code === 1001 && messageText.indexOf("connect") !== -1)) { //"Failed to connect to..."
                    PlaceHolder.showPoorConnection();
                } else if (this.code === -1000 && messageText.indexOf("Underlaying error: 412 - TARGET_COLLECTION_PRECONDITION_FAILED. " +
                    "The target collection exists, but cannot be used in the cloud.Causes:  -- cause 0 - errorIdentifier: ERRCAPAT1 -- -- cause 1 - tcId: no valu") !== -1) {
                    // alert("Please create at least one experience to start scanning");
                    PlaceHolder.showSimpleAlert("", "Please create at least one experience to start scanning");
                } else if (this.code !== 1001) {
                    alert("code=" + this.code + ", " + messageText);
                }
                break;

            case Exception.TYPE.IMAGE_TRACKER:
            case Exception.TYPE.IMAGE_TRACKABLE:
                World.arLog("--->from JS -> " + type.source + ", message=" + this.message);
                //alert(this.message);
                PlaceHolder.showPoorConnection();
                break;

            case Exception.TYPE.INTERRUPTION_RECOGNITION:
                World.arLog("--->from JS -> " + type.source + ", message=" + this.message);
                break;

            default:
                World.arLog("--->from JS -> " + type.source + ", message=" + this.message);
                break;
        }
    };
}

Exception.TYPE = {
    UNKNOWN: {value: 0, source: "from unknown", message: ""},
    ClOUD_RECOGNITION: {value: 1, source: "from cloud recognition service", message: ""},
    IMAGE_TRACKER: {value: 2, source: "from image tracker", message: ""},
    IMAGE_TRACKABLE: {value: 3, source: "from image trackable", message: ""},
    INTERRUPTION_RECOGNITION: {value: 4, source: "from cloud recognition", message: ""}
};
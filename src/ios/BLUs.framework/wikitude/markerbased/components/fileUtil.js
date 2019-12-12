var FileUtil = {
    readTextFile: async function (filePath) {
        //  Due to Safari security restrictions on using XMLHttpRequest 
        //  return true for iOS platform every time
        if (PlatformHandler.platformString() === "ios") return true;

        var localFileSystemRequest = new XMLHttpRequest();
        localFileSystemRequest.overrideMimeType("application/json");
        localFileSystemRequest.open("GET", filePath, false);
        await localFileSystemRequest.send();
        return localFileSystemRequest.responseText;
    },
    fileExist: async function (filePath) {
        //  Due to Safari security restrictions on using XMLHttpRequest 
        //  return true for iOS platform every time
        if (PlatformHandler.platformString() === "ios") return true;

        var localFileSystemRequest = new XMLHttpRequest();
        localFileSystemRequest.open('HEAD', filePath, false);
        await localFileSystemRequest.send();
        return localFileSystemRequest.responseText.length != 0;
    }
};
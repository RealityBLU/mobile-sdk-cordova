var FileUtil = {
    readTextFile: async function (filePath) {
        var localFileSystemRequest = new XMLHttpRequest();
        localFileSystemRequest.overrideMimeType("application/json");
        localFileSystemRequest.open("GET", filePath, false);
        await localFileSystemRequest.send();
        return localFileSystemRequest.responseText;
    },
    fileExist: async function (filePath) {
        var localFileSystemRequest = new XMLHttpRequest();
        localFileSystemRequest.open('HEAD', filePath, false);
        await localFileSystemRequest.send();
        return localFileSystemRequest.responseText.length != 0;
    }
};
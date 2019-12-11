# Prerequisites

- Android SDK installed on your development machine (Android development only)
- Xcode installed on your development machine (iOS development only)
- Cordova CLI installed via npm (`npm install -g cordova`)
- Git LFS support ([installation instruction](https://github.com/git-lfs/git-lfs/wiki/Installation))
- Your personal trial license key from [License Page](https://www.realityblu.com/pricing/)
- Your personal project ID which is registered in our system (Set it in your `config.xml` file)


Note: This plugin requires a camera permission. For Android development you should request the `CAMERA` permission in your code (for example by [cordova-plugin-permission](https://www.npmjs.com/package/cordova-plugin-permission)).

# Versions and Compatibility
- Android SDK version 21+
- iOS version 11.1+
- Cordova version 9+
- git >= 1.8.2

# Setup plugin
Note: It is considered that all the manipulations are done in the root of a project unless explicitly told otherwise

## 1. Enable Git LFS support for a project
```sh
git lfs install
```

## 2. Add plugin to a project
```sh
cordova plugin add https://github.com/RealityBLU/mobile-sdk-cordova.git#v1.2.0
```
It can takes some minutes because a plugin size is ~250MB.

Important note!
- The above command should be run for each new environment for set up all dependencies.
- In some cases different linux distributions may encounter issues with downloading big files from Git LFS. In this case see [resolving issues section](#resolving-issues) for a solution.
## 3. Add platform
```sh
cordova platform add ios
cordova platform add android
```
## 4. Build project
```sh
cordova build ios
cordova build android
```
iOS notes:
- This plugin requires a signing of code. You should open a generated project (after step 2) by xcode and select a necessary provisioning profile.
- iOS sdk works only with real devices (not simulators). For build your project you should connect any device with iOS.

# Initialization
Before we start please visit our [BLUairspace](https://www.realityblu.com) site to obtain unique RealityBLU license key linked to bundle identifier of your application.
```js
blu.init(licenseKey, () => {
    // handle a success result
}, (error) => {
    // handle an error result
});
```
This method will send an initialization request to BLUs server and obtain all the needed data.

# API

## Markerbased
By calling this API you create a new screen that is needed to scan markers and display experiences after the marker is detected.
```js
blu.startMarkerbased(options, () => {
    // handle a success result
}, (error) => {
    // handle an error result
});
```
Available options
```js
{
    isProofingEnabled // for proofing mode, boolean, by default false
}
```
After that user can start pointing the camera at the marker. When the marker is recognized, the experience will be downloaded and shown.

BLUairspace platform allows to upload markers and associate them with your application. This is sufficient for letting your end-users download and print markers on their own. Please note that the list of downloadable markers is configured separately from the markers you use in your experiences.
You can get the list of configured markers using `getMarkerbasedMarkers`.
```js
blu.getMarkerbasedMarkers((markers) => {
    // handle a success result
}, (error) => {
    // handle an error result
});
```

## Markerless
Markerless API allows you to upload your own models and create groups with them, that allows user find what they need to see. Markerless API helps you to download and initialize user selected experiences as well as prepare augmented reality camera screen to appear.
Note that `arrayOfExperiences` should be array of full experience objects and not only ids.

```js
blu.startMarkerless(arrayOfExperiences, () => {
    // handle a success result
}, (error) => {
    // handle an error result
});
```
To get the list of formed groups, you'll need to make the following method call
```js
blu.getMarkerlessGroups((groups) => {
    // handle a success result
}, (error) => {
    // handle an error result
});
```
After that you could obtain markerless experience list out of selected group by the method call
```js
blu.getMarkerlessExperiences(groupId, (experiences) => {
    // handle a success result
}, (error) => {
    // handle an error result
});
```

# Customization
You can customize UI components such as images of scanning and icons of buttons by modifying a `customization.json` in the folder `BLUcustomization`. This folder is placed in the generated platform project.
##### iOS
```sh
cd platforms/ios/{PROJECT_NAME}/Resources/BLUcustomization
```
##### Android
```sh
cd platforms/android/app/src/main/assets/BLUcustomization
```

Structure of the customization.json
```json
{
    "markerbased": {
        "scanning-spinner": "/markerbased/scanning-spinner.png",
        "scanning-spinner-text-svg": "/markerbased/scanning-spinner.svg",
        "loading-spinner": "/markerbased/loading-spinner.png",
        "loading-spinner-frames": 48,
        "camera-switch": "/markerbased/camera-switch.png",
        "lock-screen-on": "/markerbased/lock-screen-on.png",
        "lock-screen-off": "/markerbased/lock-screen-off.png",
        "qr-button": "/markerbased/qr-button.png"
    },
    "common": {
        "back-button": "/common/back-button.png",
        "snapshot": "/common/snapshot.png",
        "flight-off": "/common/flight-off.png",
        "flight-on": "/common/flight-on.png"
    }
}
```

# Resolving issues

**Error**: Failed to install 'cordova-plugin-blu-sdk': CordovaError: Version of installed plugin: "cordova-support-kotlin@1.1.0" does not satisfy dependency plugin requirement "cordova-support-kotlin@^1.2.0".

**Reason**: Conflict of versions in the 3rd party plugin.

**Solution**: Remove existing `platforms` and `plugins` folder then repeat setup plugin steps.
___
**Error**: `npm ERR! 404 'cordova-plugin-blu-sdk' is not in the npm registry.`

**Reason**: Plugin doesn't have a npm repository.

**Solution**: Remove existing `platforms` and `plugins` folder then repeat setup plugin steps.
___

**Error**: In some cases Linux distributions download not full files from Git LFS but only meta infomation. Files can be checked in this locations:
 - `node_modules/@blu/cordova-plugin-blu-sdk/src/android/BLUAndroidSDK.aar`
 - `node_modules/@blu/cordova-plugin-blu-sdk/src/ios/BLUs.framework/BLUs`
 - `node_modules/@blu/cordova-plugin-blu-sdk/src/ios/WikitudeSDK.framework/WikitudeSDK`
-  `plugins/cordova-plugin-blu-sdk/src/android/BLUAndroidSDK.aar`
 - `plugins/cordova-plugin-blu-sdk/src/ios/BLUs.framework/BLUs`
 - `plugins/cordova-plugin-blu-sdk/src/ios/WikitudeSDK.framework/WikitudeSDK`

If at least one of the files size is less than 1mb then it was not downloaded properly from the Git LFS
**Reason**: Caching issues with `Git LFS` and `npm`
**Solution**: Possible solutions to the issue are:
- running `git lfs pull` manually from the root of the project may resolve the issue
- manually copying files from repo to locations above to replace meta files with real ones
- clearing npm cache fixes issue:
- - run `npm cache clear --force`
- - run `npm cache verify`
- - [add plugin](#2-add-plugin-to-a-project) to the project again

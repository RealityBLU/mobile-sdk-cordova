# Prerequisites

- Android SDK installed on your development machine (Android development only)
- Xcode installed on your development machine (iOS development only)
- Cordova CLI installed via npm
- Your personal trial license key from [License Page](https://www.realityblu.com/pricing/)
- Your personal project ID which is registered in our system (Set it in your `config.xml` file)

Note: This plugin requires a camera permission. For Android development you should request the `CAMERA` permission in your code (for example by [cordova-plugin-permission](https://www.npmjs.com/package/cordova-plugin-permission)).

# Versions and Compatibility
- Android SDK version 21+
- iOS version 11.1+
- Cordova version 9+

# Setup plugin

## 1. Add plugin to a project
```sh
cordova plugin add https://github.com/RealityBLU/mobile-sdk-cordova.git#v1.2.0
```
It can takes some minutes because a plugin size is ~250MB.

Important note!
- The above command should be run for each new environment for set up all dependencies.
## 2. Add platform
```sh
cordova platform add ios
cordova platform add android
```
## 3. Build project
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
    isProofingEnabled // for proofing mode, type boolean, by default false
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
```
cd platforms/ios/{PROJECT_NAME}/Resources/BLUcustomization // for iOS
cd platforms/android/app/src/main/assets/BLUcustomization // for Android
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

**Solution**: Remove existing platforms and plugins folder then repeat setup plugin steps.
___
**Error**: npm ERR! 404 'cordova-plugin-blu-sdk' is not in the npm registry.

**Reason**: Plugin hasn't a npm repository.

**Solution**: Remove existing platforms and plugins folder then repeat setup plugin steps.

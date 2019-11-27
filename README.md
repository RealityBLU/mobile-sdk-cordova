# Setup plugin

## 1. Add plugin to a project
```sh
cordova plugin add https://github.com/RealityBLU/mobile-sdk-cordova.git#v1.1.0
```
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

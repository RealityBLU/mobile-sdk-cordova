# Setup plugin

## 1. Add plugin to a project
```sh
cordova plugin add https://github.com/RealityBLU/mobile-sdk-cordova.git#v1.0.0
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

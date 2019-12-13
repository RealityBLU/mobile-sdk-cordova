var xcode = require('xcode');
var fs = require('fs');
var path = require('path');

const xcodeProjPath = fromDir('platforms/ios', '.xcodeproj', false);
const projectPath = xcodeProjPath + '/project.pbxproj';
const myProj = xcode.project(projectPath);
const script = 'sh "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/BLUs.framework/strip_framework.sh" -s -p "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/BLUs.framework" sh "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/WikitudeSDK.framework/strip_wikitude_framework.sh" -s -p "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/WikitudeSDK.framework"';
var options = { shellPath: '/bin/sh', shellScript: script };

myProj.parse(function(err) {
  myProj.addBuildPhase([], 'PBXShellScriptBuildPhase', 'Run a script',myProj.getFirstTarget().uuid, options);
  fs.writeFileSync(projectPath, myProj.writeSync());
})

function fromDir(startPath, filter, rec, multiple) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }
  const files = fs.readdirSync(startPath);
  var resultFiles = [];
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory() && rec) {
      fromDir(filename, filter); //recurse
    }

    if (filename.indexOf(filter) >= 0) {
      if (multiple) {
        resultFiles.push(filename);
      } else {
        return filename;
      }
    }
  }
  if (multiple) {
    return resultFiles;
  }
}
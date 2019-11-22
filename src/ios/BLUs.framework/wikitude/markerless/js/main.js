const defaultScaleValue = 0.01;
const defaultRotationValue = 0;
let markerModelMaxTranslate = 50;
const reinitializingDelay = 2; // seconds
let currentReinitializingTimer = 2; // seconds
var isTracking = false;
var canUseARKitCore = -1; // -1 if not initialized, 1 if can, 0 if can not
var rotationValues = [];
var scaleValues = [];
var allCurrentModels = [];
var nodeModels = [];
var jsonResponse = [];
var oneFingerGestureAllowed = false;
var isAnimationTimeoutPassed = true;
var canShowPlacingInstructions = true;
var isCustomizedSpriteColor = false;
var isCustomizedSpriteWhite = false;

AR.context.on2FingerGestureStarted = function () {
  oneFingerGestureAllowed = false;
};

function setSpriteColor() {
  isCustomizedSpriteColor = true;
}

function setSpriteWhite() {
  isCustomizedSpriteWhite = true;
}

const World = {
  calc: null,
  modelItems: [],
  modelsAnimationNames: [],
  modelsAnimations: [],
  /*
      requestedModel is the index of the next model to be created. This is necessary because we have to wait one frame in order to pass the correct initial position to the newly created model.
      initialDrag is a boolean that serves the purpose of swiping the model into the scene. In the moment that the model is created, the drag event has already started and will not be caught by the model, so the motion has to be carried out by the tracking plane.
      lastAddedModel always holds the newest model in allCurrentModels so that the plane knows which model to apply the motion to.
  */
  requestedModel: -1,
  initialDrag: false,
  markerModel: null,
  activeMode: true,
  loaded: false,
  initialized: true,
  createOverlaysCalled: false,
  initModel: null,
  msLog: function (message) {
    AR.logger.warning("BL> " + message);
    World.sendLogMessageToNative("-->> MSLOG: " + message);
  },

  switchTrackingModelInstruction: function () {
    canShowPlacingInstructions ?
      document.getElementById('tracking-model-instruction-container').style.display = 'block' : World.hideTrackingModelInstruction();
  },

  hideTrackingModelInstruction: function () {
    document.getElementById('tracking-model-instruction-container').style.display = 'none';
  },

  isARInitializing: function () {
    return World.tracker.state === AR.InstantTrackerState.INITIALIZING
  },

  isARTracking: function () {
    return (this.tracker.state === AR.InstantTrackerState.TRACKING);
  },

  takeData: function (value, flagText) {
    World.calc = new Calculator(0);
    canShowPlacingInstructions = flagText === 'true';
    jsonResponse = JSON.parse(value);
    this.showContent(jsonResponse);
  },

  sendLogMessageToNative: function (messageString) {
    const jsonMessage = {
      name: "LogMessageFromWikitudeJS",
      id: 1,
      description: messageString,
    };
    AR.platform.sendJSONObject(jsonMessage);
  },

  addModelItem: function (position) {
    let jsonItem = jsonResponse[position];
    World.sendLogMessageToNative("addModelItem : " + JSON.stringify(jsonItem));
    this.modelItems.push(jsonItem);
  },

  showContent: function (jsonResponse) {
    if (jsonResponse.length < 6) {
      World.initializeItems(jsonResponse.length);
    }
  },

  initializeItems: function (count) {
    for (let i = 0; i < count; i++) {
      let btnKey = "image-model-" + i;
      document.getElementById(btnKey).src = jsonResponse[i].iconPath;
      World.addModelItem(i);
      this.createAnimations(jsonResponse[i].obj_animations);
    }
    let countKey = "count-" + count;
    document.getElementById("tracking-controls-container-lower").classList.add(countKey);
  },

  createAnimations: function (modelAnimationField) {
    modelAnimationField ? this.modelsAnimationNames.push(modelAnimationField) : this.modelsAnimationNames.push("");
  },

  init: function () {
    AR.hardware.smart.isPlatformAssistedTrackingSupported();
  },

  startAr: function (isSmart) {
    if (!World.createOverlaysCalled) {
      World.createOverlays(isSmart);
      World.createOverlaysCalled = true;
    }
  },

  createOverlays: function (isSmart) {
    console.log("createOverlays, isSmart=" + isSmart);
    const crossHairsBlueDrawable = new AR.ImageDrawable(new AR.ImageResource("assets/crosshairs_blue.png"), 1.0);
    canUseARKitCore = isSmart;
    this.tracker = new AR.InstantTracker({
      smartEnabled: canUseARKitCore === 1,
      deviceHeight: 1.0,
      onChangedState: function onChangedStateFn(state) {
      },
      onError: function (errorMessage) {
        alert(errorMessage);
      }
    });
    World.initModel = new AR.AnimatedImageDrawable(new AR.ImageResource(isCustomizedSpriteColor ? "file:///android_asset/customization/sprite_color.png" : "assets/sprite_color.png"), 0.6, 270, 270, {});
    World.initModel.animate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 90, -1);
    //called 1
    if (canUseARKitCore === 1) {
      this.instantTrackable = new AR.InstantTrackable(this.tracker, {
        drawables: {
          cam: crossHairsBlueDrawable,
          initialization: World.initModel
        },
        onTrackingStarted: function onTrackingStartedFn() {
          document.getElementById('mainPage').style.display = 'block';
          document.getElementById('miss-view-marker').style.visibility = 'hidden';
        },
        onTrackingStopped: function onTrackingStoppedFn() {
          if (World.activeMode) {
            document.getElementById('mainPage').style.display = 'none';
            document.getElementById('miss-view-marker').style.visibility = 'visible';
          } else {
            World.activeMode = true;
          }
        },
        onTrackingPlaneClick: function onTrackingPlaneClickFn(xPos, yPos) {
          World.onTrackingPlaneClick(xPos, yPos);
        },
        onTrackingPlaneDragBegan: function (xPos, yPos) {
          World.onTrackingPlaneDragBegan(xPos, yPos);
        },
        onTrackingPlaneDragChanged: function (xPos, yPos) {
          World.onTrackingPlaneDragChanged(xPos, yPos);
        },
        onTrackingPlaneDragEnded: function (xPos, yPos) {
          World.onTrackingPlaneDragEnded(xPos, yPos);
        },
        onError: function (errorMessage) {
          alert(errorMessage);
        }
      });
      setInterval(function () {
          currentReinitializingTimer += 1;
          if (currentReinitializingTimer > reinitializingDelay) {
            if (World.tracker.canStartTracking) {
              if (!isTracking) {
                World.changeTrackerState();
              }
            } else {
              World.instantTrackable.drawables.initialization = [World.initModel];
              if (World.isARInitializing()) {
                document.getElementById('tracking-model-start-stop-button-container').style.display = 'none';
                document.getElementById("initialization-back-button-container").style.display = "block";
              }
            }
          }
        },
        1000
      );
    } else {
      this.instantTrackable = new AR.InstantTrackable(this.tracker, {
        drawables: {
          cam: crossHairsBlueDrawable,
          initialization: World.initModel
        },
        onTrackingStarted: function onTrackingStartedFn() {
          //called 5
          document.getElementById('mainPage').style.display = 'block';
          document.getElementById('miss-view-marker').style.visibility = 'hidden';
        },
        onTrackingStopped: function onTrackingStoppedFn() {
          if (World.activeMode) {
            document.getElementById('mainPage').style.display = 'none';
            document.getElementById('miss-view-marker').style.visibility = 'visible';
          } else {
            World.activeMode = true;
          }
        },
        onTrackingPlaneClick: function onTrackingPlaneClickFn(xPos, yPos) {
          World.onTrackingPlaneClick(xPos, yPos);
        },
        onTrackingPlaneDragBegan: function (xPos, yPos) {
          World.onTrackingPlaneDragBegan(xPos, yPos);
        },
        onTrackingPlaneDragChanged: function (xPos, yPos) {
          World.onTrackingPlaneDragChanged(xPos, yPos);
        },
        onTrackingPlaneDragEnded: function (xPos, yPos) {
          World.onTrackingPlaneDragEnded(xPos, yPos);
        },
        onError: function (errorMessage) {
          alert(errorMessage);
        }
      });
      document.getElementById("initialization-back-button-container").style.display = "block";
      World.showStartBackButton();
    }
    World.setupEventListeners()
  },

  onTrackingPlaneClick: function onTrackingPlaneClickFn(xPos, yPos) {
    if (World.requestedModel < 0) {
      World.placeMarkerModel(xPos, yPos);
    }
  },

  onTrackingPlaneDragBegan: function onTrackingPlaneDragBeganFn(xPos, yPos) {
  },

  onTrackingPlaneDragChanged: function onTrackingPlaneDragChangedFn(xPos, yPos) {
  },

  onTrackingPlaneDragEnded: function onTrackingPlaneDragEndedFn(xPos, yPos) {
  },

  initModelButtons: function () {
    for (let i = 0; i < 5; i++) {
      (function (e) {
        const btnKey = "model-" + e;
        document.getElementById(btnKey).addEventListener('touchstart', function () {
          World.requestedModel = e;
          World.placeRequestedModelIfPossible();
          document.getElementById(btnKey).parentNode.classList.add('active');
        }, false);
        document.getElementById(btnKey).addEventListener('touchend', function () {
          document.getElementById(btnKey).parentNode.classList.remove('active');
        }, false);
      })(i);
    }
  },

  autoPlaceMarkerModelWithSmartMode: function () {
    if (canUseARKitCore !== 0) return;
    var countAttempt = 1;
    var maxCountAttempt = 5;
    var intervalTask = setInterval(function () {
      console.log("try");
      if (World.isARTracking()) {
        World.placeMarkerModel(0, 0);
        clearInterval(intervalTask);
      } else {
        countAttempt += 1;
        if (countAttempt > maxCountAttempt) {
          clearInterval(intervalTask);
        }
      }
    }, 50);
  },

  setupEventListeners: function () {
    World.initModelButtons();
  },

  placeRequestedModelIfPossible: function () {
    if (World.markerModel !== null) {
      var markerPos = World.markerModel.translate.x + World.markerModel.translate.y + World.markerModel.translate.z;
      if (markerPos < 3 * (markerModelMaxTranslate - 1)) {
        World.addModel(World.requestedModel, World.markerModel.translate.x, World.markerModel.translate.y);
        World.hideMarkerModel();
        World.hideModelButtons();
      }
    }
    World.requestedModel = -1;
  },

  changeTrackerState: function () {
    //called 4
    document.getElementById('mainPage').style.display = 'block';
    if (World.isARInitializing()) {
      World.showStartBackButton();
      document.getElementById("initialization-back-button-container").style.display = "none";
      document.getElementById("tracking-model-capture-button-container").style.visibility = 'visible';
      document.getElementById("tracking-model-start-stop-button-container").classList.add('tracking-model-start-stop-button-objects');
      if (canUseARKitCore === 0) {
        document.querySelector('.tracking-model-start-stop-button').style.display = 'block';
        document.getElementById("tracking-model-reset-button-container").style.visibility = 'visible';
      } else {
        document.querySelector('.tracking-model-start-stop-button').style.display = 'none';
        document.getElementById("tracking-model-start-stop-button-container").style.display = "block";
      }
      document.getElementById("tracking-model-back-button-container").style.visibility = 'visible';
      World.showModelButtons();
      this.tracker.state = AR.InstantTrackerState.TRACKING;
      isTracking = true;
      World.placeMarkerModel(0, 0);
    } else {
      currentReinitializingTimer = 0;
      document.getElementById("tracking-model-start-stop-button-container").classList.remove('tracking-model-start-stop-button-objects');
      document.getElementById("initialization-back-button-container").style.display = "block";
      if (canUseARKitCore === 0) {
        document.querySelector('.tracking-model-start-stop-button').style.display = 'block';
      } else {
        document.querySelector('.tracking-model-start-stop-button').style.display = 'none';
        document.getElementById("tracking-model-start-stop-button-container").style.display = "none";
      }
      document.getElementById("tracking-controls-container-lower").style.display = 'none';
      World.hideModelButtons();
      World.hideTrackingModelInstruction();
      document.getElementById("flightOff-button-container").style.visibility = 'hidden';
      document.getElementById("flightOn-button-container").style.visibility = 'hidden';
      document.getElementById("tracking-model-capture-button-container").style.visibility = 'hidden';
      document.getElementById("tracking-model-reset-button-container").style.visibility = 'hidden';
      document.getElementById("tracking-model-back-button-container").style.visibility = 'hidden';
      document.getElementById('miss-view-marker').style.visibility = 'hidden';
      this.tracker.state = AR.InstantTrackerState.INITIALIZING;
      isTracking = false;
      World.activeMode = false;
    }
  },

  showModelButtons: function () {
    document.getElementById("flightOff-button-container").style.visibility = 'hidden';
    document.getElementById("flightOn-button-container").style.visibility = 'hidden';
    document.getElementById("tracking-controls-container-lower").style.display = 'block';
    World.hideTrackingModelInstruction();
  },

  hideModelButtons: function () {
    document.getElementById("tracking-controls-container-lower").style.display = 'none';
    World.switchTrackingModelInstruction();
  },

  showStartBackButton: function () {
    document.getElementById('tracking-model-start-stop-button-container').style.display = 'block';
    canUseARKitCore === 0 ? document.querySelector('.tracking-model-start-stop-button').style.display = 'block' : document.querySelector('.tracking-model-start-stop-button').style.display = 'none';
  },

  changeTrackingHeight: function (height) {
    this.tracker.deviceHeight = parseFloat(height);
  },

  addModel: function (pathIndex, xpos, ypos) {
    if (World.isARTracking()) {
      const modelIndex = rotationValues.length;
      if (World.modelItems.length < pathIndex) {
        return;
      }
      let m = World.modelItems[pathIndex];
      let scaleMobile = m.scale_mobile;
      if (scaleMobile === undefined || scaleMobile <= 0) scaleMobile = defaultScaleValue;
      World.addModelValues(scaleMobile);
      const model = new AR.Model(m.filePath, {
        scale: {
          x: scaleMobile,
          y: scaleMobile,
          z: scaleMobile
        },
        translate: {
          x: xpos,
          y: ypos,
          z: 0
        },
        rotate: {
          x: World.calc.defineRotate(m.modelRotation[0]),
          y: -1 * World.calc.defineRotate(m.modelRotation[2]),
          z: World.calc.defineRotate(m.modelRotation[1])
        },
        onClick: function () {
        },
        onDragBegan: function (x, y) {
          oneFingerGestureAllowed = true;
        },
        onDragChanged: function (relativeX, relativeY, intersectionX, intersectionY) {
          if (oneFingerGestureAllowed) {
            this.translate = { x: intersectionX, y: intersectionY };
          }
        },
        onDragEnded: function (x, y, intersectionX, intersectionY) {
          if (isAnimationTimeoutPassed) {
            World.startAllAnimations();
          }
        },
        onRotationBegan: function (angleInDegrees) {
        },
        onRotationChanged: function (angleInDegrees) {
          this.rotate.z = rotationValues[modelIndex] - angleInDegrees;
        },
        onRotationEnded: function () {
          rotationValues[modelIndex] = this.rotate.z
        },
        onScaleBegan: function () {
        },
        onScaleChanged: function (scale) {
          var scaleValue = scaleValues[modelIndex] * scale;
          this.scale = { x: scaleValue, y: scaleValue, z: scaleValue };
        },
        onScaleEnded: function (scale) {
          scaleValues[modelIndex] = this.scale.x;
        }
      });
      model.modelId = m.id;
      const an = this.modelsAnimationNames[pathIndex];
      const modelAnimation = new AR.ModelAnimation(model, an);
      modelAnimation ? this.modelsAnimations.push(modelAnimation) : this.modelsAnimations.push(null);
      allCurrentModels.push(model);
      let json = {
        action: "markerlessDuration",
        param: model.modelId
      };
      AR.platform.sendJSONObject(json);
      this.instantTrackable.drawables.addCamDrawable(model);
      if (isAnimationTimeoutPassed) {
        isAnimationTimeoutPassed = false;
        setTimeout(function () {
          World.startAllAnimations();
        }, 500);
      }
      World.addSoundToModelIfExists(model, m.audioFile, m.audioLoop);//m.audio_loop)
      World.sendLogMessageToNative("2 ADD MODEL POZ=[" + model.translate.x
        + ", "
        + model.translate.y
        + ", "
        + model.translate.z
        + "], SCALE="
        + model.scale.x
        + ", models: "
        + allCurrentModels.length);
      World.modelPlayStart(m.id);
    }
  },

  addSoundToModelIfExists: function (model, modelSound, isLooping) {
    if (modelSound === null || modelSound === undefined || modelSound.length === 0) {
      World.sendLogMessageToNative("^^^ NO AUDIO, SKIP");
      return;
    }
    World.sendLogMessageToNative("^^^ HAS AUDIO: " + modelSound);
    let playbackTimes = 1;
    if (isLooping === 1) playbackTimes = -1;
    let asound = new AR.Sound(modelSound, {
      onLoaded: function () {
        asound.play(playbackTimes);
      },
      onError: function () {
      },
      onFinishedPlaying: function () {
      }
    });
    asound.load();
    model.audio = asound;
  },

  existing: function (value) {
    return typeof value !== "undefined";
  },

  placeMarkerModel: function (xpos, ypos) {
    if (World.isARTracking()) {
      if (World.markerModel === null) {
        World.markerModel = new AR.AnimatedImageDrawable(new AR.ImageResource(isCustomizedSpriteWhite ? "file:///android_asset/customization/sprite_white.png" : "assets/sprite_white.png"), 0.5, 270, 270, {
          translate: { x: xpos, y: ypos, z: 0.0 },
          opacity: 1,
          onDragBegan: function (x, y) {
            oneFingerGestureAllowed = true;
          },
          onDragChanged: function (relativeX, relativeY, intersectionX, intersectionY) {
            if (oneFingerGestureAllowed) {
              this.translate = { x: intersectionX, y: intersectionY };
            }
          }
        });
        World.markerModel.animate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 90, -1);
        World.sendLogMessageToNative(" create and placeMarkerModel, ");
        allCurrentModels.push(World.markerModel);
        this.instantTrackable.drawables.addCamDrawable(World.markerModel);
      } else {
        World.hideAllModels();
        World.markerModel.translate = { x: xpos, y: ypos, z: 0 };
        World.markerModel.opacity = 1;
        World.sendLogMessageToNative("  just    placeMarkerModel, ");
      }
      World.showModelButtons();
    }
  },

  hideAllModels: function () {
    AR.platform.sendJSONObject({ action: "hideAllMarkerlessModels" });
    for (let i = 0; i < allCurrentModels.length; i++) {
      allCurrentModels[i].translate.z = 100;
    }
  },

  showAllModels: function () {
    AR.platform.sendJSONObject({ action: "showAllMarkerlessModels" });
    for (let i = 0; i < allCurrentModels.length; i++) {
      allCurrentModels[i].translate.z = 0;
    }
  },

  hideMarkerModel: function () {
    if (World.markerModel !== null) {
      World.markerModel.opacity = 0;
      World.showAllModels();
    }
  },

  randomInt: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  },

  powSquare: function (value) {
    return Math.pow(value, 2);
  },

  roundTo2: function (num) {
    return Math.round(num * 100) / 100
  },

  startAnimationForIndex: function startAnimationForIndexFn(index) {
    World.sendLogMessageToNative("start animation for index: " + index + ", count is: " + this.modelsAnimations.length);
    if (this.modelsAnimations[index] !== null) {
      this.modelsAnimations[index].start(-1);
    }
  },

  startAllAnimations: function () {
    for (var i = 0; i < this.modelsAnimations.length; i++) {
      if (this.modelsAnimations[i] !== null) {
        this.modelsAnimations[i].start(-1);
      }
    }
    isAnimationTimeoutPassed = true;
  },

  addModelValues: function (scaleValue) {
    rotationValues.push(defaultRotationValue);
    scaleValues.push(scaleValue);
  },

  resetModels: function () {
    if ((allCurrentModels !== null || allCurrentModels !== undefined) && allCurrentModels.length > 0)
      AR.platform.sendJSONObject({ action: "resetMarkerlessModels" });
    if (this.instantTrackable) {
      for (let i = 0; i < allCurrentModels.length; i++) {
        if (allCurrentModels[i].audio) {
          allCurrentModels[i].audio.stop();
          allCurrentModels[i].audio.destroy();
        }
        this.instantTrackable.drawables.removeCamDrawable(allCurrentModels[i]);
      }
    }
    allCurrentModels = [];
    World.markerModel = null;
    nodeModels = [];
    World.modelsAnimations = [];
    World.resetAllModelValues();
  },

  resetAllModelValues: function () {
    rotationValues = [];
    scaleValues = [];
  },

  captureScreen: function () {
    if (World.initialized) {
      AR.platform.sendJSONObject({
        action: "capture_screen"
      });
    }
  },

  backToGallery: function () {
    AR.platform.sendJSONObject({
      action: "back_to_gallery"
    });
  },

  hidePlacingInstructionsForever: function () {
    World.hideTrackingModelInstruction();
    AR.platform.sendJSONObject({
      action: "changeTextStatus"
    });
  },

  modelPlayStart: function (id) {
    AR.platform.sendJSONObject({
      action: "modelPlayStart",
      param: id //Int
    });
  },

  flashlightNative: function (value) {
    AR.platform.sendJSONObject({
      action: "flashlightNative",
    });
  },
};
AR.hardware.smart.onPlatformAssistedTrackingAvailabilityChanged = function (availability) {
  switch (availability) {
    case AR.hardware.smart.SmartAvailability.INDETERMINATE_QUERY_FAILED:
      /* query failed for some reason; try again or accept the fact. */
      World.startAr(0);
      break;
    case AR.hardware.smart.SmartAvailability.CHECKING_QUERY_ONGOING:
      /* query currently ongoing; be patient and do nothing or inform the user about the ongoing process */
      break;
    case AR.hardware.smart.SmartAvailability.UNSUPPORTED:
      /* not supported, create the scene now without platform assisted tracking enabled */
      World.startAr(0);
      break;
    case AR.hardware.smart.SmartAvailability.SUPPORTED_UPDATE_REQUIRED:
      World.startAr(0);
      break;
    case AR.hardware.smart.SmartAvailability.SUPPORTED:
      /* supported, create the scene now with platform assisted tracking enabled
       *
       * SUPPORTED_UPDATE_REQUIRED may be followed by SUPPORTED, make sure not to
       * create the scene twice
       */
      World.startAr(1);
      break;
  }
};

function checkFlight(check) {
  if (check) {
    document.getElementById('flightOff-button-container').style.visibility = 'hidden';
    document.getElementById('flightOn-button-container').style.visibility = 'visible';
  } else {
    document.getElementById('flightOn-button-container').style.visibility = 'hidden';
    document.getElementById('flightOff-button-container').style.visibility = 'visible';
  }

  World.flashlightNative()
}

function backToGallery() {
  World.backToGallery();
}

function captureScreen() {
  World.captureScreen();
}

function resetModels() {
  World.resetModels();
  World.showModelButtons();
  World.placeMarkerModel(0, 0);
}

function logicStartStop() {
  World.resetModels();
  World.changeTrackerState();
  World.autoPlaceMarkerModelWithSmartMode();
}

function hideInstructions() {
  canShowPlacingInstructions = false;
  World.hidePlacingInstructionsForever();
}

World.init();
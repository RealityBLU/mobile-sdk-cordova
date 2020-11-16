let itemVideo = null;
let videosMap = new Map(); //[uniqueID: videoJSON] for all video drawables
let personalVideos = [];
let autoVideosOnScene = 0;
let autoVideosOnSceneStarted = 0;
let currentFullVideo = null;
let autoVideosForStart = [];
var Videos = {
    videoOnScene: function () {
        return itemsOnScene.get('video');
    },

    showRestartVideo: function (uniqueID) {
        if (videosMap.has(uniqueID)) {
            let video = videosMap.get(uniqueID);
            VisiabilityHelper.show(video);
            Videos.playVideo(video);
            video.isHide = false;
        }
    },

    resumeAfterPause:function() {
        for (let i = 0; i < Videos.videoOnScene().length; i++) {
            let video = Videos.videoOnScene()[i];
            if (!video.isFinished) {
                if (!video.isPaused && video.isPlaying && !video.isHide) {
                    video.isPlaying = true;
                    video.resume();
                }
            }
        }
    },

    togglePauseVideo: function (video) {
        if (video.isFinished) {
            return;
        }
        video.isPlaying ? Videos.pauseVideo(video) : Videos.playVideo(video);
    },

    playVideo: function (video) {
        if (video.isFinished) {
            video.play(1);
            video.isFinished = false;
        } else if (!video.isPlaying) {
            video.resume();
        }
        video.isPlaying = true;
        video.isPaused = false;
    },

    pauseVideo: function (video) {
        if (video.isFinished) {
            return;
        }
        if (video.isPlaying) {
            video.pause();
            video.isPaused = true;
            video.isPlaying = false;
        }
    },

    pauseAllVideos: function () {
        for (let k = 0; k < Videos.videoOnScene().length; k++) {
            if (!Videos.videoOnScene()[k].isHide) Videos.videoOnScene()[k].pause();
        }
    },

    pauseAndHideAllVideos: function () {
        for (let k = 0; k < Videos.videoOnScene().length; k++) {
            Videos.hideVideoFromScene(Videos.videoOnScene()[k].uniqueID);
        }
    },

    /*
      pauseAndHideAllManualVideos: function () {
        for (let k = 0; k < VideoPart.videoOnScene().length; k++) {
          if (VideoPart.videoOnScene()[k].isManual) {
            VideoPart.hideVideoFromScene(VideoPart.videoOnScene()[k].uniqueID);
          }
        }
      }, */

    videoIsAutomatic: function (v) {
        return TextUtils.isExist(v.item.playback_mode)
            && v.item.playback_mode === 0
    },

    autoVideos: function () {
        autoVideosOnScene = 0;
        autoVideosOnSceneStarted = 0;
        if (itemVideo) {
            let personalVideosCount = 0;
            itemVideo.forEach(v => {
                if (v.isPerson) {
                    personalVideosCount += 1;
                    autoVideosOnScene += 1;
                    Videos.preparePersonalVideoForDownload(v);
                } else {
                    let vExtended = {
                        url: v.url,
                        file_path: v.url,
                        item: v,
                    };
                    if (TextUtils.isExist(vExtended.item.playback_mode)) {
                        if (vExtended.item.playback_mode === 0) {
                            autoVideosOnScene += 1;
                        }
                    }
                    let autoVideo = Videos.createVideoDrawableIfPossible(vExtended);
                    autoVideosForStart.push(autoVideo);
                }
            });
            if (personalVideosCount > 0) {
                NativeBridge.tellNativeToDownloadPersonalVideo(personalVideos);
            }
        }
        if (autoVideosOnSceneStarted === 0 && autoVideosOnScene === 0) {
            SceneBuilder.displaySceneData();
        }
    },

    preparePersonalVideoForDownload: function (v) {
        let personalVideoDataForDownload = {id: v.uniqueID, storyboardId: v.storyboardId};
        personalVideos.push(personalVideoDataForDownload);
    },

    onNextPersonalVideoLoaded(id, videoUrl) {  //todo remove copypaste
        for (let i = 0; i < itemVideo.length; i++) {
            if (itemVideo[i].uniqueID === id) {

                if (TextUtils.isEmpty(videoUrl) || videoUrl.length < 5) {
                    autoVideosOnScene -= 1;
                    SceneBuilder.displaySceneData();
                } else {
                    itemVideo[i].url = videoUrl;
                    let vExtended = {
                        url: itemVideo[i].url,
                        file_path: itemVideo[i].url,
                        item: itemVideo[i]
                    };
                    let autoVideo = Videos.createVideoDrawableIfPossible(vExtended);
                    Videos.startCreatedAutoVideo(autoVideo);
                }
            }
        }
    },

    createVideoDrawableIfPossible: function (video) {
        let result = null;
        if (TextUtils.isExist(video.item.playback_mode)) {
            video.item.playback_mode === 0 ? result = Videos.createVideoDrawable(video) : Videos.createManualVideo(video);
        } else {
            result = Videos.createVideoDrawable(video);
        }
        return result;
    },

    startCreatedAutoVideo(autoVideo) {
        if (autoVideo !== null) {
            Tracker.trackable.drawables.addCamDrawable(autoVideo);
            autoVideo.isFinished = true;
            Videos.playVideo(autoVideo);
        }
    },

    /*
      tryToPlayVideoAgain(autoVideo) {
        autoVideo.attemptCount += 1;
        autoVideo.isFinished = true;
        VideoPart.playVideo(autoVideo);
      },
    */
    isAllAutoVideosStarted() {
        if (autoVideosOnScene <= autoVideosOnSceneStarted) {
            autoVideosOnScene = 0;
            autoVideosOnSceneStarted = 0;
            return true;
        } else return false;
    },

    startAutoVideos() {
        autoVideosForStart.forEach(video => Videos.startCreatedAutoVideo(video));
        autoVideosForStart = [];
    },

    createManualVideo: function (v) {
        let video = Videos.createVideoDrawable(v);
        video.isManual = true;
        video.isFinished = true;
        Tracker.trackable.drawables.addCamDrawable(video);
        Videos.hideVideoFromScene(v.item.uniqueID);
    },

    createVideoDrawable: function (v) {
        let vi = v.item;
        let videoWidth = World.calc.definePositiveScale(vi.scale[0]);
        let videoHeight = World.calc.definePositiveScale(vi.scale[2]);
        if (vi.isTransparent) {
            videoWidth = videoWidth / 2;
            videoHeight = videoHeight / 2;
        }
        let video = new AR.VideoDrawable(v.file_path, vi.height * 1.0 / World.pixelsPerCell, {
            mirrored: allMirrored,
            isPlaying: false,
            isFinished: false,
            isHide: false,
            onLoaded: function () {
                autoVideosOnSceneStarted += 1;
                SceneBuilder.displaySceneData();
            },
            onPlaybackStarted: function () {
                PlaceHolder.hidePlaceholderForItem(vi);
            },
            onError: function (message) {
                console.log("createVideoDrawable, onError=" + message);
                if (vi.isPerson) {
                    setTimeout(function () {
                        autoVideosOnSceneStarted += 1;
                        let autoVideo = Videos.createVideoDrawable(v);
                        Videos.startCreatedAutoVideo(autoVideo);
                    }, 2000);
                } else {
                }
            },
            onFinishedPlaying: function () {
                if (TextUtils.isExist(vi.uniqueID)) {
                    Videos.hideVideoFromScene(vi.uniqueID);
                    if (video.countPlayback === -1) {
                        Videos.showRestartVideo(vi.uniqueID);
                    }
                }
            },
            scale: {
                x: videoWidth,
                y: videoHeight,
                z: 1
            },
            rotate: {
                x: -1 * World.calc.defineRotate(vi.rotation[0]),
                y: World.calc.defineRotate(vi.rotation[2]),
                z: -1 * World.calc.defineRotate(vi.rotation[1])
            },
            translate: {
                x: World.calc.defineTranslate(vi.position[0], false),
                y: World.calc.defineTranslate(vi.position[2], true),
                z: World.calc.defineTranslate(vi.position[1], false)
            },
            onClick: function () {
                // if (video.isClicked) {
                //     VideoPart.pauseVideo(video);
                //     video.isClicked = false;
                //     clearTimeout(timeoutFunc);
                //     currentFullVideo = video;
                //     NativeBridge.fullScreen(video.url);
                // } else {
                //     video.isClicked = true;
                //     setTimeout(timeoutFunc, 1000)
                // }
                Videos.togglePauseVideo(video);
            },
            isTransparent: vi.isTransparent
        });

        function timeoutFunc() {
            video.isClicked = false;
            clearTimeout(timeoutFunc)
        }

        video.isPaused = false;
        video.isClicked = false;
        video.isFullScreen = false;
        video.attemptCount = 0;
        video.isManual = false;
        video.uniqueID = vi.uniqueID;
        video.name = vi.name;
        video.url = vi.url;
        //important, filling countPlayback
        if (vi.countPlayback) {
            video.countPlayback = vi.countPlayback;
        } else {
            vi.playback_mode === 0 ? video.countPlayback = -1 : video.countPlayback = 1;
        }
        Videos.videoOnScene().push(video);
        if (TextUtils.isExist(vi.uniqueID)) {
            videosMap.set(vi.uniqueID, video);
        }
        return video;
    },

    buttonClick: function (param) {
        if (param) { //TODO param can be 0, so remove first check
            if (videosMap.has(param)) {
                let video = videosMap.get(param);
                AnalyticsPart.sendVideoEvent(video);
                if (video.isHide) {
                    Videos.pauseAndHideAllVideos();
                    Videos.showRestartVideo(param);
                } else {
                    Videos.hideVideoFromScene(param);
                }
            }
        }
    },

    hideVideoFromScene: function (uniqueID) {
        if (videosMap.has(uniqueID)) {
            let video = videosMap.get(uniqueID);
            video.pause();
            video.isFinished = true;
            video.isPlaying = false;
            // hide block with finishing video
            VisiabilityHelper.hide(video);
            video.isHide = true;
        }
    },

    resetItemsOnSceneVideo: function () {
        itemsOnScene.set('video', []);
        personalVideos = [];
        videosMap = new Map();
    },

    destroyVideos: function () {
        for (let v = 0; v < Videos.videoOnScene().length; v++) {
            let video = Videos.videoOnScene()[v];
            Tracker.trackable.drawables.removeCamDrawable(video);
            video.stop();
            video.destroy();
            video = null
        }
    },

    clearItemVideos: function () {
        itemVideo = [];
    },

    fullScreenVideoFinished: function () {
        if (currentFullVideo.countPlayback > 0) {
            this.hideVideoFromScene(currentFullVideo.uniqueID)
        }
        currentFullVideo = null;
    }
};
let soundsAutoRes = [];
let soundsManualRes = new Map();
let soundsAuto = new Map();
let soundsManual = new Map();
let soundManualCurrent = null;
var Sounds = {
    addSound: function (value) {
        let audioRaw = value;
        if (audioRaw.playback_mode === 0) {//auto sound
            soundsAutoRes.push(audioRaw)
        } else if (audioRaw.playback_mode === 1) {//manual sound
            soundsManualRes.set(audioRaw.uniqueID, audioRaw);
        }
    },

    resumeAfterPause: function () {
        this.pauseAutoSound();
        let isPausedAudioFound = false;
        let asIds = Array.from(soundsManual.keys());
        for (let k = 0; k < asIds.length; k++) {
            let audio = {};
            if (soundsManual.has(asIds[k])) audio = soundsManual.get(asIds[k]);
            else continue;
            if (!audio.isPaused && audio.isPlaying) {
                audio.resume();
                audio.isPlaying = true;
                isPausedAudioFound = true;
            }
        }
        if (!isPausedAudioFound) this.playOrResumeAutoSound();
    },

    autoSounds: function () {
        if (soundsAutoRes.length > 0) {
            soundsAutoRes.forEach(sa => {
                let asound = new AR.Sound(sa.url, {
                    onLoaded: function () {
                        asound.play(-1);
                    },
                    onError: function () {
                    },
                    onFinishedPlaying: function () {
                    }
                });
                soundsAuto.set(sa.uniqueID, asound);
                asound.uniqueID = sa.uniqueID;
                asound.name = sa.name;
                asound.load();
            })
        }
    },

    buttonClick: function (param) {
        if (param) {
            if (soundsManual.has(param)) { // toggle audio playback
                AnalyticsPart.sendAudioEvent(soundsManual.get(param));
                if (soundsManual.get(param).isPlaying) {
                    Sounds.pauseManualSound(param);
                    soundsManual.get(param).switchedManually = false;
                } else {
                    let ms = soundsManual.get(param);
                    Sounds.playManualSoundAndPauseOthers(param, true);
                    ms.switchedManually = true;
                }
            } else if (soundsManualRes.has(param)) { //manual audio is not created yet
                //pause all other sounds
                let msIds = Array.from(soundsManual.keys());
                for (let z = 0; z < msIds.length; z++) {
                    Sounds.pauseManualSound(msIds[z]);
                }
                Sounds.createManualSound(param);
            }
        }
    },

    createManualSound: function (mSoundId) {
        if (soundsManualRes.has(mSoundId)) {
            let si = soundsManualRes.get(mSoundId);
            let msound = new AR.Sound(si.url, {
                onLoaded: function () {
                    msound.play();
                    msound.isPlaying = true;
                    soundManualCurrent = mSoundId;
                },
                onError: function () {
                    World.arLog(">>>>>>  audio error " + mSoundId);
                },
                onFinishedPlaying: function () {
                    msound.destroy();
                    soundsManual.delete(mSoundId);
                }
            });
            msound.isPaused = false;
            msound.uniqueID = mSoundId;
            msound.name = si.name;
            AnalyticsPart.sendAudioEvent(msound);
            msound.isPlaying = true;
            msound.switchedManually = true;
            soundsManual.set(mSoundId, msound);
            msound.load();
        }
    },

    playOrResumeAutoSound: function () {
        let asIds = Array.from(soundsAuto.keys());
        for (let i = 0; i < asIds.length; i++) {
            if (soundsAuto.has(asIds[i])) {
                soundsAuto.get(asIds[i]).resume();
            }
        }
    },

    playManualSoundAndPauseOthers: function (msId, manually) {
        //pause all other sounds
        let msIds = Array.from(soundsManual.keys());
        for (let z = 0; z < msIds.length; z++) {
            Sounds.pauseManualSound(msIds[z]);
        }
        if (soundsManual.has(msId)) {
            let ms = soundsManual.get(msId);
            if (manually || ms.switchedManually) {
                ms.resume();
                ms.isPlaying = true;
                ms.isPaused = false;
                soundManualCurrent = msId;
            }
        }
    },

    pauseManualSound: function (msId) {
        if (soundsManual.has(msId)) {
            soundsManual.get(msId).pause();
            soundsManual.get(msId).isPaused = true;
            soundsManual.get(msId).isPlaying = false;
        }
    },

    pauseManualSounds: function () {
        let asIds = Array.from(soundsManual.keys());
        for (let k = 0; k < asIds.length; k++) {
            if (soundsManual.has(asIds[k])) {
                soundsManual.get(asIds[k]).pause();
            }
        }
    },

    pauseAutoSound: function () {
        let asIds = Array.from(soundsAuto.keys());
        for (let k = 0; k < asIds.length; k++) {
            if (soundsAuto.has(asIds[k])) {
                soundsAuto.get(asIds[k]).pause();
            }
        }
    },

    pauseAllSounds: function () {
        this.pauseAutoSound();
        this.pauseManualSounds()
    },

    resetItemsOnSceneSound: function () {
        let asIds = Array.from(soundsAuto.keys());
        for (let k = 0; k < asIds.length; k++) {
            soundsAuto.get(asIds[k]).destroy();
        }
        soundsAuto = new Map();
        let msIds = Array.from(soundsManual.keys());
        for (let z = 0; z < msIds.length; z++) {
            soundsManual.get(msIds[z]).destroy();
        }
        soundsManual = new Map();
    },

    cleanSounds: function () {
        soundsAutoRes = [];
        soundsManualRes = new Map();
    }
};


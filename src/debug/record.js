"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = void 0;
var shared_1 = require("../shared");
var dataURL_1 = require("../utils/dataURL");
var record = function(frameRate) {
    var stream = shared_1._k.app.canvas.captureStream(frameRate);
    var audioDest = shared_1._k.audio.ctx.createMediaStreamDestination();
    shared_1._k.audio.masterNode.connect(audioDest);
    // TODO: Enabling audio results in empty video if no audio received
    // const audioStream = audioDest.stream
    // const [firstAudioTrack] = audioStream.getAudioTracks()
    // stream.addTrack(firstAudioTrack);
    var recorder = new MediaRecorder(stream);
    var chunks = [];
    recorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };
    recorder.onerror = function() {
        shared_1._k.audio.masterNode.disconnect(audioDest);
        stream.getTracks().forEach(function(t) {
            return t.stop();
        });
    };
    recorder.start();
    return {
        resume: function() {
            recorder.resume();
        },
        pause: function() {
            recorder.pause();
        },
        stop: function() {
            recorder.stop();
            // cleanup
            shared_1._k.audio.masterNode.disconnect(audioDest);
            stream.getTracks().forEach(function(t) {
                return t.stop();
            });
            return new Promise(function(resolve) {
                recorder.onstop = function() {
                    resolve(
                        new Blob(chunks, {
                            type: "video/mp4",
                        }),
                    );
                };
            });
        },
        download: function(filename) {
            if (filename === void 0) filename = "kaboom.mp4";
            this.stop().then(function(blob) {
                return (0, dataURL_1.downloadBlob)(filename, blob);
            });
        },
    };
};
exports.record = record;

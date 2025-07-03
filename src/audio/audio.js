"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAudio = void 0;
exports.createEmptyAudioBuffer = createEmptyAudioBuffer;
function createEmptyAudioBuffer(ctx) {
    return ctx.createBuffer(1, 1, 44100);
}
var initAudio = function() {
    var audio = (function() {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var masterNode = ctx.createGain();
        masterNode.connect(ctx.destination);
        return {
            ctx: ctx,
            masterNode: masterNode,
        };
    })();
    return audio;
};
exports.initAudio = initAudio;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileName = exports.isDataURL = void 0;
exports.base64ToArrayBuffer = base64ToArrayBuffer;
exports.dataURLToArrayBuffer = dataURLToArrayBuffer;
exports.download = download;
exports.downloadText = downloadText;
exports.downloadJSON = downloadJSON;
exports.downloadBlob = downloadBlob;
function base64ToArrayBuffer(base64) {
    var binstr = window.atob(base64);
    var len = binstr.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binstr.charCodeAt(i);
    }
    return bytes.buffer;
}
function dataURLToArrayBuffer(url) {
    return base64ToArrayBuffer(url.split(",")[1]);
}
function download(filename, url) {
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
}
function downloadText(filename, text) {
    download(filename, "data:text/plain;charset=utf-8," + text);
}
function downloadJSON(filename, data) {
    downloadText(filename, JSON.stringify(data));
}
function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    download(filename, url);
    URL.revokeObjectURL(url);
}
var isDataURL = function(str) {
    return str.match(/^data:\w+\/\w+;base64,.+/);
};
exports.isDataURL = isDataURL;
var getFileName = function(p) {
    return p.split(".").slice(0, -1).join(".");
};
exports.getFileName = getFileName;

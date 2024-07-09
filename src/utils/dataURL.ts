export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binstr = window.atob(base64);
    const len = binstr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binstr.charCodeAt(i);
    }
    return bytes.buffer;
}

export function dataURLToArrayBuffer(url: string): ArrayBuffer {
    return base64ToArrayBuffer(url.split(",")[1]);
}

export function download(filename: string, url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
}

export function downloadText(filename: string, text: string) {
    download(filename, "data:text/plain;charset=utf-8," + text);
}

export function downloadJSON(filename: string, data: any) {
    downloadText(filename, JSON.stringify(data));
}

export function downloadBlob(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    download(filename, url);
    URL.revokeObjectURL(url);
}

export const isDataURL = (str: string) => str.match(/^data:\w+\/\w+;base64,.+/);
export const getFileExt = (p: string) => p.split(".").pop();
export const getFileName = (p: string) => p.split(".").slice(0, -1).join(".");

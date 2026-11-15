import { expect, test } from "@playwright/test";
export { expect, test };

test.beforeEach(async ({ page }) => {
    await page.context().setOffline(true);
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(() => {
        let next = 0;
        const frames = new Map<number, FrameRequestCallback>();
        window.requestAnimationFrame = cb => {
            frames.set(++next, cb);
            return next;
        };
        window.cancelAnimationFrame = id => {
            frames.delete(id);
        };
        const frame = () => {
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach(cb => cb(performance.now()));
        };
        const media: any[] = [];
        let starts = 0;
        class Media {
            paused = true;
            loop = false;
            currentTime = 0;
            playbackRate = 1;
            duration = 10;
            crossOrigin = "";
            preload = "";
            onended: (() => void) | null = null;
            localVolume = 1;
            gain?: GainNode;
            source?: AudioBufferSourceNode;
            started = false;
            constructor(public src: string) {
                media.push(this);
            }
            get volume() {
                return this.localVolume;
            }
            set volume(v: number) {
                this.localVolume = v;
                if (this.gain) this.gain.gain.value = v;
            }
            play() {
                this.paused = false;
                if (this.source && !this.started) {
                    this.source.start();
                    this.started = true;
                }
                return Promise.resolve();
            }
            pause() {
                this.paused = true;
            }
        }
        class Offline extends OfflineAudioContext {
            constructor() {
                super(1, (window as any).audioFrames ?? 256, 48000);
            }
            resume() {
                return Promise.resolve();
            }
            createBufferSource() {
                const node = super.createBufferSource();
                const start = node.start.bind(node);
                node.start = (...args) => {
                    starts++;
                    start(...args);
                };
                return node;
            }
            createMediaElementSource(element: any): any {
                const gain = this.createGain();
                const source = this.createBufferSource();
                const buffer = this.createBuffer(1, 1024, 48000);
                buffer.getChannelData(0).fill(1);
                source.buffer = buffer;
                source.loop = true;
                source.connect(gain);
                element.gain = gain;
                element.source = source;
                gain.gain.value = element.volume;
                return gain;
            }
        }
        (window as any).AudioContext = Offline;
        (window as any).Audio = Media;
        const k = kaplay({ global: false, width: 16, height: 16 });
        const ctx = k.audioCtx as unknown as OfflineAudioContext;
        const sound = () => {
            const b = ctx.createBuffer(2, 1024, 48000);
            b.getChannelData(0).fill(1);
            b.getChannelData(1).fill(1);
            return new k.SoundData(b);
        };
        const render = async () => {
            const data = (await ctx.startRendering()).getChannelData(0);
            return [...data.slice(32, 224)];
        };
        const throws = (action: () => void) => {
            try {
                action();
                return false;
            } catch {
                return true;
            }
        };
        (window as any).audioTest = {
            k,
            ctx,
            sound,
            render,
            throws,
            frame,
            media,
            starts: () => starts,
        };
    });
});

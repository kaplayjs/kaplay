import { _k } from "../shared";
import type { InternalAudioCtx } from "./audio";

/** Options for a shared audio bus. @group Audio */
export interface AudioBusOpt {
    /** Parent bus, or null for the master output. */
    parent?: AudioBus | null;
    /** Finite Web Audio gain (32-bit float). Defaults to 1. */
    volume?: number;
    /** Silence the branch without changing its volumes. */
    muted?: boolean;
}

/** A shared output for players and other buses. @group Audio */
export interface AudioBus {
    volume: number;
    muted: boolean;
    readonly parent: AudioBus | null;
    readonly disposed: boolean;
    /** Move this branch to another bus, or the master output. */
    setParent(parent?: AudioBus | null): void;
    /** Move direct children and players to the parent and release this bus. */
    dispose(): void;
}

interface BusState {
    audio: InternalAudioCtx;
    node: GainNode;
    children: Set<AudioBus>;
    routes: Set<WeakRef<AudioRoute>>;
}

const buses = new WeakMap<AudioBus, BusState>();
const routeCleanup = new FinalizationRegistry<{
    routes: Set<WeakRef<AudioRoute>>;
    reference: WeakRef<AudioRoute>;
}>(({ routes, reference }) => routes.delete(reference));

function busState(audio: InternalAudioCtx, bus: AudioBus): BusState {
    const state = buses.get(bus);
    if (!state || state.audio !== audio) {
        throw new Error("Audio bus belongs to a different audio context");
    }
    if (bus.disposed) {
        throw new Error("Audio bus is disposed");
    }
    return state;
}

function reaches(start: AudioBus | null, target: AudioBus): boolean {
    for (let bus = start; bus; bus = bus.parent) {
        if (bus === target) return true;
    }
    return false;
}

function validateVolume(volume: number): void {
    if (
        !Number.isFinite(volume) || !Number.isFinite(Math.fround(volume))
    ) {
        throw new Error(
            "Audio bus volume must be a finite Web Audio gain",
        );
    }
}

/** @ignore */
export interface AudioDestination {
    node: AudioNode;
    bus: AudioBus | null;
}

function destination(
    audio: InternalAudioCtx,
    target?: AudioNode | AudioBus,
): AudioDestination {
    if (target === undefined) {
        return { node: audio.masterNode, bus: null };
    }
    if (buses.has(target as AudioBus)) {
        return {
            node: busState(audio, target as AudioBus).node,
            bus: target as AudioBus,
        };
    }
    if (!("context" in target) || target.context !== audio.ctx) {
        throw new Error(
            "Audio destination belongs to a different audio context",
        );
    }
    return { node: target, bus: null };
}

/** Validate and capture a player's initial destination before creating audio nodes. @ignore */
export function initialAudioDestination(
    audio: InternalAudioCtx,
    opt: { bus?: AudioBus; connectTo?: AudioNode },
): AudioDestination {
    if (opt.bus !== undefined && opt.connectTo !== undefined) {
        throw new Error("Specify either bus or connectTo, not both");
    }
    return destination(audio, opt.bus ?? opt.connectTo);
}

/** @ignore */
export interface AudioRoute {
    readonly bus: AudioBus | null;
    connect(target?: AudioNode | AudioBus): void;
    activate(): void;
    deactivate(): void;
}

/** Maintain one output edge without changing the player's source or transport. @ignore */
export function createAudioRoute(
    audio: InternalAudioCtx,
    output: AudioNode,
    initial: AudioDestination,
): AudioRoute {
    return new AudioRouteImpl(audio, output, initial);
}

class AudioRouteImpl implements AudioRoute {
    private current: AudioDestination;
    private readonly audio: InternalAudioCtx;
    private readonly output: AudioNode;
    private readonly reference = new WeakRef<AudioRoute>(this);
    private active = false;

    constructor(
        audio: InternalAudioCtx,
        output: AudioNode,
        initial: AudioDestination,
    ) {
        this.audio = audio;
        this.output = output;
        this.current = initial;
        output.connect(initial.node);
        this.track();
    }

    get bus() {
        return this.current.bus;
    }

    connect(target?: AudioNode | AudioBus) {
        const next = destination(this.audio, target);
        if (next.node === this.current.node) return;
        // Connect first so a rejected native connection leaves the old route intact.
        this.output.connect(next.node);
        this.output.disconnect(this.current.node);
        if (this.current.bus) {
            buses.get(this.current.bus)!.routes.delete(this.reference);
        }
        routeCleanup.unregister(this);
        this.current = next;
        this.track();
    }

    private track() {
        if (this.current.bus) {
            const routes = buses.get(this.current.bus)!.routes;
            routes.add(this.reference);
            routeCleanup.register(
                this,
                { routes, reference: this.reference },
                this,
            );
        }
        if (this.active) this.activate();
    }

    activate() {
        this.active = true;
        // Keep audible routes movable even when the caller drops its player handle.
        if (this.current.bus) this.audio.activeRoutes.add(this);
        else this.audio.activeRoutes.delete(this);
    }

    deactivate() {
        this.active = false;
        this.audio.activeRoutes.delete(this);
    }
}

class AudioBusImpl implements AudioBus {
    private readonly audio: InternalAudioCtx;
    private readonly node: GainNode;
    private readonly muteNode: GainNode;
    private readonly children = new Set<AudioBus>();
    private readonly routes = new Set<WeakRef<AudioRoute>>();
    private currentParent: AudioBus | null;
    private localVolume: number;
    private isMuted: boolean;
    private isDisposed = false;

    constructor(audio: InternalAudioCtx, opt: AudioBusOpt) {
        this.audio = audio;
        this.currentParent = opt.parent ?? null;
        this.localVolume = opt.volume ?? 1;
        this.isMuted = opt.muted ?? false;
        validateVolume(this.localVolume);
        const parentState = this.currentParent
            ? busState(audio, this.currentParent)
            : null;
        this.node = audio.ctx.createGain();
        this.muteNode = audio.ctx.createGain();
        this.node.gain.value = this.localVolume;
        this.muteNode.gain.value = this.isMuted ? 0 : 1;
        this.node.connect(this.muteNode);
        this.muteNode.connect(parentState?.node ?? audio.masterNode);
        buses.set(this, {
            audio,
            node: this.node,
            children: this.children,
            routes: this.routes,
        });
        parentState?.children.add(this);
        audio.buses.add(this);
    }

    private assertLive() {
        if (this.isDisposed) throw new Error("Audio bus is disposed");
    }

    get volume() {
        return this.localVolume;
    }

    set volume(value: number) {
        this.assertLive();
        validateVolume(value);
        this.node.gain.value = value;
        this.localVolume = value;
    }

    get muted() {
        return this.isMuted;
    }

    set muted(value: boolean) {
        this.assertLive();
        this.muteNode.gain.value = value ? 0 : 1;
        this.isMuted = value;
    }

    get parent() {
        return this.currentParent;
    }

    get disposed() {
        return this.isDisposed;
    }

    setParent(value?: AudioBus | null) {
        this.assertLive();
        const next = value ?? null;
        const nextState = next ? busState(this.audio, next) : null;
        if (reaches(next, this)) {
            throw new Error("Audio bus routes cannot form a cycle");
        }
        if (next === this.currentParent) return;
        const oldState = this.currentParent
            ? buses.get(this.currentParent)!
            : null;
        this.muteNode.connect(nextState?.node ?? this.audio.masterNode);
        this.muteNode.disconnect(oldState?.node ?? this.audio.masterNode);
        oldState?.children.delete(this);
        nextState?.children.add(this);
        this.currentParent = next;
    }

    dispose() {
        if (this.isDisposed) return;
        for (const child of [...this.children]) {
            child.setParent(this.currentParent);
        }
        for (const reference of [...this.routes]) {
            reference.deref()?.connect(this.currentParent ?? undefined);
        }
        this.routes.clear();
        this.node.disconnect();
        this.muteNode.disconnect();
        if (this.currentParent) {
            buses.get(this.currentParent)!.children.delete(this);
        }
        this.audio.buses.delete(this);
        this.isDisposed = true;
    }
}

/** Create a shared, independently controlled audio branch. @group Audio */
export function createAudioBus(opt: AudioBusOpt = {}): AudioBus {
    return new AudioBusImpl(_k.audio, opt);
}

/** @ignore */
export function disposeAudioBuses(audio: InternalAudioCtx): void {
    for (const bus of [...audio.buses]) {
        bus.dispose();
    }
}

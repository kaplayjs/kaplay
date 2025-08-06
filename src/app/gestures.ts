import { KEventHandler } from "../events/events";
import { lerp } from "../math/lerp";
import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";

const events = new KEventHandler();
let gestureDetectorInstalled: boolean | undefined;
enum Gesture {
    None,
    Tap,
    NotTap,
    Swipe,
    Rotate,
    Pinch
}
let currentGesture = Gesture.None;

function installGestureDetector() {
    if (gestureDetectorInstalled) { return; }
    gestureDetectorInstalled = true;

    let touches: Map<number, Vec2> = new Map<number, Vec2>();

    if (_k.k.isTouchscreen()) {
        _k.k.onTouchStart((pos, touch) => {
            touches.set(touch.identifier, pos.clone());
            if (!currentGesture) {
                currentGesture = Gesture.Tap;
                debug.log("Gesture.Tap");
            }
        });

        _k.k.onTouchMove((pos, touch) => {
            // If we move during a tap, it's probably a swipe or pinch
            if (pos.dist(touches.get(touch.identifier)!) > 1) {
                if (currentGesture === Gesture.Tap) {
                    currentGesture = Gesture.NotTap;
                    debug.log("Gesture.NotTap");
                }
                else if (currentGesture === Gesture.NotTap) {
                    // If more than 1 finger
                    const keys = [...touches.keys()];
                    if (keys.length > 1) {
                        const index = keys.indexOf(touch.identifier);
                        const otherKey = keys[(index + 1) % keys.length];
                        const prevPos = touches.get(touch.identifier)!;
                        const otherPos = touches.get(otherKey)!
                        const prevDist = otherPos.dist(prevPos);
                        const nextDist = otherPos.dist(pos);
                        // If touches are drifting, it is not a swipe
                        if (Math.abs(nextDist - prevDist) > 1) {
                            debug.log("Gesture.Pinch");
                            currentGesture = Gesture.Pinch;
                        }
                        // If one touch is orbiting around the other, it is not a swipe
                        else if (Vec2.angleBetween(prevPos.sub(otherPos), pos.sub(prevPos)) > 1) {
                            debug.log("Gesture.Rotate");
                            currentGesture = Gesture.Rotate;
                        }
                        else {
                            debug.log("Gesture.Swipe");
                            currentGesture = Gesture.Swipe
                        }
                    }
                    else {
                        currentGesture = Gesture.Swipe
                    }
                }
            }
            if (currentGesture)
                switch (currentGesture) {
                    case Gesture.Tap:
                        // Triggered after lifting the touch
                        break;
                    case Gesture.Swipe:
                        events.trigger(`swipe_${touches.size}`, pos.sub(touches.get(touch.identifier)!));
                        break;
                    case Gesture.Pinch:
                        // The pinch gesture uses 2 fingers, although 3 of 4 fingers should also work
                        if (touches.size == 2) {
                            let p = [...touches.values()];
                            const scaleCenter = lerp(p[0], p[1], 0.5);
                            const oldDistance = p[0].dist(p[1]);
                            touches.set(touch.identifier, pos.clone());
                            p = [...touches.values()];
                            const newDistance = p[0].dist(p[1]);
                            debug.log("pinch", scaleCenter, newDistance / oldDistance);
                            events.trigger(`pinch_${touches.size}`, scaleCenter, newDistance / oldDistance);
                            return;
                        }
                        break;
                    case Gesture.Rotate:
                        if (touches.size == 2) {
                            let p = [...touches.values()];
                            const scaleCenter = lerp(p[0], p[1], 0.5);
                            const oldVector = p[0].sub(p[1]);
                            touches.set(touch.identifier, pos.clone());
                            p = [...touches.values()];
                            const newVector = p[0].sub(p[1]);
                            debug.log("rotate", Vec2.angleBetween(oldVector, newVector));
                            events.trigger(`rotate_${touches.size}`, Vec2.angleBetween(oldVector, newVector));
                            return;
                        }
                        break;
                }
            touches.set(touch.identifier, pos.clone());
        });

        _k.k.onTouchEnd((pos, touch) => {
            switch (currentGesture) {
                case Gesture.Tap:
                    if (touches.size == 1) {
                        events.trigger(`tap_${touches.size}`, pos);
                    }
                    break;
                case Gesture.Swipe:
                    // Triggered during swipe
                    break;
                case Gesture.Pinch:
                    // Triggered during pinch
                    break;
            }
            touches.delete(touch.identifier);
            if (touches.size == 0) {
                debug.log("Gesture.None");
                currentGesture = Gesture.None;
            }
        });
    }
}

export namespace gestures {
    export function onTap(fingers: number, cb: (point: Vec2) => void) {
        installGestureDetector();
        events.on(`tap_${fingers}`, cb);
    }

    export function onSwipe(fingers: number, cb: (delta: Vec2) => void) {
        installGestureDetector();
        events.on(`swipe_${fingers}`, cb);
    }

    export function onPinch(cb: (center: Vec2, scale: Vec2) => void) {
        installGestureDetector();
        events.on(`pinch_${2}`, cb);
    }

    export function onRotate(cb: (center: Vec2, angle: number) => void) {
        installGestureDetector();
        events.on(`rotate_${2}`, cb);
    }
}

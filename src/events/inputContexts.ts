import type { App } from "../app/app";
import type { KAPLAYCtx } from "../core/contextType";
import type { Vec2 } from "../math/Vec2";
import type {
    Key,
    KGamepad,
    KGamepadButton,
    KGamepadStick,
    MouseButton,
} from "../types";
import type { AppEventMap } from "./eventMap";
import type { KEventController } from "./events";
import type { ScopeHandlers } from "./scopeHandlers";

const inputEvents = {
    onKeyDown: "keyDown",
    onKeyPress: "keyPress",
    onKeyPressRepeat: "keyPressRepeat",
    onKeyRelease: "keyRelease",
    onCharInput: "charInput",
    onMouseDown: "mouseDown",
    onMousePress: "mousePress",
    onMouseRelease: "mouseRelease",
    onMouseMove: "mouseMove",
    onTouchStart: "touchStart",
    onTouchEnd: "touchEnd",
    onTouchMove: "touchMove",
    onScroll: "scroll",
    onGamepadButtonDown: "gamepadButtonDown",
    onGamepadButtonPress: "gamepadButtonPress",
    onGamepadButtonRelease: "gamepadButtonRelease",
    onGamepadStick: "gamepadStick",
    onButtonDown: "buttonDown",
    onButtonPress: "buttonPress",
    onButtonRelease: "buttonRelease",
} as const satisfies Record<string, keyof AppEventMap>;

type InputHandlerName = keyof typeof inputEvents;
const inputHandlerNames = Object.keys(inputEvents) as InputHandlerName[];

/**
 * Scene-owned input registrations with the same overloads and controllers as
 * the public input API. Registration methods can be called independently.
 *
 * @group Input
 */
export type InputContext = Pick<KAPLAYCtx, InputHandlerName> & {
    /**
     * Remove this context from the stack and cancel its registrations.
     * Repeated calls are safe; later registration and push attempts fail.
     */
    dispose(): void;
};

type ContextRecord = {
    controllers: Set<KEventController>;
    disposed: boolean;
};

export function createInputContexts(handlers: ScopeHandlers, app: App) {
    const records = new Map<InputContext, ContextRecord>();
    const stack: InputContext[] = [];
    const recipients = new WeakMap<object, InputContext | null>();

    function top(): InputContext | null {
        return stack[stack.length - 1] ?? null;
    }

    function recipient(): InputContext | null {
        const dispatch = app.events.currentDispatch();
        return dispatch ? recipients.get(dispatch) ?? null : top();
    }

    for (const name of inputHandlerNames) {
        app.events.on(inputEvents[name], () => {
            const dispatch = app.events.currentDispatch();
            if (dispatch && !recipients.has(dispatch)) {
                recipients.set(dispatch, top());
            }
        });
    }

    function registration(
        name: InputHandlerName,
        args: unknown[],
        active: () => boolean,
        record?: ContextRecord,
    ): KEventController {
        if (record?.disposed) {
            throw new Error("Cannot register input on a disposed context");
        }

        const action = args[args.length - 1];
        if (typeof action !== "function") {
            throw new TypeError("Input handler requires a callback");
        }

        const forwarded = [...args];
        forwarded[forwarded.length - 1] = (...eventArgs: unknown[]) => {
            if (active()) {
                return action(...eventArgs);
            }
        };

        const handler = handlers[name] as unknown as (
            ...values: unknown[]
        ) => KEventController;
        const controller = handler(...forwarded);
        if (record) {
            const cancel = controller.cancel;
            controller.cancel = () => {
                record.controllers.delete(controller);
                cancel();
            };
            record.controllers.add(controller);
        }
        return controller;
    }

    const sceneHandlers = { ...handlers } as
        & ScopeHandlers
        & Record<string, unknown>;
    const objectHandlers = { ...handlers } as
        & ScopeHandlers
        & Record<string, unknown>;
    for (const name of inputHandlerNames) {
        sceneHandlers[name] = (...args: unknown[]) =>
            registration(name, args, () => recipient() === null);
        objectHandlers[name] = (...args: unknown[]) => {
            const owner = top();
            const record = owner ? records.get(owner) : undefined;
            return registration(
                name,
                args,
                () => recipient() === owner,
                record,
            );
        };
    }

    class Context implements InputContext {
        private readonly record: ContextRecord = {
            controllers: new Set(),
            disposed: false,
        };

        constructor() {
            records.set(this, this.record);
            for (const name of inputHandlerNames) {
                const handler = this[name] as (
                    ...args: unknown[]
                ) => KEventController;
                Object.defineProperty(this, name, {
                    value: handler.bind(this),
                    writable: true,
                    configurable: true,
                });
            }
            this.dispose = this.dispose.bind(this);
        }

        private register(name: InputHandlerName, args: unknown[]) {
            return registration(
                name,
                args,
                () => recipient() === this,
                this.record,
            );
        }

        dispose(): void {
            dispose(this);
        }

        onKeyDown(action: (key: Key) => void): KEventController;
        onKeyDown(
            key: Key | Key[],
            action: (key: Key) => void,
        ): KEventController;
        onKeyDown(...args: unknown[]): KEventController {
            return this.register("onKeyDown", args);
        }

        onKeyPress(action: (key: Key) => void): KEventController;
        onKeyPress(
            key: Key | Key[],
            action: (key: Key) => void,
        ): KEventController;
        onKeyPress(...args: unknown[]): KEventController {
            return this.register("onKeyPress", args);
        }

        onKeyPressRepeat(action: (key: Key) => void): KEventController;
        onKeyPressRepeat(
            key: Key | Key[],
            action: (key: Key) => void,
        ): KEventController;
        onKeyPressRepeat(...args: unknown[]): KEventController {
            return this.register("onKeyPressRepeat", args);
        }

        onKeyRelease(action: (key: Key) => void): KEventController;
        onKeyRelease(
            key: Key | Key[],
            action: (key: Key) => void,
        ): KEventController;
        onKeyRelease(...args: unknown[]): KEventController {
            return this.register("onKeyRelease", args);
        }

        onCharInput(action: (character: string) => void): KEventController {
            return this.register("onCharInput", [action]);
        }

        onMouseDown(action: (button: MouseButton) => void): KEventController;
        onMouseDown(
            button: MouseButton | MouseButton[],
            action: (button: MouseButton) => void,
        ): KEventController;
        onMouseDown(...args: unknown[]): KEventController {
            return this.register("onMouseDown", args);
        }

        onMousePress(action: (button: MouseButton) => void): KEventController;
        onMousePress(
            button: MouseButton | MouseButton[],
            action: (button: MouseButton) => void,
        ): KEventController;
        onMousePress(...args: unknown[]): KEventController {
            return this.register("onMousePress", args);
        }

        onMouseRelease(action: (button: MouseButton) => void): KEventController;
        onMouseRelease(
            button: MouseButton | MouseButton[],
            action: (button: MouseButton) => void,
        ): KEventController;
        onMouseRelease(...args: unknown[]): KEventController {
            return this.register("onMouseRelease", args);
        }

        onMouseMove(
            action: (pos: Vec2, delta: Vec2) => void,
        ): KEventController {
            return this.register("onMouseMove", [action]);
        }

        onTouchStart(
            action: (pos: Vec2, touch: Touch) => void,
        ): KEventController {
            return this.register("onTouchStart", [action]);
        }

        onTouchEnd(
            action: (pos: Vec2, touch: Touch) => void,
        ): KEventController {
            return this.register("onTouchEnd", [action]);
        }

        onTouchMove(
            action: (pos: Vec2, touch: Touch) => void,
        ): KEventController {
            return this.register("onTouchMove", [action]);
        }

        onScroll(action: (delta: Vec2) => void): KEventController {
            return this.register("onScroll", [action]);
        }

        onGamepadButtonDown(
            action: (button: KGamepadButton, gamepad: KGamepad) => void,
        ): KEventController;
        onGamepadButtonDown(
            button: KGamepadButton | KGamepadButton[],
            action: (button: KGamepadButton, gamepad: KGamepad) => void,
        ): KEventController;
        onGamepadButtonDown(...args: unknown[]): KEventController {
            return this.register("onGamepadButtonDown", args);
        }

        onGamepadButtonPress(
            action: (button: KGamepadButton, gamepad: KGamepad) => void,
        ): KEventController;
        onGamepadButtonPress(
            button: KGamepadButton | KGamepadButton[],
            action: (button: KGamepadButton, gamepad: KGamepad) => void,
        ): KEventController;
        onGamepadButtonPress(...args: unknown[]): KEventController {
            return this.register("onGamepadButtonPress", args);
        }

        onGamepadButtonRelease(
            action: (button: KGamepadButton, gamepad: KGamepad) => void,
        ): KEventController;
        onGamepadButtonRelease(
            button: KGamepadButton | KGamepadButton[],
            action: (button: KGamepadButton, gamepad: KGamepad) => void,
        ): KEventController;
        onGamepadButtonRelease(...args: unknown[]): KEventController {
            return this.register("onGamepadButtonRelease", args);
        }

        onGamepadStick(
            stick: KGamepadStick,
            action: (value: Vec2, gamepad: KGamepad) => void,
        ): KEventController {
            return this.register("onGamepadStick", [stick, action]);
        }

        onButtonDown(action: (button: string) => void): KEventController;
        onButtonDown(
            button: string | string[],
            action: (button: string) => void,
        ): KEventController;
        onButtonDown(...args: unknown[]): KEventController {
            return this.register("onButtonDown", args);
        }

        onButtonPress(action: (button: string) => void): KEventController;
        onButtonPress(
            button: string | string[],
            action: (button: string) => void,
        ): KEventController;
        onButtonPress(...args: unknown[]): KEventController {
            return this.register("onButtonPress", args);
        }

        onButtonRelease(action: (button: string) => void): KEventController;
        onButtonRelease(
            button: string | string[],
            action: (button: string) => void,
        ): KEventController;
        onButtonRelease(...args: unknown[]): KEventController {
            return this.register("onButtonRelease", args);
        }
    }

    function create(): InputContext {
        return new Context();
    }

    function dispose(context: InputContext): void {
        const record = records.get(context);
        if (!record || record.disposed) {
            return;
        }

        record.disposed = true;
        const index = stack.indexOf(context);
        if (index >= 0) {
            stack.splice(index, 1);
        }

        for (const controller of record.controllers) {
            controller.cancel();
        }
        record.controllers.clear();
        records.delete(context);
    }

    function push(context: InputContext): void {
        const record = records.get(context);
        if (!record || record.disposed) {
            throw new Error(
                "Input context does not belong to the current scene",
            );
        }
        if (stack.includes(context)) {
            throw new Error("Input context is already on the stack");
        }
        stack.push(context);
    }

    function pop(): void {
        stack.pop();
    }

    function resetScene(): void {
        for (const context of records.keys()) {
            dispose(context);
        }
    }

    return { create, push, pop, resetScene, sceneHandlers, objectHandlers };
}

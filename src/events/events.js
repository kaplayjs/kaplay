"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEventHandler = exports.KEvent = exports.KEventController = exports.Registry = void 0;
var general_1 = require("../constants/general");
var Registry = /** @class */ (function (_super) {
    __extends(Registry, _super);
    function Registry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastID = 0;
        return _this;
    }
    Registry.prototype.push = function (v) {
        var id = this.lastID;
        this.set(id, v);
        this.lastID++;
        return id;
    };
    Registry.prototype.pushd = function (v) {
        var _this = this;
        var id = this.push(v);
        return function () { return _this.delete(id); };
    };
    return Registry;
}(Map));
exports.Registry = Registry;
/**
 * A controller for all events in KAPLAY.
 *
 * @example
 * ```js
 * // Create a new event
 * const logHi = onUpdate(() => {
 *    debug.log("hi");
 * });
 *
 * // Pause the event
 * logHi.paused = true;
 *
 * // Cancel the event
 * logHi.cancel();
 *
 * ```
 *
 * @group Events
 */
var KEventController = /** @class */ (function () {
    function KEventController(cancel) {
        /** If the event is paused */
        this.paused = false;
        this.cancel = cancel;
    }
    KEventController.join = function (events) {
        var ev = new KEventController(function () {
            return events.forEach(function (e) { return e.cancel(); });
        });
        Object.defineProperty(ev, "paused", {
            get: function () { return events[0].paused; },
            set: function (p) { return events.forEach(function (e) { return e.paused = p; }); },
        });
        ev.paused = false;
        return ev;
    };
    KEventController.replace = function (oldEv, newEv) {
        oldEv.cancel = function () { return newEv.cancel(); };
        newEv.paused = oldEv.paused;
        Object.defineProperty(oldEv, "paused", {
            get: function () { return newEv.paused; },
            set: function (p) { return newEv.paused = p; },
        });
        return oldEv;
    };
    return KEventController;
}());
exports.KEventController = KEventController;
var KEvent = /** @class */ (function () {
    function KEvent() {
        this.cancellers = new WeakMap();
        this.handlers = new Registry();
    }
    KEvent.prototype.add = function (action) {
        function handler() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (ev.paused)
                return;
            return action.apply(void 0, args);
        }
        var cancel = this.handlers.pushd(handler);
        var ev = new KEventController(cancel);
        this.cancellers.set(handler, cancel);
        return ev;
    };
    KEvent.prototype.addOnce = function (action) {
        var ev = this.add(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            ev.cancel();
            action.apply(void 0, args);
        });
        return ev;
    };
    KEvent.prototype.next = function () {
        var _this = this;
        return new Promise(function (res) { return _this.addOnce(res); });
    };
    KEvent.prototype.trigger = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.handlers.forEach(function (action) {
            var result = action.apply(void 0, args);
            var cancel;
            if (result === general_1.EVENT_CANCEL_SYMBOL
                && (cancel = _this.cancellers.get(action))) {
                cancel();
            }
        });
    };
    KEvent.prototype.numListeners = function () {
        return this.handlers.size;
    };
    KEvent.prototype.clear = function () {
        this.handlers.clear();
    };
    return KEvent;
}());
exports.KEvent = KEvent;
// TODO: only accept one argument?
var KEventHandler = /** @class */ (function () {
    function KEventHandler() {
        this.handlers = {};
        this.registers = {};
    }
    KEventHandler.prototype.on = function (name, action) {
        if (!this.handlers[name]) {
            this.handlers[name] = new KEvent();
        }
        return this.handlers[name].add(action);
    };
    KEventHandler.prototype.onOnce = function (name, action) {
        var ev = this.on(name, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            ev.cancel();
            action.apply(void 0, args);
        });
        return ev;
    };
    KEventHandler.prototype.next = function (name) {
        var _this = this;
        return new Promise(function (res) {
            // TODO: can only pass 1 val to resolve()
            _this.onOnce(name, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return res(args[0]);
            });
        });
    };
    KEventHandler.prototype.trigger = function (name) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.handlers[name]) {
            (_a = this.handlers[name]).trigger.apply(_a, args);
        }
    };
    KEventHandler.prototype.remove = function (name) {
        delete this.handlers[name];
    };
    KEventHandler.prototype.clear = function () {
        this.handlers = {};
    };
    KEventHandler.prototype.numListeners = function (name) {
        var _a, _b;
        return (_b = (_a = this.handlers[name]) === null || _a === void 0 ? void 0 : _a.numListeners()) !== null && _b !== void 0 ? _b : 0;
    };
    return KEventHandler;
}());
exports.KEventHandler = KEventHandler;

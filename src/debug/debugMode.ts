import type { ButtonsDef } from "../app/inputBindings";
import { clamp } from "../math/clamp";
import { _k } from "../shared";
import { toFixed } from "../utils/numbers";

const symbols = {
	debugInspect: Symbol("debugInspect") as unknown as string,
	debugClearLog: Symbol("debugClearLog") as unknown as string,
	debugDecreaseTimeScale: Symbol("debugDecreaseTimeScale") as unknown as string,
	debugPause: Symbol("debugPause") as unknown as string,
	debugIncreaseTimeScale: Symbol("debugIncreaseTimeScale") as unknown as string,
	debugStepFrame: Symbol("debugStepFrame") as unknown as string,
};

const buttonsDef: ButtonsDef = {
	[symbols.debugInspect]: {
		keyboard: "d",
	},
	[symbols.debugClearLog]: {
		keyboard: "f2",
	},
	[symbols.debugDecreaseTimeScale]: {
		keyboard: "f7",
	},
	[symbols.debugPause]: {
		keyboard: "f8",
	},
	[symbols.debugIncreaseTimeScale]: {
		keyboard: "f9",
	},
	[symbols.debugStepFrame]: {
		keyboard: "f10",
	},
};

export function createDebugMode() {
	for (const key of Reflect.ownKeys(buttonsDef)) {
		console.log("Setting debug button:", key, buttonsDef[key]);
		_k.k.setButton(key as string, buttonsDef[key]);
	}

	_k.k.app.onUpdate(() => {
		console.log("Debug mode active");
		if (_k.k.isButtonPressed(symbols.debugInspect)) {
			console.log("Toggling debug inspect mode");
			_k.debug.inspect = !_k.debug.inspect;
		}
		if (_k.k.isButtonPressed(symbols.debugClearLog)) {
			_k.debug.clearLog();
		}

		if (_k.k.isButtonPressed(symbols.debugIncreaseTimeScale)) {
			_k.debug.timeScale = toFixed(
				clamp(_k.debug.timeScale + 0.2, 0, 2),
				1,
			);
		}
		if (_k.k.isButtonPressed(symbols.debugDecreaseTimeScale)) {
			_k.debug.timeScale = toFixed(
				clamp(_k.debug.timeScale - 0.2, 0, 2),
				1,
			);
		}
		if (_k.k.isButtonPressed(symbols.debugPause)) {
			_k.debug.paused = !_k.debug.paused;
		}
		if (_k.k.isButtonPressed(symbols.debugStepFrame)) {
			_k.debug.stepFrame();
		}
	});
}


export interface KeyboardOperationPluginOptions {
	noPreventDefault?: boolean;
}

export interface KeyboardOperationPluginEventData {
	type: string;
	code: string;
	key: string;
	shiftKey: boolean;
	altKey: boolean;
	ctrlKey: boolean;
	metaKey: boolean;
}

export class KeyboardOperationPlugin implements g.OperationPlugin {
	// 画面がスクロールしてしまうなどの動作を避けるため preventDefault() するキーの一覧
	private static _keymapForPreventDefault: { [key: string]: boolean } = {
		Tab: true,
		Backspace: true,
		Enter: true,
		Space: true,
		" ": true,
		ArrowLeft: true,
		ArrowUp: true,
		ArrowRight: true,
		ArrowDown: true,
		F1: true,
		F2: true,
		F3: true,
		F4: true,
		F5: true,
		F6: true,
		F7: true,
		F8: true,
		F9: true,
		F10: true,
		F11: true,
		F12: true,
	};

	operationTrigger: g.Trigger<g.OperationPluginOperation | (number | string)[]>;

	private _view: g.OperationPluginView;
	private _noPreventDefault: boolean;

	static isSupported(): boolean {
		return (
			typeof document !== "undefined" &&
			typeof document.addEventListener === "function"
		);
	}

	constructor(
		_game: g.Game,
		viewInfo: g.OperationPluginViewInfo | null,
		option: KeyboardOperationPluginOptions = {},
	) {
		this.operationTrigger = new g.Trigger();
		this._view = viewInfo!.view as HTMLElement;
		this._noPreventDefault = !!option.noPreventDefault;
	}

	start(): boolean {
		this._view.addEventListener("keydown", this._handleKeyDown, false);
		this._view.addEventListener("keyup", this._handleKeyUp, false);
		return true;
	}

	stop(): void {
		this._view.removeEventListener("keydown", this._handleKeyDown, false);
		this._view.removeEventListener("keyup", this._handleKeyUp, false);
	}

	decode(op: [string, string, string, number, number, number, number]): KeyboardOperationPluginEventData {
		return {
			type: op[0],
			code: op[1],
			key: op[2],
			shiftKey: op[3] === 1,
			altKey: op[4] === 1,
			ctrlKey: op[5] === 1,
			metaKey: op[6] === 1,
		};
	}

	private _makeData(type: string, e: KeyboardEvent): g.OperationPluginOperation {
		if (!this._noPreventDefault && KeyboardOperationPlugin._keymapForPreventDefault[e.key]) {
			e.preventDefault();
		}

		return {
			data: [
				type,
				e.code,
				e.key,
				e.shiftKey ? 1 : 0,
				e.altKey ? 1 : 0,
				e.ctrlKey ? 1 : 0,
				e.metaKey ? 1 : 0,
			],
		};
	}

	private _handleKeyDown = (e: KeyboardEvent): void => {
		this.operationTrigger.fire(this._makeData("keydown", e));
	};

	private _handleKeyUp = (e: KeyboardEvent): void => {
		this.operationTrigger.fire(this._makeData("keyup", e));
	};
}

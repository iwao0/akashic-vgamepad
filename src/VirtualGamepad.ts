import { KeyboardOperationPlugin } from "./KeyboardOperationPlugin";

function resolveAssetPath(assetId: string): string {
	return "/node_modules/@iwao0/akashic-vgamepad/assets/" + assetId;
}

const GAMEPAD_BUTTON = {
	up: 12,
	down: 13,
	left: 14,
	right: 15
} as const;

interface KeyboardState {
	x: number;
	y: number;
	keys: { [key: string]: number };
}

/**
 * VirtualGamepadのコンストラクタに渡すオプション
 * @extends g.EParameterObject
 */
export interface VirtualGamepadParameterObject extends g.EParameterObject {
	/**
	 * 仮想スティックの左側の隙間
	 * @default 40
	 */
	marginLeft?: number;
	/**
	 * 仮想ボタンの右側の隙間
	 * @default 40
	 */
	marginRight?: number;
	/**
	 * 仮想スティック、仮想ボタンの下側の隙間
	 * @default 40
	 */
	marginBottom?: number;
	/**
	 * 仮想スティックの軸の可動域 (値が大きいほど狭くなる)
	 * @default 8
	 */
	shaftMargin?: number;
	/**
	 * 仮想ボタンの数 (0〜2)
	 * @default 2
	 */
	buttonCount?: number;
	/**
	 * 仮想ボタン間の隙間
	 * @default 20
	 */
	buttonSpace?: number;
	/**
	 * 物理スティックの中心の遊びの領域 (0〜1)
	 * @default 0.2
	 */
	stickNeutralRange?: number;
	/**
	 * キーボードの押し始めにヒントを表示するか
	 * @default true
	 */
	useHint?: boolean;
	/**
	 * キーボード入力を使用するか
	 * @default true
	 */
	useKeyboard?: boolean;
	/**
	 * マウス、タッチ入力を使用するか
	 * @default true
	 */
	useMouseOrTouch?: boolean;
	/**
	 * 物理ゲームパッドを使用するか
	 * @default true
	 */
	useGamepad?: boolean;
	/**
	 * キーボードプラグインのコード番号 (問題が起こった時は値を変更してください)
	 * @default 139
	 */
	keyboardPluginCode?: number;
	/**
	 * キーボードのキー入力の再マップ (それぞれに複数キーの登録可能)
	 */
	keys?: {
		/**
		 * スティック入力の左
		 * @default ["a", "A", "ArrowLeft"]
		 */
		left?: string[];
		/**
		 * スティック入力の右
		 * @default ["d", "D", "ArrowRight"]
		 */
		right?: string[];
		/**
		 * スティック入力の上
		 * @default ["w", "W", "ArrowUp"]
		 */
		up?: string[];
		/**
		 * スティック入力の下
		 * @default ["s", "S", "ArrowDown"]
		 */
		down?: string[];
		/**
		 * ボタン0
		 * @default [" ", "Space"]
		 */
		button0?: string[];
		/**
		 * ボタン1
		 * @default ["Shift"]
		 */
		button1?: string[];
	};
	/**
	 * 画像の置き換え
	 * scene.asset.getImageById()等を使って入れ替えてください。
	 */
	images?: {
		/**
		 * スティックの土台
		 */
		stickBase?: g.ImageAsset | g.Surface;
		/**
		 * スティックのキーボードヒント
		 */
		stickHint?: g.ImageAsset | g.Surface;
		/**
		 * スティックの軸
		 */
		stickShaft?: g.ImageAsset | g.Surface;
		/**
		 * ボタン0
		 */
		button0Up?: g.ImageAsset | g.Surface;
		/**
		 * ボタン0のキーボードヒント
		 */
		button0Hint?: g.ImageAsset | g.Surface;
		/**
		 * ボタン1
		 */
		button1Up?: g.ImageAsset | g.Surface;
		/**
		 * ボタン1のキーボードヒント
		 */
		button1Hint?: g.ImageAsset | g.Surface;
	};
}

/**
 * 仮想スティックの状態
 */
export interface VirtualGamepadStick {
	/**
	 * X座標 (-1〜1)
	 */
	x: number;
	/**
	 * Y座標 (-1〜1)
	 */
	y: number;
	/**
	 * 角度 (-π〜π)
	 */
	angle: number;
	/**
	 * 傾きの大きさ (0〜1)
	 */
	magnitude: number;
	/**
	 * 画像
	 */
	sprites: {
		/**
		 * スティックの土台
		 */
		base: g.Sprite;
		/**
		 * スティックの軸
		 */
		shaft: g.Sprite;
		/**
		 * キーボードヒント
		 */
		hint: g.Sprite;
	};
}

/**
 * 仮想ボタンの状態
 */
export interface VirtualGamepadButton {
	/**
	 * 押された瞬間:true
	 */
	isPressed: boolean;
	/**
	 * 離された瞬間:true
	 */
	isReleased: boolean;
	/**
	 * 押されている間:true (isPressedがtrueになった次のフレームからtrueになる)
	 */
	isHeld: boolean;
	/**
	 * 画像
	 */
	sprites: {
		/**
		 * ボタン
		 */
		up: g.Sprite;
		/**
		 * キーボードヒント
		 */
		hint: g.Sprite;
	};
}

/**
 * VirtualGamepadのコンストラクタに渡されたオプションの一覧
 */
export class VirtualGamepadOptions {
	readonly marginLeft: number;
	readonly marginRight: number;
	readonly marginBottom: number;
	readonly shaftMargin: number;
	readonly buttonCount: number;
	readonly buttonSpace: number;
	readonly stickNeutralRange: number;
	readonly useHint: boolean;
	readonly useKeyboard: boolean;
	readonly useMouseOrTouch: boolean;
	readonly useGamepad: boolean;
	readonly keys: {
		readonly left: string[];
		readonly right: string[];
		readonly up: string[];
		readonly down: string[];
		readonly button0: string[];
		readonly button1: string[];
	};
	readonly keyboardPluginCode: number;

	constructor(param: VirtualGamepadParameterObject) {
		this.marginLeft = this.getNumberParam(param.marginLeft, 40);
		this.marginRight = this.getNumberParam(param.marginRight, 40);
		this.marginBottom = this.getNumberParam(param.marginBottom, 40);
		this.shaftMargin = this.getNumberParam(param.shaftMargin, 8);
		this.buttonCount = this.getNumberParam(param.buttonCount, 2);
		this.buttonCount = Math.max(0, Math.min(2, this.buttonCount));
		this.buttonSpace = this.getNumberParam(param.buttonSpace, 20);
		this.stickNeutralRange = this.getNumberParam(param.stickNeutralRange, 0.2);
		this.useHint = this.getBooleanParam(param.useHint, true);
		this.useKeyboard = this.getBooleanParam(param.useKeyboard, true);
		this.useMouseOrTouch = this.getBooleanParam(param.useMouseOrTouch, true);
		this.useGamepad = this.getBooleanParam(param.useGamepad, true);
		this.keys = {
			left: this.getStringArrayParam(param.keys?.left, ["a", "A", "ArrowLeft"]),
			right: this.getStringArrayParam(param.keys?.right, ["d", "D", "ArrowRight"]),
			up: this.getStringArrayParam(param.keys?.up, ["w", "W", "ArrowUp"]),
			down: this.getStringArrayParam(param.keys?.down, ["s", "S", "ArrowDown"]),
			button0: this.getStringArrayParam(param.keys?.button0, [" ", "Space"]),
			button1: this.getStringArrayParam(param.keys?.button1, ["Shift"])
		};
		this.keyboardPluginCode = this.getNumberParam(param.keyboardPluginCode, 139);
	}

	private getNumberParam(value: number | undefined, defaultValue: number): number {
		if (typeof(value) === "number") {
			return value;
		}
		return defaultValue;
	}

	private getBooleanParam(value: boolean | undefined, defaultValue: boolean): boolean {
		if (typeof(value) === "boolean") {
			return value;
		}
		return defaultValue;
	}

	private getStringArrayParam(value: string[] | undefined, defaultValue: string[]): string[] {
		if (Array.isArray(value)) {
			const array: string[] = [];
			for (const i of value) {
				if (typeof(i) !== "string") {
					continue;
				}
				if (i.length !== 1) {
					array.push(i);
					continue;
				}
				const u = i.toUpperCase();
				const l = i.toLowerCase();
				if (array.indexOf(u) < 0) {
					array.push(u);
				}
				if (array.indexOf(l) < 0) {
					array.push(l);
				}
			}
			return array;
		}
		return defaultValue;
	}
}

/**
 * 仮想ゲームパッド
 * @description
 * 使用例:
 * ```js
 * const scene = new g.Scene({
 * 	game: g.game,
 * 	// VirtualGamepadに含まれている画像素材を追加する
 * 	assetPaths: [
 * 		...VirtualGamepad.getAssetPaths()
 * 	]
 * });
 *
 * const gamepad = new VirtualGamepad({
 * 	scene: scene,
 * });
 * scene.append(gamepad);
 *
 * scene.onUpdate.add(() => {
 * 	// フレームごとにリフレッシュする
 * 	gamepad.refresh();
 * })
 * ```
 */
export class VirtualGamepad extends g.E {
	/**
	 * 入力の有効・無効
	 */
	isEnabled: boolean;
	/**
	 * スティックの状態
	 */
	stick: VirtualGamepadStick;
	/**
	 * ボタンの状態
	 */
	buttons: VirtualGamepadButton[];
	/**
	 * コンストラクタで渡されたオプションの一覧
	 */
	options: VirtualGamepadOptions;

	private isUsingVirtualStick: boolean;
	private isUsingKeyboard: boolean;
	private isHintVisible: boolean;
	private keyboard: KeyboardState;

	/**
	 * VirtualGamepadで使用されるアセットのパス一覧
	 * @description
	 * g.SceneのコンストラクタのassetPathsに渡してください。
	 * @returns アセットのパス一覧
	 */
	static getAssetPaths(): string[] {
		return [
			resolveAssetPath("stick_base.png"),
			resolveAssetPath("stick_hint.png"),
			resolveAssetPath("stick_shaft.png"),
			resolveAssetPath("button0_up.png"),
			resolveAssetPath("button0_hint.png"),
			resolveAssetPath("button1_up.png"),
			resolveAssetPath("button1_hint.png")
		];
	}

	/**
	 * @param param 仮想ゲームパッドの作成オプション
	 */
	constructor(param: VirtualGamepadParameterObject) {
		super(param);

		this.isEnabled = true;
		this.options = new VirtualGamepadOptions(param);

		this.isUsingVirtualStick = false;
		this.isUsingKeyboard = false;
		this.isHintVisible = false;
		this.keyboard = {
			x: 0,
			y: 0,
			keys: {}
		};

		this.registerKeyboardOperationPlugin();

		const width = g.game.width / this.scaleX;
		const height = g.game.height / this.scaleY;

		const marginLeft = this.options.marginLeft / this.scaleX;
		const marginRight = this.options.marginRight / this.scaleX;
		const marginBottom = this.options.marginBottom / this.scaleY;
		const buttonSpace = this.options.buttonSpace / this.scaleY;

		let stickBase: g.Sprite;
		let stickHint: g.Sprite;
		let stickShaft: g.Sprite;

		if (param.images?.stickBase) {
			stickBase = this.makeSpriteFromImage(
				param.images?.stickBase,
				marginLeft,
				height - marginBottom
			);
		} else {
			stickBase = this.makeSprite(
				resolveAssetPath("stick_base.png"),
				marginLeft,
				height - marginBottom
			);
		}

		if (param.images?.stickHint) {
			stickHint = this.makeSpriteFromImage(
				param.images?.stickHint,
				stickBase.width * 0.5,
				stickBase.height * 0.5
			);
		} else {
			stickHint = this.makeSprite(
				resolveAssetPath("stick_hint.png"),
				stickBase.width * 0.5,
				stickBase.height * 0.5
			);
		}

		if (param.images?.stickShaft) {
			stickShaft = this.makeSpriteFromImage(
				param.images?.stickShaft,
				stickBase.width * 0.5,
				stickBase.height * 0.5
			);
		} else {
			stickShaft = this.makeSprite(
				resolveAssetPath("stick_shaft.png"),
				stickBase.width * 0.5,
				stickBase.height * 0.5
			);
		}

		this.stick = {
			x: 0,
			y: 0,
			angle: 0,
			magnitude: 0,
			sprites: {
				base: stickBase,
				shaft: stickShaft,
				hint: stickHint
			}
		};

		const buttonUpSprites: g.Sprite[] = [];

		if (param.images?.button0Up) {
			buttonUpSprites.push(this.makeSpriteFromImage(
				param.images?.button0Up,
				width - marginRight,
				height - marginBottom
			));
		} else {
			buttonUpSprites.push(this.makeSprite(
				resolveAssetPath("button0_up.png"),
				width - marginRight,
				height - marginBottom
			));
		}

		if (param.images?.button1Up) {
			buttonUpSprites.push(this.makeSpriteFromImage(
				param.images?.button1Up,
				width - marginRight,
				0
			));
		} else {
			buttonUpSprites.push(this.makeSprite(
				resolveAssetPath("button1_up.png"),
				width - marginRight,
				0
			));
		}

		buttonUpSprites[1].y = buttonUpSprites[0].y -
			buttonUpSprites[1].height - buttonSpace;

		const buttonHintSprites: g.Sprite[] = [];

		if (param.images?.button0Hint) {
			buttonHintSprites.push(this.makeSpriteFromImage(
				param.images?.button0Hint,
				buttonUpSprites[0].width * 0.5,
				buttonUpSprites[0].height * 0.5
			));
		} else {
			buttonHintSprites.push(this.makeSprite(
				resolveAssetPath("button0_hint.png"),
				buttonUpSprites[0].width * 0.5,
				buttonUpSprites[0].height * 0.5
			));
		}

		if (param.images?.button1Hint) {
			buttonHintSprites.push(this.makeSpriteFromImage(
				param.images?.button1Hint,
				buttonUpSprites[1].width * 0.5,
				buttonUpSprites[1].height * 0.5
			));
		} else {
			buttonHintSprites.push(this.makeSprite(
				resolveAssetPath("button1_hint.png"),
				buttonUpSprites[1].width * 0.5,
				buttonUpSprites[1].height * 0.5
			));
		}

		this.buttons = [];
		for (let i = 0; i < this.options.buttonCount; i++) {
			this.buttons.push({
				isPressed: false,
				isReleased: false,
				isHeld: false,
				sprites: {
					up: buttonUpSprites[i],
					hint: buttonHintSprites[i]
				}
			});
		}

		this.makeStick();
		this.makeButtons();
	}

	/**
	 * 入力値をリセットし、軸を中心に戻す
	 */
	reset(): void {
		for (const button of this.buttons) {
			button.isPressed = false;
			button.isReleased = false;
			button.isHeld = false;
		}
		this.stick.x = 0;
		this.stick.y = 0;
		this.stick.angle = 0;
		this.stick.magnitude = 0;
		this.setStickShaftPosition(0, 0);
	}

	/**
	 * 仮想ゲームパッドの表示サイズを変更する
	 * @param value 表示サイズ (0〜1)
	 */
	scale(value: number): void {
		this.scaleX = value;
		this.scaleY = value;

		const width = g.game.width / this.scaleX;
		const height = g.game.height / this.scaleY;

		const marginLeft = this.options.marginLeft / this.scaleX;
		const marginRight = this.options.marginRight / this.scaleX;
		const marginBottom = this.options.marginBottom / this.scaleY;
		const buttonSpace = this.options.buttonSpace / this.scaleY;

		this.stick.sprites.base.x = marginLeft;
		this.stick.sprites.base.y = height - marginBottom;
		this.stick.sprites.base.invalidate();

		this.buttons[0].sprites.up.x = width - marginRight;
		this.buttons[0].sprites.up.y = height - marginBottom;
		this.buttons[0].sprites.up.invalidate();

		this.buttons[1].sprites.up.x = width - marginRight;
		this.buttons[1].sprites.up.y = this.buttons[0].sprites.up.y -
			this.buttons[1].sprites.up.height - buttonSpace;
		this.buttons[1].sprites.up.invalidate();

		this.modified();
	}

	/**
	 * キーボードヒントを表示する
	 */
	showHint(): void {
		this.stick.sprites.base.append(this.stick.sprites.hint);
		if (this.options.buttonCount >= 1) {
			this.buttons[0].sprites.up.append(this.buttons[0].sprites.hint);
		}
		if (this.options.buttonCount >= 2) {
			this.buttons[1].sprites.up.append(this.buttons[1].sprites.hint);
		}
	}

	/**
	 * 実行されている端末がスマートフォンか調べる
	 * @returns スマートフォンの場合true、それ以外の場合false
	 */
	isSmartPhone(): boolean {
		if (navigator == null || navigator.userAgent == null) {
			return true;
		}
		if (navigator.userAgent.indexOf("akashic") >= 0) {
			return true;
		}
		return false;
	}

	/**
	 * 仮想ゲームパッドの状態を更新する
	 * @description
	 * フレームごとに一度だけ呼び出してください。
	 * 動作に問題が出る場合は、onUpdate()の最後に呼び出してください。
	 */
	refresh(): void {
		const gamepad = this.getGamepad();
		if (!this.isUsingVirtualStick) {
			if (!this.isUsingKeyboard) {
				this.updateGamepadStick(gamepad);
			} else {
				this.stickMove(
					this.keyboard.x,
					this.keyboard.y
				);
			}
		}
		this.isUsingKeyboard = false;

		for (const button of this.buttons) {
			if (button.isPressed) {
				button.isPressed = false;
				button.isHeld = true;
				continue;
			}
			if (button.isReleased) {
				button.isReleased = false;
				button.isHeld = false;
			}
		}
		this.updateGamepadButtons(gamepad);
	}

	protected buttonDown(button: number): void {
		if (!this.isEnabled || button < 0 || button >= this.options.buttonCount) {
			return;
		}
		this.buttons[button].isPressed = true;
		this.buttons[button].sprites.up.opacity = 0.5;
	}

	protected buttonUp(button: number): void {
		if (!this.isEnabled || button < 0 || button >= this.options.buttonCount) {
			return;
		}
		this.buttons[button].isReleased = true;
		this.buttons[button].sprites.up.opacity = 1;
	}

	protected stickMove(x: number, y: number): void {
		let magnitude = Math.sqrt(x * x + y * y);
		if (magnitude > 1) {
			magnitude = 1;
		}
		const angle = Math.atan2(y, x);
		this.stick.x = Math.cos(angle) * magnitude;
		this.stick.y = Math.sin(angle) * magnitude;
		this.stick.angle = angle;
		this.stick.magnitude = magnitude;
		this.setStickShaftPosition(angle, magnitude);
	}

	protected setStickShaftPosition(angle: number, magnitude: number): void {
		const shaftMarginX = this.options.shaftMargin;
		const shaftMarginY = this.options.shaftMargin;
		const shaftWidth = this.stick.sprites.shaft.width * 0.5;
		const shaftHeight = this.stick.sprites.shaft.height * 0.5;
		const baseWidth = this.stick.sprites.base.width * 0.5;
		const baseHeight = this.stick.sprites.base.height * 0.5;
		const x = Math.cos(angle) * (baseWidth - shaftWidth - shaftMarginX) * magnitude + baseWidth;
		const y = Math.sin(angle) * (baseHeight - shaftHeight - shaftMarginY) * magnitude + baseHeight;
		if (this.stick.sprites.shaft.x === x && this.stick.sprites.shaft.y === y) {
			return;
		}
		this.stick.sprites.shaft.x = x;
		this.stick.sprites.shaft.y = y;
		this.stick.sprites.shaft.invalidate();
	}

	protected getGamepad(): Gamepad | null {
		if (!this.isEnabled ||
			!this.options.useGamepad ||
			!navigator) {
			return null;
		}
		const gamepads = navigator.getGamepads();
		if (!gamepads || gamepads.length <= 0) {
			return null;
		}
		const gamepad = gamepads[0];
		if (!gamepad) {
			return null;
		}
		return gamepad;
	}

	private registerKeyboardOperationPlugin(): void {
		if (!this.options.useKeyboard) {
			return;
		}
		g.game.operationPluginManager.register(
			KeyboardOperationPlugin,
			this.options.keyboardPluginCode
		);
		g.game.operationPluginManager.start(
			this.options.keyboardPluginCode
		);
		this.scene.onStateChange.add((state: g.SceneStateString) => {
			if (state === "active") {
				g.game.operationPluginManager.start(
					this.options.keyboardPluginCode
				);
			} else if (state === "deactive") {
				g.game.operationPluginManager.stop(
					this.options.keyboardPluginCode
				);
			}
		});

		this.scene.onOperation.add((e: g.OperationEvent) => {
			if (!this.isEnabled || e.code !== this.options.keyboardPluginCode) {
				return;
			}
			switch (e.data.type) {
				case "keydown":
					this.isUsingKeyboard = true;
					this.handleKeyDown(e.data.key);
					break;
				case "keyup":
					this.isUsingKeyboard = true;
					this.handleKeyUp(e.data.key);
					break;
			}
		});
	}

	private makeStick(): void {
		this.stick.sprites.base.anchor(0, 1);
		this.stick.sprites.base.touchable = true;
		if (this.options.useMouseOrTouch) {
			this.stick.sprites.base.onPointDown.add(this.handleStickBasePointDown);
			this.stick.sprites.base.onPointUp.add(this.handleStickBasePointUp);
			this.stick.sprites.base.onPointMove.add(this.handleStickBasePointMove);
		}
		this.append(this.stick.sprites.base);

		this.stick.sprites.hint.anchor(0.5, 0.5);
		this.stick.sprites.hint.scale(1);

		this.stick.sprites.shaft.anchor(0.5, 0.5);
		this.stick.sprites.shaft.scale(1);
		this.stick.sprites.base.append(this.stick.sprites.shaft);
	}

	private makeButtons(): void {
		if (this.options.buttonCount <= 0) {
			return;
		}

		this.buttons[0].sprites.up.anchor(1, 1);
		this.buttons[0].sprites.up.touchable = true;
		if (this.options.useMouseOrTouch) {
			this.buttons[0].sprites.up.onPointDown.add(() => {
				this.buttonDown(0);
			});
			this.buttons[0].sprites.up.onPointUp.add(() => {
				this.buttonUp(0);
			});
		}
		this.append(this.buttons[0].sprites.up);

		this.buttons[0].sprites.hint.anchor(0.5, 0.5);

		if (this.options.buttonCount <= 1) {
			return;
		}

		this.buttons[1].sprites.up.anchor(1, 1);
		this.buttons[1].sprites.up.touchable = true;
		if (this.options.useMouseOrTouch) {
			this.buttons[1].sprites.up.onPointDown.add(() => {
				this.buttonDown(1);
			});
			this.buttons[1].sprites.up.onPointUp.add(() => {
				this.buttonUp(1);
			});
		}
		this.append(this.buttons[1].sprites.up);

		this.buttons[1].sprites.hint.anchor(0.5, 0.5);
	}

	private handleStickBasePointDown = (e: g.PointDownEvent): void => {
		if (!this.isEnabled) {
			return;
		}
		this.isUsingVirtualStick = true;
		const shaftMarginX = this.options.shaftMargin;
		const shaftMarginY = this.options.shaftMargin;
		const shaftWidth = this.stick.sprites.shaft.width * 0.5;
		const shaftHeight = this.stick.sprites.shaft.height * 0.5;
		const baseWidth = this.stick.sprites.base.width * 0.5 - shaftWidth - shaftMarginX;
		const baseHeight = this.stick.sprites.base.height * 0.5 - shaftHeight - shaftMarginY;
		const x = (e.point.x - shaftWidth - shaftMarginX) / baseWidth - 1;
		const y = (e.point.y - shaftHeight - shaftMarginY) / baseHeight - 1;
		this.stickMove(x, y);
	};

	private handleStickBasePointUp = (_e: g.PointUpEvent): void => {
		if (!this.isEnabled) {
			return;
		}
		this.isUsingVirtualStick = false;
		this.stickMove(0, 0);
	};

	private handleStickBasePointMove = (e: g.PointMoveEvent): void => {
		if (!this.isEnabled) {
			return;
		}
		const shaftMarginX = this.options.shaftMargin;
		const shaftMarginY = this.options.shaftMargin;
		const shaftWidth = this.stick.sprites.shaft.width * 0.5;
		const shaftHeight = this.stick.sprites.shaft.height * 0.5;
		const baseWidth = this.stick.sprites.base.width * 0.5 - shaftWidth - shaftMarginX;
		const baseHeight = this.stick.sprites.base.height * 0.5 - shaftHeight - shaftMarginY;
		const deltaX = e.startDelta.x / this.scaleX;
		const deltaY = e.startDelta.y / this.scaleY;
		const x = (e.point.x + deltaX - shaftWidth - shaftMarginX) / baseWidth - 1;
		const y = (e.point.y + deltaY - shaftHeight - shaftMarginY) / baseHeight - 1;
		this.stickMove(x, y);
	};

	private updateGamepadButtons(gamepad: Gamepad | null): void {
		if (!this.isEnabled ||
			gamepad == null ||
			gamepad.buttons == null ||
			gamepad.buttons.length < this.options.buttonCount) {
			return;
		}
		for (let i = 0; i < this.options.buttonCount; i++) {
			if (this.buttons[i].isHeld) {
				if (!gamepad.buttons[i].pressed) {
					this.buttonUp(i);
				}
			} else {
				if (gamepad.buttons[i].pressed) {
					this.buttonDown(i);
				}
			}
		}
	}

	private updateGamepadStick(gamepad: Gamepad | null): void {
		if (!this.isEnabled || gamepad == null) {
			return;
		}
		let useDpad = false;
		if (gamepad.buttons &&
			gamepad.buttons.length >= GAMEPAD_BUTTON.right + 1) {
			let x = 0;
			let y = 0;
			if (gamepad.buttons[GAMEPAD_BUTTON.up].pressed) {
				y = -1;
			} else if (gamepad.buttons[GAMEPAD_BUTTON.down].pressed) {
				y = 1;
			}
			if (gamepad.buttons[GAMEPAD_BUTTON.left].pressed) {
				x = -1;
			} else if (gamepad.buttons[GAMEPAD_BUTTON.right].pressed) {
				x = 1;
			}
			if (x !== 0 || y !== 0) {
				useDpad = true;
				this.stick.angle = Math.atan2(y, x);
				this.stick.x = Math.cos(this.stick.angle);
				this.stick.y = Math.sin(this.stick.angle);
				this.stick.magnitude = 1;
				this.setStickShaftPosition(this.stick.angle, 1);
			}
		}

		if (!useDpad && gamepad.axes && gamepad.axes.length >= 2) {
			let magnitude = Math.sqrt(
				gamepad.axes[0] * gamepad.axes[0] +
				gamepad.axes[1] * gamepad.axes[1]
			);

			if (magnitude < this.options.stickNeutralRange) {
				this.stick.x = 0;
				this.stick.y = 0;
				this.stick.angle = 0;
				this.stick.magnitude = 0;
				this.setStickShaftPosition(0, 0);
			} else {
				let x = gamepad.axes[0];
				let y = gamepad.axes[1];
				if (magnitude > 1.0) {
					x /= magnitude;
					y /= magnitude;
					magnitude = 1;
				}
				this.stick.x = x;
				this.stick.y = y;
				this.stick.angle = Math.atan2(y, x);
				this.stick.magnitude = magnitude;
				this.setStickShaftPosition(this.stick.angle, magnitude);
			}
		}
	}

	private handleKeyDown(key: string): void {
		if (this.options.useHint && !this.isHintVisible) {
			this.isHintVisible = true;
			this.showHint();
		}
		if (key.length === 1) {
			key = key.toUpperCase();
		}
		if (this.keyboard.keys[key]) {
			return;
		}
		const keys = this.options.keys;
		if (keys.button0.indexOf(key) >= 0) {
			this.buttonDown(0);
		}
		if (keys.button1.indexOf(key) >= 0) {
			this.buttonDown(1);
		}
		if (keys.left.indexOf(key) >= 0) {
			this.keyboard.x = -1;
		} else if (keys.right.indexOf(key) >= 0) {
			this.keyboard.x = 1;
		}
		if (keys.up.indexOf(key) >= 0) {
			this.keyboard.y = -1;
		} else if (keys.down.indexOf(key) >= 0) {
			this.keyboard.y = 1;
		}
		this.keyboard.keys[key] = 1;
	}

	private handleKeyUp(key: string): void {
		if (key.length === 1) {
			key = key.toUpperCase();
		}
		if (!this.keyboard.keys[key]) {
			return;
		}
		delete this.keyboard.keys[key];
		const keys = this.options.keys;
		if (keys.button0.indexOf(key) >= 0) {
			this.buttonUp(0);
		}
		if (keys.button1.indexOf(key) >= 0) {
			this.buttonUp(1);
		}
		if (keys.left.indexOf(key) >= 0) {
			for (const i of keys.right) {
				if (!this.keyboard.keys[i]) {
					continue;
				}
				this.keyboard.x = 1;
				return;
			}
			this.keyboard.x = 0;
			return;
		}
		if (keys.right.indexOf(key) >= 0) {
			for (const i of keys.left) {
				if (!this.keyboard.keys[i]) {
					continue;
				}
				this.keyboard.x = -1;
				return;
			}
			this.keyboard.x = 0;
			return;
		}
		if (keys.up.indexOf(key) >= 0) {
			for (const i of keys.down) {
				if (!this.keyboard.keys[i]) {
					continue;
				}
				this.keyboard.y = 1;
				return;
			}
			this.keyboard.y = 0;
			return;
		}
		if (keys.down.indexOf(key) >= 0) {
			for (const i of keys.up) {
				if (!this.keyboard.keys[i]) {
					continue;
				}
				this.keyboard.y = -1;
				return;
			}
			this.keyboard.y = 0;
			return;
		}
	}

	private makeSprite(assetPath: string, x: number, y: number): g.Sprite {
		const image = this.scene.asset.getImage(assetPath);
		const sprite = new g.Sprite({
			scene: this.scene,
			src: image,
			x: x,
			y: y,
			width: image.width,
			height: image.height
		});
		return sprite;
	}

	private makeSpriteFromImage(image: g.ImageAsset | g.Surface, x: number, y: number): g.Sprite {
		const sprite = new g.Sprite({
			scene: this.scene,
			src: image,
			x: x,
			y: y,
			width: image.width,
			height: image.height
		});
		return sprite;
	}
}

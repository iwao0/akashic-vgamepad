# akashic-vgamepad

**akashic-vgamepad** は、仮想ゲームパッドの表示と入力用のakashicゲーム向け操作プラグインです。

実装例は [サンプル](./sample) ディレクトリ以下にあるサンプルプロジェクトを参照してください。

4種類の入力方法に対応してします。
- マウス入力
- タッチ入力
- キーボード入力
- 物理ゲームパッド入力

機能
- 仮想ゲームパッドの見た目を変更可能
- ボタンの数を変更可能（0から2個）
- 表示位置の微調整が可能
- キーボードのキー割り当てが変更可能
- 個別のデバイスの入力を無効化可能 (マウスとタッチは個別に設定できません)

## 利用方法

### インストール

[akashic-cli](https://github.com/akashic-games/akashic-cli)をインストールした後、

```sh
akashic install @iwao0/akashic-vgamepad
```

でインストールできます。

インストール後、**akashic-vgamepad**に含まれる画像素材がgame.jsonに追加されます。

### コンテンツへの適用

```javascript
const { VirtualGamepad } = require("@iwao0/akashic-vgamepad");

const gamepad = new VirtualGamepad({
	scene: scene,
});
scene.append(gamepad);

scene.onUpdate.add(() => {
	// フレームごとにリフレッシュする必要があります
	gamepad.refresh();
})
```

### 入力された値の読み取り

```javascript
// スティックの座標
let x = gamepad.stick.x; // 0〜1
let y = gamepad.stick.y; // 0〜1
// スティックの角度と大きさ
let angle = gamepad.stick.angle; // -π〜π (右向きが0)
let magnitude = gamepad.stick.magnitude; // 0〜1

//　ボタンの状態
let isPressed = gamepad.buttons[0].isPressed; // 押された瞬間:true
let isHeld = gamepad.buttons[0].isHeld; // 押されている間:true (isPressedがtrueになった次のフレームからtrueになる)
let isReleased = gamepad.buttons[0].isReleased; // 離された瞬間:true
```

### 設定

VirtualGamepadクラスのコンストラクタに渡す値を変更することで設定可能です。

```javascript
const gamepad = new VirtualGamepad({
	scene: scene,
	// 表示サイズ (デフォルト:1)
	scaleX: 0.5,
	scaleY: 0.5,

	// 仮想スティックの左側の隙間
	marginLeft: 40,

	// 仮想ボタンの右側の隙間
	marginRight: 40,

	// 仮想スティック、仮想ボタンの下側の隙間
	marginBottom: 40,

	// 仮想スティックの軸の可動域 (値が大きいほど狭くなる)
	shaftMargin: 8,

	// 仮想ボタンの数 (0〜2)
	buttonCount: 2,

	// 仮想ボタン間の隙間
	buttonSpace: 20,

	// 物理スティックの中心の遊びの領域 (0〜1)
	stickNeutralRange: 0.2,

	// キーボードの押し始めにヒントを表示するか
	useHint: true,

	// キーボード入力を使用するか
	useKeyboard: true,

	// マウス、タッチ入力を使用するか
	useMouseOrTouch: true,

	// 物理ゲームパッドを使用するか
	useGamepad: true,

	// キーボードプラグインのコード番号 (問題が起こった時は値を変更してください)
	keyboardPluginCode: 139,

	// キーボードのキー入力の再マップ (それぞれに複数キーの登録可能)
	keys: {
		left: ["z"], // スティックの左をZキーに変更
		right: ["c"], // スティックの右をCキーに変更
		up: ["s"], // スティックの上をSキーに変更
		down: ["x"], // スティックの下をXキーに変更
		button0: ["Control"], // ボタン0をCtrlキーに変更
		button1: ["Tab"] // ボタン1をTabキーに変更
	},

	// 画像の置き換え
	// getImageById()等を使用する場合は、game.jsonに登録しておいてください
	images: {
		stickBase: scene.asset.getImageById("stick"), // スティックの土台を"stick"に変更
		stickHint: scene.asset.getImageById("hint"), // スティックのキーボードヒント(WASD)を"hint"に変更
		stickShaft: scene.asset.getImageById("shaft"), // スティックの軸を"shaft"に変更
		button0Up: scene.asset.getImageById("b0up"), // ボタン0を"b0up"に変更
		button0Hint: scene.asset.getImageById("b0hint"), // ボタン0のキーボードヒントを"b0hint"に変更
		button1Up: scene.asset.getImageById("b1up"), // ボタン1を"b1up"に変更
		button1Hint: scene.asset.getImageById("b1hint") // ボタン1のキーボードヒントを"b1hint"に変更
	}
});
```

### メソッド

#### refresh(): void

仮想ゲームパッドの状態を更新します。

フレームごとに一度だけ呼び出してください。
動作に問題が出る場合は、onUpdate()の最後に呼び出してください。

#### reset(): void

入力値をリセットし、軸を中心に戻します。

#### scale(value: number): void

仮想ゲームパッドの表示サイズを変更します。

引数:
- value: 0〜1 表示サイズ

#### showHint(): void

キーボードヒントを表示します。

#### isSmartPhone(): boolean

実行されている端末がスマートフォンか調べます。

戻り値:
- スマートフォンの場合true、それ以外の場合false

## ビルド方法

**akashic-vgamepad** はTypeScriptで書かれたjsモジュールであるため、ビルドにはNode.jsが必要です。

`npm run build` によりビルドできます。

```sh
npm install
npm run build
```

## テスト方法

```sh
npm test
```

## ライセンス
本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](./LICENSE) をご覧ください。

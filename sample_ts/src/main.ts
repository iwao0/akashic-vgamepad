import { VirtualGamepad } from "@iwao0/akashic-vgamepad";
import { GameMainParameterObject } from "./parameterObject";

export function main(param: GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["stick_base2"],
		assetPaths: [
			...VirtualGamepad.getAssetPaths()
		]
	});

	// console.log(VirtualGamepad.getAssetPaths())

	scene.onLoad.add(() => {
		const gamepad = new VirtualGamepad({
			scene: scene,
			scaleX: 0.5,
			scaleY: 0.5,
			// buttonCount: 1,
			// useKeyboard: false,
			// useMouseOrTouch: false,
			// useGamepad: false,
			keys: {
				// left: ["ArrowLeft"]
			},
			images: {
				// stickBase: scene.asset.getImageById("stick_base2")
			}
		});
		// gamepad.showHint()
		// gamepad.isEnabled = false
		scene.append(gamepad);
		console.log(gamepad.options.keys);

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: ["sans-serif", "monospace"],
			size: 20,
		});

		const stickLabel = new g.Label({
			scene,
			font,
			text: "",
			textColor: "#666",
			x: 20,
			y: 20
		});
		scene.append(stickLabel);

		const button0Label = new g.Label({
			scene,
			font,
			text: "",
			textColor: "#666",
			x: 20,
			y: 50
		});
		scene.append(button0Label);

		const button1Label = new g.Label({
			scene,
			font,
			text: "",
			textColor: "#666",
			x: 20,
			y: 80
		});
		scene.append(button1Label);

		scene.onUpdate.add(() => {
			const stickText = gamepad.stick.x.toFixed(2) + ", " +
				gamepad.stick.y.toFixed(2) + " " +
				`angle: ${(gamepad.stick.angle * 180 / Math.PI).toFixed(2)}, ` +
				`magnitude: ${gamepad.stick.magnitude.toFixed(2)}`;
			if (stickLabel.text !== stickText) {
				stickLabel.text = stickText;
				stickLabel.invalidate();
				scene.modified();
			}

			if (gamepad.options.buttonCount > 0) {
				const button0Text = "buttons[0] " +
					`isPressed: ${gamepad.buttons[0].isPressed}, ` +
					`isHeld: ${gamepad.buttons[0].isHeld}, ` +
					`isReleased: ${gamepad.buttons[0].isReleased}`;
				if (button0Label.text !== button0Text) {
					button0Label.text = button0Text;
					button0Label.invalidate();
				}

				if (gamepad.buttons[0].isPressed) {
					console.log("pressed 0");
				}
				if (gamepad.buttons[0].isReleased) {
					console.log("released 0");
				}
			}

			if (gamepad.options.buttonCount > 1) {
				const button1Text = "buttons[1] " +
					`isPressed: ${gamepad.buttons[1].isPressed}, ` +
					`isHeld: ${gamepad.buttons[1].isHeld}, ` +
					`isReleased: ${gamepad.buttons[1].isReleased}`;
				if (button1Label.text !== button1Text) {
					button1Label.text = button1Text;
					button1Label.invalidate();
				}

				if (gamepad.buttons[1].isPressed) {
					console.log("pressed 1");
				}
				if (gamepad.buttons[1].isReleased) {
					console.log("released 1");
				}
			}

			gamepad.refresh();
		});
	});
	g.game.pushScene(scene);
}

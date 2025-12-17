import { Player } from '../../game/player/Player';
import { CameraController } from '../../game/world/CameraController';

export class KeyboardInputHandler {
    private readonly player: Player;
    private readonly cameraController?: CameraController;

    constructor(player: Player, cameraController?: CameraController) {
        this.player = player;
        this.cameraController = cameraController;
    }

    attachListeners(target: Window): void {
        target.addEventListener('keydown', this.handleKeyEvent);
        target.addEventListener('keyup', this.handleKeyEvent);
    }

    private handleKeyEvent = (event: KeyboardEvent): void => {
        const isKeyDown = event.type === 'keydown';

        switch (event.key) {
            case 'W':
            case 'w':
                this.player.keyState.w = isKeyDown;
                break;
            case 'A':
            case 'a':
                this.player.keyState.a = isKeyDown;
                break;
            case 'S':
            case 's':
                this.player.keyState.s = isKeyDown;
                break;
            case 'D':
            case 'd':
                this.player.keyState.d = isKeyDown;
                break;
            case 'C':
            case 'c':
                if (!isKeyDown) {
                    const newMode = this.cameraController?.cycleCamera();
                    if (newMode !== undefined) {
                        this.player.chaseCameraEnabled = (newMode === 1);
                    } else {
                        this.player.chaseCameraEnabled = !this.player.chaseCameraEnabled;
                    }
                }
                break;
            case 'V':
            case 'v':
                if (!isKeyDown) {
                    this.cameraController?.cycleCamera();
                }
                break;
        }
    };
}

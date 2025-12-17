import { Player } from '../player/Player';
import { GameWorld } from '../world/GameWorld';
import { RendererContext } from '../../rendering/RendererContext';
import { CameraController } from '../world/CameraController';

export class RenderSystem {
    private readonly player: Player;
    private readonly world: GameWorld;
    private readonly rendererContext: RendererContext;
    private readonly cameraController: CameraController;

    constructor(player: Player, world: GameWorld, rendererContext: RendererContext, cameraController: CameraController) {
        this.player = player;
        this.world = world;
        this.rendererContext = rendererContext;
        this.cameraController = cameraController;
    }

    update(): void {
        if (!this.world.isReady || !this.player.carModel || !this.world.track) {
            return;
        }

        this.player.carModel.rotation.y = this.player.rotation;
        this.player.carModel.position.set(this.player.x, this.player.y, this.player.z);
        this.player.updateGrounding(this.world.track);
        this.player.updatePosition();
        this.cameraController.updateForPlayer(this.player);
        this.rendererContext.renderer.render(this.rendererContext.scene, this.rendererContext.camera);
    }
}


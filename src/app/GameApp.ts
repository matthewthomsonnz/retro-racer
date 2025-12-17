import { RendererContext } from '../rendering/RendererContext';
import { Player } from '../game/player/Player';
import { AssetLoader } from '../engine/assets/AssetLoader';
import { GameWorld } from '../game/world/GameWorld';
import { KeyboardInputHandler } from '../interface/input/KeyboardInputHandler';
import { CameraController } from '../game/world/CameraController';
import { RenderSystem } from '../game/systems/RenderSystem';
import { Loop } from '../engine/core/Loop';

export class GameApp {
    async start(): Promise<void> {
        const rendererContext = new RendererContext();
        const player = new Player(0, 10, 0, Math.PI);
        const assetLoader = new AssetLoader();
        const world = new GameWorld(rendererContext, player, assetLoader);
        await world.initialize();

        const cameraController = new CameraController(rendererContext.camera);
        const renderSystem = new RenderSystem(player, world, rendererContext, cameraController);
        const loop = new Loop(renderSystem);

        const keyboardInput = new KeyboardInputHandler(player, cameraController);
        keyboardInput.attachListeners(window);

        loop.start();
    }
}

import { RenderSystem } from '../../game/systems/RenderSystem';

export class Loop {
    private readonly renderSystem: RenderSystem;

    constructor(renderSystem: RenderSystem) {
        this.renderSystem = renderSystem;
    }

    start(): void {
        const step = () => {
            this.renderSystem.update();
            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }
}


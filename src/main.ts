import './style.css';
import { GameApp } from './app/GameApp';

const app = new GameApp();

app.start().catch(error => {
    console.error(error);
});

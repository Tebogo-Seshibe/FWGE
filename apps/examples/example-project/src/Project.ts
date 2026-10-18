import { Game } from "@fwge/core";
import { CubeMesh } from "./assets/CubeMesh";
import { GridMesh } from "./assets/GridMesh";
import { EditorScene, Scene1 } from "./scenes";
import { LightingExampleScene } from "./scenes/LightingExample";

export class Project extends Game
{
    UseAssets = [
        CubeMesh,
        GridMesh,
    ];
    UseScenes = [
        Scene1,
        // EditorScene,
        // LightingExampleScene
    ];
    
    constructor() {
        super({
            height: 1080,
            width: 1920,
            canvas() {
                return document.getElementsByTagName('canvas')[0];
            }
        })
    }
}
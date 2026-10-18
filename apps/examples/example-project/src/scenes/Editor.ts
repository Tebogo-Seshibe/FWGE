import { DefaultWindow, Scene, ScriptSystem } from "@fwge/core";
import { EditorViewer } from "../entities/EditorViewer";
import { Environment } from "../entities/Environment";
import { GeneralAreaLight } from "../entities/GeneralAreaLight";
import { Grid } from "../entities/Grid";
import { Sun } from "../entities/Sun";
import { InputSystem } from "@fwge/input";
import { EditorRenderSystem, ProjectRenderSystem } from "../systems";

export class EditorScene extends Scene
{
    UseWindows = [
        DefaultWindow
    ];
    UseEntites = [
        Grid,
        GeneralAreaLight,
        Sun,
        EditorViewer,
        Environment
    ];
    UseSystems = [
        InputSystem,
        ScriptSystem,
        // EditorRenderSystem,
        ProjectRenderSystem,
    ];
}

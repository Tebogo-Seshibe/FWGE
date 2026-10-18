import { DefaultWindow, Scene, ScriptSystem } from "@fwge/core";
import { InputSystem } from "@fwge/input";
import { EditorViewer } from "../entities/EditorViewer";
import { Lighting } from "../entities/Lighting";
import { ProjectRenderSystem } from "../systems";
import { Blocks } from "../entities/Blocks";

export class LightingExampleScene extends Scene
{
  protected UseWindows =
  [
    DefaultWindow,
  ];

  protected UseEntites =
  [
    Blocks,
    Lighting,
    EditorViewer,
  ];

  protected UseSystems =
  [
    InputSystem,
    ScriptSystem,
    ProjectRenderSystem
  ];
    
  Init(): void
  {
    super.Init();
    const renderSystem = this.Systems.find(x => x.Name === ProjectRenderSystem.name) as ProjectRenderSystem;
    renderSystem.window = this.Windows[0];
  }
}
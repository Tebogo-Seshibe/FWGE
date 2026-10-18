import { AssetManager, MeshRenderer, RenderMode, ShaderAsset, Transform } from "@fwge/core";
import { Entity } from "@fwge/ecs";
import { OBJMTLAsset } from "../OBJMTLAsset";

export class Blocks extends Entity
{
  Init(): void
  {
    const shaderAsset = AssetManager.Get<ShaderAsset>('Default Shader')!;
    const asset = AssetManager.Get<OBJMTLAsset>('Cube')!;
    const mesh = asset.OBJ['Cube'].mesh;
    const material = asset.MTL[asset.OBJ['Cube'].material];
    material.Shader = shaderAsset.Shader!;

    this.AddComponents(
      new Transform({ position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] }),
      new MeshRenderer({ asset: mesh, renderMode: RenderMode.FACE }),
      material,
    )

    console.log(this)
    console.log(this.GetAllComponents())
    console.log(this.GetComponent(Transform))
  }
}
import { AssetManager, Transform } from "@fwge/core";
import { Entity } from "@fwge/ecs";
import { Helipad as HelipadAsset } from "../assets/Helipad";
import { Animation, AnimationPlayer, AnimationTrack, Keyframe } from "@fwge/animation";
import { lerp, lerpSquared } from "@fwge/common";

export class Helipad extends Entity
{
    Init(): void
    {
        const animationPlayer = new AnimationPlayer();
        const animation = new Animation({loop: true});
        const spinTrack = new AnimationTrack(
            'Transform.Rotation.Y',
            (entity) => entity.GetComponent(Transform)!.Rotation.Y,
            (entity, value) => entity.GetComponent(Transform)!.Rotation.Y = value,
            [
                new Keyframe(0, 0, lerpSquared),
                new Keyframe(2, 180, lerpSquared),
                new Keyframe(4, 0, lerpSquared),
            ]
        );
        animation.AddTrack(spinTrack);
        animationPlayer.Add('Spin', animation);
        this.AddComponent(new Transform());
        this.AddComponent(animationPlayer);
        // animationPlayer.Play('Spin');
        // const cubeShader = AssetManager.Get(CubeShaderAsset)!.Shader!;
        
        const helipad = AssetManager.Get(HelipadAsset)!;
        this.AddChild(helipad.Instance);
        // const helipadMesh = helipad.OBJ['Helipad'].mesh;
        // const helipadMaterial = helipad.MTL[helipad.OBJ['Helipad'].material];
        // helipadMaterial.Shader = cubeShader;
        // helipadMaterial.ProjectsShadows = false;
        // helipadMaterial.ReceiveShadows = true;

        // this.AddComponents(
        //     new Transform({ position: [0, -2, 0]}),
        //     new MeshRenderer({ asset: helipadMesh }),
        //     helipadMaterial
        // );
    }
}
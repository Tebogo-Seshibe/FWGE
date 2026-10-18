import { Animation, AnimationPlayer, AnimationTrack, Keyframe, lerpColour3, lerpVector3, Transition } from "@fwge/animation";
import { Colour3, Vector3 } from "@fwge/common";
import { AssetManager, BasicLitMaterial, Mesh, MeshRenderer, ShaderAsset, Transform } from "@fwge/core";
import { Entity } from "@fwge/ecs";
import { Input, KeyState } from "@fwge/input";
import { SphereAsset } from "../assets/SphereAsset";
import { OBJMTLAsset } from "../OBJMTLAsset";

const toggle: Transition<Mesh> = (t, from, to, target) => {
    return (t < 0.5) ? from : to;
}

export class Sphere extends Entity
{
    Init(): void
    {
        const sphereAsset = AssetManager.Get<SphereAsset>('MySphere')!;
        const sphereMesh = sphereAsset.OBJ[''].mesh;
        const smoothSphereAsset = AssetManager.Get<OBJMTLAsset>('SmoothSphere')!;
        const shaderAsset = AssetManager.Get<ShaderAsset>('Default Shader')!;

        const cube = AssetManager.Get<OBJMTLAsset>('Cube')!;
        const cubeMesh = cube.OBJ['Cube'].mesh;

        const animation = new Animation({ loop: false });
        const positionTrack = new AnimationTrack(Transform, 'Position', [
            new Keyframe(0, new Vector3( -4, 2,  4), lerpVector3),
            new Keyframe(1, new Vector3( -4, 2, -4), lerpVector3),
            new Keyframe(2, new Vector3(  4, 2, -4), lerpVector3),
            new Keyframe(3, new Vector3(  4, 2,  4), lerpVector3),
            new Keyframe(4, new Vector3( -4, 2,  4), lerpVector3),
        ]);
        const colourTrack = new AnimationTrack(BasicLitMaterial, 'Colour', [
            new Keyframe(0, new Colour3(1, 0, 0), lerpColour3),
            new Keyframe(2, new Colour3(0, 0, 1), lerpColour3),
            new Keyframe(4, new Colour3(1, 0, 0), lerpColour3),
        ]);
        const toggleTrack = new AnimationTrack(MeshRenderer, 'Asset', [
            new Keyframe(0, sphereMesh, toggle),
            new Keyframe(2, cubeMesh, toggle),
            new Keyframe(4, sphereMesh, toggle),
        ]);
        animation.AddTrack(positionTrack);
        animation.AddTrack(colourTrack);
        animation.AddTrack(toggleTrack);
        
        const animationPlayer = new AnimationPlayer();
        animationPlayer.Add('Square', animation);
        
        this.AddComponents(
            new Transform({ position: [0,2,2], scale: [2,2,2] }),
            new MeshRenderer({ 
                asset: smoothSphereAsset.OBJ[''].mesh
            }),
            new BasicLitMaterial({
                colour: [0.3, 0, 0],
                shader: shaderAsset.Shader!
            }),
            new Input({
                onInput(delta, keyboard, mouse, controllers) {
                    if (keyboard.Numpad1 === KeyState.PRESSED) {
                        animationPlayer.Play('Square', { seconds: 1 });
                    }
                    
                    if (keyboard.Numpad2 === KeyState.PRESSED) {
                        animationPlayer.Stop();
                    }
                },
            }),
            animationPlayer
        );
        
        console.log(this)
    }
}
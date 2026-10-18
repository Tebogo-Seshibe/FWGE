import { Animation, AnimationPlayer, AnimationTrack, Keyframe, lerpColour3, Transition } from "@fwge/animation";
import { Colour3, lerp } from "@fwge/common";
import { AssetManager, BasicLitMaterial, Mesh, MeshRenderer, ShaderAsset, Transform } from "@fwge/core";
import { Entity } from "@fwge/ecs";
import { Input, KeyState } from "@fwge/input";
import { SphereAsset } from "../assets/SphereAsset";
import { OBJMTLAsset } from "../OBJMTLAsset";
import { SquareAnimationAsset } from "../assets/SquareAnimationAsset";

const toggle: Transition<Mesh> = (t, from, to, _curr) => {
    return (t < 1) ? from : to;
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

        const animation = new Animation({ loop: true });
        const positionXTrack = new AnimationTrack(
            'Transform.Position.X',
            (entity) => entity.GetComponent(Transform)!.Position.X,
            (entity, value) => entity.GetComponent(Transform)!.Position.X = value,
            [
                new Keyframe(0, -4, lerp),
                new Keyframe(1, -4, lerp),
                new Keyframe(2,  4, lerp),
                new Keyframe(3,  4, lerp),
                new Keyframe(4, -4, lerp),
            ]
        );
        const positionZTrack = new AnimationTrack(
            'Transform.Position.Z',
            (entity) => entity.GetComponent(Transform)!.Position.Z,
            (entity, value) => entity.GetComponent(Transform)!.Position.Z = value,
            [
                new Keyframe(0,  4, lerp),
                new Keyframe(1, -4, lerp),
                new Keyframe(2, -4, lerp),
                new Keyframe(3,  4, lerp),
                new Keyframe(4,  4, lerp),
            ]
        );
        const colourTrack = new AnimationTrack(
            'BasicLitMaterial.Colour', 
            (entity) => entity.GetComponent(BasicLitMaterial)!.Colour,
            (entity, value) => entity.GetComponent(BasicLitMaterial)!.Colour.Set(value),
            [
                new Keyframe(0, new Colour3(1, 0, 0), lerpColour3),
                new Keyframe(1, new Colour3(0, 1, 0), lerpColour3),
                new Keyframe(2, new Colour3(0, 0, 1), lerpColour3),
                new Keyframe(3, new Colour3(1, 0, 0), lerpColour3),
                new Keyframe(4, new Colour3(1, 0, 0), lerpColour3),
            ]
        );
        const toggleTrack = new AnimationTrack(
            'MeshRenderer.Asset',
            (entity) => entity.GetComponent(MeshRenderer)!.Asset,
            (entity, value) => entity.GetComponent(MeshRenderer)!.Asset = value,
            [
                new Keyframe(0, sphereMesh, toggle),
                new Keyframe(2, cubeMesh, toggle),
                new Keyframe(4, sphereMesh, toggle),
            ]
        );
        animation.AddTrack(positionXTrack);
        animation.AddTrack(positionZTrack);
        animation.AddTrack(toggleTrack);
        animation.AddTrack(colourTrack);
        
        const animationPlayer = new AnimationPlayer();
        // animationPlayer.Add('Square', animation);
        animationPlayer.Add('Square', new SquareAnimationAsset());
        
        this.AddComponents(
            new Transform({ position: [0,2,2] }),
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
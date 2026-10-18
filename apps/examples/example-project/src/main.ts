import { AssetManager } from '@fwge/core';
import { CubeMesh } from './assets/CubeMesh';
import { FinalPassShaderAsset } from './assets/FinalPassShader';
import { GridMesh } from './assets/GridMesh';
import { OBJMTLAsset } from './OBJMTLAsset';
import { Project } from './Project';
import { TextAsset } from './TextAsset';
import { CubeShaderAsset } from './assets/CubeShader';
import { Registry } from '@fwge/ecs';
import { Helipad } from './assets/Helipad';
import { Suzanne } from './assets/Suzanne';
import { SphereAsset } from './assets/SphereAsset';

const game = new Project();
await AssetManager
    .Add('Default Shader', CubeShaderAsset)
    .Add(CubeShaderAsset)
    .Add(FinalPassShaderAsset)
    .Add(CubeMesh)
    .Add(GridMesh)
    .Add(Helipad)
    .Add(Suzanne)
    .Add('Text', TextAsset, './public/text.txt')
    .Add('SphereText', TextAsset, './public/objects/Sphere/Sphere.obj')
    .Add('SmoothSphereText', TextAsset, './public/objects/SmoothSphere/SmoothSphere.obj')
    .Add('helipad', OBJMTLAsset, './public/objects/helipad/helipad.obj', './public/objects/helipad/helipad.mtl')
    .Add('Sphere', OBJMTLAsset, './public/objects/Sphere/Sphere.obj', './public/objects/Sphere/Sphere.mtl')
    .Add('SmoothSphere', OBJMTLAsset, './public/objects/SmoothSphere/SmoothSphere.obj', './public/objects/SmoothSphere/SmoothSphere.mtl')
    .Add('Cube', OBJMTLAsset, './public/objects/Cube/Cube.obj', './public/objects/Cube/Cube.mtl')
    .Add('MySphere', SphereAsset)
    .Init();
await game.Init();

game.SetScene(0);
game.Start();

(window as any).game = game;
(window as any).AssetManager = AssetManager;
(window as any).Registry = Registry;

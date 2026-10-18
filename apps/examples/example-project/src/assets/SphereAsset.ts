import { AssetManager, BasicLitMaterial, Material, Mesh, MeshRenderer, ShaderAsset, Transform } from "@fwge/core";
import { OBJMTLAsset } from "../OBJMTLAsset";
import { Entity } from "@fwge/ecs";

export class SphereAsset extends OBJMTLAsset {    
    get SphereMesh(): Mesh {
        return this.OBJ[''].mesh;
    }
    
    get SphereMaterial(): Material {
        return this.MTL[this.OBJ[''].material];
    }

    get Instance(): Entity {
        return new Entity()
            .AddComponent(new Transform())
            .AddChild(new Entity()
                .AddComponents(
                    new Transform(),
                    new MeshRenderer({ asset: this.SphereMesh }),
                    this.SphereMaterial
                )
            );
    }

    constructor() {
        super(
            './public/objects/Sphere/Sphere.obj',
            './public/objects/Sphere/Sphere.mtl'
        )
    }

    public async Load(protocol?: (...args: any[]) => Promise<Blob | Response>): Promise<void> {
        await super.Load(protocol);
        const shaderAsset = AssetManager.Get<ShaderAsset>('Default Shader')!
        this.MTL[''] = new BasicLitMaterial({
          shader: shaderAsset.Shader!
        });
    }
}

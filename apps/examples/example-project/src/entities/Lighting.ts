import { randBetween } from "@fwge/common";
import { AreaLight, DirectionalLight, PointLight, Script, Transform } from "@fwge/core";
import { Entity } from "@fwge/ecs";

export class Lighting extends Entity
{
    Init(): void
    {
        [
            ...this.CreateAreaLights(),
            ...this.CreateDirectionalLights(),
            ...this.CreatePointLights(),
        ].forEach(child => this.AddChild(child))
        let x = 0;

        this.AddComponents(
            new Transform(),
            new Script({
                update: (delta) => {
                    this.GetComponent(Transform)!.Position.X = Math.cos(x);
                    this.GetComponent(Transform)!.Position.Z = Math.sin(x);
                    x += delta * 10;
                }
            })
        );
    }

    CreateAreaLights()
    {
        const children = [];
        
        const environment = new Entity()
            .AddComponents(
                new AreaLight(
                {
                    colour: [1, 1, 1],
                    intensity: 5,
                })
            );
        children.push(environment)

        return children;
    }

    CreateDirectionalLights()
    {
        const children = [];

        const sun = new Entity()
            .AddComponents(
                new Transform(
                {
                    rotation: [0,0,0]
                }),
                new DirectionalLight(
                {
                    direction: [0,-1,0],
                    castShadows: true,
                    colour: [1,1,1],
                    intensity: 0,
                })
            )
        children.push(sun)

        return children;
    }

    CreatePointLights()
    {
        const children = [];
        const radius = 2;
        const step = 1;
        const min_y = 2;
        const max_y = 4;

        for (let x = -radius; x <= radius; x += step)
        {
            for (let z = -radius; z <= radius; z += step)
            {
                const child = new Entity()
                    .AddComponents(
                        new Transform({ position: [x, 3, z] }),
                        // new Transform({ position: [0,y,0] }),
                        new PointLight(
                        { 
                            colour: [Math.random(), Math.random(), Math.random()],
                            // colour: [1.0, 1.0, 1.0],
                            intensity: 0,
                            radius: 3,
                        })
                    );
                children.push(child)
            }
        }

        return children;
    }
}
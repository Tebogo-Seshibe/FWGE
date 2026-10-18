import { Registry, System } from "@fwge/ecs";
import { AnimationPlayer } from "../components";

export class AnimationSystem extends System
{
    private _animationsView!: number;
    
    Init(): void
    {
        this._animationsView = Registry.RegisterView([ AnimationPlayer ], (entity) => entity.Active);
    }

    Update(delta: number): void
    {
        for (const entityId of Registry.GetView(this._animationsView))
        {
            const entity = Registry.GetEntity(entityId)!
            const animationPlayer = Registry.GetComponent(entityId, AnimationPlayer)!
            if (!animationPlayer.Running)
            {
                continue;
            }
            animationPlayer.Update(entity, delta);
        }
    }
}

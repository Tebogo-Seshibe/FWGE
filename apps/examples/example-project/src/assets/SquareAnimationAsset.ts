import { Animation, AnimationTrack, Keyframe, lerpVector3 } from "@fwge/animation";
import { Vector3 } from "@fwge/common";
import { Transform } from "@fwge/core";

export class SquareAnimationAsset extends Animation
{
    constructor()
    {
        super({ loop: true });
        
        this.AddTrack(new AnimationTrack(
            'Transform.Position',
            (entity) => entity.GetComponent(Transform)!.Position,
            (_entity, _value) => void 0,
            [
                new Keyframe(0, new Vector3(-4, 2, 4), lerpVector3),
                new Keyframe(1, new Vector3(-4, 2,-4), lerpVector3),
                new Keyframe(2, new Vector3( 4, 2,-4), lerpVector3),
                new Keyframe(3, new Vector3( 4, 2, 4), lerpVector3),
                new Keyframe(4, new Vector3(-4, 2, 4), lerpVector3),
            ]
        ));
    }
}

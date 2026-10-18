import { Keyframe } from "./Keyframe";
import { ValueGetter, ValueSetter } from "./transitions";

export class AnimationTrack<T>
{
    get Length(): number
    {
        return this.KeyFrames.at(-1)?.Time ?? 0;
    }
    
    constructor(
        readonly Name: string,
        readonly GetValue: ValueGetter<T>,
        readonly SetValue: ValueSetter<T>,
        readonly KeyFrames: Keyframe<T>[]
    ) {}
}

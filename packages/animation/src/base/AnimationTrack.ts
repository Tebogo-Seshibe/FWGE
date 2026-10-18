import { Class, Component } from "@fwge/ecs";
import { Keyframe } from "./Keyframe";

export class AnimationTrack<T extends Component, U extends keyof T = any>
{
    get Length(): number
    {
        return this.KeyFrames.at(-1)?.Time ?? 0;
    }
    
    constructor(
        readonly Component: Class<T>, 
        readonly Property: U, 
        readonly KeyFrames: Keyframe<T[U]>[]
    ) {}
}

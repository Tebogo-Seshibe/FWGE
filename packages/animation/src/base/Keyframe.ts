import { Transition } from "./transitions/Transition"

export class Keyframe<T>
{    
    constructor(
        readonly Time: number,
        readonly Value: T,
        readonly Transition: Transition<T>
    ) { }
}

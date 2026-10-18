import { lerp, Vector3, Vector4, Colour3, Colour4 } from "@fwge/common"
import { Transition } from "./Transition"

export const lerpVector3: Transition<Vector3> = (t: number, curr: Vector3, next: Vector3, out: Vector3) =>
{
    return out.Set(
        lerp(t, curr[0], next[0]),
        lerp(t, curr[1], next[1]),
        lerp(t, curr[2], next[2])
    )
}

export const lerpVector4: Transition<Vector4> = (t: number, curr: Vector4, next: Vector4, out: Vector4) =>
{
    return out.Set(
        lerp(t, curr[0], next[0]),
        lerp(t, curr[1], next[1]),
        lerp(t, curr[2], next[2]),
        lerp(t, curr[3], next[3])
    )
}

export const lerpColour3: Transition<Colour3> = (t: number, curr: Colour3, next: Colour3, out: Colour3) =>
{
    return out.Set(
        lerp(t, curr[0], next[0]),
        lerp(t, curr[1], next[1]),
        lerp(t, curr[2], next[2])
    )
}

export const lerpColour4: Transition<Colour4> = (t: number, curr: Colour4, next: Colour4, out: Colour4) =>
{
    return out.Set(
        lerp(t, curr[0], next[0]),
        lerp(t, curr[1], next[1]),
        lerp(t, curr[2], next[2]),
        lerp(t, curr[3], next[3])
    )
}

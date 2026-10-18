import { Class, Component, TypeId } from "@fwge/ecs";
import { AnimationTrack } from "./AnimationTrack";
import { Keyframe } from "./Keyframe";
import { Asset } from "@fwge/core";

export interface IAnimation
{
    loop: boolean
}

export interface AnimationFrame<T extends Component = any>
{
    type: TypeId;
    prop: keyof T;
    length: number;
    curr: Keyframe<T>;
    next: Keyframe<T>;
}

export class Animation extends Asset
{
    public readonly Tracks = new Map<number, Map<string, AnimationTrack<any, any>>>();
    public readonly Summary: AnimationFrame[] = []
    public Loop: boolean;
    private _totalLength: number = 0;

    public get TotalLength(): number
    {
        return this._totalLength;
    }    

    constructor()
    constructor(anim: IAnimation)
    constructor(args?: IAnimation)
    {
        super(Animation);
        
        this.Loop = args?.loop ?? false;
    }

    AddTrack<T extends Component, U extends keyof T>(track: AnimationTrack<T, U>): void
    {
        if (!this.Tracks.has(track.Component.TypeId))
        {
            this.Tracks.set(track.Component.TypeId, new Map());
        }

        this.Tracks.get(track.Component.TypeId)!.set(track.Property as string, track);
        for (let i = 0; i < track.KeyFrames.length - 1; ++i)
        {
            const curr = track.KeyFrames[i];
            const next = track.KeyFrames[i + 1];
            this.Summary.push({
                prop: track.Property,
                type: track.Component.TypeId,
                length: next.Time - curr.Time,
                curr,
                next
            });

            this._totalLength = Math.max(curr.Time, next.Time, this._totalLength);
        }
    }

    GetTrack<T extends Component, U extends keyof T>(componentTypeId: TypeId, property: U): AnimationTrack<T, U> | undefined
    GetTrack<T extends Component, U extends keyof T>(component: Class<T>, property: U): AnimationTrack<T, U> | undefined
    GetTrack<T extends Component, U extends keyof T>(c: TypeId | Class<T>, property: U): AnimationTrack<T, U> | undefined
    {
        const typeId = typeof c === 'number' ? c : c.TypeId;
        return this.Tracks.get(typeId)?.get(property as string);
    }

    RemoveTrack<T extends Component, U extends keyof T>(component: Class<T>, property: U): void
    {
        this.Tracks.get(component.TypeId)?.delete(property as string);
    }

    GetCurrentFrames(elapsed: number): AnimationFrame[]
    {
        return this.Summary.filter(frame => {
            return frame.curr.Time <= elapsed && elapsed <= frame.next.Time
        });
    }

    Load(protocol?: (...args: any[]) => Promise<Blob>): Promise<any> {
        return Promise.resolve();
    }
    Reset(): void {
        throw new Error("Method not implemented.");
    }
    Unload(): void {
        throw new Error("Method not implemented.");
    }
    Destroy(): void {
        throw new Error("Method not implemented.");
    }
}

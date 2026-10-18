import { CalcuateDelay, IDelay } from "@fwge/common";
import { Component, Entity, TypeId } from "@fwge/ecs";
import { Animation } from "../base";

export class AnimationPlayer extends Component
{
    private _currentAnimation: Animation | undefined = undefined;
    private _animations: Map<string, Animation> = new Map();
    
    private _startDelay = -1;
    private _stopDelay = -1;
    private _elapsed = 0;
    private _nextAnimation = '';
    private _currentFrame = new Map<TypeId, Map<string, number>>();
    
    get Running(): boolean
    {
        return !!this._nextAnimation || !!this._currentAnimation;
    }

    get CurrentAnimation(): Animation | undefined
    {
        return this._currentAnimation;
    }

    constructor()
    {
        super(AnimationPlayer)
    }

    Add(name: string, animation: Animation)
    {
        this._animations.set(name, animation);
    }

    Remove(name: string)
    {
        const animation = this._animations.get(name);
        if (!animation)
        {
            return;
        }

        if (this._currentAnimation === animation)
        {
            this.Stop();
        }

        this._animations.delete(name);
    }

    Play(name: string): void
    Play(name: string, delay: IDelay): void
    Play(name: string, delay: IDelay = {}): void
    {
        this._startDelay = CalcuateDelay(delay) / 1000;
        this._stopDelay = 0;
        this._nextAnimation = name;
    }

    Stop(): void
    Stop(delay: IDelay): void
    Stop(delay: IDelay = {}): void
    {
        this._startDelay = 0;
        this._stopDelay = CalcuateDelay(delay) / 1000;
    }

    Update(entity: Entity, delta: number): void
    {
        if (this._currentAnimation && this._stopDelay > 0)
        {
            const diff = this._stopDelay - delta;
            this._stopDelay = Math.max(0, diff);
            delta = Math.max(0, -diff);
        }
        else if (!this._currentAnimation && this._startDelay > 0)
        {
            const diff = this._startDelay - delta;
            this._startDelay = Math.max(0, diff);
            delta = Math.max(0, -diff);
        }

        if (!this._currentAnimation && this._startDelay === 0)
        {
            this._start();
        }

        this._elapsed += delta;
        this._update(entity);

        if (this._currentAnimation && this._stopDelay === 0)
        {
            this._stop();
        }
    }

    private _update(entity: Entity): void
    {
        if (!this._currentAnimation)
        {
            return;
        }

        if (this._elapsed >= this._currentAnimation.TotalLength)
        {
            if (this._currentAnimation.Loop) {
                this._elapsed -= this._currentAnimation.TotalLength;
            } else {
                this.Stop();
                this._elapsed = this._currentAnimation.TotalLength;
            }
        }

        const currentFrames = this._currentAnimation.GetCurrentFrames(this._elapsed);
        for (const {curr, next, get, set, length} of currentFrames)
        {
            const updatedValue = curr.Transition(
                (this._elapsed - curr.Time) / length,
                curr.Value,
                next.Value,
                get(entity)
            );
            set(entity, updatedValue);
        }
    }

    private _start(): void
    {
        this._startDelay = -1;
        this._stopDelay = -1;
        this._elapsed = 0;
        this._currentAnimation = this._animations.get(this._nextAnimation);
        this._nextAnimation = '';
    }

    private _stop(): void
    {
        this._startDelay = -1;
        this._stopDelay = -1;
        this._elapsed = 0;
        this._currentAnimation = undefined;
        this._currentFrame.clear();
        this._nextAnimation = '';
    }
}

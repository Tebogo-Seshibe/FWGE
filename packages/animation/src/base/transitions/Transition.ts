import { Entity } from "@fwge/ecs";

export type ValueGetter<T> = (entity: Entity) => T;
export type ValueSetter<T> = (entity: Entity, value: T) => void;
export type Transition<T> = (t: number, from: T, to:T, curr: T) => T
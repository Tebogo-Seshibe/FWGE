import Cloneable from '../Interfaces/Cloneable';
export default class Vector3 extends Float32Array implements Cloneable<Vector3> {
    constructor(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number);
    X: number;
    Y: number;
    Z: number;
    static readonly ZERO: Vector3;
    static readonly ONE: Vector3;
    static readonly UNIT: Vector3;
    readonly Length: number;
    static Length(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number): number;
    Set(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number): Vector3;
    static Set(vector: Vector3, x: Float32Array | number[] | number, y: number, z: number): Vector3;
    Sum(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number): Vector3;
    static Sum(vector: Vector3, x?: Float32Array | number[] | number, y?: number, z?: number): Vector3;
    Diff(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number): Vector3;
    static Diff(vector: Vector3, x?: Float32Array | number[] | number, y?: number, z?: number): Vector3;
    Mult(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number): Vector3;
    static Mult(vector: Vector3, x?: Float32Array | number[] | number, y?: number, z?: number): Vector3;
    Scale(scalar: number): Vector3;
    static Scale(vector: Vector3, scalar: number): Vector3;
    Dot(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number): number;
    static Dot(vector: Vector3, x?: Float32Array | number[] | number, y?: number, z?: number): number;
    Cross(x?: Vector3 | Float32Array | number[] | number, y?: number, z?: number): Vector3;
    static Cross(vector: Vector3, x?: Float32Array | number[] | number, y?: number, z?: number): Vector3;
    Unit(): Vector3;
    static Unit(vector: Vector3): Vector3;
    toString(): string;
    toLocaleString(): string;
    Clone(): Vector3;
}

import { Matrix4, MinLengthArray, Vector3, Vector3Array } from '@fwge/common';
import { Component, EntityId, Registry } from '@fwge/ecs';

export interface ITransform
{
    position?: Vector3 | MinLengthArray<number, 3>
    rotation?: Vector3 | MinLengthArray<number, 3>
    scale?: Vector3 | MinLengthArray<number, 3>
}

export interface ISimpleTransform extends ITransform 
{
}

export interface ITransformBuffered extends ITransform
{
    buffer: ArrayBuffer
    positionOffset: number
    rotationOffset: number
    scaleOffset: number
}

export class Transform extends Component
{
    public readonly Position: Vector3;
    public readonly Rotation: Vector3;
    public readonly Scale: Vector3;

    constructor()
    constructor(transform: ISimpleTransform)
    constructor(transform: ITransformBuffered)
    constructor(args: ISimpleTransform | ITransformBuffered = { })
    {
        super(Transform);

        if ('buffer' in args && args.buffer)
        {
            this.Position = new Vector3(args.buffer, args.positionOffset);
            this.Rotation = new Vector3(args.buffer, args.rotationOffset);
            this.Scale = new Vector3(args.buffer, args.scaleOffset);
        }
        else
        {
            const buffer = new Float32Array(9);
            this.Position = new Vector3(buffer.buffer, 0 * Float32Array.BYTES_PER_ELEMENT);
            this.Rotation = new Vector3(buffer.buffer, 3 * Float32Array.BYTES_PER_ELEMENT);
            this.Scale = new Vector3(buffer.buffer, 6 * Float32Array.BYTES_PER_ELEMENT);
        }

        if (args.position)
        {
            this.Position.Set(args.position as Vector3Array);
        }
        else
        {
            this.Position.Set(0, 0, 0);
        }

        if (args.rotation)
        {
            this.Rotation.Set(args.rotation as Vector3Array);
        }
        else
        {
            this.Rotation.Set(0, 0, 0);
        }

        if (args.scale)
        {
            this.Scale.Set(args.scale as Vector3Array);
        }
        else
        {
            this.Scale.Set(1, 1, 1);
        }
    }

    GlobalPosition(): Readonly<Vector3>
    GlobalPosition(ownerId: EntityId): Readonly<Vector3>
    GlobalPosition(ownerId: EntityId = -1): Readonly<Vector3>
    {
        const position = this.Position.Clone();

        while (ownerId !== -1)
        {
            const transform = Registry.GetComponent(ownerId, Transform);

            if (transform)
            {
                position.Add(transform.Position);
            }

            ownerId = Registry.GetParentId(ownerId);
        }

        return position;
    }

    GlobalRotation(): Readonly<Vector3>
    GlobalRotation(ownerId: EntityId): Readonly<Vector3>
    GlobalRotation(ownerId: EntityId = -1): Readonly<Vector3>
    {
        const rotation = this.Rotation.Clone();
        
        while (ownerId !== -1)
        {
            const transform = Registry.GetComponent(ownerId, Transform);
            
            if (transform)
            {
                rotation.Add(transform.Rotation);
            }
                
            ownerId = Registry.GetParentId(ownerId);
        }

        return rotation;
    }

    GlobalScale(): Readonly<Vector3>
    GlobalScale(ownerId: EntityId): Readonly<Vector3>
    GlobalScale(ownerId: EntityId = -1): Readonly<Vector3>
    {
        const scale = this.Scale.Clone();
        
        while (ownerId !== -1)
        {
            const transform = Registry.GetComponent(ownerId, Transform);

            if (transform)
            {
                scale.Add(transform.Scale);
            }

            ownerId = Registry.GetParentId(ownerId);
        }

        return scale;
    }
    
    GlobalModelViewMatrix(): Readonly<Matrix4>
    GlobalModelViewMatrix(out: Matrix4): Readonly<Matrix4>
    GlobalModelViewMatrix(ownerId: EntityId): Readonly<Matrix4>
    GlobalModelViewMatrix(ownerId: EntityId, out: Matrix4): Readonly<Matrix4>
    GlobalModelViewMatrix(_0?: Matrix4 | EntityId, _1?: Matrix4): Readonly<Matrix4>
    {
        const modelViewMatrix = _1 ?? (_0 instanceof Matrix4 ? _0 : Matrix4.Identity);
        let ownerId = typeof _0 === 'number' ? _0 : -1;
            
        Matrix4.TransformationMatrix(
            this.Position, 
            this.Rotation, 
            this.Scale,
            modelViewMatrix
        );
        
        while (ownerId !== -1)
        {
            const transform = Registry.GetComponent(ownerId, Transform);

            if (transform)
            {
                Matrix4.Multiply(
                    Matrix4.TransformationMatrix(
                        transform.Position, 
                        transform.Rotation, 
                        transform.Scale,
                    ),
                    modelViewMatrix,
                    modelViewMatrix
                );
            }

            ownerId = Registry.GetParentId(ownerId);
        }

        return modelViewMatrix;
    }
    
    LocalModelViewMatrix(): Matrix4
    LocalModelViewMatrix(out: Matrix4): Matrix4
    LocalModelViewMatrix(_0: Matrix4 = Matrix4.Identity): Matrix4
    {
        return Matrix4.TransformationMatrix(
            this.Position,
            this.Rotation,
            this.Scale,
            _0
        )
    }
}

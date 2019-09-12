import Collider, { ICollider } from './Collider';

export class IBoxCollider extends ICollider
{
    height?: number
    width?: number
    breadth?: number
}

export default class BoxCollider extends Collider
{
    public Height: number
    public Width: number
    public Breadth: number
    
    constructor()
    constructor(boxCollider: IBoxCollider)
    constructor({ name = 'BoxCollider', transform, height = 1.0, width = 1.0, breadth = 1.0 }: IBoxCollider = new IBoxCollider)
    {
        super({ name, transform })

        this.Height = height
        this.Width = width
        this.Breadth = breadth
    }

    public Clone(): BoxCollider
    {
        return new BoxCollider(
        {
            name:       this.Name + ' Clone',
            transform:  this.Transform.Clone(),
            height:     this.Height,
            width:      this.Width,
            breadth:    this.Breadth
        })
    }
}

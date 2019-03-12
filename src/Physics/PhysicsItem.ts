import Collider from './Collision/Collider'
import Item from '../Item'
import PhysicsBody from './PhysicsBody'
import PhysicsMaterial from './PhysicsMaterial'

export class IPhysicsItem
{
    name?: string = 'Physics Item'
    body?: PhysicsBody
    collider?: Collider
    material?: PhysicsMaterial
}

export default class PhysicsItem extends Item
{
    public Collider: Collider
    public Material: PhysicsMaterial
    public Body: PhysicsBody
    
    constructor({ name, body, collider, material }: IPhysicsItem = new IPhysicsItem)
    {
        super(name)

        this.Collider = collider
        this.Material = material
        this.Body = body
    }
}
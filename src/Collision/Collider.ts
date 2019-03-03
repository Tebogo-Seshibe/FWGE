import Vector3 from '../Maths/Vector3'
import GameItem from '../GameItem'

export class ICollider
{
    name: string = 'Collider'
    position: Vector3 = Vector3.ZERO
    physicsitem: any = undefined
}

export default class Collider implements GameItem
{
    constructor({name, position, physicsitem}: ICollider)
    {
        super(name)

        this.Position = new Vector3(position)
        this.PhysicsItem = undefined // physicsitem
    }
}
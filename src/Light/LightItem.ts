import Colour4 from '../Render/Colour4'
import Item from '../Item'

export class ILightItem
{
    name: string
    colour: Colour4 | Float32Array | Array<number>
    intensity: number
}

export default class LightItem extends Item
{
    public Colour: Colour4
    public Intensity: number

    constructor(name: string, colour: Colour4 | Float32Array | Array<number> = [255, 255, 255, 255], intensity: number = 1)
    {
        super(name)

        this.Colour = new Colour4(colour)
        this.Intensity = intensity
    }
}
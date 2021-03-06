// import Vector3 from '../Maths/Vector3';
// import List from '../Utility/List';
import Light, { ShadowQuality } from './Light';
// import Colour4 from '../Colour/Colour4';

export const MAX_DIRECTIONAL_LIGHTS: number = 3

// export const DirectionalLights: List<DirectionalLight> = new List<DirectionalLight>(MAX_DIRECTIONAL_LIGHTS)
export const DirectionalLights: Array<DirectionalLight> = new Array<DirectionalLight>()

export class IDirectionalLight
{
    name?: string
    colour?: [number, number, number, number]
    intensity?: number
    direction?: [number, number, number]
    shadows?: ShadowQuality
}

export default class DirectionalLight extends Light
{
    public Direction: [number, number, number]

    constructor()
    constructor(ambientLight: IDirectionalLight)
    constructor({ name = 'Ambient Light', colour = [1, 1, 1, 1], intensity = 1 , direction = [0, 0, 1], shadows = ShadowQuality.NONE }: IDirectionalLight = new IDirectionalLight)
    {
        super(name)

        this.Colour = [ ...colour ]
        this.Intensity = intensity
        this.Direction = [ ...direction ]
        this.Shadows = shadows

        DirectionalLights.push(this)
    }
}
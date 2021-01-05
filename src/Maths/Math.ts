export const DECIMAL_PLACES: number = 5
export const SIGNIFICANT_FIGURES: number = Math.pow(10, DECIMAL_PLACES)

export const radian = (degree: number): number =>
{
    return clean(Math.PI / 180 * degree)
}

export const cot = (radian: number): number =>
{
    return clean(1 / Math.tan(radian))
}

export const clamp = (value: number, min: number, max: number): number =>
{
    return clean(Math.min(max, Math.max(min, value)))
}

export const randBetween = (min: number, max: number): number =>
{
    return (Math.random() * max) + min
}

export const clean = (value: number): number =>
{
    return Math.round(value * SIGNIFICANT_FIGURES) / SIGNIFICANT_FIGURES
}

export const isPowerOf2 = (value: number): boolean =>
{
    return (value & (value - 1)) === 0
}

export const lerp = (min: number, max: number, time: number): number =>
{
    return clean(min + (time * (max - min)))
}

export const inverseLerp = (min: number, max: number, value: number): number =>
{
    return clean(value - min) / (max - min))
}

export const remap = (inputMin: number, inputMax: number, outputMin: number, outputMax: number, inputVal: number): number =>
{
    return clean(lerp(outputMin, outputMax, inverseLerp(inputMin, inputMax, inputVal)))
}

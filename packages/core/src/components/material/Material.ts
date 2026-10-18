import { Colour3, Colour3Array, GL, isPowerOf2, Scalar } from "@fwge/common";
import { Game, ImageAsset } from "../../base";
import { Shader } from "../../base/shader/Shader";
import { Component } from "@fwge/ecs";

export enum BlendMode
{
    NONE,
    ADDITIVE,
    SUBTRACTIVE,
    MULTIPLICATIVE
}

export enum RenderType
{
    OPAQUE,
    TRANSPARENT,
    EMISSIVE
}

export interface IMaterial
{
    shader: Shader
    renderType?: RenderType
}

export class Material extends Component
{
    static Empty: WebGLTexture;
    
    ReceiveShadows: boolean = true;
    ProjectsShadows: boolean = true;
    Shader: Shader
    RenderType: RenderType;

    private readonly alpha: Scalar;
    private readonly colour: Colour3;
    
    // readonly MaterialBuffer = GL.createBuffer()!
    readonly Textures: Array<WebGLTexture | null> = new Array(8).fill(null)
    readonly ImageTextures: Array<ImageAsset | null> = new Array(8).fill(null)

    get Alpha()
    {
        return this.alpha.Value
    }

    set Alpha(alpha: number)
    {
        this.alpha.Value = alpha
    }

    get Colour()
    {
        return this.colour;
    }

    set Colour(colour: Colour3 | Colour3Array)
    {
        this.colour.Set(colour as Colour3Array);
    }

    constructor(
        shader: Shader,
        renderType?: RenderType,
        readonly BufferData: Float32Array = new Float32Array([1, 1, 1, 1])
    ) {
        super(Material)

        this.Shader = shader
        this.RenderType = renderType ?? RenderType.OPAQUE
        this.colour = new Colour3(1,1,1)//this.BufferData.buffer, Float32Array.BYTES_PER_ELEMENT * 0)
        this.alpha = new Scalar(1)//this.BufferData.buffer, Float32Array.BYTES_PER_ELEMENT * 3)
        
        this.colour.Set(0.3, 0.3, 0.3)
        this.alpha.Set(1.0)

        if (!Material.Empty)
        {
            Material.Empty = GL.createTexture()!
            GL.bindTexture(GL.TEXTURE_2D, Material.Empty)
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
            GL.generateMipmap(GL.TEXTURE_2D)
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_NEAREST)
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST)
            GL.bindTexture(GL.TEXTURE_2D, null)            
        }
    }
    
    // protected applyImage(texture: WebGLTexture, src: string): void
    // {    
    //     GL.bindTexture(GL.TEXTURE_2D, texture)
    //     GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
    
    //     const img: HTMLImageElement = new Image()
    //     img.onload = () =>
    //     {
    //         setTimeout(() =>
    //         {
    //             GL.bindTexture(GL.TEXTURE_2D, texture)
    //             GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img)
        
    //             if (isPowerOf2(img.width) && isPowerOf2(img.height))
    //             {
    //                 GL.generateMipmap(GL.TEXTURE_2D)
    //                 GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST)
    //                 GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR)
    //             }
    //             else
    //             {
    //                 GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE)
    //                 GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE)
    //                 GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR)
    //                 GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR)
    //             }
        
    //             GL.bindTexture(GL.TEXTURE_2D, null)
    //         })
    //     }
    
    //     img.src = src
    // }

    // Bind(): void
    // Bind(shader: Shader): void
    // Bind(_0?: Shader): void
    // {
    //     if (this.RenderType === RenderType.OPAQUE)
    //     {
    //         GL.disable(GL.BLEND)
    //         GL.enable(GL.DEPTH_TEST)
    //         GL.enable(GL.CULL_FACE)
    //         GL.cullFace(GL.FRONT)
    //         GL.depthFunc(GL.LESS)
    //         GL.depthMask(true)
    //     }
    //     else
    //     {
    //         GL.enable(GL.BLEND)
    //         GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA)
    //     }
    // }

    // UnBind(): void
    // {
    //     for (let i = 0; i < this.Textures.length; ++i)
    //     {
    //         const texture = this.Textures[i]
    //         if (texture)
    //         {
    //             GL.activeTexture(GL.TEXTURE0 + i)
    //             GL.bindTexture(GL.TEXTURE_2D, null)
    //         }
    //     }
    // }
}

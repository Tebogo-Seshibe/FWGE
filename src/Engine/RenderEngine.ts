import IEngine from "./IEngine";
import BuildShaders, { CombinedShader, GUIShader, LightShader, NormalDepthShader, PostProcessingShader, SSAOShader } from "../Shader/Shaders";
import { Shader } from "../Render";
import { Shaders } from "../Shader/Shader";
import { Mesh, Material, GameObject } from "../Object";
import { Matrix4, Matrix3 } from "../Maths";
import { DirectionalLights } from "../Light/DirectionalLight";
import { PointLights } from "../Light/PointLight";
import { GameObjects } from "../Object/GameObject";
import { Camera, ViewMode } from "../Camera";
import { Perspective, Orthographic, LookAt } from "../Render/Projection";
import ModelView from "../Render/ModelView";

/**
 * 1) Depth Pass -> Main camera
 * 2) Point/Spot Light Pass -> Main Camera
 * 3) Directional Pass -> Main Camera
 * 4) G-Buffer
 * 5) Screen Space Ambient Occlusion Pass
 * 6) Post-Processing Pass
 * 6.1) Shadows
 * 6.2) AA
 * 6.3) DoF
 * 6.4) Motion Blur
 * 6.5) Reflections
 * 6.6) Glows
 * 6.7) Vigette
 * 6.8) Edge Detection
 * 7) GUI Pass
 */

 /**
  * Pass Process
  * -> Clear buffer
  * -> Render to texture
  */

let GL: WebGLRenderingContext

type ObjectListType =
{
    id: number
    mesh: Mesh
    material: Material
    modelView: Matrix4
    normal: Matrix3
}

let ObjectList: Map<number, ObjectListType> = new Map

function ClearBuffer(shader?: Shader): void
{
    const width = shader ? shader.Width : GL.drawingBufferWidth
    const height = shader ? shader.Height : GL.drawingBufferHeight
    const buffer = shader ? shader.FrameBuffer : null
    const clear = shader ? shader.Clear : [0.0, 0.0, 0.0, 0.0]

    GL.bindFramebuffer(GL.FRAMEBUFFER, buffer)
    GL.viewport(0, 0, width, height)
    GL.clearColor(clear[0], clear[1], clear[2], clear[3])
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)
}

function BindAttributes(shader: Shader, mesh: Mesh): void
{    
    const position: number = shader.Attribute.Position
    const normal: number = shader.Attribute.Normal
    const uv: number = shader.Attribute.UV
    const colour: number = shader.Attribute.Colour
    
    if (position !== -1)
    {
        if(mesh.PositionBuffer)
        {
            GL.enableVertexAttribArray(position)
            GL.bindBuffer(GL.ARRAY_BUFFER, mesh.PositionBuffer)
            GL.vertexAttribPointer(position, 3, GL.FLOAT, false, 0, 0)
        }
        else
        {
            GL.disableVertexAttribArray(position)
        }
    }
    
    if (normal !== -1)
    {
        if (mesh.NormalBuffer)
        {
            GL.enableVertexAttribArray(normal)
            GL.bindBuffer(GL.ARRAY_BUFFER, mesh.NormalBuffer)
            GL.vertexAttribPointer(normal, 3, GL.FLOAT, false, 0, 0)
        }
        else
        {
            GL.disableVertexAttribArray(normal)
        }
    }

    if (uv !== -1)
    {
        if (mesh.UVBuffer)
        {
            GL.enableVertexAttribArray(uv)
            GL.bindBuffer(GL.ARRAY_BUFFER, mesh.UVBuffer)
            GL.vertexAttribPointer(uv, 2, GL.FLOAT, false, 0, 0)
        }
        else
        {
            GL.disableVertexAttribArray(uv)
        }

    }

    if (colour !== -1)
    {
        if (mesh.ColourBuffer)
        {
            GL.enableVertexAttribArray(colour)
            GL.bindBuffer(GL.ARRAY_BUFFER, mesh.ColourBuffer)
            GL.vertexAttribPointer(colour, 4, GL.FLOAT, false, 0, 0)
        }
        else
        {
            GL.disableVertexAttribArray(colour)
        }
    }
    
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.IndexBuffer)
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.WireframeBuffer)
}

function BindGlobalUniforms(shader: Shader): void
{
    let directional_count: number = 0
    for (let light of DirectionalLights)
    {
        GL.uniform4fv(shader.BaseUniforms.DirectionalLights[directional_count].Colour, light.Colour)
        GL.uniform1f(shader.BaseUniforms.DirectionalLights[directional_count].Intensity, light.Intensity)
        GL.uniform3fv(shader.BaseUniforms.DirectionalLights[directional_count].Direction, light.Direction)

        ++directional_count
    }
    
    let point_count: number = 0
    for (let light of PointLights)
    {
        GL.uniform4fv(shader.BaseUniforms.PointLights[point_count].Colour, light.Colour)
        GL.uniform1f(shader.BaseUniforms.PointLights[point_count].Intensity, light.Intensity)
        GL.uniform3fv(shader.BaseUniforms.PointLights[point_count].Position, light.Position)
        GL.uniform1f(shader.BaseUniforms.PointLights[point_count].Radius, light.Radius)
        GL.uniform1f(shader.BaseUniforms.PointLights[point_count].Angle, light.Angle)

        ++point_count
    }

    let projectionMatrix = 
        Camera.Main.Mode == ViewMode.PERSPECTIVE
        ? Perspective(Camera.Main.NearClipping, Camera.Main.FarClipping, Camera.Main.FieldOfView, Camera.Main.AspectRatio)
        : Orthographic(Camera.Main.Left, Camera.Main.Right, Camera.Main.Top, Camera.Main.Bottom, Camera.Main.NearClipping, Camera.Main.FarClipping, Camera.Main.HorizontalTilt, Camera.Main.VericalTilt)

    let lookAtMatrix = LookAt(Camera.Main.Position, Camera.Main.Target, Camera.Main.Up)

    GL.uniform1i(shader.BaseUniforms.DirectionalLightCount, directional_count)
    GL.uniform1i(shader.BaseUniforms.PointLightCount, point_count)
    GL.uniformMatrix4fv(shader.BaseUniforms.Matrix.Projection, false, projectionMatrix)
    GL.uniformMatrix4fv(shader.BaseUniforms.Matrix.View, false, lookAtMatrix)
    
    GL.uniform1i(shader.BaseUniforms.Global.Time, Date.now())
    GL.uniform2f(shader.BaseUniforms.Global.Resolution, shader.Width, shader.Height)
    GL.uniform1f(shader.BaseUniforms.Global.NearClip, Camera.Main.NearClipping)
    GL.uniform1f(shader.BaseUniforms.Global.FarClip, Camera.Main.FarClipping)
    GL.uniform1i(shader.BaseUniforms.Global.ObjectCount, GameObjects.length)
}

function BindObjectUniforms(shader: Shader, material: Material, mv: Matrix4, n: Matrix3): void
{
    GL.uniform4fv(shader.BaseUniforms.Material.AmbientColour, material.Ambient)
    GL.uniform4fv(shader.BaseUniforms.Material.DiffuseColour, material.Diffuse)
    GL.uniform4fv(shader.BaseUniforms.Material.SpecularColour, material.Specular)
    GL.uniform1f(shader.BaseUniforms.Material.Shininess, material.Shininess)
    GL.uniform1f(shader.BaseUniforms.Material.Alpha, material.Alpha)

    if (material.ImageMap)
    {
        GL.activeTexture(GL.TEXTURE0)
        GL.bindTexture(GL.TEXTURE_2D, material.ImageMap)
        GL.uniform1i(shader.BaseUniforms.Material.ImageSampler, 0)
    }
    else
    {
        GL.activeTexture(GL.TEXTURE0)
        GL.bindTexture(GL.TEXTURE_2D, null)
    }
    
    if (material.BumpMap)
    {
        GL.activeTexture(GL.TEXTURE1)
        GL.bindTexture(GL.TEXTURE_2D, material.BumpMap)
        GL.uniform1i(shader.BaseUniforms.Material.BumpSampler, 0)
    }
    else
    {
        GL.activeTexture(GL.TEXTURE1)
        GL.bindTexture(GL.TEXTURE_2D, null)
    }
    
    if (material.SpecularMap)
    {
        GL.activeTexture(GL.TEXTURE2)
        GL.bindTexture(GL.TEXTURE_2D, material.SpecularMap)
        GL.uniform1i(shader.BaseUniforms.Material.SpecularSampler, 0)
    }
    else
    {
        GL.activeTexture(GL.TEXTURE2)
        GL.bindTexture(GL.TEXTURE_2D, null)
    }

    GL.uniformMatrix4fv(shader.BaseUniforms.Matrix.Model, false, mv)
    GL.uniformMatrix3fv(shader.BaseUniforms.Matrix.Normal, false, n)
}

function CalculateObjectMatrices(gameObject: GameObject, mv: ModelView): void
{
    mv.Push(gameObject.Transform)
    let modelView: Matrix4  = mv.Peek()
    let inverse: Matrix4 = modelView.Clone().Inverse()

    ObjectList.set(gameObject.ID,
    {
        id: gameObject.ObjectID,
        mesh: gameObject.Mesh,
        material: gameObject.Material,
        modelView,
        normal: new Matrix3(
            inverse.M11, inverse.M12, inverse.M13,
            inverse.M21, inverse.M22, inverse.M23,
            inverse.M31, inverse.M32, inverse.M33
        )
    })

    gameObject.Children.forEach(child => CalculateObjectMatrices(child, mv))

    mv.Pop()
}

function RunProgram(shader: Shader, object?: ObjectListType): void
{
    GL.useProgram(shader.Program)

    ClearBuffer(shader)
    BindGlobalUniforms(shader)

    if (!shader.Attribute.Exists || !object)
    {
        GL.bindFramebuffer(GL.FRAMEBUFFER, null)
        GL.drawElements(GL.TRIANGLES, 0, GL.UNSIGNED_BYTE, 0)
    }
    else
    {
        if (object.material.Alpha !== 1.0)
        {
            GL.enable(GL.BLEND)
            GL.disable(GL.DEPTH_TEST)
        }

        BindAttributes(shader, object.mesh)
        BindObjectUniforms(shader, object.material, object.modelView, object.normal)
        GL.uniform1i(shader.BaseUniforms.Global.ObjectID, object.id)

        GL.bindFramebuffer(GL.FRAMEBUFFER, null) //shader.FrameBuffer)
        GL.drawElements(GL.TRIANGLES, object.mesh.VertexCount, GL.UNSIGNED_BYTE, 0)


        if (object.material.Alpha !== 1.0)
        {
            GL.enable(GL.DEPTH_TEST)
            GL.disable(GL.BLEND)
        }
    }

    GL.useProgram(null)    
}

function MainPass()
{
    ObjectList.forEach(object => RunProgram(object.material.Shader, object))
}

export default class RenderEngine implements IEngine
{
    private modelView: ModelView = new ModelView

    public Init(gl: WebGLRenderingContext): void
    {
        GL = gl
        
        BuildShaders()

        GL.enable(GL.DEPTH_TEST)
        GL.disable(GL.BLEND)
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE)

        Shaders.filter(shader => shader.Filter).forEach(shader => RunProgram(shader, null))
    }

    public Update(): void
    {
        GameObjects.forEach(object => CalculateObjectMatrices(object, this.modelView))
        
        // ObjectList.forEach(object => RunProgram(NormalDepthShader, object))
        // ObjectList.forEach(object => RunProgram(LightShader, object))
        // ObjectList.forEach(object => RunProgram(CombinedShader, object))
        // ObjectList.forEach(object => RunProgram(PostProcessingShader, object))
        // ObjectList.forEach(object => RunProgram(SSAOShader, object))
        // ObjectList.forEach(object => RunProgram(GUIShader, object))

        ClearBuffer()
        ObjectList.forEach(object => RunProgram(object.material.Shader, object))
        //RunProgram(null)
    }

    public Reset(): void
    {
        Shaders.forEach(shader => ClearBuffer(shader))
    }
}
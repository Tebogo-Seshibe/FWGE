import { ShaderAsset } from "@fwge/core";

export class FinalPassShaderAsset extends ShaderAsset
{
    constructor()
    {
        super(
            './public/shaders/FinalPassShader.vert',
            './public/shaders/FinalPassShader.frag',
            'Final Pass Shader'
        )
    }
}

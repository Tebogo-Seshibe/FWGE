#version 300 es
#pragma vscode_glsllint_stage: frag

precision highp float;
layout (std140) uniform;

in vec2 V_UV;
layout(location = 0) out vec4 O_FragColour;

uniform Camera
{
    mat4 View;
    mat4 Projection;
    vec3 Position;
} camera;

struct Fragment
{
    vec3 Position;
    vec3 Normal;
    vec3 Diffuse;
    float Alpha;
    float Depth;
} fragment;
uniform sampler2D U_Position;
uniform sampler2D U_Normal;
uniform sampler2D U_Albedo_Alpha;
uniform sampler2D U_Depth;
uniform sampler2D U_Dir_Tex;

// Area Lighting ---------------------------------------
struct AreaLight
{
    vec3 Colour;
    float Intensity;
};
uniform AreaLight[1] U_AreaLight;

vec3 CalcAreaLight(AreaLight light)
{
    return light.Colour * light.Intensity;
}
// Area Lighting ---------------------------------------

// Directional Lighting --------------------------------
struct DirectionalLight
{
    vec3 Colour;
    float Intensity;

    vec3 Direction;
    bool CastShadows;

    float TexelSize;
    float TexelCount;
    float Bias;
    float PCFLevel;

    mat4 ProjectionMatrix;
    mat4 ViewMatrix;
};
uniform DirectionalLight[1] U_DirectionalLight;

float BasicShadowWeightDirectional(DirectionalLight dir, float diffuseDot, float specularDot, sampler2D shadowSampler, mat4 shadowMatrix)
{
    vec4 shadowPosition = shadowMatrix * vec4(fragment.Position, 1.0);
    vec3 lightPosition = (shadowPosition.xyz / shadowPosition.w) * 0.5 + 0.5;
    vec2 fragUV = lightPosition.xy;
    float shadowDepth = texture(shadowSampler, fragUV).r;

    return 1.0;
}

float ShadowWeightDirectional(DirectionalLight dir, float diffuseDot, float specularDot, sampler2D shadowSampler, mat4 shadowMatrix)
{
    vec4 shadowPosition = shadowMatrix * vec4(fragment.Position, 1.0);
    vec3 lightPosition = shadowPosition.xyz * 0.5 + 0.5;
    
    float bias = max(dir.Bias * (1.0 - diffuseDot), 0.0005);
    vec2 fragUV = lightPosition.xy;
    float fragmentDepth = lightPosition.z;

    if (fragmentDepth > 1.0)
    {
        fragmentDepth = 1.0;
    }

    float total = 0.0;
    for (float x = -dir.PCFLevel; x <= dir.PCFLevel; ++x)
    {
        for (float y = -dir.PCFLevel; y <= dir.PCFLevel; ++y)
        {
            vec2 offset = vec2(x, y) * dir.TexelSize;
            vec2 uv = fragUV + offset;
            if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0)
            {
                continue;
            }

            float shadowDepth = texture(shadowSampler, fragUV).r + bias;
            if (shadowDepth < fragmentDepth)
            {
                total += 1.0;
            }
        }
    }

    // return 1.0;
    return total / dir.TexelCount;
}

vec3 CalcDirectionalLight(DirectionalLight light)
{
    mat4 shadowMatrix = light.ProjectionMatrix * light.ViewMatrix;

    float diffuseInfluence = max(dot(fragment.Normal, light.Direction), 0.0);
    vec3 diffuse = light.Colour * diffuseInfluence * light.Intensity;

    // vec4 viewPosition = inverse(camera.Projection) * vec4(fragment.Position, 1.0);
    // vec3 halfway = normalize(light.Direction - viewPosition.xyz);
    // float specularInfluence = pow(max(dot(fragment.Normal, halfway), 0.0), 64.0);
    // vec3 specular = light.Colour * specularInfluence * light.Intensity;

    float shadow = ShadowWeightDirectional(light, diffuseInfluence, 1.0, U_Dir_Tex, shadowMatrix);

    return (diffuse) * (1.0 - shadow);
}
// Directional Lighting --------------------------------


//# Point Lighting --------------------------------
struct PointLight
{
    vec3 Colour;
    float Intensity;

    vec3 Position;
    float Radius;
    
    float Shininess;
};
uniform PointLight[100] U_PointLight;

vec3 CalcPointLight(PointLight light)
{
    vec3 difference = light.Position - fragment.Position;
    vec3 direction = normalize(difference);
    vec3 eye = normalize(-fragment.Normal);
    vec3 reflection = reflect(direction, fragment.Normal);
    float len = length(difference);

    float diffuseWeight = max(0.0, dot(fragment.Normal, direction));
    float specularWeight = pow(max(0.0, dot(reflection, eye)), light.Shininess);

    float attenuation = light.Radius / (len * len);

    vec3 diffuse = light.Colour * diffuseWeight * attenuation;
    vec3 specular = light.Colour * specularWeight * attenuation;
    vec3 colour = diffuse + specular;

    vec3 result = colour;

    return result * light.Intensity;
}
// Directional Lighting --------------------------------


void main(void)
{
    fragment = Fragment(
        texture(U_Position, V_UV).rgb,
        texture(U_Normal, V_UV).rgb,
        texture(U_Albedo_Alpha, V_UV).rgb,
        texture(U_Albedo_Alpha, V_UV).a,
        texture(U_Depth, V_UV).r
    );

    vec3 light = vec3(0.0);
    vec3 area = vec3(0.0);
    vec3 dir = vec3(0.0);
    vec3 point = vec3(0.0);

    for (int i = 0; i < U_AreaLight.length(); ++i)
    {
        area += CalcAreaLight(U_AreaLight[i]);
    }
        
    // for (int i = 0; i < U_DirectionalLight.length(); ++i)
    // {
    //     dir += CalcDirectionalLight(U_DirectionalLight[i]);
    // }
        
    // for (int i = 0; i < U_PointLight.length(); ++i)
    // {
    //     point += CalcPointLight(U_PointLight[i]);
    // }

    light = area + dir + point;
    O_FragColour = vec4(fragment.Diffuse * light, fragment.Alpha);
}

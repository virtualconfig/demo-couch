import { MathUtils } from 'three';
const glsl = String.raw;
class ShaderService {
    constructor() { }

    convertToTriplanar(material) {

        const defaultValues = {
            mappingDirection: 0,
            dimensions: {
                width: 0.5,
                height: 0.5,
                rotation: 0,
                flipX: 1,
                flipY: 1
            }
        }
        console.log(material)
        material.onBeforeCompile = (shader) => {
            material.userData.shader = shader

            // if (props.diffuseMap) {
            //     material.defines['USE_MY_DIFF'] = true;
            //     shader.uniforms['diffuse_map'] = { value: props.diffuseMap }
            // }
            // if (props.normalMap) {
            //     material.defines['USE_MY_NORMAL'] = true;
            //     shader.uniforms['normal_map'] = { value: props.normalMap }
            // }
            // if (props.roughnessMap) {
            //     material.defines['USE_MY_ROUGH'] = true;
            //     shader.uniforms['roughness_map'] = { value: props.roughnessMap }
            // }

            shader.uniforms['width'] = { value: defaultValues.dimensions.width }
            shader.uniforms['height'] = { value: defaultValues.dimensions.height }
            shader.uniforms['rotation'] = { value: MathUtils.degToRad(defaultValues.dimensions.rotation) }
            shader.uniforms['flipX'] = { value: defaultValues.dimensions.flipX }
            shader.uniforms['flipY'] = { value: defaultValues.dimensions.flipY }


            shader.vertexShader = glsl`
                varying vec3 general_pos;
                uniform float general_mappingType;
                varying vec3 general_triNormal;

				uniform mat4 transformationMatrix;
			` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <fog_vertex>',
                glsl`
				#include <fog_vertex>
				vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

                general_triNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
                vec4 tempPos = modelMatrix * vec4( position, 1.0 );
                general_pos = position;

			`
            )
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <logdepthbuf_pars_fragment>',
                glsl`#include <logdepthbuf_pars_fragment>
                uniform float width;
                uniform float height;
                uniform float rotation;
                uniform float flipX;
                uniform float flipY;
                varying vec3 general_pos;
                uniform float general_mappingType;
                varying vec3 general_triNormal;
			`
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <clipping_planes_pars_fragment>',
                glsl`
				#include <clipping_planes_pars_fragment>

				vec2 rotateUV(vec2 uv, vec2 pivot, float rotation) {
					float cosa = cos(rotation);
					float sina = sin(rotation);
					uv -= pivot;
					return vec2(
						cosa * uv.x - sina * uv.y,
						cosa * uv.y + sina * uv.x 
					) + pivot;
				}


				vec3 GetTriplanarWeights (vec3 normals) {
					vec3 triW = abs(normals);
					return triW / (triW.x + triW.y + triW.z);
				}

				struct TriplanarUV {
					vec2 x, y, z;
				};

				TriplanarUV GetTriplanarUV (vec3 pos) {
					TriplanarUV  triUV;
					triUV.x = pos.zy;
					triUV.y = pos.xz;
					triUV.z = pos.xy;
					return triUV;
				}

				vec3 perturbNormal2Arb2( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
					vec3 q0 = dFdx( eye_pos.xyz );
					vec3 q1 = dFdy( eye_pos.xyz );
					vec2 st0 = dFdx( vUv.st );
					vec2 st1 = dFdy( vUv.st );
					vec3 N = surf_norm; // normalized
					vec3 q1perp = cross( q1, N );
					vec3 q0perp = cross( N, q0 );
					vec3 T = q1perp * st0.x + q0perp * st1.x;
					vec3 B = q1perp * st0.y + q0perp * st1.y;
					float det = max( dot( T, T ), dot( B, B ) );
					float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
					return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
				}

				vec4 mappedTexture2DSimple (
						sampler2D image, 
						vec3 ppos, 
						float rotation, 
						float flipX, 
						float flipY, 
                        float xWidth,
                        float xHeight,
						vec3 triNormal
					) {
					vec4 mapTexel;


                    // vec2 rotatexonX = rotateUV(newNewPos.yz, vec2(0.0,0.0), rotation);
                    vec2 rotatexonX = rotateUV(vec2(ppos.y * flipX / xWidth, ppos.z * flipY / xHeight), vec2(0.0,0.0), rotation);
                    vec4 xColor = texture2D(image, rotatexonX);

                    // vec2 rotatexonY = rotateUV(newNewPos.xz, vec2(0.0,0.0), rotation);
                    vec2 rotatexonY = rotateUV(vec2(ppos.x * flipX / xWidth,  ppos.z * flipY / xHeight ), vec2(0.0,0.0), rotation);
                    vec4 yColor = texture2D(image, rotatexonY);

                    // vec2 rotatexonZ = rotateUV(newNewPos.xy, vec2(0.0,0.0), rotation);
                    vec2 rotatexonZ = rotateUV(vec2(ppos.x * flipX / xWidth , ppos.y * flipX / xHeight), vec2(0.0,0.0), rotation);
                    vec4 zColor = texture2D(image, rotatexonZ);

                    vec3 triW = GetTriplanarWeights(triNormal);
                    mapTexel = vec4( xColor * triW.x + yColor * triW.y + zColor * triW.z);

					return mapTexel;
				}
				`
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                glsl`
				#ifdef USE_MAP
                    vec4 sampledDiffuseColor = mappedTexture2DSimple( map, general_pos, rotation, flipX, flipY, width, height, general_triNormal );

                    diffuseColor *= sampledDiffuseColor;
				#endif
				`
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <roughnessmap_fragment>',
                glsl`
                float roughnessFactor = roughness;
				#ifdef USE_ROUGHNESSMAP
                    vec4 texelRoughness = mappedTexture2DSimple( roughnessMap, general_pos, rotation, flipX, flipY, width, height, general_triNormal );
                    // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
                    roughnessFactor *= texelRoughness.g;
				#endif
				`
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <roughnessmap_fragment>',
                glsl`
                float roughnessFactor = roughness;
				#ifdef USE_ROUGHNESSMAP
                    vec4 texelRoughness = mappedTexture2DSimple( roughnessMap, general_pos, rotation, flipX, flipY, width, height, general_triNormal );
                    // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
                    roughnessFactor *= texelRoughness.g;
				#endif
				`
            )

            shader.fragmentShader = shader.fragmentShader.replace(
				'#include <normal_fragment_maps>',
				glsl`
                #ifdef USE_NORMALMAP
                    vec3 localNormal = vec3(0.0);
                    vec3 localMeshNormal = vec3(0.0);
                    #ifdef USE_MY_NORMAL

                        vec4 normalTexelF = mappedTexture2DSimple( normalMap, general_pos, rotation, flipX, flipY, width, height, general_triNormal );
                        vec3 mapN = normalTexelF.xyz * 2.0 - 1.0;
                        mapN.xy *= normalMap_scale;
                        localNormal = perturbNormal2Arb2( - vViewPosition, normalize( vNormal ), mapN, 1.0 );
   
                        normal = vec3(localNormal.x, localNormal.y, localNormal.z);
                    #endif

                #endif
				
				`
			)
        }



    }
}

export default new ShaderService();
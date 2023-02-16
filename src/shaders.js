import { Vector3, Matrix3 } from 'three';

class CustomShader {
    constructor() { };

    configureShader(material, props) {

        material.onBeforeCompile = (shader) => {

            console.log(shader)

            shader.uniforms['mattype'] = { value: props.material.type }

            // for (const map in props.material) {
            //     console.log(map, props.material[map])
            //     for (const mapprop in props.material[map]) {
            //         console.log(map + mapprop)
            //     }
            // }

            shader.uniforms['map_type'] = { value: props.material.map ? props.material.map.type : null }
            shader.uniforms['map_image'] = { value: props.material.map ? props.maps[props.material.map.image].texture : null }
            shader.uniforms['map_direction'] = { value: props.material.map ? props.material.map.direction : null }

            console.log(props.maps[props.material.map.image].texture)

            shader.vertexShader = shader.vertexShader.replace(
				'#define STANDARD',
				`
				#define STANDARD
				uniform sampler2D map_image;
				`
			)

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <clipping_planes_pars_fragment>',
                `#include <clipping_planes_pars_fragment>
                
                vec4 mappedTexture(sampler2D imageX, sampler2D imageY, sampler2D imageZ, float mappingType, float direction, float rotation, float sizeX, float flipX, float xScale, float offsetX, float sizeY, float flipY, float yScale, float offsetY) {
                    vec4 mapTexel;
                    if(mappingType == 0.0) {
                        // UV Mapping
                    }
                    return mapTexel;
                }
                `
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <map_pars_fragment>",
                `
                #ifdef USE_MAP
                    uniform sampler2D map_image;
                #endif
                `
            ) 
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <map_fragment>",
                `
                #ifdef USE_MAP
                    vec4 sampledDiffuseColor = texture2D( map_image, vUv );
                    diffuseColor *= sampledDiffuseColor;
                #endif
                `
            )


            console.log(props)
        }
    }

}

export default new CustomShader();
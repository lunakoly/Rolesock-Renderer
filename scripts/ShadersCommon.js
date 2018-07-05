const Shaders = {}


Shaders.TEXTURE_VISUALIZATION_SHADERS = {
    fragment: `
        precision lowp float;

        uniform sampler2D uTarget2D;
        uniform samplerCube uTargetCube;

        uniform int uDoLinearization;
        uniform int uIsCubeTexture;
        uniform int uIsDepthTexture;
        uniform int uIsDepthColorTexture;

        varying vec2 vTexture;


        float vToO(vec4 v) {
            return (v.x + v.y + v.z + v.w) / 4.0;
        }

        float tryLinearize(float depth) {
            if (uDoLinearization == 0) return depth;
            float zNear = 0.1;
            float zFar = 100.0;
            return (2.0 * zNear) / (zFar + zNear - depth * (zFar - zNear));
        }

        float unwrap(float val) {
            return val * 2.0 - 1.0;
        }


        void main(void) {
            if (uIsCubeTexture == 1) {
                vec3 grabber = vec3(0.0, 0.0, 0.0);
                vec2 tex = vec2(vTexture.x, 1.0 - vTexture.y);

                if (tex.x < 0.25) {
                    grabber = vec3(-1.0, unwrap(tex.y) * 3.0, unwrap(tex.x / 0.25));
                } else if (tex.x < 0.5) {
                    if (tex.y < 0.333) {
                        grabber = vec3(unwrap((tex.x - 0.25) / 0.25), -1.0, unwrap(tex.y / 0.333));
                    } else if (tex.y > 0.666) {
                        grabber = vec3(unwrap((tex.x - 0.25) / 0.25), 1.0, unwrap((tex.y - 0.666) / 0.333));
                    } else {
                        grabber = vec3(unwrap((tex.x - 0.25) / 0.25), unwrap((tex.y - 0.333) / 0.333), 1.0);
                    }

                } else if (tex.x < 0.75) {
                    grabber = vec3(1.0, unwrap(tex.y) * 3.0, -unwrap((tex.x - 0.5) / 0.25));
                } else {
                    grabber = vec3(-unwrap((tex.x - 0.75) / 0.25), unwrap(tex.y) * 3.0, -1.0);
                }



                // if (vTexture.x < 0.333) {
                //     grabber = vec3(unwrap(vTexture.x / 0.333), unwrap(vTexture.y), 1.0);
                // } else if (vTexture.x < 0.666) {
                //     grabber = vec3(1.0, unwrap(vTexture.y), unwrap((vTexture.x - 0.333) / 0.333));
                // } else {
                //     grabber = vec3(unwrap((vTexture.x - 0.666) / 0.333), 1.0, unwrap(vTexture.y));
                // }
                //
                // if (vTexture.y < 0.5) grabber = -grabber;
                vec4 resolved = textureCube(uTargetCube, grabber);


                if (uIsDepthTexture == 1) {
                    float depth = tryLinearize(resolved.r);
                    gl_FragColor = vec4(depth, depth, depth, 1.0);

                } else if (uIsDepthColorTexture == 1) {
                    float depth = tryLinearize(vToO(resolved));
                    gl_FragColor = vec4(depth, depth, depth, 1.0);

                } else {
                    gl_FragColor = resolved;
                }

            } else {
                vec4 resolved = texture2D(uTarget2D, vTexture);

                if (uIsDepthTexture == 1) {
                    float depth = tryLinearize(resolved.r);
                    gl_FragColor = vec4(depth, depth, depth, 1.0);

                } else if (uIsDepthColorTexture == 1) {
                    float depth = tryLinearize(vToO(resolved));
                    gl_FragColor = vec4(depth, depth, depth, 1.0);

                } else {
                    gl_FragColor = texture2D(uTarget2D, vTexture);
                }
            }
        }
    `,

    vertex: `
        precision lowp float;
        attribute vec2 aTexture;
        varying vec2 vTexture;

        void main(void) {
            vTexture = aTexture;
            gl_Position = vec4(aTexture * 2.0 - 1.0, 0.0, 1.0);
        }
    `
}


Shaders.MESH_DEPTH_SHADERS = {
    fragment: `
        #extension GL_EXT_frag_depth : enable
        precision lowp float;

        uniform struct {
            vec4 diffuse;
            vec4 specular;
            float opacity;
            float shininess;
        } uMaterial;

        uniform struct {
            sampler2D diffuse;
            float diffuseScaleX;
            float diffuseScaleY;
            float diffuseOffsetX;
            float diffuseOffsetY;
            sampler2D specular;
            float specularScaleX;
            float specularScaleY;
            float specularOffsetX;
            float specularOffsetY;
            int isDiffusePresented;
            int isSpecularPresented;
        } uTexture;

        varying vec2 vTexture;


        vec4 oToV(float o) {
            vec4 v = vec4(0, 0, 0, 0);
            float s = o * 4.0;
            v.x = min(s, 1.0);
            v.y = min(s - v.x, 1.0);
            v.z = min(s - v.y - v.x, 1.0);
            v.w = min(s - v.z - v.y - v.x, 1.0);
            return v;
        }


        void main(void) {
            float alpha = uMaterial.diffuse.a;

            // blend with texture
            if (uTexture.isDiffusePresented == 1) {
                vec2 grabber = vTexture.xy;
                grabber.y = 1.0 - grabber.y;
                grabber.x *= uTexture.diffuseScaleX;
                grabber.y *= uTexture.diffuseScaleY;
                grabber.x += uTexture.diffuseOffsetX;
                grabber.y += uTexture.diffuseOffsetY;
                float newAlpha = texture2D(uTexture.diffuse, grabber).a;
                alpha = min(newAlpha + alpha, 1.0);
            }

            alpha *= uMaterial.opacity;

            if (alpha != 1.0) {
                gl_FragDepthEXT = 1.0;
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            } else {
                gl_FragDepthEXT = gl_FragCoord.z + 0.0001;
                gl_FragColor = oToV(gl_FragDepthEXT);
            }
        }
    `,

    vertex: `
        precision lowp float;

        attribute vec3 aPosition;
        attribute vec2 aTexture;

        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;

        varying vec2 vTexture;

        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            vTexture = aTexture;
        }
    `
}

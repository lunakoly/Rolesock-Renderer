const Shaders = {}


Shaders.TEXTURE_VISUALIZATION_SHADERS = {
    fragment: `
        precision lowp float;

        uniform sampler2D uTarget;
        uniform int uDoLinearization;
        uniform int uIsDepthTexture;

        varying vec2 vTexture;

        void main(void) {
            if (uIsDepthTexture == 1) {
                float depth = texture2D(uTarget, vTexture).r;

                // perspective linearization required
                if (uDoLinearization == 1) {
                    float zNear = 0.1;
                    float zFar = 100.0;
                    depth = (2.0 * zNear) / (zFar + zNear - depth * (zFar - zNear));
                }

                gl_FragColor = vec4(depth, depth, depth, 1.0);

            } else {
                gl_FragColor = texture2D(uTarget, vTexture);
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
                // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            } else {
                gl_FragDepthEXT = gl_FragCoord.z + 0.0001;
                // gl_FragColor = oToV(gl_FragDepthEXT);
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

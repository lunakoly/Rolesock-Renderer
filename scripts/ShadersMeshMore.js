Shaders.MESH_DIFFUSE_POINT_LIGHT_SHADERS = {
    fragment: `
        precision lowp float;

        uniform mat4 uModelMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        uniform mat4 uLightInversedViewMatrix;

        uniform struct {
            vec4 color;
            float radius;
            samplerCube shadowCube;
        } uLight;

        uniform struct {
            vec4 diffuse;
            vec4 specular;
            float opacity;
            float shininess;
        } uMaterial;

        varying vec3 vWorldSpaceLightDirection;
        varying vec3 vNormal;


        float vToO(vec4 v) {
            return (v.x + v.y + v.z + v.w) / 4.0;
        }

        float linearize(float depth) {
            float zNear = 0.1;
            float zFar = 100.0;
            float linearized = (2.0 * zNear) / (zFar + zNear - depth * (zFar - zNear));
            return linearized * (zFar - zNear) + zNear;
        }


        void main(void) {
            vec3 grabber = vWorldSpaceLightDirection;
            grabber.y = -grabber.y;
            float depth = linearize(vToO(textureCube(uLight.shadowCube, grabber)));
            float distance = length(vWorldSpaceLightDirection);

            if (distance <= depth + 0.0004) {
                 // accept light
                float state = max((uLight.radius - distance) / uLight.radius, 0.0);
                vec3 portion = uLight.color.rgb * uLight.color.a * state * dot(vNormal, normalize(-vWorldSpaceLightDirection));
                gl_FragColor = vec4(portion, 1.0);

            } else {
                // in shadow
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        }
    `,

    vertex: `
        precision lowp float;

        attribute vec3 aPosition;
        attribute vec3 aNormal;

        uniform mat4 uModelMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        uniform mat4 uLightViewMatrix;
        uniform mat4 uLightProjectionMatrix;
        uniform mat4 uLightInversedViewMatrix;

        varying vec3 vWorldSpaceLightDirection;
        varying vec3 vNormal;

        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);

            // vec3 worldSpacePosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
            // vec3 worldSpaceLightDirection = (uLightInversedViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
            // vWorldSpaceLightDirection = worldSpacePosition - worldSpaceLightDirection;

            // vec4 worldSpacePosition = uLightProjectionMatrix * uLightViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            // vWorldSpaceLightDirection = worldSpacePosition.xyz / worldSpacePosition.w;

            vWorldSpaceLightDirection = (uLightViewMatrix * uModelMatrix * vec4(aPosition, 1.0)).xyz;
            vNormal = normalize((uModelMatrix * vec4(aNormal, 0.0)).xyz);
        }
    `
}

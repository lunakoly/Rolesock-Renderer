Shaders.DIRECTIONAL_DIFFUSE_LIGHT_SHADERS = {
    fragment: `
        precision lowp float;

        uniform struct {
            vec4 color;
            sampler2D shadow2D;
        } uLight;

        uniform struct {
            vec4 diffuse;
            vec4 specular;
            float opacity;
            float shininess;
        } uMaterial;

        varying vec3 vLightSpacePosition;
        varying vec3 vLightSpaceRawNormal;


        void main(void) {
            float depth = texture2D(uLight.shadow2D, vLightSpacePosition.xy).x;

            if (vLightSpacePosition.z <= depth + 0.0004) {
                // accept light
                vec3 portion = uLight.color.rgb * uLight.color.a * dot(vLightSpaceRawNormal, vec3(0, 0, -1));
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

        varying vec3 vLightSpacePosition;
        varying vec3 vLightSpaceRawNormal;


        void main(void) {
            vec4 worldSpacePosition = uModelMatrix * vec4(aPosition, 1.0);
            gl_Position = uProjectionMatrix * uViewMatrix * worldSpacePosition;

            vec4 lightSpacePosition = uLightProjectionMatrix * uLightViewMatrix * worldSpacePosition;
            lightSpacePosition = lightSpacePosition / lightSpacePosition.w;
            lightSpacePosition = lightSpacePosition * 0.5 + 0.5;
            vLightSpacePosition = lightSpacePosition.xyz;

            vLightSpaceRawNormal = normalize((uLightViewMatrix * uModelMatrix * vec4(aNormal, 0.0)).xyz);
        }
    `
}


Shaders.DIRECTIONAL_SPECULAR_LIGHT_SHADERS = {
    fragment: `
        precision lowp float;

        uniform struct {
            vec4 color;
            sampler2D shadow2D;
        } uLight;

        uniform struct {
            vec4 diffuse;
            vec4 specular;
            float opacity;
            float shininess;
        } uMaterial;

        varying vec3 vPosition;
        varying vec3 vLightSpacePosition;
        varying vec3 vEyeSpaceReflectedRay;


        void main(void) {
            float depth = texture2D(uLight.shadow2D, vLightSpacePosition.xy).x;

            if (vLightSpacePosition.z <= depth + 0.0004) {
                // accept light
                vec3 eyeSpaceEyeRay = normalize(vec3(0.0, 0.0, -1.0) - vPosition);
                float cos = pow(dot(vEyeSpaceReflectedRay, eyeSpaceEyeRay), uMaterial.shininess);
                gl_FragColor = vec4(uLight.color.rgb, uLight.color.a * cos);

            } else {
                // in shadow
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
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

        varying vec3 vPosition;
        varying vec3 vLightSpacePosition;
        varying vec3 vEyeSpaceReflectedRay;


        void main(void) {
            vec4 worldSpacePosition = uModelMatrix * vec4(aPosition, 1.0);
            gl_Position = uProjectionMatrix * uViewMatrix * worldSpacePosition;
            vPosition = gl_Position.xyz;

            vec4 lightSpacePosition = uLightProjectionMatrix * uLightViewMatrix * worldSpacePosition;
            lightSpacePosition = lightSpacePosition / lightSpacePosition.w;
            lightSpacePosition = lightSpacePosition * 0.5 + 0.5;
            vLightSpacePosition = lightSpacePosition.xyz;

            vec4 worldSpaceNormal = uModelMatrix * vec4(aNormal, 0.0);
            vec4 worldSpaceLightDirection = uLightInversedViewMatrix * vec4(0.0, 0.0, 1.0, 0.0);
            vec3 worldSpaceReflectedRay = reflect(
                    normalize(worldSpaceLightDirection.xyz),
                    normalize(worldSpaceNormal.xyz));
            vEyeSpaceReflectedRay = normalize((uViewMatrix * vec4(worldSpaceReflectedRay, 0.0)).xyz);
        }
    `
}

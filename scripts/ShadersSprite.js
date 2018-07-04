Shaders.SPRITE_DIFFUSE_LIGHT_SHADERS = {
    fragment: `
        precision lowp float;

        uniform float uAspect;

        uniform mat4 uTranslationMatrix;
        uniform mat4 uRotationMatrix;
        uniform mat4 uScaleMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uInversedViewMatrix;
        uniform mat4 uInversedProjectionMatrix;

        uniform mat4 uLightViewMatrix;
        uniform mat4 uLightProjectionMatrix;
        uniform mat4 uLightInversedViewMatrix;

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

        varying vec3 vLightSpaceRawPosition;
        varying vec3 vLightSpacePosition;
        varying vec3 vLightSpaceRawNormal;


        void main(void) {
            float depth = texture2D(uLight.shadow2D, vLightSpacePosition.xy).x;

            if (vLightSpacePosition.z <= depth + 0.005) {
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

        attribute vec2 aTexture;

        uniform float uAspect;

        uniform mat4 uTranslationMatrix;
        uniform mat4 uRotationMatrix;
        uniform mat4 uScaleMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uInversedViewMatrix;
        uniform mat4 uInversedProjectionMatrix;

        uniform mat4 uLightViewMatrix;
        uniform mat4 uLightProjectionMatrix;
        uniform mat4 uLightInversedViewMatrix;

        varying vec3 vLightSpaceRawPosition;
        varying vec3 vLightSpacePosition;
        varying vec3 vLightSpaceRawNormal;


        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uTranslationMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            vec2 position = aTexture * 2.0 - 1.0;
            position.x /= uAspect;
            position.y += 1.0;
            gl_Position.xy += (uRotationMatrix * uScaleMatrix * vec4(position.xy, 0.0, 1.0)).xy;

            vec4 worldSpacePosition = uInversedViewMatrix * uInversedProjectionMatrix * gl_Position;

            vec4 lightSpacePosition = uLightProjectionMatrix * uLightViewMatrix * worldSpacePosition;
            lightSpacePosition = lightSpacePosition / lightSpacePosition.w;
            lightSpacePosition = lightSpacePosition * 0.5 + 0.5;
            vLightSpacePosition = lightSpacePosition.xyz;

            vec4 lightSpaceRawPosition = uLightViewMatrix * worldSpacePosition;
            lightSpaceRawPosition = lightSpaceRawPosition / lightSpacePosition.w;
            vLightSpaceRawPosition = lightSpaceRawPosition.xyz;

            vLightSpaceRawNormal = normalize((uLightViewMatrix * uInversedViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz);
        }
    `
}


Shaders.SPRITE_SPECULAR_LIGHT_SHADERS = {
    fragment: `
        precision lowp float;

        uniform float uAspect;

        uniform mat4 uTranslationMatrix;
        uniform mat4 uRotationMatrix;
        uniform mat4 uScaleMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uInversedViewMatrix;
        uniform mat4 uInversedProjectionMatrix;

        uniform mat4 uLightViewMatrix;
        uniform mat4 uLightProjectionMatrix;
        uniform mat4 uLightInversedViewMatrix;

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
        varying vec3 vLightSpaceRawPosition;
        varying vec3 vEyeSpaceReflectedRay;


        void main(void) {
            float depth = texture2D(uLight.shadow2D, vLightSpacePosition.xy).x;

            if (vLightSpacePosition.z <= depth + 0.005) {
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

        attribute vec2 aTexture;

        uniform float uAspect;

        uniform mat4 uTranslationMatrix;
        uniform mat4 uRotationMatrix;
        uniform mat4 uScaleMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uInversedViewMatrix;
        uniform mat4 uInversedProjectionMatrix;

        uniform mat4 uLightViewMatrix;
        uniform mat4 uLightProjectionMatrix;
        uniform mat4 uLightInversedViewMatrix;

        varying vec3 vPosition;
        varying vec3 vLightSpacePosition;
        varying vec3 vLightSpaceRawPosition;
        varying vec3 vEyeSpaceReflectedRay;


        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uTranslationMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            vec2 position = aTexture * 2.0 - 1.0;
            position.x /= uAspect;
            position.y += 1.0;
            gl_Position.xy += (uRotationMatrix * uScaleMatrix * vec4(position.xy, 0.0, 1.0)).xy;
            vPosition = gl_Position.xyz;

            vec4 worldSpacePosition = uInversedViewMatrix * uInversedProjectionMatrix * gl_Position;

            vec4 lightSpacePosition = uLightProjectionMatrix * uLightViewMatrix * worldSpacePosition;
            lightSpacePosition = lightSpacePosition / lightSpacePosition.w;
            lightSpacePosition = lightSpacePosition * 0.5 + 0.5;
            vLightSpacePosition = lightSpacePosition.xyz;

            vec4 lightSpaceRawPosition = uLightViewMatrix * worldSpacePosition;
            lightSpaceRawPosition = lightSpaceRawPosition / lightSpacePosition.w;
            vLightSpaceRawPosition = lightSpaceRawPosition.xyz;

            vec4 worldSpaceNormal = uInversedViewMatrix * vec4(0.0, 0.0, -1.0, 0.0);
            vec4 worldSpaceLightDirection = uLightInversedViewMatrix * vec4(0.0, 0.0, 1.0, 0.0);
            vec3 worldSpaceReflectedRay = reflect(
                    normalize(worldSpaceLightDirection.xyz),
                    normalize(worldSpaceNormal.xyz));
            vEyeSpaceReflectedRay = normalize((uViewMatrix * vec4(worldSpaceReflectedRay, 0.0)).xyz);
        }
    `
}


Shaders.SPRITE_SELF_SHADERS = {
    fragment: `
        precision lowp float;

        uniform float uAspect;

        uniform mat4 uTranslationMatrix;
        uniform mat4 uRotationMatrix;
        uniform mat4 uScaleMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uInversedViewMatrix;
        uniform mat4 uInversedProjectionMatrix;

        uniform sampler2D uLightDiffuseTexture;
        uniform sampler2D uLightSpecularTexture;

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

        varying vec4 vPosition;
        varying vec2 vTexture;


        vec4 blend(vec4 primary, vec4 secondary) {
            vec3 newColor = primary.rgb * primary.a + secondary.rgb * (1.0 - primary.a);
            return vec4(newColor, min(primary.a + secondary.a, 1.0));
        }


        void main(void) {
            // diffuse
            vec4 primary = uMaterial.diffuse;

            // blend with texture
            if (uTexture.isDiffusePresented == 1) {
                vec2 grabber = vTexture.xy;
                grabber.y = 1.0 - grabber.y;
                grabber.x *= uTexture.diffuseScaleX;
                grabber.y *= uTexture.diffuseScaleY;
                grabber.x += uTexture.diffuseOffsetX;
                grabber.y += uTexture.diffuseOffsetY;
                primary = blend(texture2D(uTexture.diffuse, grabber), primary);
            }

            // apply diffuse light
            vec2 screenPosition = vPosition.xy / vPosition.w;
            screenPosition = screenPosition * 0.5 + 0.5;
            primary.rgb *= texture2D(uLightDiffuseTexture, screenPosition).rgb;


            // specular
            vec4 secondary = uMaterial.specular;
            secondary.a *= primary.a;

            // blend with texture
            if (uTexture.isSpecularPresented == 1) {
                vec2 grabber = vTexture.xy;
                grabber.y = 1.0 - grabber.y;
                grabber.x *= uTexture.specularScaleX;
                grabber.y *= uTexture.specularScaleY;
                grabber.x += uTexture.specularOffsetX;
                grabber.y += uTexture.specularOffsetY;
                secondary = blend(texture2D(uTexture.specular, grabber), secondary);
            }

            // apply specular light
            secondary *= texture2D(uLightSpecularTexture, screenPosition);
            primary = blend(secondary, primary);


            // final
            primary.a *= uMaterial.opacity;
            gl_FragColor = primary;
        }
    `,

    vertex: `
        precision lowp float;

        attribute vec2 aTexture;

        uniform float uAspect;

        uniform mat4 uTranslationMatrix;
        uniform mat4 uRotationMatrix;
        uniform mat4 uScaleMatrix;

        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uInversedViewMatrix;
        uniform mat4 uInversedProjectionMatrix;

        varying vec4 vPosition;
        varying vec2 vTexture;


        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uTranslationMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            vec2 position = aTexture * 2.0 - 1.0;
            position.x /= uAspect;
            position.y += 1.0;
            gl_Position.xy += (uRotationMatrix * uScaleMatrix * vec4(position.xy, 0.0, 1.0)).xy;
            vPosition = gl_Position;
            vTexture = aTexture;
        }
    `
}

Shaders.POINT_DIFFUSE_LIGHT_SHADERS = {
    fragment: `
        precision lowp float;

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
                vec3 portion = uLight.color.rgb * uLight.color.a * state * state * dot(vNormal, normalize(-vWorldSpaceLightDirection));
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

        varying vec3 vWorldSpaceLightDirection;
        varying vec3 vNormal;

        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            vWorldSpaceLightDirection = (uLightViewMatrix * uModelMatrix * vec4(aPosition, 1.0)).xyz;
            vNormal = normalize((uModelMatrix * vec4(aNormal, 0.0)).xyz);
        }
    `
}


Shaders.POINT_SPECULAR_LIGHT_SHADERS = {
    fragment: `
        precision lowp float;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uLightViewMatrix;

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

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vPositionRaw;


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
            vec3 worldSpaceLightDirection = (uLightViewMatrix * uModelMatrix * vec4(vPositionRaw, 1.0)).xyz;

            vec3 grabber = worldSpaceLightDirection;
            grabber.y = -grabber.y;
            float depth = linearize(vToO(textureCube(uLight.shadowCube, grabber)));
            float distance = length(worldSpaceLightDirection);

            if (distance <= depth + 0.0004) {
                // accept light

                vec3 worldSpaceReflectedRay = reflect(normalize(worldSpaceLightDirection.xyz), vNormal);
                vec3 eyeSpaceReflectedRay = normalize((uViewMatrix * vec4(worldSpaceReflectedRay, 0.0)).xyz);

                vec3 eyeSpaceEyeRay = normalize(vec3(0.0, 0.0, -1.0) - vPosition);
                float cos = pow(dot(eyeSpaceReflectedRay, eyeSpaceEyeRay), uMaterial.shininess);
                gl_FragColor = vec4(uLight.color.rgb, uLight.color.a * cos);

                // gl_FragColor = vec4(eyeSpaceEyeRay, 1.0);

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

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vPositionRaw;


        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            vPositionRaw = aPosition.xyz;
            vPosition = gl_Position.xyz;
            vNormal = normalize((uModelMatrix * vec4(aNormal, 0.0)).xyz);
        }
    `
}

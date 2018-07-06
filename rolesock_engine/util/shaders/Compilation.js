Shaders.COMPILATION_SHADERS = {
    fragment: `
        precision lowp float;

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

        attribute vec3 aPosition;
        attribute vec2 aTexture;

        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;

        varying vec4 vPosition;
        varying vec2 vTexture;


        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            vPosition = gl_Position;
            vTexture = aTexture;
        }
    `
}

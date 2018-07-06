/**
* Object that encapsulates rendering
*/
const Renderer = {
    initialize() {
        try {
            Renderer.gl = Surface.space.getContext("webgl")
                       || Surface.space.getContext("experimental-webgl")

           Renderer.depthTextureExt = Renderer.gl.getExtension('WEBGL_depth_texture')
           Renderer.drawBuffersExt = Renderer.gl.getExtension('WEBGL_draw_buffers')
           Renderer.fragDepthExt = Renderer.gl.getExtension('EXT_frag_depth')
        } catch (e) {}

        if (!Renderer.gl ||
            !Renderer.depthTextureExt ||
            !Renderer.drawBuffersExt ||
            !Renderer.fragDepthExt) {
            console.error("Renderer: Could not get WebGL context with all of the required extensions")
            return
        }

        Renderer.initializeShaderPrograms()
        Renderer.initSubFramebuffer()
        Renderer.restoreDefaults()
    },

    restoreDefaults() {
        Renderer.gl.cullFace(Renderer.gl.FRONT)

        // used if no data defined for rendering
        Renderer.emptyMatrix = new mat4()
        Renderer.emptyTexture = Texture.color2D().complicate()
        Renderer.emptyCubeTexture = Texture.colorCube(16)
        Renderer.longOrtho = mat4.ortho(Surface.aspect, 0.1, 100).xM(mat4.scale(0.09, 0.09, 1)).xM(mat4.translate(0, 0, 15))
        Renderer.inversedLongOrtho = mat4.translate(0, 0, -15).xM(mat4.scale(1/0.09, 1/0.09, 1)).xM(mat4.inverseOrtho(Surface.aspect, 0.1, 100))
        Renderer.cubeSidePerspective = mat4.perspective(90, 1, 0.1, 100)
        Renderer.inversedCubeSidePerspective = mat4.inversePerspective(90, 1, 0.1, 100)

        // used by visualization mechanism to display screen texture
        Renderer.screenMesh = {
            uvBuffer: Renderer.createArrayBuffer([
                1, 1,
                0, 1,
                1, 0,
                0, 0
            ]),
            orderBuffer: Renderer.createOrderBuffer([
                0, 2, 1,
                1, 2, 3
            ])
        }

        Renderer.setVisualizationTarget(Renderer.colorTexture, 'color', false, Renderer.transparentHelperTexture)
    },

    initializeShaderPrograms() {
        Renderer.initializeShaderProgram(Shaders.TEXTURE_VISUALIZATION_SHADERS)
        Renderer.initializeShaderProgram(Shaders.DEPTH_SHADERS)

        Renderer.initializeShaderProgram(Shaders.COMPILATION_SHADERS)

        Renderer.initializeShaderProgram(Shaders.DIRECTIONAL_DIFFUSE_LIGHT_SHADERS)
        Renderer.initializeShaderProgram(Shaders.DIRECTIONAL_SPECULAR_LIGHT_SHADERS)

        Renderer.initializeShaderProgram(Shaders.POINT_DIFFUSE_LIGHT_SHADERS)
        Renderer.initializeShaderProgram(Shaders.POINT_SPECULAR_LIGHT_SHADERS)
    },

    initializeShaderProgram(shaders) {
        shaders.program = new ShaderProgram(shaders)
    },

    update(dt) {
        Surface.layers.forEach(Renderer.renderScene)
    },

    setClearColor(color) {
        Renderer.gl.clearColor(color[0], color[1], color[2], color[3])
    },

    visualizeTexture(texture, type, doLinearization) {
        Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, null)
        Renderer.gl.viewport(0, 0, Surface.space.clientWidth, Surface.space.clientHeight)
        Renderer.gl.clearColor(0, 0, 0, 1)
        Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT)
        Renderer.gl.blendFunc(Renderer.gl.ONE, Renderer.gl.ONE)

        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.use()
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setAttribute(Renderer.screenMesh.uvBuffer, 2, 'aTexture')

        if (type == 'color') {
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setCubeMap(Renderer.emptyCubeTexture.texture, Renderer.gl.TEXTURE1, 1, 'uTargetCube')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setRawTexture(texture.texture, Renderer.gl.TEXTURE0, 0, 'uTarget2D')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthColorTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsCubeTexture')
        } else if (type == 'depth') {
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setCubeMap(Renderer.emptyCubeTexture.texture, Renderer.gl.TEXTURE1, 1, 'uTargetCube')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setRawTexture(texture.texture, Renderer.gl.TEXTURE0, 0, 'uTarget2D')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthColorTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(1, 'uIsDepthTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsCubeTexture')
        } else if (type == 'color_cube') {
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setCubeMap(texture.texture, Renderer.gl.TEXTURE1, 1, 'uTargetCube')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setRawTexture(Renderer.emptyTexture.texture, Renderer.gl.TEXTURE0, 0, 'uTarget2D')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthColorTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(1, 'uIsCubeTexture')
        } else if (type == 'depth_color_cube') {
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setCubeMap(texture.texture, Renderer.gl.TEXTURE1, 1, 'uTargetCube')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setRawTexture(Renderer.emptyTexture.texture, Renderer.gl.TEXTURE0, 0, 'uTarget2D')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(1, 'uIsDepthColorTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthTexture')
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(1, 'uIsCubeTexture')
        }

        if (doLinearization)
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(1, 'uDoLinearization')
        else
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uDoLinearization')

        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.drawElements(Renderer.screenMesh.orderBuffer, 6)
    },

    continueColorVisualization(texture) {
        Renderer.gl.blendFunc(Renderer.gl.ONE, Renderer.gl.ONE_MINUS_SRC_ALPHA)
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setCubeMap(Renderer.emptyCubeTexture.texture, Renderer.gl.TEXTURE1, 1, 'uTargetCube')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setRawTexture(texture.texture, Renderer.gl.TEXTURE0, 0, 'uTarget2D')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthColorTexture')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsDepthTexture')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uIsCubeTexture')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uDoLinearization')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.drawElements(Renderer.screenMesh.orderBuffer, 6)
    },

    setVisualizationTarget(texture, type, doLinearization, postVisualizationTexture) {
        Renderer.visualizationTarget = {
            type: type,
            texture: texture,
            doLinearization: doLinearization,
            postVisualizationTexture: postVisualizationTexture
        }
    },

    prepareFramebufferForDepthTesting() {
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.NONE])
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, null, 0)

        Renderer.gl.disable(Renderer.gl.BLEND)

        Renderer.gl.enable(Renderer.gl.DEPTH_TEST)
        Renderer.gl.depthFunc(Renderer.gl.LEQUAL)
        Renderer.gl.depthMask(true)
    },

    prepareFramebufferForDepthColorTesting() {
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.COLOR_ATTACHMENT0])
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, null, 0)
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, Renderer.gl.TEXTURE_2D, null, 0)
        Renderer.gl.clearColor(1, 1, 1, 1)

        Renderer.gl.disable(Renderer.gl.BLEND)

        Renderer.gl.enable(Renderer.gl.DEPTH_TEST)
        Renderer.gl.depthFunc(Renderer.gl.LEQUAL)
        Renderer.gl.depthMask(true)
    },

    prepareFramebufferForColorRendering() {
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.COLOR_ATTACHMENT0])
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, Renderer.gl.TEXTURE_2D, Renderer.depthTexture.texture, 0)

        Renderer.gl.enable(Renderer.gl.BLEND)
        Renderer.gl.enable(Renderer.gl.CULL_FACE)

        Renderer.gl.enable(Renderer.gl.DEPTH_TEST)
        Renderer.gl.depthFunc(Renderer.gl.LEQUAL)
        Renderer.gl.depthMask(false)

        Renderer.gl.viewport(0, 0, Surface.space.clientWidth, Surface.space.clientHeight)
        Renderer.gl.clearColor(0, 0, 0, 0)

        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.colorTexture.texture, 0)
        Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT)
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.transparentHelperTexture.texture, 0)
        Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT)
    },

    prepareClearLightImpactTexture(texture, color) {
        Renderer.setClearColor(color)
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, texture.texture, 0)
        Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT)
    },

    renderScene(scene) {
        // we use subFramebuffer for all the off-screen rendering
        Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, Renderer.subFramebuffer)

        // common camera eye data
        const options = {}

        if (scene.camera) {
            options.viewMatrix = scene.camera.getInversedModel()
            options.projectionMatrix = scene.camera.projection
            options.inversedViewMatrix = scene.camera.getModel()
            options.inversedProjectionMatrix = scene.camera.inversedProjection
        } else {
            options.viewMatrix = Renderer.emptyMatrix
            options.projectionMatrix = Renderer.longOrtho
            options.inversedViewMatrix = Renderer.emptyMatrix
            options.inversedProjectionMatrix = Renderer.inversedLongOrtho
        }


        // render light shadow maps
        Renderer.prepareFramebufferForDepthTesting()

        // render common scene depth
        Shaders.DEPTH_SHADERS.program.ensureUsage(options)
        Renderer.gl.enable(Renderer.gl.CULL_FACE)
        Renderer.renderToDepthTexture(Renderer.gl.TEXTURE_2D, Renderer.depthTexture, scene, Shaders.DEPTH_SHADERS.program)
        Renderer.gl.disable(Renderer.gl.CULL_FACE)
        // throw new Error('STOP')

        // Render light depth textures for meshes
        scene.container.directionalLightSources.forEach(light => Renderer.renderShadowMapForDirectionalLight(scene, light))


        // render depth-color cubemaps for point lights
        Renderer.prepareFramebufferForDepthColorTesting()
        scene.container.pointLightSources.forEach(light => Renderer.renderShadowMapForPointLight(scene, light))


        // Render light textures and final color one
        Renderer.prepareFramebufferForColorRendering()

        // Render common temporary light textures for opaques
        // + render objects to final color texture
        // console.log('RUN');
        scene.forEachOpaque((it, parentModelMatrix) =>
                Renderer.renderObject(scene, it, parentModelMatrix, options, false))
        // console.log('STEP');
        // for transparent
        scene.forEachTransparent((it, parentModelMatrix) =>
                Renderer.renderObject(scene, it, parentModelMatrix, options, true))


        // print out to screen
        Renderer.visualizeTexture(
                Renderer.visualizationTarget.texture,
                Renderer.visualizationTarget.type,
                Renderer.visualizationTarget.doLinearization)

        if (Renderer.visualizationTarget.postVisualizationTexture)
            Renderer.continueColorVisualization(Renderer.visualizationTarget.postVisualizationTexture)

        // throw new Error('STOP')
    },

    renderShadowMapForDirectionalLight(scene, light) {
        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(Renderer.longOrtho, 'uProjectionMatrix')
        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(light.getInversedModel(), 'uViewMatrix')
        Renderer.renderToDepthTexture(Renderer.gl.TEXTURE_2D, light.shadowMap, scene, Shaders.DEPTH_SHADERS.program)
    },

    renderToDepthTexture(slot, texture, scene, prog) {
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, slot, texture.texture, 0)
        Renderer.gl.viewport(0, 0, texture.width, texture.height)
        Renderer.gl.clear(Renderer.gl.DEPTH_BUFFER_BIT)

        scene.forEachOpaque((it, parentModelMatrix) => {
            it.draw(prog, parentModelMatrix, 'shape')
        })
    },

    renderShadowMapForPointLight(scene, light) {
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, Renderer.gl.TEXTURE_2D, light.shadowMapHelper.texture, 0)

        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(Renderer.cubeSidePerspective, 'uProjectionMatrix')
        const viewMatrix = light.getInversedModel()

        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(viewMatrix, 'uViewMatrix')
        Renderer.renderToColorTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, light.shadowMap, scene, Shaders.DEPTH_SHADERS.program, light.holder)
        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(-90, 0, 0).xM(viewMatrix), 'uViewMatrix')
        Renderer.renderToColorTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, light.shadowMap, scene, Shaders.DEPTH_SHADERS.program, light.holder)
        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(180, 0, 0).xM(viewMatrix), 'uViewMatrix')
        Renderer.renderToColorTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, light.shadowMap, scene, Shaders.DEPTH_SHADERS.program, light.holder)
        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(90, 0, 0).xM(viewMatrix), 'uViewMatrix')
        Renderer.renderToColorTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_X, light.shadowMap, scene, Shaders.DEPTH_SHADERS.program, light.holder)
        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(0, -90, 0).xM(viewMatrix), 'uViewMatrix')
        Renderer.renderToColorTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, light.shadowMap, scene, Shaders.DEPTH_SHADERS.program, light.holder)
        Shaders.DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(0, 90, 0).xM(viewMatrix), 'uViewMatrix')
        Renderer.renderToColorTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, light.shadowMap, scene, Shaders.DEPTH_SHADERS.program, light.holder)
    },

    renderToColorTexture(slot, texture, scene, prog, excludeObject) {
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, slot, texture.texture, 0)
        Renderer.gl.viewport(0, 0, texture.width, texture.height)
        Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT | Renderer.gl.DEPTH_BUFFER_BIT)

        scene.forEachOpaque((it, parentModelMatrix) => {
            if (excludeObject != it)
                it.draw(prog, parentModelMatrix, 'shape')
        })
    },

    renderObject(scene, obj, parentModelMatrix, options, isObjectFullyTransparent) {
        Renderer.gl.blendFunc(Renderer.gl.ONE, Renderer.gl.ONE)

        // for optimization
        if (obj.light) {
            Renderer.prepareClearLightImpactTexture(Renderer.diffuseLightTexture, obj.light.color)
            Renderer.prepareClearLightImpactTexture(Renderer.specularLightTexture, [0, 0, 0, 0])

        } else {
            // diffuse
            Renderer.prepareClearLightImpactTexture(Renderer.diffuseLightTexture, scene.environment.ambient)
            const diffLightProg = Shaders.DIRECTIONAL_DIFFUSE_LIGHT_SHADERS.program
            diffLightProg.ensureUsage(options)

            // render light impact
            scene.forEachDirectionalLight(light => Renderer.renderImpactForDirectionalLight(light, obj, parentModelMatrix, diffLightProg, options))


            const diffPointLightProg = Shaders.POINT_DIFFUSE_LIGHT_SHADERS.program
            diffPointLightProg.ensureUsage(options)
            // render light impact
            scene.forEachPointLight(light => Renderer.renderImpactForPointLight(light, obj, parentModelMatrix, diffPointLightProg, options))


            // specular
            Renderer.prepareClearLightImpactTexture(Renderer.specularLightTexture, [0, 0, 0, 0])
            const specLightProg = Shaders.DIRECTIONAL_SPECULAR_LIGHT_SHADERS.program
            specLightProg.ensureUsage(options)

            // render light impact
            scene.forEachDirectionalLight(light => Renderer.renderImpactForDirectionalLight(light, obj, parentModelMatrix, specLightProg, options))


            const specPointLightProg = Shaders.POINT_SPECULAR_LIGHT_SHADERS.program
            specPointLightProg.ensureUsage(options)
            // render light impact
            scene.forEachPointLight(light => Renderer.renderImpactForPointLight(light, obj, parentModelMatrix, specPointLightProg, options))
        }


        // summary
        const selfProg = Shaders.COMPILATION_SHADERS.program
        selfProg.ensureUsage(options)
        selfProg.setRawTexture(Renderer.diffuseLightTexture.texture, Renderer.gl.TEXTURE2, 2, 'uLightDiffuseTexture')
        selfProg.setRawTexture(Renderer.specularLightTexture.texture, Renderer.gl.TEXTURE3, 3, 'uLightSpecularTexture')
        Renderer.gl.blendFunc(Renderer.gl.SRC_ALPHA, Renderer.gl.ONE_MINUS_SRC_ALPHA)

        if (!isObjectFullyTransparent) {
            Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.colorTexture.texture, 0)
            selfProg.setUniform1i(1, 'uIsRenderingOpaque')
            obj.draw(selfProg, parentModelMatrix, 'self')
        }

        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.transparentHelperTexture.texture, 0)
        selfProg.setUniform1i(0, 'uIsRenderingOpaque')
        obj.draw(selfProg, parentModelMatrix, 'self')
    },

    renderImpactForDirectionalLight(light, obj, parentModelMatrix, prog, options) {
        prog.setUniformMatrix4fv(light.getModel(), 'uLightInversedViewMatrix')
        prog.setUniformMatrix4fv(light.getInversedModel(), 'uLightViewMatrix')
        prog.setVec4(light.color, 'uLight.color')

        prog.setRawTexture(light.shadowMap.texture, Renderer.gl.TEXTURE0, 0, 'uLight.shadow2D')
        prog.setUniformMatrix4fv(Renderer.longOrtho, 'uLightProjectionMatrix')
        obj.draw(prog, parentModelMatrix, 'light')
    },

    renderImpactForPointLight(light, obj, parentModelMatrix, prog, options) {
        prog.setUniformMatrix4fv(Renderer.cubeSidePerspective, 'uLightProjectionMatrix')
        prog.setUniformMatrix4fv(light.getInversedModel(), 'uLightViewMatrix')
        prog.setUniformMatrix4fv(light.getModel(), 'uLightInversedViewMatrix')
        prog.setUniform1f(light.radius, 'uLight.radius')
        prog.setVec4(light.color, 'uLight.color')

        prog.setCubeMap(light.shadowMap.texture, Renderer.gl.TEXTURE0, 0, 'uLight.shadowCube')
        obj.draw(prog, parentModelMatrix, 'light')
    },

    updateViewport() {
        Renderer.gl.viewport(0, 0, Surface.space.clientWidth, Surface.space.clientHeight)
        Renderer.subFramebuffer.height = Surface.space.clientHeight
        Renderer.subFramebuffer.width = Surface.space.clientWidth
        Renderer.depthTexture.make().scaleToScreen().beDepth2D()
        Renderer.colorTexture.make().scaleToScreen().beColor2D()
        Renderer.diffuseLightTexture.make().scaleToScreen().beColor2D()
        Renderer.specularLightTexture.make().scaleToScreen().beColor2D().unbind()
    },

    createArrayBuffer(data) {
        const buffer = Renderer.gl.createBuffer()
        Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, buffer)
        Renderer.gl.bufferData(Renderer.gl.ARRAY_BUFFER,
                new Float32Array(data), Renderer.gl.STATIC_DRAW)
        return buffer
    },

    createOrderBuffer(data) {
        const buffer = Renderer.gl.createBuffer()
        Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, buffer)
        Renderer.gl.bufferData(Renderer.gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(data), Renderer.gl.STATIC_DRAW)
        return buffer
    },

    initSubFramebuffer() {
        // DEPTH FRAMEBUFFER WITH NO DEPTH TEXTURE YET
        Renderer.subFramebuffer = Renderer.gl.createFramebuffer()
        Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, Renderer.subFramebuffer)
        Renderer.subFramebuffer.height = Surface.space.clientHeight
        Renderer.subFramebuffer.width = Surface.space.clientWidth
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.NONE])

        // SCENE COMMON DEPTH TEXTURE
        Renderer.depthTexture = Texture.screenDepth()
        // SCENE RESULT COLOR TEXTURE
        Renderer.colorTexture = Texture.screenColor()
        // SCENE RESULT COLOR TEXTURE FOR TRANSPARENT
        Renderer.transparentHelperTexture = Texture.screenColor()
        // TEMPORARY DIFFUSE LIGHT TEXTURE
        Renderer.diffuseLightTexture = Texture.screenColor()
        // TEMPORARY SPECULAR LIGHT TEXTURE
        Renderer.specularLightTexture = Texture.screenColor()
    }
}

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
        Renderer.longOrtho = mat4.ortho(Surface.aspect, 0.1, 100).xM(mat4.scale(0.09, 0.09, 1)).xM(mat4.translate(0, 0, 15))
        Renderer.inversedLongOrtho = mat4.translate(0, 0, -15).xM(mat4.scale(1/0.09, 1/0.09, 1)).xM(mat4.inverseOrtho(Surface.aspect, 0.1, 100))

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

        Renderer.setVisualizationTarget(Renderer.colorTexture, false, false)
    },

    setClearColor(color) {
        Renderer.gl.clearColor(color[0], color[1], color[2], color[3])
    },

    initializeShaderPrograms() {
        Renderer.initializeShaderProgram(Shaders.TEXTURE_VISUALIZATION_SHADERS)

        Renderer.initializeShaderProgram(Shaders.MESH_SELF_SHADERS)
        Renderer.initializeShaderProgram(Shaders.MESH_DEPTH_SHADERS)
        Renderer.initializeShaderProgram(Shaders.MESH_DIFFUSE_LIGHT_SHADERS)
        Renderer.initializeShaderProgram(Shaders.MESH_SPECULAR_LIGHT_SHADERS)
    },

    initializeShaderProgram(shaders) {
        shaders.program = new ShaderProgram(shaders)
    },

    update(dt) {
        Surface.layers.forEach(Renderer.renderScene)
    },

    visualizeTexture(texture, isDepthTexture, doLinearization) {
        Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, null)
        Renderer.gl.viewport(0, 0, Surface.space.clientWidth, Surface.space.clientHeight)
        Renderer.gl.clearColor(0, 0, 0, 1)
        Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT)

        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.use()
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setAttribute(Renderer.screenMesh.uvBuffer, 2, 'aTexture')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setRawTexture(texture.texture, Renderer.gl.TEXTURE0, 0, 'uTarget')
        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(isDepthTexture ? 1 : 0, 'uIsDepthTexture')

        if (doLinearization)
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(0, 'uDoLinearization')
        else
            Shaders.TEXTURE_VISUALIZATION_SHADERS.program.setUniform1i(1, 'uDoLinearization')

        Shaders.TEXTURE_VISUALIZATION_SHADERS.program.drawElements(Renderer.screenMesh.orderBuffer, 6)
    },

    setVisualizationTarget(texture, isDepthTexture, doLinearization) {
        Renderer.visualizationTarget = {
            texture: texture,
            isDepthTexture: isDepthTexture,
            doLinearization: doLinearization
        }
    },

    prepareFramebufferForDepthTesting() {
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.NONE])
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, null, 0)

        Renderer.gl.disable(Renderer.gl.BLEND)
        Renderer.gl.disable(Renderer.gl.CULL_FACE)

        Renderer.gl.enable(Renderer.gl.DEPTH_TEST)
        Renderer.gl.depthFunc(Renderer.gl.LEQUAL)
        Renderer.gl.depthMask(true)
    },

    prepareFramebufferForColorRendering() {
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.COLOR_ATTACHMENT0])
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, Renderer.gl.TEXTURE_2D, Renderer.depthTexture.texture, 0)
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.colorTexture.texture, 0)

        Renderer.gl.enable(Renderer.gl.BLEND)
        Renderer.gl.enable(Renderer.gl.CULL_FACE)

        Renderer.gl.enable(Renderer.gl.DEPTH_TEST)
        Renderer.gl.depthFunc(Renderer.gl.LEQUAL)
        Renderer.gl.depthMask(false)

        Renderer.gl.viewport(0, 0, Surface.space.clientWidth, Surface.space.clientHeight)
        Renderer.gl.clearColor(0, 0, 0, 0)
        Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT | Renderer.gl.DEPTH_BUFFER_BIT)
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
            options.viewMatrix = scene.camera.model.inversed()
            options.projectionMatrix = scene.camera.projection
            options.inversedViewMatrix = scene.camera.model.total()
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
        Shaders.MESH_DEPTH_SHADERS.program.ensureUsage(options)
        Renderer.renderToDepthTexture(Renderer.gl.TEXTURE_2D, Renderer.depthTexture, scene, Shaders.MESH_DEPTH_SHADERS.program)

        // Render light depth textures for meshes
        scene.container.directionalLightSources.forEach(light => Renderer.renderShadowMapForDirectionalLight(scene, light))


        // Render light textures and final color one
        Renderer.prepareFramebufferForColorRendering()

        // Render common temporary light textures for opaques
        // + render objects to final color texture
        scene.forEachOpaque((it, parentModelMatrix) =>
                Renderer.renderObject(scene, it, parentModelMatrix, options))
        // for transparent
        scene.forEachTransparent((it, parentModelMatrix) =>
                Renderer.renderObject(scene, it, parentModelMatrix, options))


        // print out to screen
        Renderer.visualizeTexture(
                Renderer.visualizationTarget.texture,
                Renderer.visualizationTarget.isDepthTexture,
                Renderer.visualizationTarget.doLinearization)

        // throw new Error('STOP')
    },

    renderShadowMapForDirectionalLight(scene, light) {
        Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(Renderer.longOrtho, 'uProjectionMatrix')
        Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(light.model.inversed(), 'uViewMatrix')
        Renderer.renderToDepthTexture(Renderer.gl.TEXTURE_2D, light.shadowMap, scene, Shaders.MESH_DEPTH_SHADERS.program)
    },

    renderToDepthTexture(slot, texture, scene, prog) {
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, slot, texture.texture, 0)
        Renderer.gl.viewport(0, 0, texture.width, texture.height)
        Renderer.gl.clear(Renderer.gl.DEPTH_BUFFER_BIT)

        scene.forEachOpaque((it, parentModelMatrix) => {
            it.draw(prog, parentModelMatrix, 'shape')
        })
    },

    renderObject(scene, obj, parentModelMatrix, options) {
        Renderer.gl.blendFunc(Renderer.gl.ONE, Renderer.gl.ONE)

        // diffuse
        Renderer.prepareClearLightImpactTexture(Renderer.diffuseLightTexture, scene.environment.ambient)
        const diffLightProg = obj.diffuseLightShaderProgram.program
        diffLightProg.ensureUsage(options)

        // render light impact
        scene.forEachDirectionalLight(light => Renderer.renderImpactForDirectionalLight(light, obj, parentModelMatrix, diffLightProg, options))


        // specular
        Renderer.prepareClearLightImpactTexture(Renderer.specularLightTexture, [0, 0, 0, 0])
        const specLightProg = obj.specularLightShaderProgram.program
        specLightProg.ensureUsage(options)

        // render light impact
        scene.forEachDirectionalLight(light => Renderer.renderImpactForDirectionalLight(light, obj, parentModelMatrix, specLightProg, options))


        // summary
        Renderer.gl.blendFunc(Renderer.gl.SRC_ALPHA, Renderer.gl.ONE_MINUS_SRC_ALPHA)
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.colorTexture.texture, 0)

        const selfProg = obj.selfShaderProgram.program
        selfProg.ensureUsage(options)
        selfProg.setRawTexture(Renderer.diffuseLightTexture.texture, Renderer.gl.TEXTURE2, 2, 'uLightDiffuseTexture')
        selfProg.setRawTexture(Renderer.specularLightTexture.texture, Renderer.gl.TEXTURE3, 3, 'uLightSpecularTexture')

        obj.draw(selfProg, parentModelMatrix, 'self')
    },

    renderImpactForDirectionalLight(light, obj, parentModelMatrix, prog, options) {
        prog.setUniformMatrix4fv(light.model.total(), 'uLightInversedViewMatrix')
        prog.setUniformMatrix4fv(light.model.inversed(), 'uLightViewMatrix')
        prog.setVec4(light.color, 'uLight.color')

        prog.setRawTexture(light.shadowMap.texture, Renderer.gl.TEXTURE0, 0, 'uLight.shadow2D')
        prog.setUniformMatrix4fv(Renderer.longOrtho, 'uLightProjectionMatrix')
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
        // Renderer.depthTexture = Texture.depth2D()
        Renderer.depthTexture = Texture.screenDepth()
        // SCENE RESULT COLOR TEXTURE
        Renderer.colorTexture = Texture.screenColor()
        // TEMPORARY DIFFUSE LIGHT TEXTURE
        Renderer.diffuseLightTexture = Texture.screenColor()
        // TEMPORARY SPECULAR LIGHT TEXTURE
        Renderer.specularLightTexture = Texture.screenColor()
    }
}

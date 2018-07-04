const Renderer = {
    initialize() {
        try {
            Renderer.gl = Surface.space.getContext("webgl")
                       || Surface.space.getContext("experimental-webgl")
        } catch (e) {}

        if (!Renderer.gl) {
            console.error("Renderer: Could not get WebGL context")
            return
        }

        Renderer.depthTextureExt = Renderer.gl.getExtension('WEBGL_depth_texture')
        Renderer.drawBuffersExt = Renderer.gl.getExtension('WEBGL_draw_buffers')
        Renderer.fragDepthExt = Renderer.gl.getExtension('EXT_frag_depth')
        Renderer.initSubFramebuffer()

        Renderer.restoreDefaults()
        Renderer.initializeShaderPrograms()
    },

    restoreDefaults() {
        Renderer.gl.enable(Renderer.gl.CULL_FACE)
        Renderer.gl.cullFace(Renderer.gl.FRONT)

        // used if no data defined for rendering
        Renderer.emptyCubeMap = Texture.colorCube()
        Renderer.emptyTexture = Texture.color2D().complicate()
        Renderer.emptyMatrix = new mat4()
        Renderer.longOrtho = mat4.ortho(Surface.aspect, 0.1, 100).xM(mat4.scale(0.09, 0.09, 1)).xM(mat4.translate(0, 0, 15))
        Renderer.inverseLongOrtho = mat4.translate(0, 0, -15).xM(mat4.scale(1/0.09, 1/0.09, 1)).xM(mat4.inverseOrtho(Surface.aspect, 0.1, 100))

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
        Shaders.MESH_DEPTH_SHADERS.program = new ShaderProgram(Shaders.MESH_DEPTH_SHADERS)
        Shaders.SPRITE_DEPTH_SHADERS.program = new ShaderProgram(Shaders.SPRITE_DEPTH_SHADERS)

        Shaders.MESH_SELF_SHADERS.program = new ShaderProgram(Shaders.MESH_SELF_SHADERS)
        Shaders.MESH_DIFFUSE_LIGHT_SHADERS.program = new ShaderProgram(Shaders.MESH_DIFFUSE_LIGHT_SHADERS)
        Shaders.MESH_SPECULAR_LIGHT_SHADERS.program = new ShaderProgram(Shaders.MESH_SPECULAR_LIGHT_SHADERS)

        Shaders.SPRITE_SELF_SHADERS.program = new ShaderProgram(Shaders.SPRITE_SELF_SHADERS)
        Shaders.SPRITE_DIFFUSE_LIGHT_SHADERS.program = new ShaderProgram(Shaders.SPRITE_DIFFUSE_LIGHT_SHADERS)
        Shaders.SPRITE_SPECULAR_LIGHT_SHADERS.program = new ShaderProgram(Shaders.SPRITE_SPECULAR_LIGHT_SHADERS)

        Shaders.TEXTURE_VISUALIZATION_SHADERS.program = new ShaderProgram(Shaders.TEXTURE_VISUALIZATION_SHADERS)

        Shaders.MESH_SELF_SHADERS.program.use()
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

    prepareFramebufferForMeshDepthTesting() {
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.NONE])
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, null, 0)

        Renderer.gl.disable(Renderer.gl.BLEND)

        Renderer.gl.enable(Renderer.gl.DEPTH_TEST)
        Renderer.gl.depthFunc(Renderer.gl.LEQUAL)
        Renderer.gl.depthMask(true)
    },

    prepareFramebufferForColorRendering() {
        Renderer.drawBuffersExt.drawBuffersWEBGL([Renderer.gl.COLOR_ATTACHMENT0])
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, Renderer.gl.TEXTURE_2D, Renderer.depthTexture.texture, 0)
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.colorTexture.texture, 0)

        Renderer.gl.enable(Renderer.gl.BLEND)

        Renderer.gl.enable(Renderer.gl.DEPTH_TEST)
        Renderer.gl.depthFunc(Renderer.gl.LEQUAL)

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
            options.viewMatrix = scene.camera.model.total()
            options.projectionMatrix = scene.camera.projection
            options.inversedViewMatrix = scene.camera.model.inversed()
            options.inversedProjectionMatrix = scene.camera.inverseProjection
        } else {
            options.viewMatrix = Renderer.emptyMatrix
            options.projectionMatrix = Renderer.longOrtho
            options.inversedViewMatrix = Renderer.emptyMatrix
            options.inversedProjectionMatrix = Renderer.inverseLongOrtho
        }


        // render light shadow maps
        Renderer.prepareFramebufferForMeshDepthTesting()

        // Render depth textures for meshes
        Shaders.MESH_DEPTH_SHADERS.program.ensureUsage(options)
        scene.container.lightSources.forEach(light => Renderer.renderMeshesShadowMapForLight(scene, light))

        // Render depth textures for sprites
        Renderer.gl.disable(Renderer.gl.CULL_FACE)
        Shaders.SPRITE_DEPTH_SHADERS.program.ensureUsage(options)
        scene.container.lightSources.forEach(light => Renderer.renderSpritesShadowMapForLight(scene, light))
        Renderer.gl.enable(Renderer.gl.CULL_FACE)


        // Renderer.visualizeTexture(scene.environment.sun.shadowMap, true, true)
        // throw new Error('STOP')
        // return


        // Render light textures and final color one
        Renderer.prepareFramebufferForColorRendering()

        // Render common temporary light textures for opaques
        // + render objects to final color texture
        scene.container.forEachOpaque(it => Renderer.renderObject(scene, it, options))
        Renderer.gl.depthMask(false)
        // for transparent
        scene.container.forEachTransparent(it => Renderer.renderObject(scene, it, options))
        // for sprites
        scene.container.forEachSprite(it => Renderer.renderObject(scene, it, options))


        // print out to screen
        Renderer.visualizeTexture(
                Renderer.visualizationTarget.texture,
                Renderer.visualizationTarget.isDepthTexture,
                Renderer.visualizationTarget.doLinearization)

        // throw new Error('STOP')
    },

    renderMeshesShadowMapForLight(scene, light) {
        const lightView = light.model.total()

        if (light.type == 'directional') {
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(Renderer.longOrtho, 'uProjectionMatrix')
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(lightView, 'uViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_2D, light.shadowMap, scene)

        } else if (light.type == 'spot') {
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(
                    mat4.perspective(90, Surface.aspect, 0.01, light.radius), 'uProjectionMatrix')

            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(lightView, 'uViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, light.shadowMap, scene)
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(90, 0, 0) * lightView, 'uViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, light.shadowMap, scene)
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(180, 0, 0) * lightView, 'uViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, light.shadowMap, scene)
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(-90, 0, 0) * lightView, 'uViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_X, light.shadowMap, scene)
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(0, 90, 0) * lightView, 'uViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, light.shadowMap, scene)
            Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(0, -90, 0) * lightView, 'uViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, light.shadowMap, scene)
        }
    },

    renderMeshesToDepthTexture(slot, texture, scene, condition) {
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, slot, texture.texture, 0)
        Renderer.gl.viewport(0, 0, texture.width, texture.height)
        Renderer.gl.clear(Renderer.gl.DEPTH_BUFFER_BIT)

        scene.container.forEachOpaque(it => {
            it.drawShape(Renderer.emptyMatrix)
        })
    },

    renderSpritesShadowMapForLight(scene, light) {
        const lightView = light.model.total()

        if (light.type == 'directional') {
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(Renderer.longOrtho, 'uLightProjectionMatrix')
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(lightView, 'uLightViewMatrix')
            Renderer.renderSpritesToDepthTexture(Renderer.gl.TEXTURE_2D, light.shadowMap, scene)

        } else if (light.type == 'spot') {
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(
                    mat4.perspective(90, Surface.aspect, 0.01, light.radius), 'uLightProjectionMatrix')

            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(lightView, 'uLightViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, light.shadowMap, scene)
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(90, 0, 0) * lightView, 'uLightViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, light.shadowMap, scene)
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(180, 0, 0) * lightView, 'uLightViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, light.shadowMap, scene)
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(-90, 0, 0) * lightView, 'uLightViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_X, light.shadowMap, scene)
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(0, 90, 0) * lightView, 'uLightViewMatrix')
            Renderer.renderMeshesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, light.shadowMap, scene)
            Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(mat4.rotate(0, -90, 0) * lightView, 'uLightViewMatrix')
            Renderer.renderSpritesToDepthTexture(Renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, light.shadowMap, scene)
        }
    },

    renderSpritesToDepthTexture(slot, texture, scene, condition) {
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.DEPTH_ATTACHMENT, slot, texture.texture, 0)
        Renderer.gl.viewport(0, 0, texture.width, texture.height)
        // no need to clear because this is run after meshes rendering

        scene.container.forEachSprite(it => {
            it.drawShape(Renderer.emptyMatrix)
        })
    },

    renderObject(scene, obj, options) {
        Renderer.gl.blendFunc(Renderer.gl.ONE, Renderer.gl.ONE)

        // diffuse
        Renderer.prepareClearLightImpactTexture(Renderer.diffuseLightTexture, scene.environment.ambient)
        const diffLightProg = obj.diffuseLightShaderProgram.program
        diffLightProg.ensureUsage(options)

        // render light impact
        scene.container.forEachLight(light => Renderer.renderImpactForLight(light, obj, diffLightProg, options))


        // specular
        Renderer.prepareClearLightImpactTexture(Renderer.specularLightTexture, [0, 0, 0, 0])
        const specLightProg = obj.specularLightShaderProgram.program
        specLightProg.ensureUsage(options)

        // render light impact
        scene.container.forEachLight(light => Renderer.renderImpactForLight(light, obj, specLightProg, options))


        // summary
        Renderer.gl.blendFunc(Renderer.gl.SRC_ALPHA, Renderer.gl.ONE_MINUS_SRC_ALPHA)
        Renderer.gl.framebufferTexture2D(Renderer.gl.FRAMEBUFFER, Renderer.gl.COLOR_ATTACHMENT0, Renderer.gl.TEXTURE_2D, Renderer.colorTexture.texture, 0)

        const selfProg = obj.selfShaderProgram.program
        selfProg.ensureUsage(options)
        selfProg.setRawTexture(Renderer.diffuseLightTexture.texture, Renderer.gl.TEXTURE2, 2, 'uLightDiffuseTexture')
        selfProg.setRawTexture(Renderer.specularLightTexture.texture, Renderer.gl.TEXTURE3, 3, 'uLightSpecularTexture')

        obj.drawSelf(Renderer.emptyMatrix)
    },

    renderImpactForLight(light, obj, prog, options) {
        prog.setUniformMatrix4fv(light.model.inversed(), 'uLightInversedViewMatrix')
        prog.setUniformMatrix4fv(light.model.total(), 'uLightViewMatrix')
        prog.setUniform1f(light.radius, 'uLight.radius')
        prog.setVec4(light.color, 'uLight.color')

        if (light.type == 'directional') {
            prog.setRawTexture(light.shadowMap.texture, Renderer.gl.TEXTURE0, 0, 'uLight.shadow2D')
            prog.setCubeMap(Renderer.emptyCubeMap.texture, Renderer.gl.TEXTURE1, 1, 'uLight.shadowCube')
            prog.setUniformMatrix4fv(Renderer.longOrtho, 'uLightProjectionMatrix')
            prog.setUniform1i(0, 'uLight.type')
            obj.drawLight(prog, Renderer.emptyMatrix)

        } else if (light.type == 'spot') {
            prog.setRawTexture(Renderer.emptyTexture.texture, Renderer.gl.TEXTURE0, 0, 'uLight.shadow2D')
            prog.setCubeMap(light.shadowMap.texture, Renderer.gl.TEXTURE1, 1, 'uLight.shadowCube')
            prog.setUniformMatrix4fv(mat4.perspective(90, Surface.aspect, 0.01, light.radius), 'uLightProjectionMatrix')
            prog.setUniform1i(1, 'uLight.type')
            obj.drawLight(prog, Renderer.emptyMatrix)
        }
    },

    updateViewport() {
        Renderer.gl.viewport(0, 0, Surface.space.clientWidth, Surface.space.clientHeight)
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

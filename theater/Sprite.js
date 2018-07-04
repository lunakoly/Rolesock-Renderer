class Sprite {
    constructor(material, texture) {
        this.model = new ModelComponent()
        this.meshType = 'sprite'

        this.material = material || Materials.DUMMY_MATERIAL
        this.texture = texture   || new TextureComponent()

        this.indicesCount = 6
        this.uvBuffer = Renderer.screenMesh.uvBuffer
        this.orderBuffer = Renderer.screenMesh.orderBuffer

        this.selfShaderProgram = Shaders.SPRITE_SELF_SHADERS
        this.diffuseLightShaderProgram = Shaders.SPRITE_DIFFUSE_LIGHT_SHADERS
        this.specularLightShaderProgram = Shaders.SPRITE_SPECULAR_LIGHT_SHADERS
    }

    update(dt) {

    }

    drawShape(parentModelMatrix) {
        Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(parentModelMatrix.xM(this.model.translationMatrix), 'uTranslationMatrix')
        Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(this.model.rotationMatrix, 'uRotationMatrix')
        Shaders.SPRITE_DEPTH_SHADERS.program.setUniformMatrix4fv(this.model.scaleMatrix, 'uScaleMatrix')

        Shaders.SPRITE_DEPTH_SHADERS.program.setAttribute(this.uvBuffer, 2, 'aTexture')
        Shaders.SPRITE_DEPTH_SHADERS.program.useMaterial(this.material)
        Shaders.SPRITE_DEPTH_SHADERS.program.useTexture(this.texture)

        Shaders.SPRITE_DEPTH_SHADERS.program.drawElements(this.orderBuffer, this.indicesCount)
    }

    drawSelf(parentModelMatrix) {
        const prog = this.selfShaderProgram.program

        prog.setUniformMatrix4fv(parentModelMatrix.xM(this.model.translationMatrix), 'uTranslationMatrix')
        prog.setUniformMatrix4fv(this.model.rotationMatrix, 'uRotationMatrix')
        prog.setUniformMatrix4fv(this.model.scaleMatrix, 'uScaleMatrix')

        prog.setAttribute(this.uvBuffer, 2, 'aTexture')
        prog.useMaterial(this.material)
        prog.useTexture(this.texture)

        prog.drawElements(this.orderBuffer, this.indicesCount)
    }

    drawLight(prog, parentModelMatrix) {
        prog.setUniformMatrix4fv(parentModelMatrix.xM(this.model.translationMatrix), 'uTranslationMatrix')
        prog.setUniformMatrix4fv(this.model.rotationMatrix, 'uRotationMatrix')
        prog.setUniformMatrix4fv(this.model.scaleMatrix, 'uScaleMatrix')

        prog.setAttribute(this.uvBuffer, 2, 'aTexture')
        prog.useMaterial(this.material)

        prog.drawElements(this.orderBuffer, this.indicesCount)
    }



    // draw(options) {
    //     const modelMatrix = this.model.apply(options.parentModelMatrix)
    //     const prog = this.shaderProgram.program
    //     prog.ensureUsage()
    //
    //     prog.setAttribute(this.uvBuffer, 2, 'aTexture')
    //
    //     prog.setUniformMatrix4fv(modelMatrix, 'uModelMatrix')
    //     prog.setUniformMatrix4fv(options.viewMatrix, 'uViewMatrix')
    //     prog.setUniformMatrix4fv(options.projectionMatrix, 'uProjectionMatrix')
    //     prog.setUniformMatrix4fv(options.inversedViewMatrix, 'uInversedViewMatrix')
    //     prog.setUniformMatrix4fv(this.model.scaleMatrix, 'uScaleMatrix')
    //
    //     prog.setUniform3f(
    //             options.eyePosition[0],
    //             options.eyePosition[1],
    //             options.eyePosition[2],
    //             'uEyePosition')
    //
    //     prog.setUniform1f(Surface.aspect, 'uAspect')
    //     prog.useEnvironment(options.environment)
    //     prog.useMaterial(this.material)
    //     prog.useTexture(this.texture)
    //
    //     prog.drawElements(this.orderBuffer, this.indicesCount)
    // }
}

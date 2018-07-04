class Mesh {
    constructor(vertexBuffer, orderBuffer, indicesCount, uvBuffer, normalsBuffer, material, texture) {
        this.model = new ModelComponent()
        this.meshType = 'mesh'

        this.material = material || Materials.DUMMY_MATERIAL
        this.texture = texture   || new TextureComponent()
        this.indicesCount = indicesCount

        this.uvBuffer = uvBuffer
        this.orderBuffer = orderBuffer
        this.vertexBuffer = vertexBuffer
        this.normalsBuffer = normalsBuffer

        this.selfShaderProgram = Shaders.MESH_SELF_SHADERS
        this.diffuseLightShaderProgram = Shaders.MESH_DIFFUSE_LIGHT_SHADERS
        this.specularLightShaderProgram = Shaders.MESH_SPECULAR_LIGHT_SHADERS
    }

    update(dt) {

    }

    drawShape(parentModelMatrix) {
        const modelMatrix = this.model.apply(parentModelMatrix)

        Shaders.MESH_DEPTH_SHADERS.program.setUniformMatrix4fv(modelMatrix, 'uModelMatrix')
        Shaders.MESH_DEPTH_SHADERS.program.setAttribute(this.vertexBuffer, 3, 'aPosition')

        Shaders.MESH_DEPTH_SHADERS.program.drawElements(this.orderBuffer, this.indicesCount)
    }

    drawSelf(parentModelMatrix) {
        const modelMatrix = this.model.apply(parentModelMatrix)
        const prog = this.selfShaderProgram.program

        prog.setUniformMatrix4fv(modelMatrix, 'uModelMatrix')
        prog.setAttribute(this.vertexBuffer, 3, 'aPosition')
        prog.setAttribute(this.uvBuffer, 2, 'aTexture')

        prog.useMaterial(this.material)
        prog.useTexture(this.texture)

        prog.drawElements(this.orderBuffer, this.indicesCount)
    }

    drawLight(prog, parentModelMatrix) {
        const modelMatrix = this.model.apply(parentModelMatrix)

        prog.setUniformMatrix4fv(modelMatrix, 'uModelMatrix')
        prog.setAttribute(this.vertexBuffer, 3, 'aPosition')
        prog.setAttribute(this.normalsBuffer, 3, 'aNormal')

        prog.useMaterial(this.material)

        prog.drawElements(this.orderBuffer, this.indicesCount)
    }
}

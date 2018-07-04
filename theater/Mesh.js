class Mesh {
    constructor(vertexBuffer, orderBuffer, indicesCount, uvBuffer, normalsBuffer, material, texture) {
        this.controller = new ControllerComponent()
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
        this.model.update(dt)
        this.texture.update(dt)
        this.material.update(dt)
        this.controller.update(dt)
    }

    draw(prog, parentModelMatrix, mode) {
        const modelMatrix = this.model.apply(parentModelMatrix)

        prog.setUniformMatrix4fv(modelMatrix, 'uModelMatrix')
        prog.setAttribute(this.vertexBuffer, 3, 'aPosition')
        prog.useMaterial(this.material)

        if (mode == 'light') {
            prog.setAttribute(this.normalsBuffer, 3, 'aNormal')
        } else {
            prog.setAttribute(this.uvBuffer, 2, 'aTexture')
            prog.useTexture(this.texture)
        }

        prog.drawElements(this.orderBuffer, this.indicesCount)
    }
}

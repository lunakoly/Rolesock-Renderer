class MeshPrototype {
    constructor(name, vertices, indices, uv, normals, material, texture) {
        this.material = material
        this.texture = texture
        this.name = name

        this.vertices = vertices
        this.normals = normals
        this.indices = indices
        this.uv = uv
    }

    generateBuffers() {
        this.uvBuffer = Renderer.createArrayBuffer(this.uv)
        this.orderBuffer = Renderer.createOrderBuffer(this.indices)
        this.vertexBuffer = Renderer.createArrayBuffer(this.vertices)
        this.normalsBuffer = Renderer.createArrayBuffer(this.normals)
        return this
    }
}

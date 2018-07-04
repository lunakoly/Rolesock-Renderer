const Create = {
    initialize() {
        Create.prototypes = {}

        // PLANE PROTOTYPE
        Create.setPrototype(new MeshPrototype('Plane', [
             1,  1, 0,
            -1,  1, 0,
             1, -1, 0,
            -1, -1, 0
        ], [
            0, 2, 1,
            1, 2, 3
        ], [
            1, 1,
            0, 1,
            1, 0,
            0, 0
        ], [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ]).generateBuffers())
    },

    getPrototype(name) {
        return Create.prototypes[name]
    },

    setPrototype(meshPrototype) {
        Create.prototypes[meshPrototype.name] = meshPrototype
    },

    fromPrototype(proto) {
        return new Mesh(
            proto.vertexBuffer,
            proto.orderBuffer,
            proto.indices.length,
            proto.uvBuffer,
            proto.normalsBuffer,
            proto.material,
            proto.texture
        )
    },

    new(name) {
        return Create.fromPrototype(Create.prototypes[name])
    },

    Mesh(vertices, indices, uv, normals, name, material, texture) {
        const proto = new MeshPrototype(name, vertices, indices,
                uv, normals, material, texture).generateBuffers()
        if (name) Create.setPrototype(proto)
        return Create.fromPrototype(proto)
    },

    fromOBJSource(name, source) {
        const proto = OBJLoader.build(name, source).generateBuffers()
        if (name) Create.setPrototype(proto)
        return Create.fromPrototype(proto)
    }
}

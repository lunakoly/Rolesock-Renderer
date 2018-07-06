const OBJLoader = {
    build(name, source) {
        const proto = new MeshPrototype(name, [], [], [], [])

        const vertices = []
        const uv = []
        const normals = []

        let nextVertexIndex = 0

        OBJLoader.readStringByLine(source, line => {
            if (line.length == 0) return;
            if (line.startsWith('#')) return;

            const words = line.split(' ')

            if (words[0] == 'usemtl') {
                proto.material = Materials[words[1]]
            } else if (words[0] == 'v') {
                vertices.push(parseFloat(words[1]))
                vertices.push(parseFloat(words[2]))
                vertices.push(parseFloat(words[3]))
            } else if (words[0] == 'vt') {
                uv.push(parseFloat(words[1]))
                uv.push(parseFloat(words[2]))
            } else if (words[0] == 'vn') {
                normals.push(parseFloat(words[1]))
                normals.push(parseFloat(words[2]))
                normals.push(parseFloat(words[3]))
            } else if (words[0] == 'f') {
                OBJLoader.setFaceElement(words[1], nextVertexIndex, vertices, uv, normals, proto)
                nextVertexIndex++
                OBJLoader.setFaceElement(words[2], nextVertexIndex, vertices, uv, normals, proto)
                nextVertexIndex++
                OBJLoader.setFaceElement(words[3], nextVertexIndex, vertices, uv, normals, proto)
                nextVertexIndex++
            }
        })

        return proto
    },

    getFaceElementInfo(elem) {
        const ind = elem.split('/')
        const vInd = (parseInt(ind[0]) - 1) * 3
        const tInd = (parseInt(ind[1]) - 1) * 2
        const nInd = (parseInt(ind[2]) - 1) * 3
        return [vInd, tInd, nInd]
    },

    setFaceElement(elem, nextVertexIndex, vertices, uv, normals, proto) {
        const [vInd, tInd, nInd] = OBJLoader.getFaceElementInfo(elem)
        proto.indices.push(nextVertexIndex)

        proto.vertices[nextVertexIndex * 3] = vertices[vInd]
        proto.vertices[nextVertexIndex * 3 + 1] = vertices[vInd + 1]
        proto.vertices[nextVertexIndex * 3 + 2] = vertices[vInd + 2]

        if (tInd != NaN) {
            proto.uv[nextVertexIndex * 2] = uv[tInd]
            proto.uv[nextVertexIndex * 2 + 1] = uv[tInd + 1]
        }

        if (nInd != NaN) {
            proto.normals[nextVertexIndex * 3] = normals[nInd]
            proto.normals[nextVertexIndex * 3 + 1] = normals[nInd + 1]
            proto.normals[nextVertexIndex * 3 + 2] = normals[nInd + 2]
        }
    },

    readStringByLine(string, callback) {
        let line = ''

        for (let it = 0; it < string.length; it++) {
            if (string[it] == '\n') {
                callback(line)
                line = ''
            } else {
                line += string[it]
            }
        }

        if (line.length > 0) callback(line)
    }
}

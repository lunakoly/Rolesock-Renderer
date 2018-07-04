class ModelComponent {
    constructor() {
        this.translationMatrix = new mat4()
        this.rotationMatrix = new mat4()
        this.scaleMatrix = new mat4()

        // it's too difficult to get Euler Angles from matrix
        // I'm not goot enough at quaternions now
        this.rotationMetaData = { y: 0, x: 0, z: 0 }
    }

    position() {
        return {
            x: this.translationMatrix[0][3],
            y: this.translationMatrix[1][3],
            z: this.translationMatrix[2][3]
        }
    }

    put(x, y, z) {
        this.translationMatrix[0][3] = x
        this.translationMatrix[1][3] = y
        this.translationMatrix[2][3] = z
    }

    move(dx, dy, dz) {
        this.translationMatrix[0][3] += dx
        this.translationMatrix[1][3] += dy
        this.translationMatrix[2][3] += dz
    }

    size() {
        return {
            x: this.scaleMatrix[0][0],
            y: this.scaleMatrix[1][1],
            z: this.scaleMatrix[2][2]
        }
    }

    fit(x, y, z) {
        this.scaleMatrix[0][0] = x
        this.scaleMatrix[1][1] = y
        this.scaleMatrix[2][2] = z
    }

    scale(dx, dy, dz) {
        this.scaleMatrix[0][0] *= dx
        this.scaleMatrix[1][1] *= dy
        this.scaleMatrix[2][2] *= dz
    }

    orientation() {
        return {
            y: this.rotationMetaData.y,
            x: this.rotationMetaData.x,
            z: this.rotationMetaData.z
        }
    }

    rotate(dy, dx, dz) {
        this.rotationMatrix = mat4.rotate(
            this.rotationMetaData.y + dy,
            this.rotationMetaData.x + dx,
            this.rotationMetaData.z + dz)
        this.rotationMetaData.y += dy
        this.rotationMetaData.x += dx
        this.rotationMetaData.z += dz
    }

    turn(y, x, z) {
        this.rotationMatrix = mat4.rotate(y, x, z)
        this.rotationMetaData = { y: y, x: x, z: z }
    }

    total() {
        return this.translationMatrix
                .xM(this.rotationMatrix)
                .xM(this.scaleMatrix)
    }

    apply(parentModelMatrix) {
        return parentModelMatrix.xM(this.total())
    }

    inversed() {
        const r = this.orientation()
        const t = this.position()
        const s = this.size()

        return mat4.scale(1/s.x, 1/s.y, 1/s.z)
                .xM(mat4.inverseRotate(-r.y, -r.x, -r.z))
                .xM(mat4.translate(-t.x, -t.y, -t.z))
    }
}

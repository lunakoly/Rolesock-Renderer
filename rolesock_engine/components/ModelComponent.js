/**
* Represents layer entity transformation
*/
class ModelComponent {
    constructor() {
        this.translationMatrix = new mat4()
        this.rotationMatrix = new mat4()
        this.offsetMatrix = new mat4()
        this.scaleMatrix = new mat4()

        // it's too difficult to get Euler Angles from matrix
        // I'm not goot enough at quaternions now
        this.rotationMetaData = { y: 0, x: 0, z: 0 }
    }

    update(dt) {

    }

    /**
    * Returns entity's position according to it's holder
    */
    position() {
        return {
            x: this.translationMatrix[0][3],
            y: this.translationMatrix[1][3],
            z: this.translationMatrix[2][3]
        }
    }

    /**
    * Puts entity into the particular position
    */
    put(x, y, z) {
        this.translationMatrix[0][3] = x
        this.translationMatrix[1][3] = y
        this.translationMatrix[2][3] = z
    }

    /**
    * Increases entity's coordinates by some values
    */
    move(dx, dy, dz) {
        this.translationMatrix[0][3] += dx
        this.translationMatrix[1][3] += dy
        this.translationMatrix[2][3] += dz
    }

    /**
    * Returns entity's size according to it's holder
    */
    size() {
        return {
            x: this.scaleMatrix[0][0],
            y: this.scaleMatrix[1][1],
            z: this.scaleMatrix[2][2]
        }
    }

    /**
    * Sets entity's size multiplier to particular values
    */
    fit(x, y, z) {
        this.scaleMatrix[0][0] = x
        this.scaleMatrix[1][1] = y
        this.scaleMatrix[2][2] = z
    }

    /**
    * Multiplies entity's size multiplier by some values
    */
    scale(dx, dy, dz) {
        this.scaleMatrix[0][0] *= dx
        this.scaleMatrix[1][1] *= dy
        this.scaleMatrix[2][2] *= dz
    }

    /**
    * Returns entity's orientation according to it's holder
    */
    orientation() {
        return {
            y: this.rotationMetaData.y,
            x: this.rotationMetaData.x,
            z: this.rotationMetaData.z
        }
    }

    /**
    * Sets entity's rotation angles to particular values
    */
    turn(y, x, z) {
        this.rotationMatrix = mat4.rotate(y, x, z)
        this.rotationMetaData = { y: y, x: x, z: z }
    }

    /**
    * Increases entity's rotation angles by some values
    */
    rotate(dy, dx, dz) {
        this.rotationMatrix = mat4.rotate(
            this.rotationMetaData.y + dy,
            this.rotationMetaData.x + dx,
            this.rotationMetaData.z + dz)
        this.rotationMetaData.y += dy
        this.rotationMetaData.x += dx
        this.rotationMetaData.z += dz
    }

    /**
    * Returns entity's offset according to it's holder
    */
    offset() {
        return {
            x: this.offsetMatrix[0][3],
            y: this.offsetMatrix[1][3],
            z: this.offsetMatrix[2][3]
        }
    }

    /**
    * Sets entity's offset to particular values
    */
    mount(x, y, z) {
        this.offsetMatrix[0][3] = x
        this.offsetMatrix[1][3] = y
        this.offsetMatrix[2][3] = z
    }

    /**
    * Increases entity's offset by some values
    */
    shift(dx, dy, dz) {
        this.offsetMatrix[0][3] += dx
        this.offsetMatrix[1][3] += dy
        this.offsetMatrix[2][3] += dz
    }

    /**
    * Returns total transformation matrix
    */
    total() {
        return this.translationMatrix
                .xM(this.rotationMatrix)
                .xM(this.scaleMatrix)
                .xM(this.offsetMatrix)
    }

    /**
    * Returns 'parentModelMatrix' multiplied by
    * the total transformation matrix
    */
    apply(parentModelMatrix) {
        return parentModelMatrix.xM(this.total())
    }

    /**
    * Returns inversed total transformation matrix
    */
    inversed() {
        const r = this.orientation()
        const t = this.position()
        const o = this.offset()
        const s = this.size()

        return mat4.translate(-o.x, -o.y, -o.z)
                .xM(mat4.scale(1/s.x, 1/s.y, 1/s.z))
                .xM(mat4.inverseRotate(-r.y, -r.x, -r.z))
                .xM(mat4.translate(-t.x, -t.y, -t.z))
    }
}

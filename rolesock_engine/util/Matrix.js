class mat4 extends Array {
    /**
    * Creates new identity mat4
    */
    constructor() {
        super()
        this[0] = [1, 0, 0, 0]
        this[1] = [0, 1, 0, 0]
        this[2] = [0, 0, 1, 0]
        this[3] = [0, 0, 0, 1]
    }

    /**
    * Returns 1d array based on this mat4
    */
    flatten() {
        const l = []

        for (let i = 0; i < this.length; i++)
            for (let k = 0; k < this[i].length; k++)
                l.push(this[k][i])

        return l
    }

    /**
    * Prints contents to console
    */
    print() {
        this.forEach(line => {
            let out = ""
            line.forEach(it => out += it + '\t')
            console.log(out)
        })
    }

    /**
    * Returns the result of multiplication of
    * this matrix on 'mat'
    */
    xM(mat) {
        return mat4.create([
            [
                mat[0][0] * this[0][0] + mat[1][0] * this[0][1] + mat[2][0] * this[0][2] + mat[3][0] * this[0][3],
                mat[0][1] * this[0][0] + mat[1][1] * this[0][1] + mat[2][1] * this[0][2] + mat[3][1] * this[0][3],
                mat[0][2] * this[0][0] + mat[1][2] * this[0][1] + mat[2][2] * this[0][2] + mat[3][2] * this[0][3],
                mat[0][3] * this[0][0] + mat[1][3] * this[0][1] + mat[2][3] * this[0][2] + mat[3][3] * this[0][3]
            ],[
                mat[0][0] * this[1][0] + mat[1][0] * this[1][1] + mat[2][0] * this[1][2] + mat[3][0] * this[1][3],
                mat[0][1] * this[1][0] + mat[1][1] * this[1][1] + mat[2][1] * this[1][2] + mat[3][1] * this[1][3],
                mat[0][2] * this[1][0] + mat[1][2] * this[1][1] + mat[2][2] * this[1][2] + mat[3][2] * this[1][3],
                mat[0][3] * this[1][0] + mat[1][3] * this[1][1] + mat[2][3] * this[1][2] + mat[3][3] * this[1][3]
            ],[
                mat[0][0] * this[2][0] + mat[1][0] * this[2][1] + mat[2][0] * this[2][2] + mat[3][0] * this[2][3],
                mat[0][1] * this[2][0] + mat[1][1] * this[2][1] + mat[2][1] * this[2][2] + mat[3][1] * this[2][3],
                mat[0][2] * this[2][0] + mat[1][2] * this[2][1] + mat[2][2] * this[2][2] + mat[3][2] * this[2][3],
                mat[0][3] * this[2][0] + mat[1][3] * this[2][1] + mat[2][3] * this[2][2] + mat[3][3] * this[2][3]
            ],[
                mat[0][0] * this[3][0] + mat[1][0] * this[3][1] + mat[2][0] * this[3][2] + mat[3][0] * this[3][3],
                mat[0][1] * this[3][0] + mat[1][1] * this[3][1] + mat[2][1] * this[3][2] + mat[3][1] * this[3][3],
                mat[0][2] * this[3][0] + mat[1][2] * this[3][1] + mat[2][2] * this[3][2] + mat[3][2] * this[3][3],
                mat[0][3] * this[3][0] + mat[1][3] * this[3][1] + mat[2][3] * this[3][2] + mat[3][3] * this[3][3]
            ]
        ])
    }

    /**
    * Returns the result of multiplication of
    * this matrix on 'vec'
    */
    xV(vec) {
        return [
            this[0][0] * vec[0] + this[0][1] * vec[1] + this[0][2] * vec[2] + this[0][3] * vec[3],
            this[1][0] * vec[0] + this[1][1] * vec[1] + this[1][2] * vec[2] + this[1][3] * vec[3],
            this[2][0] * vec[0] + this[2][1] * vec[1] + this[2][2] * vec[2] + this[2][3] * vec[3],
            this[3][0] * vec[0] + this[3][1] * vec[1] + this[3][2] * vec[2] + this[3][3] * vec[3]
        ]
    }


    /**
    * Makes src be a mat4 instance
    */
    static create(src) {
        src.__proto__ = mat4.prototype
        return src
    }

    /**
    * Returns primitive translation matrix
    */
    static translate(x, y, z) {
        return mat4.create([
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1]
        ])
    }

    /*
    * Returns primitive scale matrix
    */
    static scale(x, y, z) {
        return mat4.create([
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1]
        ])
    }

    /**
    * Returns orthographic projection matrix
    */
    static ortho(aspect, near, far) {
        const w = 1 / aspect
        const a = 2 / (far - near)
        const b = 1 - far * a

        return mat4.create([
            [w, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, a, b],
            [0, 0, 0, 1]
        ])
    }

    /**
    * Returns perspective projection matrix
    */
    static perspective(fovy, aspect, near, far) {
        fovy = fovy * Math.PI / 180
        const a = (far + near) / (far - near)
        const b = 2 * far * near / (near - far)
        const h = 1 / Math.tan(fovy / 2)
        const w = h / aspect

        return mat4.create([
            [w, 0, 0, 0],
            [0, h, 0, 0],
            [0, 0, a, b],
            [0, 0, 1, 0]
        ])
    }

    /**
    * Returns first-person look around matrix
    */
    static fps(dy, dx) {
        const asp = Math.PI / 180
        dy = dy * asp
        dx = dx * asp

        const rotY = mat4.create([
            [Math.cos(dy), 0, -Math.sin(dy), 0],
            [0,            1, 0,             0],
            [Math.sin(dy), 0, Math.cos(dy),  0],
            [0,            0, 0,             1],
        ])

        const rotX = mat4.create([
            [1, 0,             0,            0],
            [0, Math.cos(dx),  Math.sin(dx), 0],
            [0, -Math.sin(dx), Math.cos(dx), 0],
            [0, 0,             0,            1]
        ])

        return rotX.xM(rotY)
    }

    /**
    * Returns rotation matrix with Z, X, Y order
    */
    static rotate(dy, dx, dz) {     // TODO
        const asp = Math.PI / 180
        dy = dy * asp
        dx = dx * asp
        dz = dz * asp

        const rotY = mat4.create([
            [Math.cos(dy), 0, -Math.sin(dy), 0],
            [0,            1, 0,             0],
            [Math.sin(dy), 0, Math.cos(dy),  0],
            [0,            0, 0,             1],
        ])

        const rotX = mat4.create([
            [1, 0,             0,            0],
            [0, Math.cos(dx),  Math.sin(dx), 0],
            [0, -Math.sin(dx), Math.cos(dx), 0],
            [0, 0,             0,            1]
        ])

        const rotZ = mat4.create([
            [Math.cos(dz),  Math.sin(dz), 0, 0],
            [-Math.sin(dz), Math.cos(dz), 0, 0],
            [0,             0,            1, 0],
            [0,             0,            0, 1],
        ])

        return rotY.xM(rotX).xM(rotZ)
    }

    /**
    * Returns rotation matrix with Y, X, Z order
    */
    static inverseRotate(dy, dx, dz) {     // TODO
        const asp = Math.PI / 180
        dy = dy * asp
        dx = dx * asp
        dz = dz * asp

        const rotY = mat4.create([
            [Math.cos(dy), 0, -Math.sin(dy), 0],
            [0,            1, 0,             0],
            [Math.sin(dy), 0, Math.cos(dy),  0],
            [0,            0, 0,             1],
        ])

        const rotX = mat4.create([
            [1, 0,             0,            0],
            [0, Math.cos(dx),  Math.sin(dx), 0],
            [0, -Math.sin(dx), Math.cos(dx), 0],
            [0, 0,             0,            1]
        ])

        const rotZ = mat4.create([
            [Math.cos(dz),  Math.sin(dz), 0, 0],
            [-Math.sin(dz), Math.cos(dz), 0, 0],
            [0,             0,            1, 0],
            [0,             0,            0, 1],
        ])

        return rotZ.xM(rotX).xM(rotY)
    }

    /**
    * Returns inverse orthographic projection matrix
    */
    static inverseOrtho(aspect, near, far) {
        const w = aspect
        const a = (far - near) / 2
        const b = a * (2 * far / (far - near) - 1)

        return mat4.create([
            [w, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, a, b],
            [0, 0, 0, 1]
        ])
    }

    /**
    * Returns inverse perspective projection matrix
    */
    static inversePerspective(fovy, aspect, near, far) {
        fovy = fovy * Math.PI / 180
        const a = (far - near) / (-2 * far * near)
        const b = (far + near) / ( 2 * far * near)
        const h = Math.tan(fovy / 2)
        const w = h * aspect

        return mat4.create([
            [w, 0, 0, 0],
            [0, h, 0, 0],
            [0, 0, 0, 1],
            [0, 0, a, b]
        ])
    }
}


const MathUtil = {
    getDistance(p1, p2) {
        return sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y) + (p1.z - p2.z) * (p1.z - p2.z))
    }
}

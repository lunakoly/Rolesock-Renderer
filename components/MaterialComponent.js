class MaterialComponent {
    constructor() {
        // basic
        this.opacity  = 1
        this.diffuse  = [1, 1, 1, 1]
        this.specular = [0, 0, 0, 0]
        this.shininess = 10

        // TODO: mb later
        // https://en.wikipedia.org/wiki/Wavefront_.obj_file
        this.illumination = 2
    }

    isTransparent() {
        return this.opacity < 1 || this.diffuse[3] < 1
    }

    clone() {
        const mat = new MaterialComponent()
        mat.shininess = this.shininess
        mat.opacity = this.opacity

        mat.diffuse = [
            this.diffuse[0],
            this.diffuse[1],
            this.diffuse[2],
            this.diffuse[3]
        ]
        mat.specular = [
            this.specular[0],
            this.specular[1],
            this.specular[2],
            this.specular[3]
        ]

        return mat
    }
}

class TextureComponent {
    constructor(diffuse, specular) {
        this.diffuse = diffuse || null
        this.specular = specular || null
    }

    isNotEmpty() {
        return this.diffuse != null || this.specular != null
    }
}

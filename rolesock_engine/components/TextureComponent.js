class TextureComponent {
    constructor(diffuse, specular) {
        this.diffuse = diffuse || null
        this.specular = specular || null
    }

    update(dt) {
        if (this.diffuse) this.diffuse.update(dt)
        if (this.specular) this.specular.update(dt)
    }

    isNotEmpty() {
        return this.diffuse != null || this.specular != null
    }
}

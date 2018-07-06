/**
* Holds diffuse and specular textures
*/
class TextureComponent {
    constructor(diffuse, specular) {
        this.diffuse = diffuse || null
        this.specular = specular || null
    }

    update(dt) {
        if (this.diffuse) this.diffuse.update(dt)
        if (this.specular) this.specular.update(dt)
    }

    /**
    * Returns true if at least one of textures
    * is presented
    */
    isNotEmpty() {
        return this.diffuse != null || this.specular != null
    }
}

/**
* Observer that represents global directional light
*/
class DirectionalLight extends Observer {
    constructor(color) {
        super()
        this.type = 'directional'
        this.color = color

        this.shadowMap = Texture.depth2D(1024)
    }
}

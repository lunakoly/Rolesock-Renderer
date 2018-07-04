class DirectionalLight extends Observer {
    constructor(color) {
        super()
        this.type = 'directional'
        this.color = color

        this.shadowMap = Texture.depth2D()
    }
}

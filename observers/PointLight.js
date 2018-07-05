class PointLight extends Observer {
    constructor(color) {
        super()
        this.type = 'point'
        this.color = color
        this.radius = 1

        this.shadowMapHelper = Texture.depth2D(512)
        this.shadowMap = Texture.colorCube(512)
    }
}

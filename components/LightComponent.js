class LightComponent {
    constructor(type, color) {
        this.model = new ObserverModelComponent()
        this.color = color
        this.type = type
        this.radius = 1

        // meta
        if (type == 'directional')
            this.shadowMap = Texture.depth2D()
        else if (type == 'spot')
            this.shadowMap = Texture.depthCube()
    }
}

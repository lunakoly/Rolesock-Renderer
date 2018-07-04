class DirectionalLightComponent {
    constructor(color, model) {
        this.type = 'directional'
        this.color = color

        this.model = model || new ObserverModelComponent()
        this.shadowMap = Texture.depth2D()
    }

    update(dt) {

    }
}

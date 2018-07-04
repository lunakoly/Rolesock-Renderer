class Group {
    constructor() {
        this.container = new ContainerComponent()
        this.model = new ModelComponent()
    }

    update(dt) {
        this.container.update(dt)
    }

    drawOpaque(options, parentModelMatrix) {
        this.container.drawOpaque(options, this.model.apply(parentModelMatrix))
    }

    drawTransparent(options, parentModelMatrix) {
        this.container.drawTransparent(options, this.model.apply(parentModelMatrix))
    }

    drawSprite(options, parentModelMatrix) {
        this.container.drawSprite(options, this.model.apply(parentModelMatrix))
    }
}

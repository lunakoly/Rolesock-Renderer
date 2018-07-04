class ContainerComponent {
    constructor() {
        this.spriteChildren = []
        this.opaqueChildren = []
        this.transparentChildren = []
        this.containerChildren = []
        this.lightSources = []
    }

    addActor(actor) {
        if (actor.container)
            this.containerChildren.push(actor)
        else if (actor.meshType == 'sprite')
            this.spriteChildren.push(actor)
        else if (actor.material.isTransparent())
            this.transparentChildren.push(actor)
        else
            this.opaqueChildren.push(actor)

        if (actor.light) this.addLightSource(actor.light)
    }

    removeActor(actor) {
        if (actor.container)
            this.containerChildren.splice(this.containerChildren.indexOf(actor), 1)
        else if (actor.meshType == 'sprite')
            this.spriteChildren.splice(this.spriteChildren.indexOf(actor), 1)
        else if (actor.material.isTransparent())
            this.transparentChildren.splice(this.transparentChildren.indexOf(actor), 1)
        else
            this.opaqueChildren.splice(this.opaqueChildren.indexOf(actor), 1)

        if (actor.light) this.removeLightSource(actor.light)
    }

    addLightSource(lightSource) {
        this.lightSources.push(lightSource)
    }

    removeLightSource(lightSource) {
        this.lightSources.splice(this.lightSources.indexOf(lightSource), 1)
    }

    update(dt) {
        this.opaqueChildren.forEach(it => it.update(dt))
        this.transparentChildren.forEach(it => it.update(dt))
        this.spriteChildren.forEach(it => it.update(dt))
        this.containerChildren.forEach(it => it.update(dt))
    }

    // drawOpaque(options) {
    //     this.opaqueChildren.forEach(it => it.draw(options))
    //     this.containerChildren.forEach(it => it.drawOpaque(options))
    // }
    //
    // drawTransparent(options) {
    //     this.transparentChildren.forEach(it => it.draw(options))
    //     this.containerChildren.forEach(it => it.drawTransparent(options))
    // }
    //
    // drawSprite(options) {
    //     this.spriteChildren.forEach(it => it.draw(options))
    //     this.containerChildren.forEach(it => it.drawSprite(options))
    // }

    forEachOpaque(callback) {
        this.opaqueChildren.forEach(callback)
        this.containerChildren.forEach(it => it.forEachOpaque(callback))
    }

    forEachTransparent(callback) {
        this.transparentChildren.forEach(callback)
        this.containerChildren.forEach(it => it.forEachTransparent(callback))
    }

    forEachSprite(callback) {
        this.spriteChildren.forEach(callback)
        this.containerChildren.forEach(it => it.forEachSprite(callback))
    }

    forEachLight(callback) {
        this.lightSources.forEach(callback)
        this.containerChildren.forEach(it => it.forEachLight(callback))
    }
}

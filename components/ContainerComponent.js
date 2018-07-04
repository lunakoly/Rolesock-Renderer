class ContainerComponent {
    constructor(holder) {
        this.holder = holder

        this.opaqueChildren = []
        this.transparentChildren = []

        this.containerChildren = []

        this.directionalLightSources = []
    }

    addActor(actor) {
        actor.holder = this.holder

        if (actor.container)
            this.containerChildren.push(actor)
        else if (actor.material.isTransparent)
            this.transparentChildren.push(actor)
        else
            this.opaqueChildren.push(actor)

        if (actor.light) this.addLightSource(actor.light)
    }

    removeActor(actor) {
        actor.holder = null

        if (actor.container)
            this.containerChildren.splice(this.containerChildren.indexOf(actor), 1)
        else if (actor.material.isTransparent)
            this.transparentChildren.splice(this.transparentChildren.indexOf(actor), 1)
        else
            this.opaqueChildren.splice(this.opaqueChildren.indexOf(actor), 1)

        if (actor.light) this.removeLightSource(actor.light)
    }

    addLightSource(lightSource) {
        this.directionalLightSources.push(lightSource)
    }

    removeLightSource(lightSource) {
        this.directionalLightSources.splice(this.directionalLightSources.indexOf(lightSource), 1)
    }

    update(dt) {
        this.opaqueChildren.forEach(it => it.update(dt))
        this.transparentChildren.forEach(it => it.update(dt))

        this.containerChildren.forEach(it => it.update(dt))

        this.directionalLightSources.forEach(it => it.update(dt))
    }
}

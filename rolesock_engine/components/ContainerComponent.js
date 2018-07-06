/**
* Manages containing layer entities
*/
class ContainerComponent {
    constructor(holder) {
        this.holder = holder

        this.opaqueChildren = []
        this.transparentChildren = []

        this.containerChildren = []

        this.directionalLightSources = []
        this.pointLightSources = []
    }

    /**
    * Adds object to the corresponding inner collection.
    * Also adds light source attached to it
    * via 'light' field
    */
    addObject(obj) {
        obj.holder = this.holder

        if (obj.container)
            this.containerChildren.push(obj)
        else if (obj.material.isFullyTransparent)
            this.transparentChildren.push(obj)
        else
            this.opaqueChildren.push(obj)

        if (obj.light) this.addLightSource(obj.light)
    }

    /**
    * Removes object from the corresponding inner collection.
    * Also removes light source attached to it
    * via 'light' field
    */
    removeObject(obj) {
        obj.holder = null

        if (obj.container)
            this.containerChildren.splice(this.containerChildren.indexOf(obj), 1)
        else if (obj.material.isFullyTransparent)
            this.transparentChildren.splice(this.transparentChildren.indexOf(obj), 1)
        else
            this.opaqueChildren.splice(this.opaqueChildren.indexOf(obj), 1)

        if (obj.light) this.removeLightSource(obj.light)
    }

    /**
    * Adds light source to the corresponding inner collection.
    */
    addLightSource(lightSource) {
        if (lightSource.type == 'directional')
            this.directionalLightSources.push(lightSource)
        else
            this.pointLightSources.push(lightSource)
    }

    /**
    * Removes light source from the corresponding
    * inner collection.
    */
    removeLightSource(lightSource) {
        if (lightSource.type == 'directional')
            this.directionalLightSources.splice(this.directionalLightSources.indexOf(lightSource), 1)
        else
            this.pointLightSources.splice(this.pointLightSources.indexOf(lightSource), 1)
    }

    update(dt) {
        this.opaqueChildren.forEach(it => it.update(dt))
        this.transparentChildren.forEach(it => it.update(dt))

        this.containerChildren.forEach(it => it.update(dt))

        this.directionalLightSources.forEach(it => it.update(dt))
        this.pointLightSources.forEach(it => it.update(dt))
    }
}

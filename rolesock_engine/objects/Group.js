/**
* Object that specifies movable local transformation
* origin for several other objects
*/
class Group {
    constructor() {
        this.controller = new ControllerComponent()
        this.container = new ContainerComponent(this)
        this.model = new ModelComponent()
    }

    update(dt) {
        this.model.update(dt)
        this.container.update(dt)
        this.controller.update(dt)
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of opaque child objects
    */
    forEachOpaque(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.opaqueChildren.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachOpaque(callback, modelMatrix))
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of transparent child objects
    */
    forEachTransparent(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.transparentChildren.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachTransparent(callback, modelMatrix))
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of directional light child observer
    */
    forEachDirectionalLight(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.directionalLightSources.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachDirectionalLight(callback, modelMatrix))
    }

    /**
    * Executes callback(obj, parentModelMatrix)
    * for each of point light child observer
    */
    forEachPointLight(callback, parentModelMatrix) {
        const modelMatrix = parentModelMatrix.xM(this.model.total())
        this.container.pointLightSources.forEach(it => callback(it, modelMatrix))
        this.container.containerChildren.forEach(it => it.forEachPointLight(callback, modelMatrix))
    }
}

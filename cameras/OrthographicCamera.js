class OrthographicCamera {
    constructor(near, far) {
        this.model = new ObserverModelComponent()
        this.setProjection(near, far)
    }

    setProjection(near, far) {
        this.projectionMetaData = {
            near: near,
            far: far
        }
        this.updateViewport()
    }

    updateViewport() {
        this.projection = mat4.ortho(
            Surface.aspect,
            this.projectionMetaData.near,
            this.projectionMetaData.far)
        this.inverseProjection = inverseOrtho(
            Surface.aspect,
            this.projectionMetaData.near,
            this.projectionMetaData.far)
    }
}

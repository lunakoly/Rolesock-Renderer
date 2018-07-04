class MMOControls {
    constructor(camera) {
        this.camera = camera
        this.camOldY = 0
        this.camOldX = -35
        this.camera.model.turn(0, -35, 0)
    }

    onMouseDown(e) {
        const orient = this.camera.model.orientation()
        this.camOldY = orient.y
        this.camOldX = orient.x
    }

    onDrag(e) {
        let newX = this.camOldX + e.dy / 30
        if (newX > -35) newX = -35
        if (newX < -50) newX = -50
        this.camera.model.turn(this.camOldY + e.dx / 10, newX, 0)
    }
}

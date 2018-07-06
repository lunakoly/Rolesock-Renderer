/**
* Basic FPS gesture manager
*/
class FPSControls {
    constructor(camera) {
        this.camera = camera
        this.camOldY = 0
        this.camOldX = 0
    }

    onMouseDown(e) {
        const orient = this.camera.model.orientation()
        this.camOldY = orient.y
        this.camOldX = orient.x
    }

    onDrag(e) {
        this.camera.model.turn(this.camOldY + e.dx / 10, this.camOldX + e.dy / 10, 0)
    }
}

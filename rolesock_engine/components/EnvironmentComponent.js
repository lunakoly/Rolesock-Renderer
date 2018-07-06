class EnvironmentComponent {
    constructor() {
        this.ambient = [0.15, 0.15, 0.2, 0]
        this.sun = new DirectionalLight([1, 1, 1, 1])

        // this.sun.model.turn(35, -10, 0)
        this.sun.model.turn(0, -45, 0)
        this.sun.model.put(0, 0, 0)
    }

    update(dt) {
        this.sun.update(dt)
    }
}

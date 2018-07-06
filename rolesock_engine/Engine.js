/**
* Provides global engine API
*/
const Engine = {
    initialize() {
        Surface.initialize()
        Renderer.initialize()
        Create.initialize()
        Engine.runUpdateLoop()
    },

    runUpdateLoop() {
        Engine.FPS = 0

        let oldTime = new Date().getTime()
        let second = 0
        let fps = 0

        requestAnimationFrame(function f() {
            const newTime = new Date().getTime()
            const dt = newTime - oldTime

            Engine.update(newTime - oldTime)
            second += dt
            fps += 1

            if (second >= 1000) {
                Engine.FPS = fps
                second = 0
                fps = 0
            }

            oldTime = newTime
            requestAnimationFrame(f)
        })
    },

    update(dt) {
        Surface.update(dt)
        Renderer.update(dt)
        Engine.globalUpdate(dt)
    },

    /**
    * Callback called on every inner state update
    * Designed to be overriden by user
    */
    globalUpdate(dt) {

    }
}

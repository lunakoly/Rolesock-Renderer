const Surface = {
    initialize() {
        this.space = document.getElementById('quick_world_space')
        this.aspect = this.space.clientWidth / this.space.clientHeight
        this.layers = []

        Surface.initEvents()
    },

    addLayer(layer) {
        if (this.layers == undefined)
            console.error('Surface: Engine is not initialized!')
        this.layers.push(layer)
    },

    update(dt) {
        this.layers.forEach(it => it.update(dt))
    },

    resize(width, height) {
        this.space.width = width
        this.space.height = height
        this.aspect = this.space.clientWidth / this.space.clientWidth
        Renderer.updateViewport()
        this.layers.forEach(it => it.updateViewport())
    },

    initEvents() {
        this.customEvents = {
            'drag': []
        }

        let oldX = -1
        let oldY = -1
        const that = this

        document.addEventListener('mousedown', e => {
            oldX = e.x
            oldY = e.y
        })

        document.addEventListener('mousemove', e => {
            if (oldX >= 0) {
                e.dx = e.x - oldX
                e.dy = e.y - oldY
                that.customEvents.drag.forEach(it => it(e))
            }
        })

        document.addEventListener('mouseup', e => {
            oldX = -1
        })
    },

    on(event, callback) {
        if (this.customEvents[event])
            this.customEvents[event].push(callback)
        else
            document.addEventListener(event, callback)
    }
}

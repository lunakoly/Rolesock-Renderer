/////////// STARTUP ///////////
Engine.initialize()

Engine.globalUpdate = dt => {
    fps.innerText = 'FPS : ' + Engine.FPS
}


/////////// MATERIALS ///////////
const DUMMY_GLASS_MATERIAL = Materials.DUMMY_MATERIAL.clone()
DUMMY_GLASS_MATERIAL.diffuse = [0.5, 0.5, 0.5, 1]
DUMMY_GLASS_MATERIAL.opacity = 0.5

const PASTEL_BLOOD_MATERIAL = new MaterialComponent()
PASTEL_BLOOD_MATERIAL.diffuse = [1, 0.38, 0.38, 1]


/////////// ENVIRONMENT ///////////
const cam = new PerspectiveCamera(45, 0.1, 100)
cam.model.move(0, 0, -3)

const scene = new Layer()
Surface.addLayer(scene)

scene.camera = cam

const fpsControls = new FPSControls(cam)
scene.cameraControls = fpsControls


/////////// OBJECTS ///////////
const plane2 = Create.Mesh([
    0.5, 0.5, 0.0,
    -0.3, 0.3, 0.0,
    0.2, -0.2, 0.0,
    -0.7, -0.7, 0.0
], [
    0, 2, 1,
    1, 2, 3
], [
    1, 1,
    0, 1,
    1, 0,
    0, 0
], [
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1
], null, DUMMY_GLASS_MATERIAL)

plane2.model.put(0.5, 0, 0)
scene.container.addObject(plane2)


const plane = Create.Mesh([
    0.5, 0.5, 0.0,
    -0.3, 0.3, 0.0,
    0.2, -0.2, 0.0,
    -0.7, -0.7, 0.0
], [
    0, 2, 1,
    1, 2, 3
], [
    1, 1,
    0, 1,
    1, 0,
    0, 0
], [
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1
], null, PASTEL_BLOOD_MATERIAL)

scene.container.addObject(plane)
plane.model.rotate(-1, 0, 0)

let stat = 0
let next = true
plane.update = (dt) => {
	// stat += dt / 50
    stat += 0.3 * dt / 2
    if (next) plane.model.turn(0, stat, 0)
}


const plane3 = Create.Mesh([
    0.5, 0.5, 0.0,
    -0.3, 0.3, 0.0,
    0.2, -0.2, 0.0,
    -0.7, -0.7, 0.0
], [
    0, 2, 1,
    1, 2, 3
], [
    1, 1,
    0, 1,
    1, 0,
    0, 0
], [
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1
], null, DUMMY_GLASS_MATERIAL)

plane3.model.put(-0.5, 0, 0)
scene.container.addObject(plane3)


const plane4 = Create.Mesh([
    0.8, 0.8, 1.0,
    -0.8, 0.8, 1.0,
    0.8, -0.8, 1.0,
    -0.8, -0.8, 1.0
], [
    0, 2, 1,
    1, 2, 3
], [
    1, 1,
    0, 1,
    1, 0,
    0, 0
], [
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1
], null, DUMMY_GLASS_MATERIAL)

plane4.model.move(0, 0, 0)
scene.container.addObject(plane4)



const notex = Texture.fromImage('img/notex.png', false)
plane.texture.diffuse = notex
notex.offset.y = 0.3
notex.scale.x = 10

const char = Create.Sprite(cam, Materials.DUMMY_MATERIAL, Texture.fromImage('img/notex.png'))
scene.container.addObject(char)

char.model.fit(0.3, 0.2, 1)
char.model.move(1, 0, 0)

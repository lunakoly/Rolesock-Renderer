/////////// STARTUP ///////////
Engine.initialize()

Engine.globalUpdate = dt => {
    fps.innerText = 'FPS : ' + Engine.FPS
}


/////////// MATERIALS ///////////
Materials.CHARACTER = new MaterialComponent()
Materials.CHARACTER.diffuse = [1, 1, 1, 0]
Materials.CHARACTER.specular = [0.7, 0.7, 1, 0.3]
Materials.CHARACTER.shininess = 1024

Materials.PASTEL_BLOOD_MATERIAL = new MaterialComponent()
Materials.PASTEL_BLOOD_MATERIAL.diffuse = [1, 0.38, 0.38, 1]
Materials.PASTEL_BLOOD_MATERIAL.specular = [0.6, 1, 1, 0.7]


/////////// ENVIRONMENT ///////////
const cam = new PerspectiveCamera(45, 0.1, 100)
cam.model.shift(0, 0.2, -6)

const scene = new Layer(cam)
Surface.addLayer(scene)

scene.environment.ambient = [0.05, 0.05, 0.02, 0]
scene.cameraControls = new MMOControls(cam)

scene.controller.update = dt => {
    scene.environment.sun.model.rotate(dt / 30, 0, 0)
}


/////////// OBJECTS ///////////
const ground = Create.new('Plane')
scene.container.addActor(ground)
ground.model.turn(0, -90, 0)
ground.model.fit(10, 10, 1)
ground.texture.diffuse = Texture.fromImage('img/ground.png')
ground.texture.diffuse.scale.x = 10
ground.texture.diffuse.scale.y = 10


const char = Create.Sprite(cam, Materials.CHARACTER, Texture.fromImage('img/char.png'))
scene.container.addActor(char)


const sphere = Create.fromOBJSource('Sphere', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')
scene.container.addActor(sphere)
sphere.model.move(-1, 2, 2.5)


sphere.controller.update = dt => {
    sphere.model.rotate(dt / 10, 0, 0)
    sphere.model.rotate(0, dt / 100, 0)
}


const glassPane = Create.new('Plane')
// glassPane.material.isFullyTransparent = true
scene.container.addActor(glassPane)
glassPane.material = new MaterialComponent()
glassPane.material.diffuse = [0.9, 1, 0.9, 1]
glassPane.material.opacity = 0.5
glassPane.material.specular = [1.0, 0, 0, 1]
glassPane.model.rotate(30, 0, 0)
glassPane.model.put(-2, 0.7, 0)

glassPane.tag = 'damn'


const torch = Create.Sprite(cam, Materials.CHARACTER, Texture.fromImage('img/torch.png'))
torch.texture.diffuse.animateHorizontal(500, 4)
torch.material.isFullyTransparent = true
torch.model.put(-1, 0, 0)

// bind new light to the torch
torch.light = new PointLight([1, 0.7, 0.3, 1])
torch.light.holder = torch
torch.light.model.put(0, 1, 0)
torch.light.radius = 8

// must be called after ther light has been added
// otherwise scene.container.addLightSource(torch.light) would be required
scene.container.addActor(torch)






/////////// ACTIONS ///////////
function useFPS() {
    const fpsControls = new FPSControls(cam)
    scene.cameraControls = fpsControls
}

function testGroup() {
    const obj2 = Create.fromOBJSource('Sphere', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')
    scene.container.addActor(obj2)
    obj2.model.move(1, 1, 2)

    obj2.tag = 'fuck'

    const obj3 = Create.fromOBJSource('Sphere', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')
    obj3.model.move(-3, 1, -0.5)

    const obj4 = Create.fromOBJSource('Sphere', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')
    obj4.model.move(0, 1, -3)

    const group1 = new Group()
    group1.container.addActor(obj3)
    group1.container.addActor(obj4)
    scene.container.addActor(group1)
    group1.model.scale(1, 0.5, 1)
}

function addWalls() {
    const wall1 = Create.new('Plane')
    scene.container.addActor(wall1)
    wall1.model.rotate(90, 0, 0)
    wall1.model.scale(10, 5, 1)
    wall1.model.put(-10, 5, 0)

    const wall2 = Create.new('Plane')
    scene.container.addActor(wall2)
    wall2.model.rotate(-90, 0, 0)
    wall2.model.scale(10, 5, 1)
    wall2.model.put(10, 5, 0)

    const wall3 = Create.new('Plane')
    scene.container.addActor(wall3)
    wall3.model.scale(10, 5, 1)
    wall3.model.put(0, 5, 10)

    const wall4 = Create.new('Plane')
    scene.container.addActor(wall4)
    wall4.model.rotate(180, 0, 0)
    wall4.model.scale(10, 5, 1)
    wall4.model.put(0, 5, -10)
}

function maxTest() {
    moveBack()
    useFPS()
    testGroup()
    addWalls()
    scene.container.removeLightSource(scene.environment.sun)
    torch.light.radius = 20
}


testGroup()
useFPS()

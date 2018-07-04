Engine.initialize()


const cam = new ObserverCamera(45, 0.1, 100)
// cam.model.put(0, 1, -3)
cam.model.put(0, 0, 0)
cam.model.shift(0, 0.2, -3.7)


// const fpsControls = new FPSControls(cam)
const mmoControls = new MMOControls(cam)

const scene = new Scene(cam)
scene.cameraControls = mmoControls

Surface.addLayer(scene)


const ground1 = Create.new('Plane')
scene.container.addActor(ground1)

ground1.model.turn(0, -90, 0)
ground1.model.fit(10, 10, 1)
ground1.texture.diffuse = Texture.fromImage('img/ground.png')
ground1.texture.diffuse.scale.x = 10
ground1.texture.diffuse.scale.y = 10

scene.environment.sunDirection = [0, 0.5, -0.5]


Materials.SHINY = new MaterialComponent()
Materials.SHINY.diffuse = [1, 1, 1, 0]
Materials.SHINY.specular = [0.7, 0.7, 1, 0.3]
Materials.SHINY.shininess = 1024

const char = new Sprite(Materials.SHINY)
char.texture.diffuse = Texture.fromImage('img/char.png')
scene.container.addActor(char)

// char.model.put(0, 0.35, 0)


function fpsctl() {
    const fpsControls = new FPSControls(cam)
    scene.cameraControls = fpsControls
}

function sht() {
    cam.model.shift(0, 0, -3)
}





Materials.PASTEL_BLOOD_MATERIAL = new MaterialComponent()
Materials.PASTEL_BLOOD_MATERIAL.diffuse = [1, 0.38, 0.38, 1]
Materials.PASTEL_BLOOD_MATERIAL.specular = [0.6, 1, 1, 0.7]

const obj = Create.fromOBJSource('fuck', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')

scene.container.addActor(obj)
obj.model.move(0, 1, 0)
obj.model.move(1, 1, 0.5)


// SUB
const obj2 = Create.fromOBJSource('fuck', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')
scene.container.addActor(obj2)
obj2.model.move(1, 1, 2)

// SUB
const obj3 = Create.fromOBJSource('fuck', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')
scene.container.addActor(obj3)
obj3.model.move(-2, 1, -3)

// SUB
const obj4 = Create.fromOBJSource('fuck', Objects.SPHERE + 'usemtl PASTEL_BLOOD_MATERIAL')
scene.container.addActor(obj4)
obj4.model.move(2, 1, -3)


obj.update = dt => {
    obj.model.rotate(dt / 10, 0, 0)
    obj.model.rotate(0, dt / 100, 0)

    scene.environment.sun.model.rotate(dt / 30, 0, 0)
}


// SUB
const p1 = Create.new('Plane')
p1.material = new MaterialComponent()
p1.material.diffuse = [0.9, 1, 0.9, 1]
p1.material.opacity = 0.5
p1.material.specular = [1.0, 0, 0, 1]
p1.model.put(-2, 0.7, 0)
p1.model.rotate(30, 0, 0)
scene.container.addActor(p1)


const lc = new LightComponent('spot', [0, 1, 0, 1])
lc.model.put(0, 0.5, -1)
// scene.container.addLightSource(lc)


sht()
fpsctl()

function pb(arr, n) {
    console.log('+---------------------+');
    for (let i = 0; i < arr.length / n; i++) {
        let out = ''
        for (let j = 0; j < n; j++)
            out += arr[i * n + j] + '\t'
        console.log(out);
    }
}

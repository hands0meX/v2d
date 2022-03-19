import * as THREE from './libs/build/three.module.js'
import { GLTFLoader } from './libs/jsm/loaders/GLTFLoader.js'
import { GUI } from './libs/jsm/wares/gui.js'
import Stats from './libs/jsm/tools/stats.js'

let container, stats, gui, mixer, actions, activeAction, previousAction, clock;
let camera, scene, renderer, model, face;
const api = { state: 'Walking' };

function fadeToAction( name, duration ) {

    previousAction = activeAction;
    activeAction = actions[ name ];

    if ( previousAction !== activeAction ) {

        previousAction.fadeOut( duration );

    }

    activeAction
        .reset()
        .setEffectiveTimeScale( 1 )
        .setEffectiveWeight( 1 )
        .fadeIn( duration )
        .play();

}

function createGUI( model, animations ) {

    const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
    const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];

    gui = new GUI();

    mixer = new THREE.AnimationMixer( model );

    actions = {};

    for ( let i = 0; i < animations.length; i ++ ) {

        const clip = animations[ i ];
        const action = mixer.clipAction( clip );
        actions[ clip.name ] = action;

        if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {

            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;

        }

    }

    // states

    const statesFolder = gui.addFolder( 'States' );

    const clipCtrl = statesFolder.add( api, 'state' ).options( states );

    clipCtrl.onChange( function () {

        fadeToAction( api.state, 0.5 );

    } );

    statesFolder.open();

    // emotes

    const emoteFolder = gui.addFolder( 'Emotes' );

    function createEmoteCallback( name ) {

        api[ name ] = function () {

            fadeToAction( name, 0.2 );

            mixer.addEventListener( 'finished', restoreState );

        };

        emoteFolder.add( api, name );

    }

    function restoreState() {

        mixer.removeEventListener( 'finished', restoreState );

        fadeToAction( api.state, 0.2 );

    }

    for ( let i = 0; i < emotes.length; i ++ ) {

        createEmoteCallback( emotes[ i ] );

    }

    emoteFolder.open();

    // expressions

    face = model.getObjectByName( 'Head_4' );

    const expressions = Object.keys( face.morphTargetDictionary );
    const expressionFolder = gui.addFolder( 'Expressions' );

    for ( let i = 0; i < expressions.length; i ++ ) {

        expressionFolder.add( face.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );

    }

    activeAction = actions[ 'Walking' ];
    activeAction.play();

    expressionFolder.open();

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function init() {
    //container
    container = document.createElement('div')
    document.body.appendChild(container)
    
    //camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25 , 1000)
    camera.position.set(-5, 3, 10)
    camera.lookAt(new THREE.Vector3(0,0,0))
    
    //scene
    scene = new THREE.Scene()
    scene.background = null
    // scene.fog = new THREE.Fog( 0xffffff, 0, 100 );

    clock = new THREE.Clock();

    //light
    const hemisLight = new THREE.HemisphereLight( 0xffffff, 0x444444)
    hemisLight.position.set(10,10,10)
    scene.add(hemisLight)

    const dirLight = new THREE.DirectionalLight(0xffffff)
    dirLight.position.set(0, 20, 10)
    scene.add(dirLight)

    //ground
    // const mesh = new THREE.Mesh( new THREE.PlaneGeometry(2000,2000), new THREE.MeshPhongMaterial({ color:0xffffff, depthWrite: false }))
    // mesh.rotation.x = - Math.PI / 2
    // scene.add( mesh )

    const grid = new THREE.GridHelper(200, 30, 0x000000, 0x000000)
    grid.material.opacity = .1
    grid.material.transparent = true
    scene.add( grid )

    //model
    const loader = new GLTFLoader()
    // src/model/libs/models/RobotExpressive.glb
    loader.load('/src/model/libs/models/RobotExpressive.glb',(gltf) => {
        model = gltf.scene
        scene.add(model)

        createGUI(model, gltf.animations)
    }, undefined, err => {
        console.error(err);
    })

    //renderer

    renderer = new THREE.WebGLRenderer({ alpha:true })
    renderer.setClearColor(0xffffff,0)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(innerWidth, innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding
    container.appendChild(renderer.domElement)


    window.addEventListener('resize', onWindowResize)

    //stats
    stats = new Stats();
    container.appendChild( stats.dom );
}

function animate() {
    const dt = clock.getDelta();
	// console.log(dt)
	if ( mixer ) mixer.update( dt );
    requestAnimationFrame(animate)

    renderer.render( scene, camera )
}

init();
animate();
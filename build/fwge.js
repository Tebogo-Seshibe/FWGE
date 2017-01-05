(function()
{
"use strict";
    
var GL = undefined;

Object.defineProperties(Math,
{
    cot:    { value: function cot(radian)             { return 1 / Math.tan(radian);                   } },
    radian: { value: function radian(degree)          { return Math.PI / 180 * degree;                 } },
    clamp:  { value: function clamp(value, min, max)  { return Math.max(Math.min(value, max), main);   } }
});

var IDCounter = new function IDCounter(){ var id = 0; this.next = function next(){ return id++ }; };


/**
 * @constructor GameEngine
 * @description Something...
 * @module      FWGE
 */
function GameEngine()
{
    var _Running = false;
    var _AnimationFrame = undefined;

    Object.defineProperties(this,
    {
        /**
         * @property    GameObject: {Function}
         * @description The GameObject constructor.
         * @see         FWGE.Game.GameObject
         */
        GameObject:     { value: GameObject },
        
        /**
         * @property    Animation: {Function}
         * @description The Animation constructor.
         * @see         FWGE.Game.Animation
         */
        Animation:      { value: Animation },
        
        /**
         * @property    Input: {Input}
         * @description The module that handles user inputs.
         * @see         FWGE.Game.Input
         */
        Input:          { value: new Input() },
        
        /**
         * @property    Time: {Time}
         * @description The running clock.
         * @see         FWGE.Game.Time
         */
        Time:           { value: new Time() },
        
        /**
         * @property    Transform {Transform}
         * @description The Transform constructor.
         * @see         FWGE.Game.Transform
         */
        Transform:      { value: Transform },
        
        /**
         * @property    Light: {Light}
         * @description The Light module.
         * @see         FWGE.Game.Light
         */
        Light:          { value: new Light() },
        
        /**
         * @property    Maths: {Maths}
         * @description The Maths module.
         * @see         FWGE.Game.Maths
         */
        Maths:          { value: new Maths() },
        
        /**
         * @property    ParticleSystem: {Function}
         * @description The ParticleSystem constructor.
         * @see         FWGE.Game.ParticleSystem
         */
        ParticleSystem: { value: ParticleSystem },
        
        /**
         * @property    Camera: {Camera}
         * @description The viewer.
         * @see         FWGE.Game.Camera
         */
        Camera:         { value: new Camera() },

        /**
         * @function    Init: void
         * @description Initializes the game engine
         */
        Init:
        {
            value: function Init()
            {
                // TODO
            }
        },

        /**
         * @function    Run: void
         * @description Runs the main game loop
         */
        Run: 
        { 
            value: function Run()
            {
                _AnimationFrame = window.requestAnimationFrame(FWGE.Game.Run);

                if (_Running)
                {   
                    FWGE.Game.GameUpdate();
                    FWGE.Physics.PhysicsUpdate();
                    FWGE.Render.RenderUpdate();
                }
            }
        },

        /**
         * @function    GameUpdate: void
         * @description Updates the scene
         */
        GameUpdate:
        {
            value: function GameUpdate()
            {
                FWGE.Game.Time.TimeUpdate();

                var i = __OBJECT__.length;
                while (--i >= 0)
                    __OBJECT__[i].ObjectUpdate();

                FWGE.Game.Input.InputUpdate();
            }
        },

        /**
         * @function    Start: void
         * @description Initiates/resumes the main game loop
         */
        Start:
        {
            value: function Start()
            {
                if(!_Running)
                    _Running = true;

                if (!_AnimationFrame)
                    this.Run();
            }
        },

        /**
         * @function    Stop: void
         * @description Suspends the main game loop
         */
        Stop:
        {
            value: function Stop()
            {
                if (_Running)
                    _Running = false;

                if (!!_AnimationFrame)
                {
                    window.cancelAnimationFrame(_AnimationFrame);
                    _AnimationFrame = undefined;
                }
            }
        }
    });
};


/**
 * @constructor Item
 * @module      FWGE.Game
 * @description The base object for every item
 *              used within the game engine.
 * @param       request:    {Object}
 *              > type:     {String}    [nullable]
 *              > name:     {String}    [nullable]
 */
function Item(request)
{
    if (!request) request = {};

    var _Name = request.name || "Item";

    Object.defineProperties(this,
    {
        /**
         * @property    Type:{String}
         *              > get
         * @description A string descriptor for the type of item.
         */
        Type: { value: request.type || "ITEM" },

        /**
         * @property    Name: {String}
         *              > get
         *              > set
         * @description A simple string naming the item
         */
        Name:
        {
            get: function getName() { return _Name; },
            set: function setName(name)
            {
                if (typeof name === 'string')
                    _Name = name;
            }
        }
    });
}


/**
 * @constructor GameItem
 * @description The base container for objects used within the scene.
 * @module      FWGE.Game
 * @param       request:        {Object}
 *              > gameobject:   {GameObject}    [nullable]
 */
function GameItem(request)
{
    if (!request) request = {};
    Item.call(this, request);

    var _GameObject = request.gameobject;
    
    Object.defineProperties(this,
    {
        /**
         * @property    GameObject: {GameObject}
         *              > get
         *              > set
         * @description The GameObject this item is attached to.
         */
        GameObject:
        {
            get: function getGameObject() { return _GameObject; },
            set: function setGameObject()
            {
                if (arguments[0] instanceof GameObject || arguments[0] === undefined)
                    _GameObject = arguments[0];
            }
        }
    });
}


var __OBJECT__ = [];

/**
 * @constructor GameObject
 * @description The main object container for object types.   
 * @module      FWGE.Game
 * @param       request:        {Object}
 *              > material:     {Material}      [nullable]
 *              > mesh:         {Mesh}          [nullable]
 *              > transform:    {Transform}     [nullable]
 *              > physics:      {Physics}       [nullable]
 *              > animation:    {Animation}     [nullable]
 *              > lightitem:    {LightObject}   [nullable]
 *              > begin:        {Function}      [nullable]
 *              > update:       {Function}      [nullable]
 *              > end:          {Function}      [nullable]
 */
function GameObject(request)
{
    if (!request) request = {};
    request.type = "GAMEOBJECT";
    request.name = typeof request.name === 'string' ? request.name : "GameObject";
    GameItem.call(this, request);

    var _Children       = [];
    var _RenderMaterial = request.material       instanceof RenderMaterial  ? request.material       : undefined;
    var _Mesh           = request.mesh           instanceof Mesh            ? request.mesh           : undefined;
    var _PhysicsItem    = request.physicsitem    instanceof PhysicsItem     ? request.physicsitem    : undefined;
    var _Animation      = request.animation      instanceof Animation       ? request.animation      : undefined;
    var _LightItem      = request.lightitem      instanceof LightItem       ? request.lightitem      : undefined;
    var _ParticleSystem = request.particlesystem instanceof ParticleSystem  ? request.particlesystem : undefined;
    
    var _Begin  = typeof request.begin  === 'function' ? request.begin  : function Begin(){};
    var _Update = typeof request.update === 'function' ? request.update : function Update(){};
    var _End    = typeof request.end    === 'function' ? request.end    : function End(){};
    
    Object.defineProperties(this,
    {
        /**
         * @property    ID: {String}
         *              > get
         * @description Unique identifier for the gameobject
         */
        ID: { value: "[go-" + IDCounter.next() + "]" },

        /**
         * @property    Transform:  {Transform}
         *              > get
         * @description The transform object attached to the current gameobject
         */
        Transform: { value: request.transform instanceof Transform ? request.transform : new Transform() },

        /**
         * @property    Children:   {Array}
         *              > get
         * @description An array of gameobjects. All children transformation will be relative to 
         *              the parent gameobject.
         */
        Children: { get: function getChildren() { return _Children } },

        /**
         * @function    AddChild:   {GameObject}
         * @description Pushes a gameobect to the current object's childrens array, and
         *              move it down the rendering tree.
         * @param       gameobject: {GameObject}
         */
        AddChild:
        {
            value: function AddChild(gameobject)
            {
                if (gameobject instanceof GameObject)
                {
                    _Children.push(gameobject);
                    var index = __OBJECT__.indexOf(gameobject);

                    if (index !== -1)
                        __OBJECT__.slice(index, 1);
                }

                return gameobject;
            }
        },

        /**
         * @function    RemoveChild: {GameObject}
         * @description Removes a gameobject from the current object's childrens array, and
         *              moves it up the rendering tree.
         * @param       gameobject:  {GameObject}
         */
        RemoveChild: 
        {
            value: function RemoveChild(gameobject)
            {
                if (gameobject instanceof GameObject)
                {
                    var index = _Children.indexOf(gameobject);

                    if (index !== -1)
                    {
                        _Children.slice(index, 1);
                        __OBJECT__.push(gameobject);
                    }
                }

                return gameobject;
            }
        },

        /**
         * @property    RenderMaterial: {RenderMaterial}
         *              > get
         *              > set
         * @description The render material attached to this gameobject.
         */
        RenderMaterial:
        {
            get: function getRenderMaterial() { return _RenderMaterial; },
            set: function setRenderMaterial()
            {
                if (arguments[0] instanceof RenderMaterial || arguments[0] === undefined)
                    _RenderMaterial = arguments[0];
            }
        },

        /**
         * @property    Mesh: {Mesh}
         *              > get
         *              > set
         * @description The mesh attached to this gameobject.
         */
        Mesh:
        {
            get: function getMesh() { return _Mesh; },
            set: function setMesh()
            {
                if (arguments[0] instanceof Mesh || arguments[0] === undefined)
                    _Mesh = arguments[0];
            }
        },

        /**
         * @property    PhysicsItem: {PhysicsItem}
         *              > get
         *              > set
         * @description The physics item attached to this gameobject.
         */
        PhysicsItem:
        {
            get: function getPhysicsItem() { return _PhysicsItem; },
            set: function setPhysicsItem()
            {
                if (arguments[0] instanceof PhysicsItem || arguments[0] === undefined)
                    _PhysicsItem = arguments[0];
            }
        },

        /**
         * @property    Animation: {Animation}
         *              > get
         *              > set
         * @description The animation attached to this gameobject.
         */
        Animation:
        {
            get: function getAnimation() { return _Animation; },
            set: function setAnimation()
            {
                if (arguments[0] instanceof Animation || arguments[0] === undefined)
                    _Animation = arguments[0];
            }
        },

        /**
         * @property    particlesystem: {ParticleSystem}
         *              > get
         *              > set
         * @description The particle system attached to this gameobject.
         */
        ParticleSystem:
        {
            get: function getParticleSystem() { return _ParticleSystem; },
            set: function setParticleSystem()
            {
                if (arguments[0] instanceof ParticleSystem || arguments[0] === undefined)
                    _ParticleSystem = arguments[0];
            }
        },

        /**
         * @property    Begin:{Function}
         *              > get
         *              > set
         * @description This method is called upon object creation.
         */
        Begin:
        {
            get: function getBegin() { return _Begin; },
            set: function setBegin()
            {
                if (typeof arguments[0] === 'function')
                    _Begin = arguments[0];
            }
        },

        /**
         * @property    Update: {Function}
         *              > get
         *              > set
         * @description This method is called after each render frame
         */
        Update:
        {
            get: function getUpdate() { return _Update; },
            set: function setUpdate()
            {
                if (typeof arguments[0] === 'function')
                    _Update = arguments[0];
            }
        },

        /**
         * @property    End: {Function}
         *              > get
         *              > set
         * @description This method is called once the gameobject if destroyed.
         */
        End:
        {
            get: function getEnd() { return _End; },
            set: function setEnd()
            {
                if (typeof arguments[0] === 'function')
                    _End = arguments[0];
            }
        }
    });
    
    this.Begin();
    __OBJECT__.push(this);
}
Object.defineProperties(GameObject.prototype,
{
    constructor: { value: GameObject },
    
    /**
     * @function    Clone: {GameObject}
     * @description Creates a clone of a gameobject. If no gameobject is provided,
     *              it creates a clone of the calling gameobject.
     * @param       gameobject:  {GameObject} [nullable]
     */
    Clone:
    {
        value: function Clone(gameobject)
        {       
            var $ = (gameobject instanceof GameObject) ? gameobject : this;

            var clone = new GameObject
            ({
                name:           $.Name,
                material:       $.Material,
                mesh:           $.Mesh,
                transform:      new Transform
                ({
                    position:   $.Transform.Position,
                    rotation:   $.Transform.Rotation,
                    scale:      $.Transform.Scale,
                    shear:      $.Transform.Shear
                }),
                physics:        $.Physics,
                animation:      $.Animation
            });
            
            for (var i = 0; i < $.Children.length; ++i)
                clone.Children.push($.Children[i].Clone());
            
            return clone;
        }
    },

    /**
     * @function    Destroy: void
     * @description Destroys the object after a given amount of time
     * @param       timeout: {Number}
     */
    Destroy:
    {
        value: function Destroy(timeout)
        {
            var self = this;

            if (typeof timeout !== 'number')
                timeout = 0;

            setTimeout(function()
            {
                var i = __OBJECT__.length;
                while (--i >= 0)
                {
                    if (__OBJECT__[i] === self)
                    {
                        __OBJECT__.splice(i, 1);
                        break;
                    }
                }
                self.End();
            }, 1000 * timeout);
        }
    },

    /**
     * @function        ObjectUpdate: void
     * @description     Updates the object
     */
    ObjectUpdate:
    {
        value: function ObjectUpdate()
        {
            this.Update();
            this.Transform.TransformUpdate();
            if (!!this.PhysicsItem)     this.PhysicsItem.PhysicsUpdate();
            if (!!this.Animation)       this.Animation.AnimationUpdate();
            if (!!this.LightItem)       this.LightItem.LightUpdate();
            if (!!this.ParticleSystem)  this.ParticleSystem.ParticleSystemUpdate();
        }
    }
});


/**
 * @constructor Camera
 * @description Something...
 * @module      FWGE.Game
 */
function Camera()
{
    var _Mode   = 0;
    var _FOV    = 35;
    var _Aspect = 16/9;
    var _Near   = 0.1;
    var _Far    = 900;
    var _Left   = -10;
    var _Right  = 10;
    var _Top    = 10;
    var _Bottom = 10;
    var _Theta  = 90;
    var _Phi    = 90;

    Object.defineProperties(this,
    {
        /**
         * @constant    PERSPECTIVE: {Number}
         *              > get
         * @description Represents a perspective rendering mode
         */
        PERSPECTIVE:  { value: 0 },
        
        /**
         * @constant    ORTHOGRAPHIC: {Number}
         *              > get
         * @description Represents an orthographic rendering mode
         */
        ORTHOGRAPHIC: { value: 1 },

        /**
         * @property    Mode: {Number}
         *              > get
         *              > set
         * @description Represent the current rendering mode the camera is using
         */
        Mode:
        { 
            get: function getMode() { return _Mode; },
            set: function setMode()
            { 
                if (arguments[0] === this.PERSPECTIVE || arguments[0] === this.ORTHOGRAPHIC)
                    _Mode = arguments[0];
            }
        },
        
        /**
         * @property    FOV: {Number}
         *              > get
         *              > set
         * @description Represent the current field of view of the camera
         */
        FOV:
        { 
            get: function getFOV() { return _FOV; },
            set: function setFOV()
            { 
                if (typeof arguments[0] === 'number')
                    _FOV = arguments[0];
            }
        },
        
        /**
         * @property    Aspect: {Number}
         *              > get
         *              > set
         * @description Represent the aspect ratio of the camera
         */
        Aspect:
        { 
            get: function getAspect() { return _Aspect; },
            set: function setAspect()
            { 
                if (typeof arguments[0] === 'number')
                    _Aspect = arguments[0];
            }
        },
        
        /**
         * @property    Near: {Number}
         *              > get
         *              > set
         * @description Represent the near clipping plane
         */
        Near:
        { 
            get: function getNear() { return _Near; },
            set: function setNear()
            { 
                if (typeof arguments[0] === 'number')
                    _Near = arguments[0];
            }
        },
        
        /**
         * @property    Far: {Number}
         *              > get
         *              > set
         * @description Represent the far clipping plane
         */
        Far:
        { 
            get: function getFar() { return _Far; },
            set: function setFar()
            { 
                if (typeof arguments[0] === 'number')
                    _Far = arguments[0];
            }
        },
        
        /**
         * @property    Left: {Number}
         *              > get
         *              > set
         * @description Represent the left clipping plane
         */
        Left:
        { 
            get: function getLeft() { return _Left; },
            set: function setLeft()
            { 
                if (typeof arguments[0] === 'number')
                    _Left = arguments[0];
            }
        },
        
        /**
         * @property    Right: {Number}
         *              > get
         *              > set
         * @description Represent the right clipping plane
         */
        Right:
        { 
            get: function getRight() { return _Right; },
            set: function setRight()
            { 
                if (typeof arguments[0] === 'number')
                    _Right = arguments[0];
            }
        },
        
        /**
         * @property    Top: {Number}
         *              > get
         *              > set
         * @description Represent the top clipping plane
         */
        Top:
        { 
            get: function getTop() { return _Top; },
            set: function setTop()
            { 
                if (typeof arguments[0] === 'number')
                    _Top = arguments[0];
            }
        },
        
        /**
         * @property    Bottom: {Number}
         *              > get
         *              > set
         * @description Represent the bottom clipping plane
         */
        Bottom:
        { 
            get: function getBottom() { return _Bottom; },
            set: function setBottom()
            { 
                if (typeof arguments[0] === 'number')
                    _Bottom = arguments[0];
            }
        },
        
        /**
         * @property    Theta: {Number}
         *              > get
         *              > set
         * @description Represent camera's yaw around the scene
         */
        Theta:
        { 
            get: function getTheta() { return _Theta; },
            set: function setTheta()
            { 
                if (typeof arguments[0] === 'number')
                    _Theta = arguments[0];
            }
        },
        
        /**
         * @property    Phi: {Number}
         *              > get
         *              > set
         * @description Represent the camera's pitch around the scene
         */
        Phi:
        { 
            get: function getPhi() { return _Phi; },
            set: function setPhi()
            { 
                if (typeof arguments[0] === 'number')
                    _Phi = arguments[0];
            }
        },
        
        /**
         * @property    CameraUpdate: void
         * @description Updates the camera
         */
        CameraUpdate:
        {
            value: function CameraUpdate()
            {
                GL.canvas.height = GL.canvas.clientHeight;
                GL.canvas.width = GL.canvas.clientWidth;
                _Aspect = GL.drawingBufferWidth/GL.drawingBufferHeight;
            }
        }
    });
}


/**
 * @constructor Particle
 * @description Definition of an animator
 * @module      FWGE.Game
 * @param       request:     {Object}
 */
function Animation(request)
{
    if (!request) request = {};
    request.type = "ANIMATION";
    GameItem.call(this, request);    
}


/**
 * @constructor Time
 * @description This is the running clock that keeps track of elapsed time
 *              between render frames.
 * @module      FWGE.Game
 */
function Time()
{
    var _Now  = undefined,
        _Then = undefined;
    
    Object.defineProperties(this,
    {
        Delta:      { get: function(){ return (_Now - _Then) / 60; } },
        DeltaTime:  { get: function(){ return _Now - _Then; } },
        Now:        { get: function(){ return new Date(Date.now()); } },
        TimeUpdate:
        {
            value: function TimeUpdate()
            {
                if (_Now === undefined && _Then === undefined)
                    _Now = _Then = Date.now();
                else
                {
                    _Then = _Now;
                    _Now = Date.now();
                }
            }
        }
    });
}


/**
 * @constructor Transform
 * @description This object contains all the transformations that 
 *              are to be applied to the parent gameobject.
 * @param       request:    {Object}
 *              > position: {Array}     [nullable]
 *              > rotation: {Array}     [nullable]
 *              > scale:    {Array}     [nullable]
 *              > shear:    {Array}     [nullable]
 */
function Transform(request)
{
    if (!request) request = {};
    request.type ="TRANSFORM";
    GameItem.call(this, request);
    
    function setup(item)
    {
        if (!item || !(item instanceof Array)) item = [0,0,0];

        switch (item.length)
        {
            case 0: item[0] = 0;
            case 1: item[1] = 0;
            case 2: item[2] = 0;
        }

        return FWGE.Game.Maths.Vector3.Create(item);
    }
    
    var _Position   = setup(request.position);
    var _Rotation   = setup(request.rotation);
    var _Scale      = setup(request.scale);
    var _Shear      = setup(request.shear);
    
    var _Up         = FWGE.Game.Maths.Vector3.Create(0, 1, 0);
    var _Forward    = FWGE.Game.Maths.Vector3.Create(0, 0, 1);
    var _Right      = FWGE.Game.Maths.Vector3.Create(1, 0, 0);
    
    Object.defineProperties(this,
    {
        /**
         * @property    Position: {Float32Array}
         * @description The current position of the parent of gameobject
         */
        Position:
        {
            get: function getPosition() { return _Position; },
            set: function setPosition()
            {
                if (arguments[0].Type === "VECTOR3")
                    FWGE.Game.Maths.Vector3.Set(_Position, arguments[0]);
            }
        },

        /**
         * @property    Rotation: {Float32Array}
         * @description The current rotation of the parent of gameobject
         */           
        Rotation:
        {
            get: function getRotation() { return _Rotation; },
            set: function setRotation()
            {
                if (arguments[0].Type === "VECTOR3")
                    FWGE.Game.Maths.Vector3.Set(_Rotation, arguments[0]);
            }
        },

        /**
         * @property    Scale: {Float32Array}
         * @description The current scaling of the parent of gameobject
         */
        Scale:
        {
            get: function getScale() { return _Scale; },
            set: function setScale()
            {
                if (arguments[0].Type === "VECTOR3")
                    FWGE.Game.Maths.Vector3.Set(_Scale, arguments[0]);
            }
        },

        /**
         * @property    Shear: {Float32Array}
         * @description The current shearing of the parent of gameobject
         */
        Shear:
        {
            get: function getShear() { return _Shear; },
            set: function setShear()
            {
                if (arguments[0].Type === "VECTOR3")
                    FWGE.Game.Maths.Vector3.Set(_Shear, arguments[0]);
            }
        },

        /**
         * @property    Up: {Float32Array}
         * @description The parent gameobject's up vector
         */
        Up:         { get: function() { return _Up; } },
        
        /**
         * @property    Forward: {Float32Array}
         * @description The parent gameobject's forward vector
         */
        Forward:    { get: function() { return _Forward; } },
        
        /**
         * @property    Right: {Float32Array}
         * @description The parent gameobject's right vector
         */
        Right:      { get: function() { return _Right; } },
    });
    
    this.TransformUpdate();
}
Object.defineProperties(Transform.prototype,
{
    constructor: {value: Transform},

    /**
     * @property    TransformUpdate: void
     * @description Updates the transformations
     */
    TransformUpdate:
    {
        value: function TransformUpdate()
        {
            // TODO
            // UPDATE: UP, FORWARD, AND RIGHT
        }
    }
});


/**
 * @constructor Input
 * @description This module handles all user key and mouse inputs.
 * @module      FWGE.Game
 */
function Input()
{
    var _UP      = 0;
    var _PRESS   = 128;
    var _DOWN    = 256;
    var _END     = 384;

    var _Keys   = new Array(_END);
    var _Mouse  = new Array(8);
    var _Axis   = new Array(16);

    for (var i = 0; i < _PRESS; ++i)
        _Keys[i] = true;

    for (var i = _PRESS; i < _END; ++i)
        _Keys[i] = false;

    function handle_event(e)
    {
        var key = e.which || e.keyCode || 0;
        
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;

        return key;
    }

    window.onkeyup = function onkeyup(e)
    {
        var key = handle_event(e);

        _Keys[key + _UP   ]    = true;
        _Keys[key + _PRESS]    = false;
        _Keys[key + _DOWN ]    = false;
    };
    window.onkeydown = function onkeydown(e)
    {
        var key = handle_event(e);

        _Keys[key + _UP   ]    = false;
        _Keys[key + _PRESS]    = true;
        _Keys[key + _DOWN ]    = true;
    };

    document.body.oncontextmenu = function oncontextmenu(e) { handle_event(e); return false; };
    window.onmouseenter = function onmouseenter(e)
    {
        var key = handle_event(e);

        //TODO
    };
    window.onmousemove = function onmousemove(e) 
    {
        var key = handle_event(e);

        //TODO
    };
    window.onmouseleave = function onmouseleave(e)
    {
        var key = handle_event(e);

        //TODO
    };
    window.onmousedown = function onmousedown(e) 
    {
        var key = handle_event(e);

        //TODO
    };
    window.onmouseup = function onmouseup(e)   
    {
        var key = handle_event(e);

        //TODO
    };
    
    Object.defineProperties(this, 
    {
        KEY_F1_UP:      { get: function getF1KeyUp()     { return _Keys[112 + _UP   ]; } },
        KEY_F1_PRESS:   { get: function getF1KeyPress()  { return _Keys[112 + _PRESS]; } },
        KEY_F1_DOWN:    { get: function getF1KeyDown()   { return _Keys[112 + _DOWN ]; } },

        KEY_F2_UP:      { get: function getF2KeyUp()     { return _Keys[113 + _UP   ]; } },
        KEY_F2_PRESS:   { get: function getF2KeyPress()  { return _Keys[113 + _PRESS]; } },
        KEY_F2_DOWN:    { get: function getF2KeyDown()   { return _Keys[113 + _DOWN ]; } },

        KEY_F3_UP:      { get: function getF3KeyUp()     { return _Keys[114 + _UP   ]; } },
        KEY_F3_PRESS:   { get: function getF3KeyPress()  { return _Keys[114 + _PRESS]; } },
        KEY_F3_DOWN:    { get: function getF3KeyDown()   { return _Keys[114 + _DOWN ]; } },

        KEY_F4_UP:      { get: function getF4KeyUp()     { return _Keys[115 + _UP   ]; } },
        KEY_F4_PRESS:   { get: function getF4KeyPress()  { return _Keys[115 + _PRESS]; } },
        KEY_F4_DOWN:    { get: function getF4KeyDown()   { return _Keys[115 + _DOWN ]; } },

        KEY_F5_UP:      { get: function getF5KeyUp()     { return _Keys[116 + _UP   ]; } },
        KEY_F5_PRESS:   { get: function getF5KeyPress()  { return _Keys[116 + _PRESS]; } },
        KEY_F5_DOWN:    { get: function getF5KeyDown()   { return _Keys[116 + _DOWN ]; } },

        KEY_F6_UP:      { get: function getF6KeyUp()     { return _Keys[117 + _UP   ]; } },
        KEY_F6_PRESS:   { get: function getF6KeyPress()  { return _Keys[117 + _PRESS]; } },
        KEY_F6_DOWN:    { get: function getF6KeyDown()   { return _Keys[117 + _DOWN ]; } },

        KEY_F7_UP:      { get: function getF7KeyUp()     { return _Keys[118 + _UP   ]; } },
        KEY_F7_PRESS:   { get: function getF7KeyPress()  { return _Keys[118 + _PRESS]; } },
        KEY_F7_DOWN:    { get: function getF7KeyDown()   { return _Keys[118 + _DOWN ]; } },

        KEY_F8_UP:      { get: function getF8KeyUp()     { return _Keys[119 + _UP   ]; } },
        KEY_F8_PRESS:   { get: function getF8KeyPress()  { return _Keys[119 + _PRESS]; } },
        KEY_F8_DOWN:    { get: function getF8KeyDown()   { return _Keys[119 + _DOWN ]; } },

        KEY_F9_UP:      { get: function getF9KeyUp()     { return _Keys[120 + _UP   ]; } },
        KEY_F9_PRESS:   { get: function getF9KeyPress()  { return _Keys[120 + _PRESS]; } },
        KEY_F9_DOWN:    { get: function getF9KeyDown()   { return _Keys[120 + _DOWN ]; } },

        KEY_F10_UP:     { get: function getF10KeyUp()    { return _Keys[121 + _UP   ]; } },
        KEY_F10_PRESS:  { get: function getF10KeyPress() { return _Keys[121 + _PRESS]; } },
        KEY_F10_DOWN:   { get: function getF10KeyDown()  { return _Keys[121 + _DOWN ]; } },

        KEY_F11_UP:     { get: function getF11KeyUp()    { return _Keys[122 + _UP   ]; } },
        KEY_F11_PRESS:  { get: function getF11KeyPress() { return _Keys[122 + _PRESS]; } },
        KEY_F11_DOWN:   { get: function getF11KeyDown()  { return _Keys[122 + _DOWN ]; } },

        KEY_F12_UP:     { get: function getF12KeyUp()    { return _Keys[123 + _UP   ]; } },
        KEY_F12_PRESS:  { get: function getF12KeyPress() { return _Keys[123 + _PRESS]; } },
        KEY_F12_DOWN:   { get: function getF12KeyDown()  { return _Keys[123 + _DOWN ]; } },


        KEY_0_UP:       { get: function get0KeyUp()    { return _Keys[48 + _UP   ]; } },
        KEY_0_PRESS:    { get: function get0KeyPress() { return _Keys[48 + _PRESS]; } },
        KEY_0_DOWN:     { get: function get0KeyDown()  { return _Keys[48 + _DOWN ]; } },

        KEY_1_UP:       { get: function get1KeyUp()    { return _Keys[49 + _UP   ]; } },
        KEY_1_PRESS:    { get: function get1KeyPress() { return _Keys[49 + _PRESS]; } },
        KEY_1_DOWN:     { get: function get1KeyDown()  { return _Keys[49 + _DOWN ]; } },

        KEY_2_UP:       { get: function get2KeyUp()    { return _Keys[50 + _UP   ]; } },
        KEY_2_PRESS:    { get: function get2KeyPress() { return _Keys[50 + _PRESS]; } },
        KEY_2_DOWN:     { get: function get2KeyDown()  { return _Keys[50 + _DOWN ]; } },

        KEY_3_UP:       { get: function get3KeyUp()    { return _Keys[51 + _UP   ]; } },
        KEY_3_PRESS:    { get: function get3KeyPress() { return _Keys[51 + _PRESS]; } },
        KEY_3_DOWN:     { get: function get3KeyDown()  { return _Keys[51 + _DOWN ]; } },

        KEY_4_UP:       { get: function get4KeyUp()    { return _Keys[52 + _UP   ]; } },
        KEY_4_PRESS:    { get: function get4KeyPress() { return _Keys[52 + _PRESS]; } },
        KEY_4_DOWN:     { get: function get4KeyDown()  { return _Keys[52 + _DOWN ]; } },

        KEY_5_UP:       { get: function get5KeyUp()    { return _Keys[53 + _UP   ]; } },
        KEY_5_PRESS:    { get: function get5KeyPress() { return _Keys[53 + _PRESS]; } },
        KEY_5_DOWN:     { get: function get5KeyDown()  { return _Keys[53 + _DOWN ]; } },

        KEY_6_UP:       { get: function get6KeyUp()    { return _Keys[54 + _UP   ]; } },
        KEY_6_PRESS:    { get: function get6KeyPress() { return _Keys[54 + _PRESS]; } },
        KEY_6_DOWN:     { get: function get6KeyDown()  { return _Keys[54 + _DOWN ]; } },

        KEY_7_UP:       { get: function get7KeyUp()    { return _Keys[55 + _UP   ]; } },
        KEY_7_PRESS:    { get: function get7KeyPress() { return _Keys[55 + _PRESS]; } },
        KEY_7_DOWN:     { get: function get7KeyDown()  { return _Keys[55 + _DOWN ]; } },

        KEY_8_UP:       { get: function get8KeyUp()    { return _Keys[56 + _UP   ]; } },
        KEY_8_PRESS:    { get: function get8KeyPress() { return _Keys[56 + _PRESS]; } },
        KEY_8_DOWN:     { get: function get8KeyDown()  { return _Keys[56 + _DOWN ]; } },

        KEY_9_UP:       { get: function get9KeyUp()    { return _Keys[57 + _UP   ]; } },
        KEY_9_PRESS:    { get: function get9KeyPress() { return _Keys[57 + _PRESS]; } },
        KEY_9_DOWN:     { get: function get9KeyDown()  { return _Keys[57 + _DOWN ]; } },


        KEY_NUMPAD_0_UP:       { get: function getNumpad0KeyUp()    { return _Keys[96 + _UP   ]; } },
        KEY_NUMPAD_0_PRESS:    { get: function getNumpad0KeyPress() { return _Keys[96 + _PRESS]; } },
        KEY_NUMPAD_0_DOWN:     { get: function getNumpad0KeyDown()  { return _Keys[96 + _DOWN ]; } },

        KEY_NUMPAD_1_UP:       { get: function getNumpad1KeyUp()    { return _Keys[97 + _UP   ]; } },
        KEY_NUMPAD_1_PRESS:    { get: function getNumpad1KeyPress() { return _Keys[97 + _PRESS]; } },
        KEY_NUMPAD_1_DOWN:     { get: function getNumpad1KeyDown()  { return _Keys[97 + _DOWN ]; } },

        KEY_NUMPAD_2_UP:       { get: function getNumpad2KeyUp()    { return _Keys[98 + _UP   ]; } },
        KEY_NUMPAD_2_PRESS:    { get: function getNumpad2KeyPress() { return _Keys[98 + _PRESS]; } },
        KEY_NUMPAD_2_DOWN:     { get: function getNumpad2KeyDown()  { return _Keys[98 + _DOWN ]; } },

        KEY_NUMPAD_3_UP:       { get: function getNumpad3KeyUp()    { return _Keys[99 + _UP   ]; } },
        KEY_NUMPAD_3_PRESS:    { get: function getNumpad3KeyPress() { return _Keys[99 + _PRESS]; } },
        KEY_NUMPAD_3_DOWN:     { get: function getNumpad3KeyDown()  { return _Keys[99 + _DOWN ]; } },

        KEY_NUMPAD_4_UP:       { get: function getNumpad4KeyUp()    { return _Keys[100 + _UP   ]; } },
        KEY_NUMPAD_4_PRESS:    { get: function getNumpad4KeyPress() { return _Keys[100 + _PRESS]; } },
        KEY_NUMPAD_4_DOWN:     { get: function getNumpad4KeyDown()  { return _Keys[100 + _DOWN ]; } },

        KEY_NUMPAD_5_UP:       { get: function getNumpad5KeyUp()    { return _Keys[101 + _UP   ]; } },
        KEY_NUMPAD_5_PRESS:    { get: function getNumpad5KeyPress() { return _Keys[101 + _PRESS]; } },
        KEY_NUMPAD_5_DOWN:     { get: function getNumpad5KeyDown()  { return _Keys[101 + _DOWN ]; } },

        KEY_NUMPAD_6_UP:       { get: function getNumpad6KeyUp()    { return _Keys[102 + _UP   ]; } },
        KEY_NUMPAD_6_PRESS:    { get: function getNumpad6KeyPress() { return _Keys[102 + _PRESS]; } },
        KEY_NUMPAD_6_DOWN:     { get: function getNumpad6KeyDown()  { return _Keys[102 + _DOWN ]; } },

        KEY_NUMPAD_7_UP:       { get: function getNumpad7KeyUp()    { return _Keys[103 + _UP   ]; } },
        KEY_NUMPAD_7_PRESS:    { get: function getNumpad7KeyPress() { return _Keys[103 + _PRESS]; } },
        KEY_NUMPAD_7_DOWN:     { get: function getNumpad7KeyDown()  { return _Keys[103 + _DOWN ]; } },

        KEY_NUMPAD_8_UP:       { get: function getNumpad8KeyUp()    { return _Keys[104 + _UP   ]; } },
        KEY_NUMPAD_8_PRESS:    { get: function getNumpad8KeyPress() { return _Keys[104 + _PRESS]; } },
        KEY_NUMPAD_8_DOWN:     { get: function getNumpad8KeyDown()  { return _Keys[104 + _DOWN ]; } },

        KEY_NUMPAD_9_UP:       { get: function getNumpad9KeyUp()    { return _Keys[105 + _UP   ]; } },
        KEY_NUMPAD_9_PRESS:    { get: function getNumpad9KeyPress() { return _Keys[105 + _PRESS]; } },
        KEY_NUMPAD_9_DOWN:     { get: function getNumpad9KeyDown()  { return _Keys[105 + _DOWN ]; } },


        KEY_DIVIDE_UP:        { get: function getDivideKeyUp()      { return _Keys[111 + _UP   ]; } },
        KEY_DIVIDE_PRESS:     { get: function getDivideKeyPress()   { return _Keys[111 + _PRESS]; } },
        KEY_DIVIDE_DOWN:      { get: function getDivideKeyDown()    { return _Keys[111 + _DOWN ]; } },

        KEY_MULTIPLY_UP:      { get: function getMultiplyKeyUp()    { return _Keys[106 + _UP   ]; } },
        KEY_MULTIPLY_PRESS:   { get: function getMultiplyKeyPress() { return _Keys[106 + _PRESS]; } },
        KEY_MULTIPLY_DOWN:    { get: function getMultiplyKeyDown()  { return _Keys[106 + _DOWN ]; } },

        KEY_SUBTRACT_UP:      { get: function getSubtractKeyUp()    { return _Keys[109 + _UP   ]; } },
        KEY_SUBTRACT_PRESS:   { get: function getSubtractKeyPress() { return _Keys[109 + _PRESS]; } },
        KEY_SUBTRACT_DOWN:    { get: function getSubtractKeyDown()  { return _Keys[109 + _DOWN ]; } },

        KEY_ADD_UP:           { get: function getAddKeyUp()         { return _Keys[107 + _UP   ]; } },
        KEY_ADD_PRESS:        { get: function getAddKeyPress()      { return _Keys[107 + _PRESS]; } },
        KEY_ADD_DOWN:         { get: function getAddKeyDown()       { return _Keys[107 + _DOWN ]; } },


        KEY_TAB_UP:          { get: function getTABKeyUp()          { return _Keys[9 + _UP   ]; } },
        KEY_TAB_PRESS:       { get: function getTABKeyPress()       { return _Keys[9 + _PRESS]; } },
        KEY_TAB_DOWN:        { get: function getTABKeyDown()        { return _Keys[9 + _DOWN ]; } },

        KEY_CAPS_UP:         { get: function getCAPSKeyUp()         { return _Keys[20 + _UP   ]; } },
        KEY_CAPS_PRESS:      { get: function getCAPSKeyPress()      { return _Keys[20 + _PRESS]; } },
        KEY_CAPS_DOWN:       { get: function getCAPSKeyDown()       { return _Keys[20 + _DOWN ]; } },

        KEY_SHIFT_UP:        { get: function getSHIFTKeyUp()        { return _Keys[16 + _UP   ]; } },
        KEY_SHIFT_PRESS:     { get: function getSHIFTKeyPress()     { return _Keys[16 + _PRESS]; } },
        KEY_SHIFT_DOWN:      { get: function getSHIFTKeyDown()      { return _Keys[16 + _DOWN ]; } },

        KEY_CTRL_UP:         { get: function getCTRLKeyUp()         { return _Keys[17 + _UP   ]; } },
        KEY_CTRL_PRESS:      { get: function getCTRLKeyPress()      { return _Keys[17 + _PRESS]; } },
        KEY_CTRL_DOWN:       { get: function getCTRLKeyDown()       { return _Keys[17 + _DOWN ]; } },

        KEY_ALT_UP:          { get: function getALTKeyUp()          { return _Keys[18 + _UP   ]; } },
        KEY_ALT_PRESS:       { get: function getALTKeyPress()       { return _Keys[18 + _PRESS]; } },
        KEY_ALT_DOWN:        { get: function getALTKeyDown()        { return _Keys[18 + _DOWN ]; } },

        KEY_BACKSPACE_UP:    { get: function getBACKSPACEKeyUp()    { return _Keys[8 + _UP   ]; } },
        KEY_BACKSPACE_PRESS: { get: function getBACKSPACEKeyPress() { return _Keys[8 + _PRESS]; } },
        KEY_BACKSPACE_DOWN:  { get: function getBACKSPACEKeyDown()  { return _Keys[8 + _DOWN ]; } },

        KEY_ENTER_UP:        { get: function getENTERKeyUp()        { return _Keys[13 + _UP   ]; } },
        KEY_ENTER_PRESS:     { get: function getENTERKeyPress()     { return _Keys[13 + _PRESS]; } },
        KEY_ENTER_DOWN:      { get: function getENTERKeyDown()      { return _Keys[13 + _DOWN ]; } },


        KEY_UP_UP:       { get: function getUPKeyUp()       { return _Keys[38 + _UP   ]; } },
        KEY_UP_PRESS:    { get: function getUPKeyPress()    { return _Keys[38 + _PRESS]; } },
        KEY_UP_DOWN:     { get: function getUPKeyDown()     { return _Keys[38 + _DOWN ]; } },

        KEY_LEFT_UP:     { get: function getLEFTKeyUp()     { return _Keys[37 + _UP   ]; } },
        KEY_LEFT_PRESS:  { get: function getLEFTKeyPress()  { return _Keys[37 + _PRESS]; } },
        KEY_LEFT_DOWN:   { get: function getLEFTKeyDown()   { return _Keys[37 + _DOWN ]; } },

        KEY_RIGHT_UP:    { get: function getRIGHTKeyUp()    { return _Keys[40 + _UP   ]; } },
        KEY_RIGHT_PRESS: { get: function getRIGHTKeyPress() { return _Keys[40 + _PRESS]; } },
        KEY_RIGHT_DOWN:  { get: function getRIGHTKeyDown()  { return _Keys[40 + _DOWN ]; } },

        KEY_DOWN_UP:     { get: function getDOWNKeyUp()     { return _Keys[39 + _UP   ]; } },
        KEY_DOWN_PRESS:  { get: function getDOWNKeyPress()  { return _Keys[39 + _PRESS]; } },
        KEY_DOWN_DOWN:   { get: function getDOWNKeyDown()   { return _Keys[39 + _DOWN ]; } },


        KEY_BRACKET_L_UP:     { get: function getTABKeyUp()    { return _Keys[219 + _UP   ]; } },
        KEY_BRACKET_L_PRESS:  { get: function getTABKeyPress() { return _Keys[219 + _PRESS]; } },
        KEY_BRACKET_L_DOWN:   { get: function getTABKeyDown()  { return _Keys[219 + _DOWN ]; } },

        KEY_BRACKET_R_UP:     { get: function getTABKeyUp()    { return _Keys[221 + _UP   ]; } },
        KEY_BRACKET_R_PRESS:  { get: function getTABKeyPress() { return _Keys[221 + _PRESS]; } },
        KEY_BRACKET_R_DOWN:   { get: function getTABKeyDown()  { return _Keys[221 + _DOWN ]; } },

        KEY_COLON_UP:         { get: function getTABKeyUp()    { return _Keys[186 + _UP   ]; } },
        KEY_COLON_PRESS:      { get: function getTABKeyPress() { return _Keys[186 + _PRESS]; } },
        KEY_COLON_DOWN:       { get: function getTABKeyDown()  { return _Keys[186 + _DOWN ]; } },

        KEY_QUOTE_UP:         { get: function getTABKeyUp()    { return _Keys[222 + _UP   ]; } },
        KEY_QUOTE_PRESS:      { get: function getTABKeyPress() { return _Keys[222 + _PRESS]; } },
        KEY_QUOTE_DOWN:       { get: function getTABKeyDown()  { return _Keys[222 + _DOWN ]; } },

        KEY_COMMA_UP:         { get: function getTABKeyUp()    { return _Keys[188 + _UP   ]; } },
        KEY_COMMA_PRESS:      { get: function getTABKeyPress() { return _Keys[188 + _PRESS]; } },
        KEY_COMMA_DOWN:       { get: function getTABKeyDown()  { return _Keys[188 + _DOWN ]; } },

        KEY_PERIOD_UP:        { get: function getTABKeyUp()    { return _Keys[190 + _UP   ]; } },
        KEY_PERIOD_PRESS:     { get: function getTABKeyPress() { return _Keys[190 + _PRESS]; } },
        KEY_PERIOD_DOWN:      { get: function getTABKeyDown()  { return _Keys[190 + _DOWN ]; } },

        KEY_SLASH_F_UP:       { get: function getTABKeyUp()    { return _Keys[191 + _UP   ]; } },
        KEY_SLASH_F_PRESS:    { get: function getTABKeyPress() { return _Keys[191 + _PRESS]; } },
        KEY_SLASH_F_DOWN:     { get: function getTABKeyDown()  { return _Keys[191 + _DOWN ]; } },

        KEY_SLASH_B_UP:       { get: function getTABKeyUp()    { return _Keys[220 + _UP   ]; } },
        KEY_SLASH_B_PRESS:    { get: function getTABKeyPress() { return _Keys[220 + _PRESS]; } },
        KEY_SLASH_B_DOWN:     { get: function getTABKeyDown()  { return _Keys[220 + _DOWN ]; } },


        KEY_A_UP:       { get: function getAKeyUp()     { return _Keys[65 + _UP   ]; } },
        KEY_A_PRESS:    { get: function getAKeyPress()  { return _Keys[65 + _PRESS]; } },
        KEY_A_DOWN:     { get: function getAKeyDown()   { return _Keys[65 + _DOWN ]; } },

        KEY_B_UP:       { get: function getBKeyUp()     { return _Keys[66 + _UP   ]; } },
        KEY_B_PRESS:    { get: function getBKeyPress()  { return _Keys[66 + _PRESS]; } },
        KEY_B_DOWN:     { get: function getBKeyDown()   { return _Keys[66 + _DOWN ]; } },

        KEY_C_UP:       { get: function getCKeyUp()     { return _Keys[67 + _UP   ]; } },
        KEY_C_PRESS:    { get: function getCKeyPress()  { return _Keys[67 + _PRESS]; } },
        KEY_C_DOWN:     { get: function getCKeyDown()   { return _Keys[67 + _DOWN ]; } },

        KEY_D_UP:       { get: function getDKeyUp()     { return _Keys[68 + _UP   ]; } },
        KEY_D_PRESS:    { get: function getDKeyPress()  { return _Keys[68 + _PRESS]; } },
        KEY_D_DOWN:     { get: function getDKeyDown()   { return _Keys[68 + _DOWN ]; } },

        KEY_E_UP:       { get: function getEKeyUp()     { return _Keys[69 + _UP   ]; } },
        KEY_E_PRESS:    { get: function getEKeyPress()  { return _Keys[69 + _PRESS]; } },
        KEY_E_DOWN:     { get: function getEKeyDown()   { return _Keys[69 + _DOWN ]; } },

        KEY_F_UP:       { get: function getFKeyUp()     { return _Keys[70 + _UP   ]; } },
        KEY_F_PRESS:    { get: function getFKeyPress()  { return _Keys[70 + _PRESS]; } },
        KEY_F_DOWN:     { get: function getFKeyDown()   { return _Keys[70 + _DOWN ]; } },

        KEY_G_UP:       { get: function getGKeyUp()     { return _Keys[71 + _UP   ]; } },
        KEY_G_PRESS:    { get: function getGKeyPress()  { return _Keys[71 + _PRESS]; } },
        KEY_G_DOWN:     { get: function getGKeyDown()   { return _Keys[71 + _DOWN ]; } },

        KEY_H_UP:       { get: function getHKeyUp()     { return _Keys[72 + _UP   ]; } },
        KEY_H_PRESS:    { get: function getHKeyPress()  { return _Keys[72 + _PRESS]; } },
        KEY_H_DOWN:     { get: function getHKeyDown()   { return _Keys[72 + _DOWN ]; } },

        KEY_I_UP:       { get: function getIKeyUp()     { return _Keys[73 + _UP   ]; } },
        KEY_I_PRESS:    { get: function getIKeyPress()  { return _Keys[73 + _PRESS]; } },
        KEY_I_DOWN:     { get: function getIKeyDown()   { return _Keys[73 + _DOWN ]; } },

        KEY_J_UP:       { get: function getJKeyUp()     { return _Keys[74 + _UP   ]; } },
        KEY_J_PRESS:    { get: function getJKeyPress()  { return _Keys[74 + _PRESS]; } },
        KEY_J_DOWN:     { get: function getJKeyDown()   { return _Keys[74 + _DOWN ]; } },

        KEY_K_UP:       { get: function getKKeyUp()     { return _Keys[75 + _UP   ]; } },
        KEY_K_PRESS:    { get: function getKKeyPress()  { return _Keys[75 + _PRESS]; } },
        KEY_K_DOWN:     { get: function getKKeyDown()   { return _Keys[75 + _DOWN ]; } },

        KEY_L_UP:       { get: function getLKeyUp()     { return _Keys[76 + _UP   ]; } },
        KEY_L_PRESS:    { get: function getLKeyPress()  { return _Keys[76 + _PRESS]; } },
        KEY_L_DOWN:     { get: function getLKeyDown()   { return _Keys[76 + _DOWN ]; } },

        KEY_M_UP:       { get: function getMKeyUp()     { return _Keys[77 + _UP   ]; } },
        KEY_M_PRESS:    { get: function getMKeyPress()  { return _Keys[77 + _PRESS]; } },
        KEY_M_DOWN:     { get: function getMKeyDown()   { return _Keys[77 + _DOWN ]; } },

        KEY_N_UP:       { get: function getNKeyUp()     { return _Keys[78 + _UP   ]; } },
        KEY_N_PRESS:    { get: function getNKeyPress()  { return _Keys[78 + _PRESS]; } },
        KEY_N_DOWN:     { get: function getNKeyDown()   { return _Keys[78 + _DOWN ]; } },

        KEY_O_UP:       { get: function getOKeyUp()     { return _Keys[79 + _UP   ]; } },
        KEY_O_PRESS:    { get: function getOKeyPress()  { return _Keys[79 + _PRESS]; } },
        KEY_O_DOWN:     { get: function getOKeyDown()   { return _Keys[79 + _DOWN ]; } },

        KEY_P_UP:       { get: function getPKeyUp()     { return _Keys[80 + _UP   ]; } },
        KEY_P_PRESS:    { get: function getPKeyPress()  { return _Keys[80 + _PRESS]; } },
        KEY_P_DOWN:     { get: function getPKeyDown()   { return _Keys[80 + _DOWN ]; } },

        KEY_Q_UP:       { get: function getQKeyUp()     { return _Keys[81 + _UP   ]; } },
        KEY_Q_PRESS:    { get: function getQKeyPress()  { return _Keys[81 + _PRESS]; } },
        KEY_Q_DOWN:     { get: function getQKeyDown()   { return _Keys[81 + _DOWN ]; } },

        KEY_R_UP:       { get: function getRKeyUp()     { return _Keys[82 + _UP   ]; } },
        KEY_R_PRESS:    { get: function getRKeyPress()  { return _Keys[82 + _PRESS]; } },
        KEY_R_DOWN:     { get: function getRKeyDown()   { return _Keys[82 + _DOWN ]; } },

        KEY_S_UP:       { get: function getSKeyUp()     { return _Keys[83 + _UP   ]; } },
        KEY_S_PRESS:    { get: function getSKeyPress()  { return _Keys[83 + _PRESS]; } },
        KEY_S_DOWN:     { get: function getSKeyDown()   { return _Keys[83 + _DOWN ]; } },

        KEY_T_UP:       { get: function getTKeyUp()     { return _Keys[84 + _UP   ]; } },
        KEY_T_PRESS:    { get: function getTKeyPress()  { return _Keys[84 + _PRESS]; } },
        KEY_T_DOWN:     { get: function getTKeyDown()   { return _Keys[84 + _DOWN ]; } },

        KEY_U_UP:       { get: function getUKeyUp()     { return _Keys[85 + _UP   ]; } },
        KEY_U_PRESS:    { get: function getUKeyPress()  { return _Keys[85 + _PRESS]; } },
        KEY_U_DOWN:     { get: function getUKeyDown()   { return _Keys[85 + _DOWN ]; } },

        KEY_V_UP:       { get: function getVKeyUp()     { return _Keys[86 + _UP   ]; } },
        KEY_V_PRESS:    { get: function getVKeyPress()  { return _Keys[86 + _PRESS]; } },
        KEY_V_DOWN:     { get: function getVKeyDown()   { return _Keys[86 + _DOWN ]; } },

        KEY_W_UP:       { get: function getWKeyUp()     { return _Keys[87 + _UP   ]; } },
        KEY_W_PRESS:    { get: function getWKeyPress()  { return _Keys[87 + _PRESS]; } },
        KEY_W_DOWN:     { get: function getWKeyDown()   { return _Keys[87 + _DOWN ]; } },

        KEY_X_UP:       { get: function getXKeyUp()     { return _Keys[88 + _UP   ]; } },
        KEY_X_PRESS:    { get: function getXKeyPress()  { return _Keys[88 + _PRESS]; } },
        KEY_X_DOWN:     { get: function getXKeyDown()   { return _Keys[88 + _DOWN ]; } },

        KEY_Y_UP:       { get: function getYKeyUp()     { return _Keys[89 + _UP   ]; } },
        KEY_Y_PRESS:    { get: function getYKeyPress()  { return _Keys[89 + _PRESS]; } },
        KEY_Y_DOWN:     { get: function getYKeyDown()   { return _Keys[89 + _DOWN ]; } },

        KEY_Z_UP:       { get: function getZKeyUp()     { return _Keys[90 + _UP   ]; } },
        KEY_Z_PRESS:    { get: function getZKeyPress()  { return _Keys[90 + _PRESS]; } },
        KEY_Z_DOWN:     { get: function getZKeyDown()   { return _Keys[90 + _DOWN ]; } },

        InputUpdate:
        {
            value: function InputUpdate()
            {
                for (var i = _PRESS; i < _DOWN; ++i)
                    if (_Keys[i])
                        _Keys[i] = false;
            }
        }
    });
}


var __LIGHT__ = new Array(12);

/**
 * @constructor Light
 * @module      FWGE.Game
 * @description This module is used to create the lights in the scene.
 */
function Light()
{
    var _AmbientCount     = 0;
    var _DirectionalCount = 0;
    var _PointCount       = 0;
    
    var _MAX_AMBIENT      = 1;
    var _MAX_DIRECTIONAL  = 3;
    var _MAX_POINT        = 8;

    Object.defineProperties(this,
    {
        /**
         * @function    Ambient: {AmbientLight}
         * @description Returns a new ambient light object. It is treated as a singleton,
         *              i.e. there is only one ambient light object in a scene.
         * @see         FWGE.Game.Light.AmbientLight
         * @param       request:        {Object}
         *              > parent:       {GameObject}
         *              > colour:       {Float32Array}  [nullable]
         *              > intensity:    {Number}        [nullable]
         */
        Ambient:
        {
            value: function Ambient(request)
            {
                if (_AmbientCount < _MAX_AMBIENT)
                {
                    __LIGHT__[0] = new AmbientLight(request);
                    _AmbientCount++;
                }
            
                return __LIGHT__[0];
            }
        },

        /**
         * @function    Directional: {DirectionalLight}
         * @description Returns a new directional light object. There can up to three
         *              directional light objects in a scene.
         * @see         FWGE.Game.Light.DirectionalLight
         * @param       request:         {Object}
         *              > parent:        {GameObject}
         *              > colour:        {Float32Array}  [nullable]
         *              > intensity:     {Number}        [nullable]
         *              > direction:     {Float32Array}  [nullable]
         */
        Directional:
        {
            value: function Directional(request)
            {
                if (_DirectionalCount < _MAX_DIRECTIONAL)
                {
                    for (var i = 1; i < 4; ++i)
                    {
                        if (__LIGHT__[i] === undefined)
                        {
                            __LIGHT__[i] = new DirectionalLight(request);
                            _DirectionalCount++;

                            return __LIGHT__[i];        
                        }
                    }
                }

                return undefined;
            }
        },

        /**
         * @function    Point: {PointLight}
         * @description Returns a new point light object. There can up to eight
         *              point light objects in a scene.
         * @see         FWGE.Game.Light.PointLight
         * @param       request:        {Object}
         *              > parent:       {GameObject}
         *              > colour:       {Float32Array}  [nullable]
         *              > intensity:    {Number}        [nullable]
         *              > radius:       {Number}        [nullable]
         *              > angle:        {Number}        [nullable]
         */
        Point:
        {
            value: function Point(request)
            {
                if (_PointCount < _MAX_DIRECTIONAL)
                {
                    for (var i = 4; i < 12; ++i)
                    {
                        if (__LIGHT__[i] === undefined)
                        {
                            __LIGHT__[i] = new PointLight(request);
                            _PointCount++;

                            return __LIGHT__[i];        
                        }
                    }
                }

                return undefined;
            }
        },

        /**
         * @function    Remove: void
         * @description Removes a given light object from the scene.
         * @param       light: {LightItem}
         */
        Remove:
        {
            value: function Remove(light)
            {
                if (!!light)
                {
                    switch (light.Type)
                    {
                        case "AMBIENTLIGHT":
                            __LIGHT__[0] = undefined;
                            --_AmbientCount;
                        break;

                        case "DIRECTIONALLIGHT":
                            for (var i = 1; i < 4; ++i)
                            {
                                if (__LIGHT__[i] === light)
                                {
                                    __LIGHT__[i] = undefined;
                                    --_DirectionalCount;
                                    break;
                                }
                            }
                        break;

                        case "POINTLIGHT":
                            for (var i = 4; i < 12; ++i)
                            {
                                if (__LIGHT__[i] === light)
                                {
                                    __LIGHT__[i] = undefined;
                                    --_PointCount;
                                    break;
                                }
                            }
                        break;
                    }
                }
            }
        }
    });
}


/**
 * @constructor LightItem
 * @description Base definition of an object that illuminates the scene.
 * @param       request:        {Object}
 *              > colour:       {Float32Array}  [nullable]
 *              > intensity:    {Number}        [nullable]
 */
function LightItem(request)
{
    if (!request) request = {};
    GameItem.call(this, request);

    var _Colour = request.colour instanceof Float32Array ? request.colour : new Float32Array(3);
    var _Intensity = typeof request.intensity === 'number' ? request.intensity : 1.0;

    Object.defineProperties(this,
    {
        /**
         * @property    Colour: {Float32Array}
         *              > get
         *              > set
         * @description Descrbies the colour that the light object emits.
         */
        Colour:
        {
            get: function getColour() { return _Colour; },
            set: function setColour()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3)
                    FWGE.Game.Maths.Vector3.Set(_Colour, arguments[0]);
            }
        },

        /**
         * @property    Intensity:  {Number}
         *              > get
         *              > set
         * @description Descrbies the intensity at which the light object emits.
         */
        Intensity:
        {
            get: function getIntensity() { return _Intensity; },
            set: function setIntensity()
            {
                if (typeof arguments[0] === 'number')
                    _Intensity = Math.clamp(0, 255, arguments[0]);
            }
        }
    });
}


/**
 * @constructor AmbientLight
 * @description Describes a light that evenly lights the scene.
 * @module      FWGE.Game.Light
 * @param       request:        {Object}
 *              > colour:       {Float32Array}  [nullable]
 *              > intensity:    {Number}        [nullable]
 */
function AmbientLight(request)
{
    if (!request) request = {};
    request.type = "AMBIENTLIGHT";

    LightItem.call(this, request);
}


/**
 * @constructor DirectionalLight
 * @description Definition of a light that shines in a given direction.
 * @module      FWGE.Game.Light
 * @param       request:        {Object}        [nullable]
 *              > colour:       {Float32Array}  [nullable]
 *              > intensity:    {Number}        [nullable]
 *              > direction:    {Float32Array}  [nullable]
 */
function DirectionalLight(request)
{
    if (!request) request = {};
    request.type = "DIRECTIONALLIGHT";
    LightObject.call(this, request);

    var _Direction = (request.direction instanceof Float32Array && request.direction.length === 3) ? request.direction : new Float32Array(3);

    Object.defineProperties(this,
    {
        /**
         * @property    Direction: {Float32Array}
         *              > get
         *              > set
         * @description Returns the direction the light is pointing in.
         */
        Direction:
        {
            get: function getDirection() { return _Direction; },
            set: function setDirection()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3)
                    FWGE.Game.Maths.Vector3.Set(_Direction, arguments[0]);
            }
        },

        /**
         * @function    DirectionalUpdate: void
         * @description Updates the lighting.
         */
        DirectionalUpdate:
        {
            value: function DirectionalUpdate()
            {
                // TODO
                // Update the direction based on the orientation of the containing object.
            }
        }
    });
}


/**
 * @constructor PointLight
 * @description Defines a light Object that emits from a given point within a radius.
 * @module      FWGE.Game.Light
 * @param       request:        {Object}
 *              > colour:       {Float32Array}  [nullable]
 *              > intensity:    {Number}        [nullable]
 *              > radius:       {Number}        [nullable]
 *              > angle:        {Number}        [nullable]
 */
function PointLight(request)
{
    if (!request) request = {};
    request.type = "POINTLIGHT";
    LightObject.call(this, request);
    
    var _Radius = typeof request.radius === 'number' ? request.radius : 5;
    var _Angle = typeof request.angle  === 'number' ? request.angle : 180;
    
    Object.defineProperties(this, 
    {
        /**
         * @property    Radius: {Number}
         *              > get
         *              > set
         * @description The range the light will illuminate 
         */
        Radius:
        {
            get: function getRadius() { return _Radius; },
            set: function setRadius()
            {
                if (typeof arguments[0] === 'number')
                    _Radius = arguments[0];
            }
        },
        
        /**
         * @property    Angle: {Number}
         *              > get
         *              > set
         * @description The angle the light will illuminate.
         *              35 would be a spotlight while 180 would be a globe.
         */
        Angle:
        {
            get: function getAngle() { return _Angle; },
            set: function setAngle()
            {
                if (typeof arguments[0] === 'number')
                    _Angle = Math.clamp(0, 180, arguments[0]);
            }
        }
    });
}


/**
 * @constructor Maths
 * @description This module contains the methods required for matrix and vector
 *              operations.
 * @module      FWGE.Game
 */
function Maths()
{
    Object.defineProperties(this,
    {
        /**
         * @property    Matrix2: {Matrix2}
         *              > get
         * @description Operations for 2x2 matrices.
         * @see         FWGE.Maths.Matrix2
         */
        Matrix2:      { value: new Matrix2() },
        
        /**
         * @property    Matrix3: {Matrix3}
         *              > get
         * @description Operations for 3x3 matrices.
         * @see         FWGE.Maths.Matrix3
         */
        Matrix3:      { value: new Matrix3() },
        
        /**
         * @property    Matrix4: {Matrix4}
         *              > get
         * @description Operations for 4x4 matrices.
         * @see         FWGE.Maths.Matrix4
         */
        Matrix4:      { value: new Matrix4() },
        
        /**
         * @property    Vector2: {Vector2}
         *              > get
         * @description Operations for 2 component veectors.
         * @see         FWGE.Maths.Vector2
         */
        Vector2:      { value: new Vector2() },
        
        /**
         * @property    Vector3: {Vector3}
         *              > get
         * @description Operations for 3 component veectors.
         * @see         FWGE.Maths.Vector3
         */
        Vector3:      { value: new Vector3() },
        
        /**
         * @property    Vector4: {Vector4}
         *              > get
         * @description Operations for 4 component veectors.
         * @see         FWGE.Maths.Vector4
         */
        Vector4:      { value: new Vector4() },
        
        /**
         * @property    Quaternion: {Quaternion}
         *              > get
         * @description Operations for 4 component quaternions.
         * @see         FWGE.Maths.Quaternion
         */
        Quaternion:   { value: new Quaternion() }
    });
};


/**
 * @constructor Matrix2
 * @description This library contains the methods for 2x2 matrix operations.
 *              2x2 matrices are represented as a Float32Array of length 4.
 * @module      FWGE.Game.Maths 
 */
function Matrix2()
{    
    Object.defineProperties(this,
    {
        /**
         * @function    Create: {Float32Array}
         * @description Creates an new Float32Array with the Type set to "MATRIX2".
         *              It also has the appropriate value indexers:
         *              M11, M12,
         *              M21, M22.
         * @param       {Float32Array}  [nullable, override: 1]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         */
        Create:
        {
            value: function Create()
            {                    
                var $ = new Float32Array(4);
                
                $[0] = typeof arguments[0] === 'number' ? arguments[0] : arguments[0] instanceof Array && typeof arguments[0][0] === 'number' ? arguments[0][0] : 0;
                $[1] = typeof arguments[1] === 'number' ? arguments[1] : arguments[0] instanceof Array && typeof arguments[0][1] === 'number' ? arguments[0][1] : 0;
                $[2] = typeof arguments[2] === 'number' ? arguments[2] : arguments[0] instanceof Array && typeof arguments[0][2] === 'number' ? arguments[0][2] : 0;
                $[3] = typeof arguments[3] === 'number' ? arguments[3] : arguments[0] instanceof Array && typeof arguments[0][3] === 'number' ? arguments[0][3] : 0;
                
                Object.defineProperties($,
                {
                    Type: { value: "MATRIX2" },
                    M11:
                    {
                        get: function getM11(){ return $[0]; },
                        set: function setM11(){ if (typeof arguments[0] === 'number') $[0] = arguments[0]; }
                    },
                    M12: 
                    {
                        get: function getM12(){ return $[1]; },
                        set: function setM12(){ if (typeof arguments[0] === 'number') $[1] = arguments[0]; }
                    },
                    M21:
                    {
                        get: function getM21(){ return $[2]; },
                        set: function setM21(){ if (typeof arguments[0] === 'number') $[2] = arguments[0]; }
                    },
                    M22: 
                    {
                        get: function getM22(){ return $[3]; },
                        set: function setM22(){ if (typeof arguments[0] === 'number') $[3] = arguments[0]; }
                    }
                });
                
                return $;
            }
        },
        
        /**
         * @function    Set: {Float32Array}
         * @description Assigns new to the a given Float32Array.
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         */
        Set:
        {
            value: function Set()
            {         
                var $, a, b, c, d;

                $ = arguments[0];
                if (arguments[1] instanceof Float32Array && arguments[0].length === 4)
                {
                    a = arguments[1][0]; b = arguments[1][1];
                    c = arguments[1][2]; d = arguments[1][3];
                }
                else
                {
                    a = arguments[1]; b = arguments[2];
                    c = arguments[3]; d = arguments[4];
                }
                
                if ($ instanceof Float32Array && arguments[0].length === 4 && typeof a === 'number' && typeof b === 'number' && typeof c === 'number' && typeof d === 'number')
                {
                    $[0] = a; $[1] = b;
                    $[2] = c; $[3] = d;

                    return $;
                }
            }
        },
        
        /**
         * @function    Transpose: {Float32Array}
         * @description Transposes a matrix.
         * @param       {Float32Array}
         */
        Transpose:
        {
            value: function Transpose()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                    return this.Set(arguments[0],
                                    arguments[0][0], arguments[0][2],
                                    arguments[0][1], arguments[0][3]);
            }
        },
        
        /**
         * @function    Identity: {Float32Array}
         * @description If given a Float32Array, it resets it to an identity matrix.
         *              If not, it simply returns a new identity matrix.
         * @param       {Float32Array}
         */
        Identity:
        {
            value: function Identiy()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                    return this.Set(arguments[0],
                                    1, 0,
                                    0, 1);
                else
                    return this.Create(1, 0,
                                       0, 1);
            }
        },
        
        /**
         * @function    Determinant: {Number}
         * @description Calculates the determinant of a given Float32Array.
         * @param       {Float32Array}
         */
        Determinant:
        {
            value: function Determinant()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                    return arguments[0][0] * arguments[0][3] - arguments[0][2] * arguments[0][1];
            }
        },
        
        /**
         * @function    Inverse: {Float32Array}
         * @description Inverts a given Float32Array when possible i.e. the determinant
         *              is not 0.
         * @param       {Float32Array}
         */
        Inverse:
        {
            value: function Inverse()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                {
                    var det = this.Determinant(arguments[0]);
                    if (det !== 0)
                        return this.Set( arguments[0],
                                         arguments[0][3] / det, -arguments[0][1] / det,
                                        -arguments[0][2] / det,  arguments[0][0] / det);
                    else
                        return arguments[0];
                }
            }
        },
        
        /**
         * @function    Sum: {Float32Array}
         * @description Adds two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Sum:
        {
            value: function Sum()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4 && arguments[1] instanceof Float32Array && arguments[1].length === 4)
                    return this.Set(arguments[0],
                                    arguments[0][0] + arguments[1][0], arguments[0][1] + arguments[1][1],
                                    arguments[0][2] + arguments[1][2], arguments[0][3] + arguments[1][3]);
            }
        },
        
        /**
         * @function    Mult: {Float32Array}
         * @description Performs a matrix multiplication on two Float32Array or
         *              multiply a Float32Array with a scalar value.
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 2]
         * @param       {Number}        [override 2]
         */
        Mult:
        {
            value: function Mult()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                {
                    if (arguments[1] instanceof Float32Array && arguments[1].length === 4)
                    {
                        return this.Set
                        (
                            arguments[0],
                            arguments[0][0] * arguments[1][0] + arguments[0][1] * arguments[1][2],
                            arguments[0][0] * arguments[1][1] + arguments[0][1] * arguments[1][3],
                            
                            arguments[0][2] * arguments[1][0] + arguments[0][3] * arguments[1][2],
                            arguments[0][2] * arguments[1][1] + arguments[0][3] * arguments[1][3]
                        ); 
                    }
                    else if (typeof arguments[1] === 'number')
                    {
                        return this.Set(arguments[0],
                                        arguments[0][0] * arguments[1], arguments[0][1] * arguments[1],
                                        arguments[0][2] * arguments[1], arguments[0][3] * arguments[1]);
                    }
                }
            }
        },
        
        /**
         * @function    RevMult: {Float32Array}
         * @description Performs a matrix multiplication on two Float32Array but
         *              assigns the result to the second Float32Array.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        RevMult:
        {
            value: function RevMult()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4 && arguments[1] instanceof Float32Array && arguments[1].length === 4)
                {
                    return this.Set
                    (
                        arguments[0],
                        arguments[1][0] * arguments[0][0] + arguments[1][1] * arguments[0][2],
                        arguments[1][0] * arguments[0][1] + arguments[1][1] * arguments[0][3],
                        
                        arguments[1][2] * arguments[0][0] + arguments[1][3] * arguments[0][2],
                        arguments[1][2] * arguments[0][1] + arguments[1][3] * arguments[0][3]
                    ); 
                }                
            }
        } 
    });
}


/**
 * @constructor Matrix3
 * @description This library contains the methods for 3x3 matrix operations.
 *              3x3 matrices are represented as a Float32Array of length 9.
 * @module      FWGE.Game.Maths 
 */
function Matrix3()
{    
    Object.defineProperties(this,
    {
        /**
         * @function    Create: {Float32Array}
         * @description Creates an new Float32Array with the Type set to "MATRIX3".
         *              It also has the appropriate value indexers:
         *              M11, M12, M13,
         *              M21, M22, M23,
         *              M31, M32, M33.
         * @param       {Float32Array}  [nullable, override: 1]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         */
        Create:
        {
            value: function Create()
            {                    
                var $ = new Float32Array(9);
                
                $[0] = typeof arguments[0] === 'number' ? arguments[0] : arguments[0] instanceof Array && typeof arguments[0][0] === 'number' ? arguments[0][0] : 0;
                $[1] = typeof arguments[1] === 'number' ? arguments[1] : arguments[0] instanceof Array && typeof arguments[0][1] === 'number' ? arguments[0][1] : 0;
                $[2] = typeof arguments[2] === 'number' ? arguments[2] : arguments[0] instanceof Array && typeof arguments[0][2] === 'number' ? arguments[0][2] : 0;
                $[3] = typeof arguments[3] === 'number' ? arguments[3] : arguments[0] instanceof Array && typeof arguments[0][3] === 'number' ? arguments[0][3] : 0;
                $[4] = typeof arguments[4] === 'number' ? arguments[4] : arguments[0] instanceof Array && typeof arguments[0][4] === 'number' ? arguments[0][4] : 0;
                $[5] = typeof arguments[5] === 'number' ? arguments[5] : arguments[0] instanceof Array && typeof arguments[0][5] === 'number' ? arguments[0][5] : 0;
                $[6] = typeof arguments[6] === 'number' ? arguments[6] : arguments[0] instanceof Array && typeof arguments[0][6] === 'number' ? arguments[0][6] : 0;
                $[7] = typeof arguments[7] === 'number' ? arguments[7] : arguments[0] instanceof Array && typeof arguments[0][7] === 'number' ? arguments[0][7] : 0;
                $[8] = typeof arguments[8] === 'number' ? arguments[8] : arguments[0] instanceof Array && typeof arguments[0][8] === 'number' ? arguments[0][8] : 0;
                
                Object.defineProperties($,
                {
                    Type: { value: "MATRIX3" },
                    M11:
                    {
                        get: function getM11(){ return $[0]; },
                        set: function setM11(){ if (typeof arguments[0] === 'number') $[0] = arguments[0]; }
                    },
                    M12: 
                    {
                        get: function getM12(){ return $[1]; },
                        set: function setM12(){ if (typeof arguments[0] === 'number') $[1] = arguments[0]; }
                    },
                    M13:
                    {
                        get: function getM13(){ return $[2]; },
                        set: function setM13(){ if (typeof arguments[0] === 'number') $[2] = arguments[0]; }
                    },
                    M21: 
                    {
                        get: function getM21(){ return $[3]; },
                        set: function setM21(){ if (typeof arguments[0] === 'number') $[3] = arguments[0]; }
                    },
                    M22:
                    {
                        get: function getM22(){ return $[4]; },
                        set: function setM22(){ if (typeof arguments[0] === 'number') $[4] = arguments[0]; }
                    },
                    M23: 
                    {
                        get: function getM23(){ return $[5]; },
                        set: function setM23(){ if (typeof arguments[0] === 'number') $[5] = arguments[0]; }
                    },
                    M31:
                    {
                        get: function getM31(){ return $[6]; },
                        set: function setM31(){ if (typeof arguments[0] === 'number') $[6] = arguments[0]; }
                    },
                    M32: 
                    {
                        get: function getM32(){ return $[7]; },
                        set: function setM32(){ if (typeof arguments[0] === 'number') $[7] = arguments[0]; }
                    },
                    M33: 
                    {
                        get: function getM33(){ return $[8]; },
                        set: function setM33(){ if (typeof arguments[0] === 'number') $[8] = arguments[0]; }
                    }
                });
                
                return $;
            }
        },
        
        /**
         * @function    Set: {Float32Array}
         * @description Assigns new to the a given Float32Array.
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         */
        Set:
        {
            value: function Set()
            {         
                var $, a, b, c, d, e, f, g, h, i;

                $ = arguments[0];
                if (arguments[1] instanceof Float32Array && arguments[0].length === 9)
                {
                    a = arguments[1][0]; b = arguments[1][1]; c = arguments[1][2];
                    d = arguments[1][3]; e = arguments[1][4]; f = arguments[1][5];
                    g = arguments[1][6]; h = arguments[1][7]; i = arguments[1][8];
                }
                else
                {
                    a = arguments[1]; b = arguments[2]; c = arguments[3];
                    d = arguments[4]; e = arguments[5]; f = arguments[6];
                    g = arguments[7]; h = arguments[8]; i = arguments[9];
                }
                
                if ($ instanceof Float32Array && arguments[0].length === 9 && typeof a === 'number' && typeof b === 'number' && typeof c === 'number' && typeof d === 'number' && typeof e === 'number' && typeof f === 'number' && typeof g === 'number' && typeof h === 'number' && typeof i === 'number')
                {
                    $[0] = a; $[1] = b; $[2] = c;                        
                    $[3] = d; $[4] = e; $[5] = f;                        
                    $[6] = g; $[7] = h; $[8] = i;

                    return $;
                }                  
            }
        },
        
        /**
         * @function    Transpose: {Float32Array}
         * @description Transposes a matrix.
         * @param       {Float32Array}
         */
        Transpose:
        {
            value: function Transpose()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9)
                    return this.Set(arguments[0],
                                    arguments[0][0], arguments[0][3], arguments[0][6],
                                    arguments[0][1], arguments[0][4], arguments[0][7],
                                    arguments[0][2], arguments[0][5], arguments[0][8]);
            }
        },
        
        /**
         * @function    Identity: {Float32Array}
         * @description If given a Float32Array, it resets it to an identity matrix.
         *              If not, it simply returns a new identity matrix.
         * @param       {Float32Array}
         */
        Identity:
        {
            value: function Identiy()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9)
                    return this.Set(arguments[0],
                                    1, 0, 0,
                                    0, 1, 0,
                                    0, 0, 1);
                else
                    return this.Create(1, 0, 0,
                                       0, 1, 0,
                                       0, 0, 1);
            }
        },
        
        /**
         * @function    Determinant: {Number}
         * @description Calculates the determinant of a given Float32Array.
         * @param       {Float32Array}
         */
        Determinant:
        {
            value: function Determinant()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9)
                    return arguments[0][0] * (arguments[0][4] * arguments[0][8] - arguments[0][5] * arguments[0][7]) -
                            arguments[0][1] * (arguments[0][3] * arguments[0][8] - arguments[0][5] * arguments[0][6]) + 
                            arguments[0][2] * (arguments[0][3] * arguments[0][7] - arguments[0][4] * arguments[0][6]);
            }
        },
        
        /**
         * @function    Inverse: {Float32Array}
         * @description Inverts a given Float32Array when possible i.e. the determinant
         *              is not 0.
         * @param       {Float32Array}
         */
        Inverse:
        {
            value: function Inverse()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9)
                {
                    var det = this.Determinant(arguments[0]);
                    if (det !== 0)
                        return this.Set(arguments[0],
                                         (arguments[0][4] * arguments[0][8] - arguments[0][7] * arguments[0][5]) / det,
                                        -(arguments[0][1] * arguments[0][8] - arguments[0][7] * arguments[0][2]) / det,
                                         (arguments[0][1] * arguments[0][5] - arguments[0][4] * arguments[0][2]) / det,
                                        
                                        -(arguments[0][3] * arguments[0][8] - arguments[0][6] * arguments[0][5]) / det,
                                         (arguments[0][0] * arguments[0][8] - arguments[0][6] * arguments[0][2]) / det,
                                        -(arguments[0][0] * arguments[0][5] - arguments[0][3] * arguments[0][2]) / det,
                                        
                                         (arguments[0][3] * arguments[0][7] - arguments[0][6] * arguments[0][4]) / det,
                                        -(arguments[0][0] * arguments[0][7] - arguments[0][6] * arguments[0][1]) / det,
                                         (arguments[0][0] * arguments[0][4] - arguments[0][3] * arguments[0][1]) / det);
                    else
                        return arguments[0];
                }
            }
        },
        
        /**
         * @function    Sum: {Float32Array}
         * @description Adds two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Sum:
        {
            value: function Sum()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9 && arguments[1] instanceof Float32Array && arguments[1].length === 9)
                    return this.Set(arguments[0],
                                    arguments[0][0] + arguments[1][0], arguments[0][1] + arguments[1][1], arguments[0][2] + arguments[1][2],
                                    arguments[0][3] + arguments[1][3], arguments[0][4] + arguments[1][4], arguments[0][5] + arguments[1][5],
                                    arguments[0][6] + arguments[1][6], arguments[0][7] + arguments[1][7], arguments[0][8] + arguments[1][8]);
            }
        },
        
        /**
         * @function    Mult: {Float32Array}
         * @description Performs a matrix multiplication on two Float32Array or
         *              multiply a Float32Array with a scalar value.
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 2]
         * @param       {Number}        [override 2]
         */
        Mult:
        {
            value: function Mult()
            {
                
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9)
                {
                    if (arguments[1] instanceof Float32Array && arguments[1].length === 9)
                    {
                        return this.Set
                        (
                            arguments[0],
                            arguments[0][0] * arguments[1][0] + arguments[0][1] * arguments[1][3] + arguments[0][2] * arguments[1][6],
                            arguments[0][0] * arguments[1][1] + arguments[0][1] * arguments[1][4] + arguments[0][2] * arguments[1][7],
                            arguments[0][0] * arguments[1][2] + arguments[0][1] * arguments[1][5] + arguments[0][2] * arguments[1][8],
                            
                            arguments[0][3] * arguments[1][0] + arguments[0][4] * arguments[1][3] + arguments[0][5] * arguments[1][6],
                            arguments[0][3] * arguments[1][1] + arguments[0][4] * arguments[1][4] + arguments[0][5] * arguments[1][7],
                            arguments[0][3] * arguments[1][2] + arguments[0][4] * arguments[1][5] + arguments[0][5] * arguments[1][8],
                            
                            arguments[0][6] * arguments[1][0] + arguments[0][7] * arguments[1][3] + arguments[0][8] * arguments[1][6],
                            arguments[0][6] * arguments[1][1] + arguments[0][7] * arguments[1][4] + arguments[0][8] * arguments[1][7],
                            arguments[0][6] * arguments[1][2] + arguments[0][7] * arguments[1][5] + arguments[0][8] * arguments[1][8]
                        ); 
                    }
                    else if (typeof arguments[1] === 'number')
                    {
                        return this.Set(arguments[0],
                                        arguments[0][0] * arguments[1], arguments[0][1] * arguments[1], arguments[0][2] * arguments[1],
                                        arguments[0][3] * arguments[1], arguments[0][4] * arguments[1], arguments[0][5] * arguments[1],
                                        arguments[0][6] * arguments[1], arguments[0][7] * arguments[1], arguments[0][8] * arguments[1]);
                    }
                }
            }
        },
        
        /**
         * @function    RevMult: {Float32Array}
         * @description Performs a matrix multiplication on two Float32Array but
         *              assigns the result to the second Float32Array.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        RevMult:
        {
            value: function RevMult()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9 && arguments[1] instanceof Float32Array && arguments[1].length === 9)
                {
                    return this.Set
                    (
                        arguments[1],
                        arguments[0][0] * arguments[1][0] + arguments[0][1] * arguments[1][3] + arguments[0][2] * arguments[1][6],
                        arguments[0][0] * arguments[1][1] + arguments[0][1] * arguments[1][4] + arguments[0][2] * arguments[1][7],
                        arguments[0][0] * arguments[1][2] + arguments[0][1] * arguments[1][5] + arguments[0][2] * arguments[1][8],
                        
                        arguments[0][3] * arguments[1][0] + arguments[0][4] * arguments[1][3] + arguments[0][5] * arguments[1][6],
                        arguments[0][3] * arguments[1][1] + arguments[0][4] * arguments[1][4] + arguments[0][5] * arguments[1][7],
                        arguments[0][3] * arguments[1][2] + arguments[0][4] * arguments[1][5] + arguments[0][5] * arguments[1][8],
                        
                        arguments[0][6] * arguments[1][0] + arguments[0][7] * arguments[1][3] + arguments[0][8] * arguments[1][6],
                        arguments[0][6] * arguments[1][1] + arguments[0][7] * arguments[1][4] + arguments[0][8] * arguments[1][7],
                        arguments[0][6] * arguments[1][2] + arguments[0][7] * arguments[1][5] + arguments[0][8] * arguments[1][8]
                    );
                }                
            }
        } 
    });
}


/**
 * @constructor Matrix4
 * @description This library contains the methods for 2x2 matrix operations.
 *              4x4 matrices are represented as a Float32Array of length 16.
 * @module      FWGE.Game.Maths 
 */
function Matrix4()
{
    Object.defineProperties(this,
    {
        /**
         * @function    Create: {Float32Array}
         * @description Creates an new Float32Array with the Type set to "MATRIX4".
         *              It also has the appropriate value indexers:
         *              M11, M12, M13, M14,
         *              M21, M22, M23, M24,
         *              M31, M32, M33, M34,
         *              M41, M42, M43, M44.
         * @param       {Float32Array}  [nullable, override: 1]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         */
        Create:
        {
            value: function Create()
            {                    
                var $ = new Float32Array(16);
                
                $[0] = typeof arguments[0] === 'number' ? arguments[0] : arguments[0] instanceof Array && typeof arguments[0][0] === 'number' ? arguments[0][0] : 0;
                $[1] = typeof arguments[1] === 'number' ? arguments[1] : arguments[0] instanceof Array && typeof arguments[0][1] === 'number' ? arguments[0][1] : 0;
                $[2] = typeof arguments[2] === 'number' ? arguments[2] : arguments[0] instanceof Array && typeof arguments[0][2] === 'number' ? arguments[0][2] : 0;
                $[3] = typeof arguments[3] === 'number' ? arguments[3] : arguments[0] instanceof Array && typeof arguments[0][3] === 'number' ? arguments[0][3] : 0;
                $[4] = typeof arguments[4] === 'number' ? arguments[4] : arguments[0] instanceof Array && typeof arguments[0][4] === 'number' ? arguments[0][4] : 0;
                $[5] = typeof arguments[5] === 'number' ? arguments[5] : arguments[0] instanceof Array && typeof arguments[0][5] === 'number' ? arguments[0][5] : 0;
                $[6] = typeof arguments[6] === 'number' ? arguments[6] : arguments[0] instanceof Array && typeof arguments[0][6] === 'number' ? arguments[0][6] : 0;
                $[7] = typeof arguments[7] === 'number' ? arguments[7] : arguments[0] instanceof Array && typeof arguments[0][7] === 'number' ? arguments[0][7] : 0;
                $[8] = typeof arguments[8] === 'number' ? arguments[8] : arguments[0] instanceof Array && typeof arguments[0][8] === 'number' ? arguments[0][8] : 0;
                $[9] = typeof arguments[9] === 'number' ? arguments[9] : arguments[0] instanceof Array && typeof arguments[0][9] === 'number' ? arguments[0][9] : 0;
                $[10] = typeof arguments[10] === 'number' ? arguments[10] : arguments[0] instanceof Array && typeof arguments[0][10] === 'number' ? arguments[0][10] : 0;
                $[11] = typeof arguments[11] === 'number' ? arguments[11] : arguments[0] instanceof Array && typeof arguments[0][11] === 'number' ? arguments[0][11] : 0;
                $[12] = typeof arguments[12] === 'number' ? arguments[12] : arguments[0] instanceof Array && typeof arguments[0][12] === 'number' ? arguments[0][12] : 0;
                $[13] = typeof arguments[13] === 'number' ? arguments[13] : arguments[0] instanceof Array && typeof arguments[0][13] === 'number' ? arguments[0][13] : 0;
                $[14] = typeof arguments[14] === 'number' ? arguments[14] : arguments[0] instanceof Array && typeof arguments[0][14] === 'number' ? arguments[0][14] : 0;
                $[15] = typeof arguments[15] === 'number' ? arguments[15] : arguments[0] instanceof Array && typeof arguments[0][15] === 'number' ? arguments[0][15] : 0;
                
                Object.defineProperties($,
                {
                    Type: { value: "MATRIX4" },
                    M11:
                    {
                        get: function getM11(){ return $[0]; },
                        set: function setM11(){ if (typeof arguments[0] === 'number') $[0] = arguments[0]; }
                    },
                    M12: 
                    {
                        get: function getM12(){ return $[1]; },
                        set: function setM12(){ if (typeof arguments[0] === 'number') $[1] = arguments[0]; }
                    },
                    M13:
                    {
                        get: function getM13(){ return $[2]; },
                        set: function setM13(){ if (typeof arguments[0] === 'number') $[2] = arguments[0]; }
                    },
                    M14:
                    {
                        get: function getM14(){ return $[3]; },
                        set: function setM14(){ if (typeof arguments[0] === 'number') $[3] = arguments[0]; }
                    },
                    M21: 
                    {
                        get: function getM21(){ return $[4]; },
                        set: function setM21(){ if (typeof arguments[0] === 'number') $[4] = arguments[0]; }
                    },
                    M22:
                    {
                        get: function getM22(){ return $[5]; },
                        set: function setM22(){ if (typeof arguments[0] === 'number') $[5] = arguments[0]; }
                    },
                    M23: 
                    {
                        get: function getM23(){ return $[6]; },
                        set: function setM23(){ if (typeof arguments[0] === 'number') $[6] = arguments[0]; }
                    },
                    M24: 
                    {
                        get: function getM24(){ return $[7]; },
                        set: function setM24(){ if (typeof arguments[0] === 'number') $[7] = arguments[0]; }
                    },
                    M31:
                    {
                        get: function getM31(){ return $[8]; },
                        set: function setM31(){ if (typeof arguments[0] === 'number') $[8] = arguments[0]; }
                    },
                    M32: 
                    {
                        get: function getM32(){ return $[9]; },
                        set: function setM32(){ if (typeof arguments[0] === 'number') $[9] = arguments[0]; }
                    },
                    M33: 
                    {
                        get: function getM33(){ return $[10]; },
                        set: function setM33(){ if (typeof arguments[0] === 'number') $[10] = arguments[0]; }
                    },
                    M34: 
                    {
                        get: function getM34(){ return $[11]; },
                        set: function setM34(){ if (typeof arguments[0] === 'number') $[11] = arguments[0]; }
                    },
                    M41:
                    {
                        get: function getM31(){ return $[12]; },
                        set: function setM31(){ if (typeof arguments[0] === 'number') $[12] = arguments[0]; }
                    },
                    M42: 
                    {
                        get: function getM32(){ return $[13]; },
                        set: function setM32(){ if (typeof arguments[0] === 'number') $[13] = arguments[0]; }
                    },
                    M43: 
                    {
                        get: function getM33(){ return $[14]; },
                        set: function setM33(){ if (typeof arguments[0] === 'number') $[14] = arguments[0]; }
                    },
                    M44: 
                    {
                        get: function getM34(){ return $[15]; },
                        set: function setM34(){ if (typeof arguments[0] === 'number') $[15] = arguments[0]; }
                    }
                });
                
                return $;
            }
        },
        
        /**
         * @function    Set: {Float32Array}
         * @description Assigns new to the a given Float32Array.
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         */
        Set:
        {
            value: function Set()
            {         
                var $, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p;

                $ = arguments[0];
                if (arguments[1] instanceof Float32Array && arguments[0].length === 16)
                {
                    a = arguments[1][0];  b = arguments[1][1];  c = arguments[1][2];  d = arguments[1][3];
                    e = arguments[1][4];  f = arguments[1][5];  g = arguments[1][6];  h = arguments[1][7];
                    i = arguments[1][8];  j = arguments[1][9];  k = arguments[1][10]; l = arguments[1][11];
                    m = arguments[1][12]; n = arguments[1][13]; o = arguments[1][14]; p = arguments[1][15];
                }
                else
                {
                    a = arguments[1];  b = arguments[2];  c = arguments[3];  d = arguments[4];
                    e = arguments[5];  f = arguments[6];  g = arguments[7];  h = arguments[8];
                    i = arguments[9];  j = arguments[10]; k = arguments[11]; l = arguments[12];
                    m = arguments[13]; n = arguments[14]; o = arguments[15]; p = arguments[16];
                }
                
                if ($ instanceof Float32Array && arguments[0].length === 16 && typeof a === 'number' && typeof b === 'number' && typeof c === 'number' && typeof d === 'number' && typeof e === 'number' && typeof f === 'number' && typeof g === 'number' && typeof h === 'number' && typeof i === 'number' && typeof j === 'number' && typeof k === 'number' && typeof l === 'number' && typeof m === 'number' && typeof n === 'number' && typeof o === 'number' && typeof p === 'number')
                {
                    $[0] = a;  $[1] = b;  $[2] = c;  $[3] = d;                        
                    $[4] = e;  $[5] = f;  $[6] = g;  $[7] = h;                        
                    $[8] = i;  $[9] = j;  $[10] = k; $[11] = l;                        
                    $[12] = m; $[13] = n; $[14] = o; $[15] = p;

                    return $;
                }                  
            }
        },
        
        /**
         * @function    Transpose: {Float32Array}
         * @description Transposes a matrix.
         * @param       {Float32Array}
         */
        Transpose:
        {
            value: function Transpose()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 16)
                    return this.Set(arguments[0],
                                    arguments[0][0], arguments[0][4], arguments[0][8], arguments[0][12],
                                    arguments[0][1], arguments[0][5], arguments[0][9], arguments[0][13],
                                    arguments[0][2], arguments[0][6], arguments[0][10], arguments[0][14],
                                    arguments[0][3], arguments[0][7], arguments[0][11], arguments[0][15]);
                
                Error("TRANSPOSE", arguments);
            }
        },
        
        /**
         * @function    Identity: {Float32Array}
         * @description If given a Float32Array, it resets it to an identity matrix.
         *              If not, it simply returns a new identity matrix.
         * @param       {Float32Array}
         */
        Identity:
        {
            value: function Identiy()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 16)
                    return this.Set(arguments[0],
                                    1, 0, 0, 0,
                                    0, 1, 0, 0,
                                    0, 0, 1, 0,
                                    0, 0, 0, 1);
                else
                    return this.Create(1, 0, 0, 0,
                                       0, 1, 0, 0,
                                       0, 0, 1, 0,
                                       0, 0, 0, 1);
            }
        },
        
        /**
         * @function    Determinant: {Number}
         * @description Calculates the determinant of a given Float32Array.
         * @param       {Float32Array}
         */
        Determinant:
        {
            value: function Determinant()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 16)
                    return arguments[0][0] * arguments[0][5] * arguments[0][10] * arguments[0][15] +
                        arguments[0][0] * arguments[0][6] * arguments[0][11] * arguments[0][13] +
                        arguments[0][0] * arguments[0][7] *  arguments[0][9] * arguments[0][14] +
                        arguments[0][1] * arguments[0][4] * arguments[0][11] * arguments[0][14] +
                        arguments[0][1] * arguments[0][6] *  arguments[0][8] * arguments[0][15] +
                        arguments[0][1] * arguments[0][7] * arguments[0][10] * arguments[0][12] +
                        arguments[0][2] * arguments[0][4] *  arguments[0][9] * arguments[0][15] +
                        arguments[0][2] * arguments[0][5] * arguments[0][11] * arguments[0][12] +
                        arguments[0][2] * arguments[0][7] *  arguments[0][8] * arguments[0][13] +
                        arguments[0][3] * arguments[0][4] * arguments[0][10] * arguments[0][13] +
                        arguments[0][3] * arguments[0][5] *  arguments[0][8] * arguments[0][14] +
                        arguments[0][3] * arguments[0][6] *  arguments[0][9] * arguments[0][12] -
                        arguments[0][0] * arguments[0][5] * arguments[0][11] * arguments[0][14] -
                        arguments[0][0] * arguments[0][6] *  arguments[0][9] * arguments[0][15] -
                        arguments[0][0] * arguments[0][7] * arguments[0][10] * arguments[0][13] -
                        arguments[0][1] * arguments[0][4] * arguments[0][10] * arguments[0][15] -
                        arguments[0][1] * arguments[0][6] * arguments[0][11] * arguments[0][12] -
                        arguments[0][1] * arguments[0][7] *  arguments[0][8] * arguments[0][14] -
                        arguments[0][2] * arguments[0][4] * arguments[0][11] * arguments[0][13] -
                        arguments[0][2] * arguments[0][5] *  arguments[0][8] * arguments[0][15] -
                        arguments[0][2] * arguments[0][7] *  arguments[0][9] * arguments[0][12] -
                        arguments[0][3] * arguments[0][4] *  arguments[0][9] * arguments[0][14] -
                        arguments[0][3] * arguments[0][5] * arguments[0][10] * arguments[0][12] -
                        arguments[0][3] * arguments[0][6] *  arguments[0][8] * arguments[0][13];
            }
        },
        
        /**
         * @function    Inverse: {Float32Array}
         * @description Inverts a given Float32Array when possible i.e. the determinant
         *              is not 0.
         * @param       {Float32Array}
         */
        Inverse:
        {
            value: function Inverse()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 16)
                {
                    var det = this.Determinant(arguments[0]);
                    if (det !== 0)
                        return this.Set(arguments[0],
                                        (arguments[0][5] * arguments[0][10] * arguments[0][15] +
                                         arguments[0][6] * arguments[0][11] * arguments[0][13] +
                                         arguments[0][7] *  arguments[0][9] * arguments[0][14] -
                                         arguments[0][5] * arguments[0][11] * arguments[0][14] -
                                         arguments[0][6] *  arguments[0][9] * arguments[0][15] -
                                         arguments[0][7] * arguments[0][10] * arguments[0][13]) / det,
                                        (arguments[0][1] * arguments[0][11] * arguments[0][14] +
                                         arguments[0][2] *  arguments[0][9] * arguments[0][15] +
                                         arguments[0][3] * arguments[0][10] * arguments[0][13] -
                                         arguments[0][1] * arguments[0][10] * arguments[0][15] -
                                         arguments[0][2] * arguments[0][11] * arguments[0][13] -
                                         arguments[0][3] *  arguments[0][9] * arguments[0][14]) / det,
                                        (arguments[0][1] * arguments[0][6] * arguments[0][15] +
                                         arguments[0][2] * arguments[0][7] * arguments[0][13] +
                                         arguments[0][3] * arguments[0][5] * arguments[0][14] -
                                         arguments[0][1] * arguments[0][7] * arguments[0][14] -
                                         arguments[0][2] * arguments[0][5] * arguments[0][15] -
                                         arguments[0][3] * arguments[0][6] * arguments[0][13]) / det,
                                        (arguments[0][1] * arguments[0][7] * arguments[0][10] +
                                         arguments[0][2] * arguments[0][5] * arguments[0][11] +
                                         arguments[0][3] * arguments[0][6] *  arguments[0][9] -
                                         arguments[0][1] * arguments[0][6] * arguments[0][11] -
                                         arguments[0][2] * arguments[0][7] *  arguments[0][9] -
                                         arguments[0][3] * arguments[0][5] * arguments[0][10]) / det,
                                        
                                        (arguments[0][4] * arguments[0][11] * arguments[0][14] +
                                         arguments[0][6] *  arguments[0][8] * arguments[0][15] +
                                         arguments[0][7] * arguments[0][10] * arguments[0][12] -
                                         arguments[0][4] * arguments[0][10] * arguments[0][15] -
                                         arguments[0][6] * arguments[0][11] * arguments[0][12] -
                                         arguments[0][7] *  arguments[0][8] * arguments[0][14]) / det,
                                        (arguments[0][0] * arguments[0][10] * arguments[0][15] +
                                         arguments[0][2] * arguments[0][11] * arguments[0][12] +
                                         arguments[0][3] *  arguments[0][8] * arguments[0][14] -
                                         arguments[0][0] * arguments[0][11] * arguments[0][14] -
                                         arguments[0][2] *  arguments[0][8] * arguments[0][15] -
                                         arguments[0][3] * arguments[0][10] * arguments[0][12]) / det,
                                        (arguments[0][0] * arguments[0][7] * arguments[0][14] +
                                         arguments[0][2] * arguments[0][4] * arguments[0][15] +
                                         arguments[0][3] * arguments[0][6] * arguments[0][12] -
                                         arguments[0][0] * arguments[0][6] * arguments[0][15] -
                                         arguments[0][2] * arguments[0][7] * arguments[0][12] -
                                         arguments[0][3] * arguments[0][4] * arguments[0][14]) / det,
                                        (arguments[0][0] * arguments[0][6] * arguments[0][11] +
                                         arguments[0][2] * arguments[0][7] *  arguments[0][8] +
                                         arguments[0][3] * arguments[0][4] * arguments[0][10] -
                                         arguments[0][0] * arguments[0][7] * arguments[0][10] -
                                         arguments[0][2] * arguments[0][4] * arguments[0][11] -
                                         arguments[0][3] * arguments[0][6] * arguments[0][8]) / det,
                                        
                                        (arguments[0][4] *  arguments[0][9] * arguments[0][15] +
                                         arguments[0][5] * arguments[0][11] * arguments[0][12] +
                                         arguments[0][7] *  arguments[0][8] * arguments[0][13] -
                                         arguments[0][4] * arguments[0][11] * arguments[0][13] -
                                         arguments[0][5] *  arguments[0][8] * arguments[0][15] -
                                         arguments[0][7] *  arguments[0][9] * arguments[0][12]) / det,
                                        (arguments[0][0] * arguments[0][11] * arguments[0][13] +
                                         arguments[0][1] *  arguments[0][8] * arguments[0][15] +
                                         arguments[0][3] *  arguments[0][9] * arguments[0][12] -
                                         arguments[0][0] *  arguments[0][9] * arguments[0][15] -
                                         arguments[0][1] * arguments[0][11] * arguments[0][12] -
                                         arguments[0][3] *  arguments[0][8] * arguments[0][13]) / det,
                                        (arguments[0][0] * arguments[0][5] * arguments[0][15] +
                                         arguments[0][1] * arguments[0][7] * arguments[0][12] +
                                         arguments[0][3] * arguments[0][4] * arguments[0][13] -
                                         arguments[0][0] * arguments[0][7] * arguments[0][13] -
                                         arguments[0][1] * arguments[0][4] * arguments[0][15] -
                                         arguments[0][3] * arguments[0][5] * arguments[0][12]) / det,
                                        (arguments[0][0] * arguments[0][7] *  arguments[0][9] +
                                         arguments[0][1] * arguments[0][4] * arguments[0][11] +
                                         arguments[0][3] * arguments[0][5] *  arguments[0][8] -
                                         arguments[0][0] * arguments[0][5] * arguments[0][11] -
                                         arguments[0][1] * arguments[0][7] *  arguments[0][8] -
                                         arguments[0][3] * arguments[0][4] *  arguments[0][9]) / det,
                                        
                                        (arguments[0][4] * arguments[0][10] * arguments[0][13] +
                                         arguments[0][5] *  arguments[0][8] * arguments[0][14] +
                                         arguments[0][6] *  arguments[0][9] * arguments[0][12] -
                                         arguments[0][4] *  arguments[0][9] * arguments[0][14] -
                                         arguments[0][5] * arguments[0][10] * arguments[0][12] -
                                         arguments[0][6] *  arguments[0][8] * arguments[0][13]) / det,
                                        (arguments[0][0] *  arguments[0][9] * arguments[0][14] +
                                         arguments[0][1] * arguments[0][10] * arguments[0][12] +
                                         arguments[0][2] *  arguments[0][8] * arguments[0][13] -
                                         arguments[0][0] * arguments[0][10] * arguments[0][13] -
                                         arguments[0][1] *  arguments[0][8] * arguments[0][14] -
                                         arguments[0][2] *  arguments[0][9] * arguments[0][12]) / det,
                                        (arguments[0][0] * arguments[0][6] * arguments[0][13] +
                                         arguments[0][1] * arguments[0][4] * arguments[0][14] +
                                         arguments[0][2] * arguments[0][5] * arguments[0][12] -
                                         arguments[0][0] * arguments[0][5] * arguments[0][14] -
                                         arguments[0][1] * arguments[0][6] * arguments[0][12] -
                                         arguments[0][2] * arguments[0][4] * arguments[0][13]) / det,
                                        (arguments[0][0] * arguments[0][5] * arguments[0][10] +
                                         arguments[0][1] * arguments[0][6] * arguments[0][8] +
                                         arguments[0][2] * arguments[0][4] * arguments[0][9] -
                                         arguments[0][0] * arguments[0][6] * arguments[0][9] -
                                         arguments[0][1] * arguments[0][4] * arguments[0][10] -
                                         arguments[0][2] * arguments[0][5] * arguments[0][8]) / det);
                    else
                        return arguments[0];
                }
            }
        },
        
        /**
         * @function    Sum: {Float32Array}
         * @description Adds two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Sum:
        {
            value: function Sum()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 16 && arguments[1] instanceof Float32Array && arguments[1].length === 16)
                    return this.Set(arguments[0],
                                    arguments[0][0]  + arguments[1][0], arguments[0][1]  + arguments[1][1],
                                    arguments[0][2]  + arguments[1][2], arguments[0][3]  + arguments[1][3],
                                    
                                    arguments[0][4]  + arguments[1][4], arguments[0][5]  + arguments[1][5],
                                    arguments[0][6]  + arguments[1][6], arguments[0][7]  + arguments[1][7],
                                    
                                    arguments[0][8]  + arguments[1][8], arguments[0][9]  + arguments[1][9],
                                    arguments[0][10] + arguments[1][10], arguments[0][11] + arguments[1][11],
                                    
                                    arguments[0][12] + arguments[1][12], arguments[0][13] + arguments[1][13],
                                    arguments[0][14] + arguments[1][14], arguments[0][15] + arguments[1][15]);
            }
        },
        
        /**
         * @function    Mult: {Float32Array}
         * @description Performs a matrix multiplication on two Float32Array or
         *              multiply a Float32Array with a scalar value.
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 2]
         * @param       {Number}        [override 2]
         */
        Mult:
        {
            value: function Mult()
            {
                
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 16)
                {
                    if (arguments[1] instanceof Float32Array && arguments[1].length === 16)
                    {
                        return this.Set
                        (
                            arguments[0],
                            arguments[0][0]  * arguments[1][0] + arguments[0][1]  * arguments[1][4] + arguments[0][2]  * arguments[1][8]  + arguments[0][3]  * arguments[1][12],
                            arguments[0][0]  * arguments[1][1] + arguments[0][1]  * arguments[1][5] + arguments[0][2]  * arguments[1][9]  + arguments[0][3]  * arguments[1][13],
                            arguments[0][0]  * arguments[1][2] + arguments[0][1]  * arguments[1][6] + arguments[0][2]  * arguments[1][10] + arguments[0][3]  * arguments[1][14],
                            arguments[0][0]  * arguments[1][3] + arguments[0][1]  * arguments[1][7] + arguments[0][2]  * arguments[1][11] + arguments[0][3]  * arguments[1][15],
                            
                            arguments[0][4]  * arguments[1][0] + arguments[0][5]  * arguments[1][4] + arguments[0][6]  * arguments[1][8]  + arguments[0][7]  * arguments[1][12],
                            arguments[0][4]  * arguments[1][1] + arguments[0][5]  * arguments[1][5] + arguments[0][6]  * arguments[1][9]  + arguments[0][7]  * arguments[1][13],
                            arguments[0][4]  * arguments[1][2] + arguments[0][5]  * arguments[1][6] + arguments[0][6]  * arguments[1][10] + arguments[0][7]  * arguments[1][14],
                            arguments[0][4]  * arguments[1][3] + arguments[0][5]  * arguments[1][7] + arguments[0][6]  * arguments[1][11] + arguments[0][7]  * arguments[1][15],
                            
                            arguments[0][8]  * arguments[1][0] + arguments[0][9]  * arguments[1][4] + arguments[0][10] * arguments[1][8]  + arguments[0][11] * arguments[1][12],
                            arguments[0][8]  * arguments[1][1] + arguments[0][9]  * arguments[1][5] + arguments[0][10] * arguments[1][9]  + arguments[0][11] * arguments[1][13],
                            arguments[0][8]  * arguments[1][2] + arguments[0][9]  * arguments[1][6] + arguments[0][10] * arguments[1][10] + arguments[0][11] * arguments[1][14],
                            arguments[0][8]  * arguments[1][3] + arguments[0][9]  * arguments[1][7] + arguments[0][10] * arguments[1][11] + arguments[0][11] * arguments[1][15],
                            
                            arguments[0][12] * arguments[1][0] + arguments[0][13] * arguments[1][4] + arguments[0][14] * arguments[1][8]  + arguments[0][15] * arguments[1][12],
                            arguments[0][12] * arguments[1][1] + arguments[0][13] * arguments[1][5] + arguments[0][14] * arguments[1][9]  + arguments[0][15] * arguments[1][13],
                            arguments[0][12] * arguments[1][2] + arguments[0][13] * arguments[1][6] + arguments[0][14] * arguments[1][10] + arguments[0][15] * arguments[1][14],
                            arguments[0][12] * arguments[1][3] + arguments[0][13] * arguments[1][7] + arguments[0][14] * arguments[1][11] + arguments[0][15] * arguments[1][15]
                        ); 
                    }
                    else if (typeof arguments[1] === 'number')
                    {
                        return this.Set(arguments[0],
                                        arguments[0][0] * arguments[1], arguments[0][1] * arguments[1], arguments[0][2] * arguments[1], arguments[0][3] * arguments[1],
                                        arguments[0][4] * arguments[1], arguments[0][5] * arguments[1], arguments[0][6] * arguments[1], arguments[0][7] * arguments[1],
                                        arguments[0][8] * arguments[1], arguments[0][9] * arguments[1], arguments[0][10] * arguments[1], arguments[0][11] * arguments[1],
                                        arguments[0][12] * arguments[1], arguments[0][13] * arguments[1], arguments[0][14] * arguments[1], arguments[0][15] * arguments[1]);
                    }
                }
            }
        },
        
        /**
         * @function    RevMult: {Float32Array}
         * @description Performs a matrix multiplication on two Float32Array but
         *              assigns the result to the second Float32Array.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        RevMult:
        {
            value: function RevMult()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 9 && arguments[1] instanceof Float32Array && arguments[1].length === 16)
                {
                    return this.Set
                    (
                        arguments[1],
                        arguments[0][0]  * arguments[1][0] + arguments[0][1]  * arguments[1][4] + arguments[0][2]  * arguments[1][8]  + arguments[0][3]  * arguments[1][12],
                        arguments[0][0]  * arguments[1][1] + arguments[0][1]  * arguments[1][5] + arguments[0][2]  * arguments[1][9]  + arguments[0][3]  * arguments[1][13],
                        arguments[0][0]  * arguments[1][2] + arguments[0][1]  * arguments[1][6] + arguments[0][2]  * arguments[1][10] + arguments[0][3]  * arguments[1][14],
                        arguments[0][0]  * arguments[1][3] + arguments[0][1]  * arguments[1][7] + arguments[0][2]  * arguments[1][11] + arguments[0][3]  * arguments[1][15],

                        arguments[0][4]  * arguments[1][0] + arguments[0][5]  * arguments[1][4] + arguments[0][6]  * arguments[1][8]  + arguments[0][7]  * arguments[1][12],
                        arguments[0][4]  * arguments[1][1] + arguments[0][5]  * arguments[1][5] + arguments[0][6]  * arguments[1][9]  + arguments[0][7]  * arguments[1][13],
                        arguments[0][4]  * arguments[1][2] + arguments[0][5]  * arguments[1][6] + arguments[0][6]  * arguments[1][10] + arguments[0][7]  * arguments[1][14],
                        arguments[0][4]  * arguments[1][3] + arguments[0][5]  * arguments[1][7] + arguments[0][6]  * arguments[1][11] + arguments[0][7]  * arguments[1][15],

                        arguments[0][8]  * arguments[1][0] + arguments[0][9]  * arguments[1][4] + arguments[0][10] * arguments[1][8]  + arguments[0][11] * arguments[1][12],
                        arguments[0][8]  * arguments[1][1] + arguments[0][9]  * arguments[1][5] + arguments[0][10] * arguments[1][9]  + arguments[0][11] * arguments[1][13],
                        arguments[0][8]  * arguments[1][2] + arguments[0][9]  * arguments[1][6] + arguments[0][10] * arguments[1][10] + arguments[0][11] * arguments[1][14],
                        arguments[0][8]  * arguments[1][3] + arguments[0][9]  * arguments[1][7] + arguments[0][10] * arguments[1][11] + arguments[0][11] * arguments[1][15],

                        arguments[0][12] * arguments[1][0] + arguments[0][13] * arguments[1][4] + arguments[0][14] * arguments[1][8]  + arguments[0][15] * arguments[1][12],
                        arguments[0][12] * arguments[1][1] + arguments[0][13] * arguments[1][5] + arguments[0][14] * arguments[1][9]  + arguments[0][15] * arguments[1][13],
                        arguments[0][12] * arguments[1][2] + arguments[0][13] * arguments[1][6] + arguments[0][14] * arguments[1][10] + arguments[0][15] * arguments[1][14],
                        arguments[0][12] * arguments[1][3] + arguments[0][13] * arguments[1][7] + arguments[0][14] * arguments[1][11] + arguments[0][15] * arguments[1][15]
                    );
                }
            }
        } 
    });
}


function Quaternion()
{
    // TODO
}


/**
 * @constructor Vector2
 * @description This library contains the methods for 2 component vector operations.
 *              2 component vector are represented as a Float32Array of length 2.
 * @module      FWGE.Game.Maths 
 */
function Vector2()
{
    Object.defineProperties(this,
    {
        /**
         * @function    Create: {Float32Array}
         * @description Creates an new Float32Array with the Type set to "VECTOR2".
         *              It also has the appropriate value indexers:
         *              <X, Y>.
         * @param       {Float32Array}  [nullable, override: 1]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         */
        Create:
        {
            value: function Create()
            {
                var $ = new Float32Array(2);
                
                $[0] = typeof arguments[0] === 'number' ? arguments[0] : arguments[0] instanceof Array && typeof arguments[0][0] === 'number' ? arguments[0][0] : 0;
                $[1] = typeof arguments[1] === 'number' ? arguments[1] : arguments[0] instanceof Array && typeof arguments[0][1] === 'number' ? arguments[0][1] : 0;
                
                Object.defineProperties($,
                {
                    Type: { value: "VECTOR2" },
                    X:
                    {
                        get: function getX(){ return $[0]; },
                        set: function setX()
                        {
                            if (typeof arguments[0] === 'number')
                                $[0] = arguments[0];
                        }
                    },
                    Y:
                    {
                        get: function getY(){ return $[1]; },
                        set: function setY()
                        {
                            if (typeof arguments[0] === 'number')
                                $[1] = arguments[0];
                        }
                    }
                });
                
                return $;
            }
        },
        
        /**
         * @function    Set: {Float32Array}
         * @description Assigns new values to the a given Float32Array.
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         */
        Set:
        {
            value: function Set()
            {
                var $, x, y;

                $ = arguments[0];
                if (arguments[1] instanceof Float32Array && arguments[0].length === 2)
                {
                    x = arguments[1][0];
                    y = arguments[1][1];
                }
                else
                {
                    x = arguments[1];
                    y = arguments[2];
                }
                
                if ($ instanceof Float32Array && $.length === 2 && typeof x === 'number' && typeof y === 'number' && typeof z === 'number')
                {
                    $[0] = x;
                    $[1] = y;

                    return $;
                }
            }
        },
        
        /**
         * @function    Length: {Number}
         * @description Calculates the length of a given Float32Array.
         * @param       {Float32Array}
         */
        Length:
        {
            value: function Length()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 2)
                    return Math.sqrt(arguments[0][0] * arguments[0][0] + arguments[0][1] * arguments[0][1]);
            }
        },
        
        /**
         * @function    Sum: {Float32Array}
         * @description Adds two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Sum:
        {
            value: function Sum()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 2 && arguments[1] instanceof Float32Array && arguments[1].length === 2)
                    return this.Set(arguments[0], arguments[0][0] + arguments[1][0], arguments[0][1] + arguments[1][1]);
            }
        },
        
        /**
         * @function    Diff: {Float32Array}
         * @description Subtracts two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Diff:
        {
            value: function Diff()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 2 && arguments[1] instanceof Float32Array && arguments[1].length === 2)
                    return this.Create(arguments[1][0] - arguments[0][0], arguments[1][1] - arguments[0][1]);
            }
        },
        
        /**
         * @function    Mult: {Float32Array}
         * @description Multiplies two Float32Array component-wise. If the second parameter is
         *              a number, the Float32Array is scale by it.
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 2]
         * @param       {Number}        [override 2]
         */
        Mult:
        {
            value: function Mult()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 2)
                {
                    if (arguments[1] instanceof Float32Array && arguments[1].length === 2)
                        return this.Set(arguments[0], arguments[0][0] * arguments[1][0], arguments[0][1] * arguments[1][1]);
                    else if (typeof arguments[1] === 'number')
                        return this.Set(arguments[0], arguments[0][0] * arguments[1], arguments[0][1] * arguments[1]);
                }
            }
        },
        
        /**
         * @function    Dot: {Number}
         * @description Calculates the dot product of two Float32Array objects.
         * @param       {Float32Array}
         */
        Dot:
        {
            value: function Dot()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 2 && arguments[1] instanceof Float32Array && arguments[1].length === 2)
                        return arguments[0][0] * arguments[1][0] + arguments[0][1] * arguments[1][1];
            }
        },
        
        /**
         * @function    Unit: {Float32Array}
         * @description Scales the given Float32Array down to a unit vector i.e. the length is 1
         * @param       {Float32Array}
         */
        Unit:
        {
            value: function Unit()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 2)
                {
                    var length = this.Length(arguments[0]);
                    if (length !== 0)
                        return this.Mult(arguments[0], 1 / length);
                }
            }
        },
        
        /**
         * @function    Cross: {Float32Array}
         * @description Performs a cross multiplication on two Float32Array objects
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Cross:
        {
            value: function Cross()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 2 && arguments[1] instanceof Float32Array && arguments[1].length === 2)
                    return this.Create(arguments[0][1] * arguments[1][2] + arguments[0][2] * arguments[1][1], arguments[0][2] * arguments[1][0] - arguments[0][0] * arguments[1][2], arguments[0][0] * arguments[1][1] + arguments[0][1] * arguments[1][0]);
            }
        }
    });
}


/**
 * @constructor Vector3
 * @description This library contains the methods for 2 component vector operations.
 *              3 component vector are represented as a Float32Array of length 3.
 * @module      FWGE.Game.Maths 
 */
function Vector3()
{
    Object.defineProperties(this,
    {
        /**
         * @function    Create: {Float32Array}
         * @description Creates an new Float32Array with the Type set to "VECTOR2".
         *              It also has the appropriate value indexers:
         *              <X, Y, Z>.
         * @param       {Float32Array}  [nullable, override: 1]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         */
        Create:
        {
            value: function Create()
            {
                var $ = new Float32Array(3);
                
                $[0] = typeof arguments[0] === 'number' ? arguments[0] : arguments[0] instanceof Array && typeof arguments[0][0] === 'number' ? arguments[0][0] : 0;
                $[1] = typeof arguments[1] === 'number' ? arguments[1] : arguments[0] instanceof Array && typeof arguments[0][1] === 'number' ? arguments[0][1] : 0;
                $[2] = typeof arguments[2] === 'number' ? arguments[2] : arguments[0] instanceof Array && typeof arguments[0][2] === 'number' ? arguments[0][2] : 0;
                
                Object.defineProperties($,
                {
                    Type: { value: "VECTOR3" },
                    X:
                    {
                        get: function getX(){ return $[0]; },
                        set: function setX()
                        {
                            if (typeof arguments[0] === 'number')
                                $[0] = arguments[0];
                        }
                    },
                    Y:
                    {
                        get: function getY(){ return $[1]; },
                        set: function setY()
                        {
                            if (typeof arguments[0] === 'number')
                                $[1] = arguments[0];
                        }
                    },
                    Z:
                    {
                        get: function getZ(){ return $[2]; },
                        set: function setZ()
                        {
                            if (typeof arguments[0] === 'number')
                                $[2] = arguments[0];
                        }
                    }
                });
                
                return $;
            }
        },
        
        /**
         * @function    Set: {Float32Array}
         * @description Assigns new values to the a given Float32Array.
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         */
        Set:
        {
            value: function Set()
            {
                var $, x, y, z;

                $ = arguments[0];
                if (arguments[1] instanceof Float32Array && arguments[0].length === 3)
                {
                    x = arguments[1][0];
                    y = arguments[1][1];
                    z = arguments[1][2];
                }
                else
                {
                    x = arguments[1];
                    y = arguments[2];
                    z = arguments[3];
                }
                
                if ($ instanceof Float32Array && $.length === 3 && typeof x === 'number' && typeof y === 'number' && typeof z === 'number')
                {
                    $[0] = x;
                    $[1] = y;
                    $[2] = z;

                    return $;
                }
            }
        },
        
        /**
         * @function    Length: {Number}
         * @description Calculates the length of a given Float32Array.
         * @param       {Float32Array}
         */
        Length:
        {
            value: function Length()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3)
                    return Math.sqrt(arguments[0][0] * arguments[0][0] + arguments[0][1] * arguments[0][1] + arguments[0][2] * arguments[0][2]);
            }
        },
        
        /**
         * @function    Sum: {Float32Array}
         * @description Adds two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Sum:
        {
            value: function Sum()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3 && arguments[2] instanceof Float32Array && arguments[1].length === 3)
                    return this.Set(arguments[0], arguments[0][0] + arguments[1][0], arguments[0][1] + arguments[1][1], arguments[0][2] + arguments[1][2]);
            }
        },
        
        /**
         * @function    Diff: {Float32Array}
         * @description Subtracts two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Diff:
        {
            value: function Diff()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3 && arguments[2] instanceof Float32Array && arguments[1].length === 3)
                    return this.Create(arguments[1][0] - arguments[0][0], arguments[1][1] - arguments[0][1], arguments[1][2] - arguments[0][2]);
            }
        },
        
        /**
         * @function    Mult: {Float32Array}
         * @description Multiplies two Float32Array component-wise. If the second parameter is
         *              a number, the Float32Array is scale by it.
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 2]
         * @param       {Number}        [override 2]
         */
        Mult:
        {
            value: function Mult()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3)
                {
                    if (arguments[1] instanceof Float32Array && arguments[1].length === 3)
                        return this.Set(arguments[0], arguments[0][0] * arguments[1][0], arguments[0][1] * arguments[1][1], arguments[0][2] * arguments[1][2]);
                    else if (typeof arguments[1] === 'number')
                        return this.Set(arguments[0], arguments[0][0] * arguments[1], arguments[0][1] * arguments[1], arguments[0][2] * arguments[1]);
                }
            }
        },
        
        /**
         * @function    Dot: {Number}
         * @description Calculates the dot product of two Float32Array objects.
         * @param       {Float32Array}
         */
        Dot:
        {
            value: function Dot()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3 && arguments[1] instanceof Float32Array && arguments[1].length === 3)
                        return arguments[0][0] * arguments[1][0] + arguments[0][1] * arguments[1][1] + arguments[0][2] * arguments[1][2];
            }
        },
        
        /**
         * @function    Unit: {Float32Array}
         * @description Scales the given Float32Array down to a unit vector i.e. the length is 1
         * @param       {Float32Array}
         */
        Unit:
        {
            value: function Unit()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3)
                {
                    var length = this.Length(arguments[0]);
                    if (length !== 0)
                        return this.Mult(arguments[0], 1 / length);
                }
            }
        },
        
        /**
         * @function    Cross: {Float32Array}
         * @description Performs a cross multiplication on two Float32Array objects
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Cross:
        {
            value: function Cross()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 3 && arguments[1] instanceof Float32Array && arguments[1].length === 3)
                    return this.Create(arguments[0][1] * arguments[1][2] + arguments[0][2] * arguments[1][1], arguments[0][2] * arguments[1][0] - arguments[0][0] * arguments[1][2], arguments[0][0] * arguments[1][1] + arguments[0][1] * arguments[1][0]);
            }
        }
    });
}


/**
 * @constructor Vector4
 * @description This library contains the methods for 2 component vector operations.
 *              4 component vector are represented as a Float32Array of length 4.
 * @module      FWGE.Game.Maths 
 */
function Vector4()
{
    Object.defineProperties(this,
    {
        /**
         * @function    Create: {Float32Array}
         * @description Creates an new Float32Array with the Type set to "VECTOR2".
         *              It also has the appropriate value indexers:
         *              <W, X, Y, Z>.
         * @param       {Float32Array}  [nullable, override: 1]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         */
        Create:
        {
            value: function Create()
            {
                var $ = new Float32Array(4);
                
                $[0] = typeof arguments[0] === 'number' ? arguments[0] : arguments[0] instanceof Array && typeof arguments[0][0] === 'number' ? arguments[0][0] : 0;
                $[1] = typeof arguments[1] === 'number' ? arguments[1] : arguments[0] instanceof Array && typeof arguments[0][1] === 'number' ? arguments[0][1] : 0;
                $[2] = typeof arguments[2] === 'number' ? arguments[2] : arguments[0] instanceof Array && typeof arguments[0][2] === 'number' ? arguments[0][2] : 0;
                $[3] = typeof arguments[3] === 'number' ? arguments[3] : arguments[0] instanceof Array && typeof arguments[0][3] === 'number' ? arguments[0][3] : 0;
                
                Object.defineProperties($,
                {
                    Type: { value: "VECTOR4" },
                    W:
                    {
                        get: function(){ return $[0]; },
                        set: function()
                        {
                            if (typeof arguments[0] === 'number')
                                $[0] = arguments[0];
                        }
                    },
                    X:
                    {
                        get: function(){ return $[1]; },
                        set: function()
                        {
                            if (typeof arguments[0] === 'number')
                                $[1] = arguments[0];
                        }
                    },
                    Y:
                    {
                        get: function(){ return $[2]; },
                        set: function()
                        {
                            if (typeof arguments[0] === 'number')
                                $[2] = arguments[0];
                        }
                    },
                    Z:
                    {
                        get: function(){ return $[3]; },
                        set: function()
                        {
                            if (typeof arguments[0] === 'number')
                                $[3] = arguments[0];
                        }
                    }
                });
                
                return $;
            }
        },
        
        /**
         * @function    Set: {Float32Array}
         * @description Assigns new values to the a given Float32Array.
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         */
        Set:
        {
            value: function Set()
            {
                var $, w, x, y, z;

                $ = arguments[0];
                if (arguments[1] instanceof Float32Array && arguments[0].length === 4)
                {
                    w = arguments[1][0];
                    x = arguments[1][1];
                    y = arguments[1][2];
                    z = arguments[1][3];
                }
                else
                {
                    w = arguments[1];
                    x = arguments[2];
                    y = arguments[3];
                    z = arguments[4];
                }
                
                if ($ instanceof Float32Array && $.length === 4 && typeof w === 'number' && typeof x === 'number' && typeof y === 'number' && typeof z === 'number')
                {
                    $[0] = w;
                    $[1] = x;
                    $[2] = y;
                    $[3] = z;

                    return $;
                }
            }
        },
        
        /**
         * @function    Length: {Number}
         * @description Calculates the length of a given Float32Array.
         * @param       {Float32Array}
         */
        Length:
        {
            value: function Length()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                    return Math.sqrt(arguments[0][0] * arguments[0][0] + arguments[0][1] * arguments[0][1] + arguments[0][2] * arguments[0][2]);
            }
        },
        
        /**
         * @function    Sum: {Float32Array}
         * @description Adds two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Sum:
        {
            value: function Sum()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4 && arguments[2] instanceof Float32Array && arguments[1].length === 4)
                    return this.Set(arguments[0], arguments[0][0] + arguments[1][0], arguments[0][1] + arguments[1][1], arguments[0][2] + arguments[1][2], arguments[0][3] + arguments[1][3]);
            }
        },
        
        /**
         * @function    Diff: {Float32Array}
         * @description Subtracts two Float32Array component-wise.
         * @param       {Float32Array}
         * @param       {Float32Array}
         */
        Diff:
        {
            value: function Diff()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4 && arguments[2] instanceof Float32Array && arguments[1].length === 4)
                    return this.Create(arguments[1][0] - arguments[0][0], arguments[1][1] - arguments[0][1], arguments[1][2] - arguments[0][2], arguments[1][3] - arguments[0][3]);
            }
        },
        
        /**
         * @function    Mult: {Float32Array}
         * @description Multiplies two Float32Array component-wise. If the second parameter is
         *              a number, the Float32Array is scale by it.
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 1]
         * @param       {Float32Array}  [override 2]
         * @param       {Number}        [override 2]
         */
        Mult:
        {
            value: function Mult()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                {
                    if (arguments[1] instanceof Float32Array && arguments[1].length === 3)
                        return this.Set(arguments[0], arguments[0][0] * arguments[1][0], arguments[0][1] * arguments[1][1], arguments[0][2] * arguments[1][2], arguments[0][3] * arguments[1][3]);
                    else if (typeof arguments[1] === 'number')
                        return this.Set(arguments[0], arguments[0][0] * arguments[1], arguments[0][1] * arguments[1], arguments[0][2] * arguments[1], arguments[0][3] * arguments[1]);
                }
            }
        },
        
        /**
         * @function    Dot: {Number}
         * @description Calculates the dot product of two Float32Array objects.
         * @param       {Float32Array}
         */
        Dot:
        {
            value: function Dot()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4 && arguments[1] instanceof Float32Array && arguments[1].length === 4)
                        return arguments[0][0] * arguments[1][0] + arguments[0][1] * arguments[1][1] + arguments[0][2] * arguments[1][2] + arguments[0][3] * arguments[1][3];
            }
        },
        
        /**
         * @function    Unit: {Float32Array}
         * @description Scales the given Float32Array down to a unit vector i.e. the length is 1
         * @param       {Float32Array}
         */
        Unit:
        {
            value: function Unit()
            {
                
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                {
                    var length = this.Length(arguments[0]);
                    if (length !== 0)
                        return this.Mult(arguments[0], 1 / length);
                }
            }
        }
    });
}


/**
 * @constructor Particle
 * @description Definition of a single particle.
 * @module      FWGE.Game.ParticleSystem
 * @param       request:     {Object}
 */
function Particle(request)
{
    if (!request) request = {};
    request.type = "PARTICLE";
    GameItem.call(this, request);
}
/**
 * @constructor ParticleSystem
 * @description Definition of a particle system.
 * @module      FWGE.Game
 * @param       request:     {Object}
 */
function ParticleSystem(request)
{
    if (!request) request = {};
    request.type = "PARTICLESYSTEM";
    GameItem.call(this, request);
}


/**
 * @constructor PhysicsEngine
 * @description Something...
 * @module      FWGE
 */
function PhysicsEngine()
{
    Object.defineProperties(this,
    {
        /**
         * @property    Collision: {Number}
         * @description Constructor for a Collision object.
         * @see         FWGE.Physics.Collision
         */
        Collision:      {value: Collision},
        
        /**
         * @property    Collision: {Number}
         * @description Constructor for a Physics Body.
         * @see         FWGE.Physics.PhysicsBody
         */
        PhysicsBody:    {value: PhysicsBody},
        
        /**
         * @property    Collision: {Number}
         * @description Constructor for a PhysicsMaterial.
         * @see         FWGE.Physics.PhysicsMaterial
         */
        PhysicsMaterial:{value: PhysicsMaterial},

        /**
         * @constant    Gravity: {Number}
         * @description Gravity in m/s
         */
        Gravity:        { value: -9.8 },

        /**
         * @function    Init: void
         * @description Initializes the physics engine
         */
        Init:
        {
            value: function Init()
            {

            }
        },

        /**
         * @function    PhysicsUpdate: void
         * @description Initializes the physics engine
         */
        PhysicsUpdate:
        {
            value: function PhysicsUpdate()
            {

            }
        }
    });
}


/**
 * @constructor PhysicsItem
 * @description The physics item
 * @module      FWGE.Physics
 * @param       request: {Object}
 */
function PhysicsItem(request)
{
    if (!request) request = {};
    GameItem.call(this, request);
}


var __PHYSICSMATERIAL__ = [];

/**
 * @constructor PhysicsMaterial
 * @description Some words of encouragement
 * @param       request: {Object}
 */
function PhysicsMaterial()
{

}
/**
 * @constructor PhysicsBody
 * @description This object provides the masic physical properties of an object.
 * @module      FWGE.Physics
 * @param       request:    {Object}
 *              > mass:     {Number}    [nullable]
 *              > lockx:    {Boolean}   [nullable]
 *              > LockY:    {Boolean}   [nullable]
 *              > lockz:    {Boolean}   [nullable]
 */
function PhysicsBody(request)
{
    if (request) request = {};
    request.type = "PHYSICSBODY";
    PhysicsItem.call(this, request);

    var _Mass  = typeof request.mass  === 'number' ?  request.mass  : 1.0; 
    var _LockX = typeof request.lockx === 'boolean'?  request.lockx : false;
    var _LockY = typeof request.locky === 'boolean'?  request.locky : false;
    var _LockZ = typeof request.lockz === 'boolean'?  request.lockz : false;
    
    Object.defineProperties(this,
    {
        /**
         * @property    Mass: {Number}
         *              > get
         *              > set
         * @description The mass of the gameobject this physics body is attached to.
         */
        Mass:
        {
            get: function getMass() { return _Mass; },
            set: function setMass()
            {
                if (typeof arguments[0] === 'number' && arguments[0] >= 0.0)
                    _Mass = arguments[0];
            },
        },
        
        /**
         * @property    LockX: {Boolean}
         *              > get
         *              > set
         * @description Determines whether gravity will affect it along the x-axis
         */
        LockX:
        {
            get: function getLockX() { return _LockX; },
            set: function setLockX()
            {
                if (typeof arguments[0] === 'boolean')
                    _LockX = arguments[0];
            },
        },
        
        /**
         * @property    LockY: {Boolean}
         *              > get
         *              > set
         * @description Determines whether gravity will affect it along the y-axis
         */
        LockY:
        {
            get: function getLockY() { return _LockY; },
            set: function setLockY()
            {
                if (typeof arguments[0] === 'boolean')
                    _LockY = arguments[0];
            },
        },
        
        /**
         * @property    LockZ: {Boolean}
         *              > get
         *              > set
         * @description Determines whether gravity will affect it along the z-axis
         */
        LockZ:
        {
            get: function getLockZ() { return _LockZ; },
            set: function setLockZ()
            {
                if (typeof arguments[0] === 'boolean')
                    _LockZ = arguments[0];
            },
        }
    });
}


/**
 * @constructor Collision
 * @description This is the base object for collision objects
 * @module      FWGE.Physics
 * @param       request:  {Object}
 *              > parent: {PhysicsItem}
 */
function Collision(request)
{
    if (!request) request = {};
    request.type = "COLLISION";
    PhysicsItem.call(this, request);

    var _PhysicsItem = request.parent instanceof PhysicsItem ? request.parent : undefined;

    Object.defineProperties(this,
    {
        /**
         * @property    PhysicsItem: {PhysicsItem}
         *              > get
         *              > set
         * @description The physics item this collider is attached to
         */
        PhysicsItem:
        {
            get: function getPhysicsItem() { return _PhysicsItem; },
            set: function setPhysicsItem()
            {
                if (arguments[0] instanceof PhysicsItem || arguments === undefined)
                    _PhysicsItem = arguments[0];
            }
        }
    });   
}


/**
 * @constructor RenderEngine
 * @description This module contains all the visual related aspects of the 
 *              game engine.
 * @module      FWGE 
 */
function RenderEngine()
{
    var _Renderer;

    Object.defineProperties(this,
    {
        /**
         * @property    Colour: {Colour}
         * @description This module creates colour arrays.
         * @see         FWGE.Render.Colour
         */
        Colour:         {value: new Colour()},
        /**
         * @property    Mesh: {Function}
         * @description This is the constructor for a Mesh object.
         * @see         FWGE.Render.Mesh
         */
        Mesh:           {value: Mesh},
        /**
         * @property    RenderM<aterial: {Function`}
         * @description This is the constructor for a Render Material.
         * @see         FWGE.Render.RenderMaterial
         */
        RenderMaterial: {value: RenderMaterial},
        /**
         * @property    Shader: {Function}
         * @description This is a constructor for a Shader object.
         * @see         FWGE.Render.Shader
         */
        Shader:         {value: Shader},

        /**
         *  @function       Init: void
         *  @description    Initializes the rendering engine
         */
        Init:
        {
            value: function Init()
            {
                _Renderer = new Renderer();
                GL.enable(GL.DEPTH_TEST);
            }
        },

        /**
         *  @function       RenderUpdate: void
         *  @description    Updates the rendering to the screen
         */
        RenderUpdate:
        {
            value: function RenderUpdate()
            {
                _Renderer.Render();
            }
        }
    });
}


/**
 * @constructor RenderItem
 * @description The base item regarding rendering.
 * @param       request: {Object}
 */
function RenderItem(request)
{
    Item.call(this, request);
}
var __SHADER__ = [];

/**
 * @constructor Shader
 * @description This object links with the vertex and fragment shaders
 * @param       request:            {Object}
 *              > name:             {String}
 *              > vertexShader:     {String}
 *              > fragmentShader:   {String}
 *              > width:            {Number}    [nullable]
 *              > height:           {Number}    [nullable]
 */
function Shader(request)
{
    if (!request) request = {};
    if (!request.name || typeof request.name !== 'string') return;
    if (!request.vertexShader || typeof request.vertexShader !== 'string') return;
    if (!request.fragmentShader || typeof request.fragmentShader !== 'string') return;
    if (typeof request.width !== 'number') request.width = 512;
    if (typeof request.height !== 'number') request.height = 512;
    
    Object.defineProperties(this,
    {
        Name:             { value: request.name },
        Program:          { value: GL.createProgram() },
        Texture:          { value: GL.createTexture() },
        FrameBuffer:      { value: GL.createFramebuffer() },
        RenderBuffer:     { value: GL.createRenderbuffer() }
    });

    GL.bindFramebuffer(GL.FRAMEBUFFER, this.FrameBuffer);             
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.RenderBuffer);
    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, 1024, 768);
    GL.bindTexture(GL.TEXTURE_2D, this.Texture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1024, 768, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.Texture, 0);
    GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.RenderBuffer);
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    
    var vs = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(vs, request.vertexShader);
    GL.compileShader(vs);
    if (!GL.getShaderParameter(vs, GL.COMPILE_STATUS))
    {
        console.error(new Error("Vertex Shader: " + GL.getShaderInfoLog(vs)));
        return;
    }
    
    var fs = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fs, request.fragmentShader);
    GL.compileShader(fs);
    if (!GL.getShaderParameter(fs, GL.COMPILE_STATUS))
    {
        console.error(new Error("Fragment Shader: " + GL.getShaderInfoLog(fs)));
        return;
    }        
    
    GL.attachShader(this.Program, vs);
    GL.attachShader(this.Program, fs);
    GL.linkProgram(this.Program);
    if (!GL.getProgramParameter(this.Program, GL.LINK_STATUS)) return;
    
    GL.useProgram(this.Program);
    
    Object.defineProperties(this,
    {
        Attributes:
        { 
            value:
            {
                Position:               GL.getAttribLocation(this.Program, "A_Position"),
                Colour:                 GL.getAttribLocation(this.Program, "A_Colour"),
                UV:                     GL.getAttribLocation(this.Program, "A_UV"),
                Normal:                 GL.getAttribLocation(this.Program, "A_Normal")
            }
        },
        Uniforms:
        {
            value:
            {
                Material:
                {
                    Ambient:            GL.getUniformLocation(this.Program, "U_Material.Ambient"),
                    Diffuse:            GL.getUniformLocation(this.Program, "U_Material.Diffuse"),
                    Specular:           GL.getUniformLocation(this.Program, "U_Material.Specular"),
                    Shininess:          GL.getUniformLocation(this.Program, "U_Material.Shininess"),
                    Alpha:              GL.getUniformLocation(this.Program, "U_Material.Alpha")
                },
                Matrix:
                {
                    ModelView:          GL.getUniformLocation(this.Program, "U_Matrix.ModelView"),
                    Projection:         GL.getUniformLocation(this.Program, "U_Matrix.Projection"),
                    Normal:             GL.getUniformLocation(this.Program, "U_Matrix.Normal")
                },
                Light:
                {
                    Ambient:
                    {
                        Colour:         GL.getUniformLocation(this.Program, "U_Ambient.Colour"),
                        Intensity:      GL.getUniformLocation(this.Program, "U_Ambient.Intensity")
                    },
                    Directional:
                    {
                        Colour:         GL.getUniformLocation(this.Program, "U_Directional.Colour"),
                        Intensity:      GL.getUniformLocation(this.Program, "U_Directional.Intensity"),
                        Direction:      GL.getUniformLocation(this.Program, "U_Directional.Direction")
                    },
                    Point:
                    [
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[0].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[0].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[0].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[0].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[0].Angle")
                        },
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[1].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[1].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[1].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[1].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[1].Angle")
                        },
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[2].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[2].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[2].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[2].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[2].Angle")
                        },
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[3].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[3].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[3].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[3].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[3].Angle")
                        },
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[4].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[4].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[4].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[4].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[4].Angle")
                        },
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[5].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[5].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[5].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[5].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[5].Angle")
                        },
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[6].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[6].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[6].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[6].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[6].Angle")
                        },
                        {
                            Colour:     GL.getUniformLocation(this.Program, "U_Point[7].Colour"),
                            Intensity:  GL.getUniformLocation(this.Program, "U_Point[7].Intensity"),
                            Position:   GL.getUniformLocation(this.Program, "U_Point[7].Position"),
                            Radius:     GL.getUniformLocation(this.Program, "U_Point[7].Radius"),
                            Angle:      GL.getUniformLocation(this.Program, "U_Point[7].Angle")
                        }
                    ],
                    PointCount:         GL.getUniformLocation(this.Program, "U_Point_Count"),
                },
                Sampler:
                {
                    Image:              GL.getUniformLocation(this.Program, "U_Sampler.Image"),
                    Bump:               GL.getUniformLocation(this.Program, "U_Sampler.Bump")
                }
            }
        }
    });
    
    GL.useProgram(null);
    
    __SHADER__.push(this);
}


/**
 * @constructor Colour
 * @description This module is used to create simple 3 valued arrays
 *              representing the rgb values of colours.
 * @module      FWGE.Render
 */
function Colour()
{
    Object.defineProperties(this,
    {
        /**
         * @function    Create: {Float32Array}
         * @description Creates a new Float32Array array. These arrays have R,G, and B accessors.
         * @param       {Float32Array}  [nullable, override 1]
         * @param       {Number}        [nullable, override 2]
         * @param       {Number}        [nullable, override 2]
         * @param       {Number}        [nullable, override 2]
         */
        Create:
        {
            value: function Create()
            {
                var $ = new Float32Array(3);

                $[0] = typeof arguments[0] === 'number' ? arguments[0] : arguments[0] instanceof Array && typeof arguments[0][0] === 'number' ? arguments[0][0] : 0;
                $[1] = typeof arguments[1] === 'number' ? arguments[1] : arguments[0] instanceof Array && typeof arguments[0][1] === 'number' ? arguments[0][1] : 0;
                $[2] = typeof arguments[2] === 'number' ? arguments[2] : arguments[0] instanceof Array && typeof arguments[0][2] === 'number' ? arguments[0][2] : 0;
                
                Object.defineProperties($,
                {
                    Type: { value: "COLOUR" },
                    R:
                    {
                        get: function getR(){ return $[0]; },
                        set: function setR()
                        {
                            if (typeof arguments[0] === 'number')
                                $[0] = Math.clamp(arguments[0], 0, 1);
                        },
                    },
                    G:
                    {
                        get: function getG(){ return $[1]; },
                        set: function setG()
                        {
                            if (typeof arguments[1] === 'number')
                                $[1] = Math.clamp(arguments[0], 0, 1);
                        },
                    },
                    B:
                    {
                        get: function getB(){ return $[2]; },
                        set: function setB()
                        {
                            if (typeof arguments[0] === 'number')
                                $[2] = Math.clamp(arguments[0], 0, 1);
                        },
                    }
                });
                
                return $;
            }
        }
    });
}


var __MESH__ = [];

/**
 * @constructor Mesh
 * @description The vertex array buffer containers
 * @module      FWGE.Render
 * @param       request:     {Object}    [nullable]
 *              > position:  {Array}     [nullable]
 *              > uvs:       {Array}     [nullable]
 *              > colours:   {Array}     [nullable]
 *              > normals:   {Array}     [nullable]
 *              > indices:   {Array}     [nullable]
 */
function Mesh(request)
{   
    if (!request) request = {};
    request.type = "MESH";
    GameItem.call(this, request);
    
    function validate(array, constructor)
    {
        var i = array.length;

        while (--i > 0)
            if (typeof array[i] !== 'number')
                return undefined;

        return new constructor(array);
    }

    request.position    = validate(request.position, Float32Array);
    request.uvs         = validate(request.uvs,     Float32Array);
    request.colours     = validate(request.colours, Float32Array);
    request.normals     = validate(request.normals, Float32Array);
    request.indices     = validate(request.indices, Uint16Array);

    Object.defineProperties(this,
    {
        /**
         * @constant    PositionBuffer: {WebGLBuffer}
         * @description Buffer containing all the vertex position vectors
         */
        PositionBuffer: { value: GL.createBuffer() },

        /**
         * @constant    UVBuffer: {WebGLBuffer}
         * @description Buffer containing all the uv coordinate vectors
         */
        UVBuffer: { value: GL.createBuffer() },

        /**
         * @constant    ColourBuffer: {WebGLBuffer}
         * @description Buffer containing all the colour for the vertices
         */
        ColourBuffer: { value: GL.createBuffer() },

        /**
         * @constant    NormalBuffer: {WebGLBuffer}
         * @description Buffer containing all the nromal vectors
         */
        NormalBuffer: { value: GL.createBuffer() },
        
        /**
         * @constant    IndexBuffer: {WebGLBuffer}
         * @description Buffer containing all the indices
         */
        IndexBuffer: { value: GL.createBuffer() },
        
        /**
         * @constant    VertexCount: {Number}
         * @description The number of vertices in the mesh
         */
        VertexCount: { value: !!request.indices ? request.indices.length : 0 }
    });

    if (!!request.position)
    {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.PositionBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, request.position, GL.STATIC_DRAW);
    }
    if (!!request.uvs)
    {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.UVBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, request.uvs, GL.STATIC_DRAW);
    }
    if (!!request.colours)
    {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.ColourBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, request.colours, GL.STATIC_DRAW);
    }
    if (!!request.normals)
    {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.NormalBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, request.normals, GL.STATIC_DRAW);
    }
    if (!!request.indices)
    {
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.IndexBuffer);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, request.indices, GL.STATIC_DRAW);
    }
    
    __MESH__.push(this);
}


var __MATERIAL__ = [];

/**
 * @constructor Material
 * @description This object defines how the mesh in a gameobject will look
 *              like when rendered to a screen.
 * @module      FWGE.Render
 * @param       request:        {Object}
 *              > ambient:      {Array}     [nullable]
 *              > diffuse:      {Array}     [nullable]
 *              > specular:     {Array}     [nullable]
 *              > alpha:        {Number}    [nullable]
 *              > shininess:    {Number}    [nullable]
 *              > shader:       {Number}    [nullable]
 *              > imagemap:     {String}    [nullable]
 *              > bumpmap:      {String}    [nullable]
 *              > specularmap:  {String}    [nullable]
 */
function RenderMaterial(request)
{
    if (!request) request = {};
    request.type = "MATERIAL";
    RenderItem.call(this, request);

    function colour(item)
    {
        if (!item || !(item instanceof Array)) item = [0, 0, 0];
        
        switch (item.length)
        {
            case 0: item.position[0] = 0;
            case 1: item.position[1] = 0;
            case 2: item.position[2] = 0;
        }

        return FWGE.Render.Colour.Create(item);
    }
   
    var _Ambient     = colour(request.ambient);
    var _Diffuse     = colour(request.diffuse);
    var _Specular    = colour(request.specular);
    var _Alpha       = typeof request.alpha     === 'number' && request.alpha     >= 0 ? request.alpha     : 1.0;
    var _Shininess   = typeof request.shininess === 'number' && request.shininess >= 0 ? request.shininess : 5.0;
    var _Shader      = request.shader instanceof Shader ? request.shader : undefined;
    var _ImageMap    = undefined;
    var _BumpMap     = undefined;
    var _SpecularMap = undefined;
    
    Object.defineProperties(this,
    {
        /**
         * @property    Ambient: {Float32Array}
         *              > get
         *              > set
         * @description The colour of the material under no light
         */
        Ambient:
        {
            get: function getAmbient() { return _Ambient; },
            set: function setAmbient()
            {
                if (arguments[0].Type === 'COLOUR')
                    FWGE.Game.Maths.Vector3.Set(_Ambient, arguments[0]);
            }
        },

        /**
         * @property    Diffuse: {Float32Array}
         *              > get
         *              > set
         * @description The colour of the object under even/flat light
         */
        Diffuse:
        {
            get: function getDiffuse() { return _Diffuse; },
            set: function setDiffuse()
            {
                if (arguments[0].Type === 'COLOUR')
                    FWGE.Game.Maths.Vector3.Set(_Diffuse, arguments[0]);
            }
        },

        /**
         * @property    Specular: {Float32Array}
         *              > get
         *              > set
         * @description The colour of the object when reflection specular light
         */
        Specular:
        {
            get: function getSpecular() { return _Specular; },
            set: function setSpecular()
            {
                if (arguments[0].Type === 'COLOUR')
                    FWGE.Game.Maths.Vector3.Set(_Specular, arguments[0]);
            }
        },

        /**
         * @property    Alpha: {Number}
         *              > get
         *              > set
         * @description The opacity of the material
         */
        Alpha:
        {
            get: function getAlpha() { return _Alpha; },
            set: function setAlpha()
            {
                if (typeof arguments[0] === 'number')
                    _Alpha = arguments[0];
            }
        },

        /**
         * @property    Shininess: {Number}
         *              > get
         *              > set
         * @description This amount of shine the specular light shows
         */
        Shininess:
        {
            get: function getShininess() { return _Shininess; },
            set: function setShininess()
            {
                if (typeof arguments[0] === 'number')
                    _Shininess = arguments[0];
            }
        },

        /**
         * @property    Shader: {Shader}
         *              > get
         *              > set
         * @description The shader used to the render
         */
        Shader:
        {
            get: function getShader() { return _Shader; },
            set: function setShader()
            {
                if (arguments[0] instanceof Shader)
                    _Shader = arguments[0];
            }
        },

        /**
         * @property    ImageMap: {WebGLTexture}
         *              > get
         *              > set
         * @description The texture map for the material
         */
        ImageMap:
        {
            get: function getImageMap() { return _ImageMap; },
            set: function setImageMap()
            {
                if (arguments[0] instanceof WebGLTexture || arguments[0] === undefined)
                    _ImageMap = arguments[0];
            }
        },

        /**
         * @property    BumpMap: {WebGLTexture}
         *              > get
         *              > set
         * @description The bump map for the material
         */
        BumpMap:
        {
            get: function getBumpMap() { return _BumpMap; },
            set: function setBumpMap()
            {
                if (arguments[0] instanceof WebGLTexture || arguments[0] === undefined)
                    _BumpMap = arguments[0];
            }
        },

        /**
         * @property    SpecularMap: {WebGLTexture}
         *              > get
         *              > set
         * @description The specular map for the material
         */
        SpecularMap:
        {
            get: function getSpecularMap() { return _SpecularMap; },
            set: function setSpecularMap()
            {
                if (arguments[0] instanceof WebGLTexture || arguments[0] === undefined)
                    _SpecularMap = arguments[0];
            }
        }
    });
    
    __MATERIAL__.push(this);
}
Object.defineProperties(RenderMaterial.prototype,
{
    constructor: { value: RenderMaterial },
    
    /**
     * @function    SetTextures: void
     * @description This function simply loads the appropriate textures into memory.   
     * @param       request:     {Object}
     *              > image:     {String}    [nullable]
     *              > bump:      {String}    [nullable]
     *              > specular:  {String}    [nullable]
     */
    SetTextures:
    {
        value: function SetTextures(request)
        {
            if (!request) request = {};
            if (typeof request.image === 'string')      apply_image(request.image, this.ImageMap);
            if (typeof request.bump === 'string')       apply_image(request.bump, this.BumpMap);
            if (typeof request.specular === 'string')   apply_image(request.specular, this.Specular);

            function apply_image(src, texture)
            {
                var img = new Image();
                img.onload = function onload()
                {
                    //this.LoadImage(img, texture);
                };
                img.src = src;
            }
        }
    }
});


/**
 * @constructor ModelView
 * @description This module handles the model view matrices of the
 *              objects within the scene by applying the appropriate
 *              transformations.
 */
function ModelView()
{
    var _Stack  = [];
    
    Object.defineProperties(this,
    {
        /**
         * @function    PushMatrix: void
         * @description Pushes a copy of the last matrix onto the stack. If the stack is
         *              currently empty, an identity matrix is pushed.
         */
        PushMatrix:
        {
            value: function PushMatrix()
            {
                var peek = this.PeekMatrix();
                _Stack.push(FWGE.Game.Maths.Matrix4.Create
                (
                    peek.M11, peek.M12, peek.M13, peek.M14,
                    peek.M21, peek.M22, peek.M23, peek.M24,
                    peek.M31, peek.M32, peek.M33, peek.M34,
                    peek.M41, peek.M42, peek.M43, peek.M44
                ));
            }
        },

        /**
         * @function    PeekMatrix: {Float32Array}
         * @description Returns the matrix on the top of the stack. If the stack
         *              is empty, an identity matrix is returned.
         */
        PeekMatrix:
        {
            value: function PeekMatrix()
            {
                if (_Stack.length === 0)
                    return FWGE.Game.Maths.Matrix4.Identity();
                else
                    return _Stack[_Stack.length - 1];
            }
        },

        /**
         * @function    PopMatrix: {Float32Array}
         * @description Returns and removes the matrix on the top os the stack.
         */
        PopMatrix:
        {
            value: function PopMatrix()
            {
                return _Stack.pop();
            }
        },

        /**
         * @function    Transform: void
         * @description Performs the appropriate matrix operations for the different
         *              transformations on the the top matrix.
         * @param       transform: {Transform}
         */
        Transform:
        {
            value: function Transform(transform)
            {
                FWGE.Game.Maths.Matrix4.Set
                (
                    this.PeekMatrix(),
                    this.Shear
                    (
                        this.Scale
                        (
                            this.Rotate
                            (
                                this.Translate
                                (
                                    this.PeekMatrix(),
                                    transform.Position
                                ),
                                transform.Rotation
                            ),
                            transform.Scale
                        ),
                        transform.Shear
                    )
                );
            }
        },

        /**
         * @function    Translate: {Float32Array}
         * @description Returns a translation matrix.
         * @param       matrix:         {Float32Array}
         * @param       translation:    {Float32Array}
         */
        Translate:
        {
            value: function Translate(matrix, translation)
            {
                return FWGE.Game.Maths.Matrix4.Create
                (
                    matrix[0],  matrix[1],  matrix[2],  matrix[3],
                    matrix[4],  matrix[5],  matrix[6],  matrix[7],
                    matrix[8],  matrix[9], matrix[10], matrix[11],

                    matrix[0] * translation[0] + matrix[4] * translation[1] +  matrix[8] * translation[2] + matrix[12],
                    matrix[1] * translation[0] + matrix[5] * translation[1] +  matrix[9] * translation[2] + matrix[13],
                    matrix[2] * translation[0] + matrix[6] * translation[1] + matrix[10] * translation[2] + matrix[14],
                    matrix[3] * translation[0] + matrix[7] * translation[1] + matrix[11] * translation[2] + matrix[15]
                );
            }
        },

        RotateAround:
        {
            value: function RotateAround()
            {
                /* TODO */   
            }
        },

        /**
         * @function    Translate: {Float32Array}
         * @description Returns a rotation matrix.
         * @param       matrix:     {Float32Array}
         * @param       rotation:   {Float32Array}
         */
        Rotate:
        {
            value: function Rotate(matrix, rotation)
            {                    
                return FWGE.Game.Maths.Matrix4.Mult
                (
                    FWGE.Game.Maths.Matrix4.Create
                    (
                        1.0,                   0.0,                    0.0, 0.0,
                        0.0, Math.cos(rotation[0]), -Math.sin(rotation[0]), 0.0,
                        0.0, Math.sin(rotation[0]),  Math.cos(rotation[0]), 0.0,
                        0.0,                   0.0,                    0.0, 1.0
                    ),
                    FWGE.Game.Maths.Matrix4.Mult
                    (
                        FWGE.Game.Maths.Matrix4.Create
                        (
                             Math.cos(rotation[1]), 0.0, Math.sin(rotation[1]), 0.0,
                                               0.0, 1.0,                   0.0, 0.0,
                            -Math.sin(rotation[1]), 0.0, Math.cos(rotation[1]), 0.0,
                                               0.0, 0.0,                   0.0, 1.0
                        ),
                        FWGE.Game.Maths.Matrix4.Mult
                        (
                            FWGE.Game.Maths.Matrix4.Create
                            (
                                 Math.cos(rotation[2]), -Math.sin(rotation[2]), 0.0, 0.0,
                                 Math.sin(rotation[2]),  Math.cos(rotation[2]), 0.0, 0.0,
                                                   0.0,                    0.0, 1.0, 0.0,
                                                   0.0,                    0.0, 0.0, 1.0
                            ),
                            matrix
                        )
                    )
                );
            }
        },

        /**
         * @function    Translate: {Float32Array}
         * @description Returns a scaler matrix.
         * @param       matrix:     {Float32Array}
         * @param       scalers:    {Float32Array}
         */
        Scale:
        {
            value: function Scale(matrix, scalers)
            {                    
                return FWGE.Game.Maths.Matrix4.Create
                (
                     matrix[0] * scalers[0],  matrix[1] * scalers[0],  matrix[2] * scalers[0],  matrix[3] * scalers[0],
                     matrix[4] * scalers[1],  matrix[5] * scalers[1],  matrix[6] * scalers[1],  matrix[7] * scalers[1],
                     matrix[8] * scalers[2],  matrix[9] * scalers[2], matrix[10] * scalers[2], matrix[11] * scalers[2],
                                 matrix[12],              matrix[13],              matrix[14],              matrix[15],
                                 matrix[12],              matrix[13],              matrix[14],              matrix[15]
                );
            }
        },

        /**
         * @function    Shear: {Float32Array}
         * @description Returns a shearing matrix.
         * @param       matrix:    {Float32Array}
         * @param       angles:    {Float32Array}
         */
        Shear:
        {
            value: function Shear(matrix, angles)
            {
                var phi   = Math.radian(angles[0]);
                var theta = Math.radian(angles[1]);
                var rho   = Math.radian(angles[2]);

                return FWGE.Game.Maths.Matrix4.Mult
                (
                    FWGE.Game.Maths.Matrix4.Create
                    (
                                  1.0,                0.0, Math.tan(rho), 0.0,
                        Math.tan(phi),                1.0,           0.0, 0.0,
                                  0.0, Math.tan(theta),           1.0, 0.0,
                                  0.0,                0.0,           0.0, 1.0
                    ),
                    matrix
                );
            }
        }
    });
}


/**
 * @constructor Projection
 * @description This module handles the matrices regarding the camera's current
 *              view mode, and its orientation within the scene.
 * @module      FWGE.Render
 */
function Projection()
{
    var _Camera = FWGE.Game.Maths.Matrix4.Identity();
    
    function Orthographic(left, right, top, bottom, near, far, theta, phi)
    {
        theta = Math.cot(Math.radian(theta));
        phi = Math.cot(Math.radian(phi));

        left -= near * theta;
        right -= near * theta;
        top -= near * phi;
        bottom -= near * phi;

        FWGE.Game.Maths.Matrix4.Set
        (
            _Camera,

                          2 / (right - left),                                  0,                             0, 0,
                                           0,                 2 / (top - bottom),                              0, 0,
                                        theta,                                phi,            -2 / (far - near), 0,
            -(left + right) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
        );
        
    }
    
    function Perspective(field_of_view, aspect_ratio, near, far)
    {
        var top = near * Math.tan(Math.radian(field_of_view));
        var right = top * aspect_ratio;
        
        var left = -right;
        var bottom = -top;
        var width = right - left;
        var height = top - bottom;
        var depth = far - near;

        FWGE.Game.Maths.Matrix4.Set
        (
            _Camera,

                  2 * near / width,                       0,                         0,  0,
                                 0,       2 * near / height,                         0,  0,
            (right + left) / width, (top + bottom) / height,     -(far + near) / depth, -1,
                                 0,                       0, -(2 * far * near) / depth,  1
        );
    }
    
    Object.defineProperties(this,
    {
        ProjectionUpdate:
        {
            value: function ProjectionUpdate()
            {                            
                switch (FWGE.Game.Camera.Mode)
                {
                    case FWGE.Game.Camera.PERSPECTIVE:
                        Perspective
                        (
                            FWGE.Game.Camera.FOV,
                            FWGE.Game.Camera.Aspect,
                            FWGE.Game.Camera.Near,
                            FWGE.Game.Camera.Far
                        );
                    break;

                    case FWGE.Game.Camera.ORTHOGRAPHIC:
                        Orthographic
                        (
                            FWGE.Game.Camera.Left,
                            FWGE.Game.Camera.Right,
                            FWGE.Game.Camera.Top,
                            FWGE.Game.Camera.Bottom,
                            FWGE.Game.Camera.Near,
                            FWGE.Game.Camera.Far,
                            FWGE.Game.Camera.Theta,
                            FWGE.Game.Camera.Phi
                        );
                    break;
                }
            }
        },
        
        GetViewer: { value: function GetViewer() { return _Camera; } }
    });
}


/**
 * @constructor Renderer
 * @description This module handles the actual rendering of the scene to
 *              the screen.
 * @module      FWGE.Render
 */
function Renderer()
{
    var __MODELVIEW__ = new ModelView();
    var __PROJECTION__ = new Projection();

    Object.defineProperties(this,
    {
        Render:
        {
            value: function Render()
            {
                this.ClearBuffers();

                var i = __OBJECT__.length;
                while (--i >= 0)
                {
                    this.SetGlobalUniforms();
                    this.RenderObject(__OBJECT__[i]);

                }
            }
        },

        ClearBuffers:
        {
            value: function ClearBuffers()
            {
                var i = __SHADER__.length;
                while (--i >= 0)
                {
                    GL.bindFramebuffer(GL.FRAMEBUFFER, __SHADER__[i].FrameBuffer);
                    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
                    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
                }
                
                GL.bindFramebuffer(GL.FRAMEBUFFER, null);
                GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
                GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
            }
        },

        RenderObject:
        {
            value: function RenderObject(object)
            {
                
                __MODELVIEW__.PushMatrix();
                __MODELVIEW__.Transform(object.Transform);
                
                var i = object.Children.length;
                while (--i >= 0)
                    this.RenderObject(object.Children[i]);
                
                if (!!object.Mesh && !!object.RenderMaterial)
                {
                    var shader = object.RenderMaterial.Shader

                    GL.useProgram(shader.Program);
                    
                    GL.enableVertexAttribArray(shader.Attributes.Position);
                    if (shader.Attributes.Normal !== -1) GL.enableVertexAttribArray(shader.Attributes.Normal);
                    if (shader.Attributes.Colour !== -1) GL.enableVertexAttribArray(shader.Attributes.Colour);
                    if (shader.Attributes.UV !== -1) GL.enableVertexAttribArray(shader.Attributes.UV);

                    if (object.RenderMaterial.Alpha !== 1.0)
                    {
                        GL.enable(GL.BLEND);
                        GL.disable(GL.DEPTH_TEST);
                        GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
                    }
                    
                    this.BindAttributes(object.Mesh, object.RenderMaterial, object.RenderMaterial.Shader.Attributes);
                    this.SetObjectUniforms(object.RenderMaterial, object.RenderMaterial.Shader.Uniforms);
                    this.Draw(object.Mesh.VertexCount);
                    
                    if (object.RenderMaterial.Alpha !== 1.0)
                    {
                        GL.enable(GL.DEPTH_TEST);
                        GL.disable(GL.BLEND);
                    }
            
                    GL.disableVertexAttribArray(shader.Attributes.Position);
                    if (shader.Attributes.Normal !== -1) GL.disableVertexAttribArray(shader.Attributes.Normal);
                    if (shader.Attributes.Colour !== -1) GL.disableVertexAttribArray(shader.Attributes.Colour);
                    if (shader.Attributes.UV !== -1) GL.disableVertexAttribArray(shader.Attributes.UV);

                    GL.useProgram(null);
                }
                   
                __MODELVIEW__.PopMatrix();
            }
        },

        BindAttributes:
        {
            value: function BindAttributes(mesh, material, attributes)
            {
                GL.bindBuffer(GL.ARRAY_BUFFER, mesh.PositionBuffer);
                GL.vertexAttribPointer(attributes.Position, 3, GL.FLOAT, false, 0, 0);
                
                if (attributes.UV !== -1)
                {
                    if (!!mesh.UVBuffer)
                    {
                        GL.bindBuffer(GL.ARRAY_BUFFER, mesh.UVBuffer);
                        GL.vertexAttribPointer(attributes.UV, 2, GL.FLOAT, false, 0, 0);
                    }
                    else
                        GL.disableVertexAttribArray(attributes.UV);
                }
                
                if (attributes.Colour !== -1)
                {
                    if (!!mesh.ColourBuffer)
                    {
                        GL.bindBuffer(GL.ARRAY_BUFFER, mesh.ColourBuffer);
                        GL.vertexAttribPointer(attributes.Colour, 3, GL.FLOAT, false, 0, 0);                            
                    }
                    else
                        GL.disableVertexAttribArray(attributes.Colour);
                }
                
                if (attributes.Normal !== -1)
                {
                    if (!!mesh.NormalBuffer)
                    {
                        GL.bindBuffer(GL.ARRAY_BUFFER, mesh.NormalBuffer);
                        GL.vertexAttribPointer(attributes.Normal, 3, GL.FLOAT, false, 0, 0);
                    }
                    else
                        GL.disableVertexAttribArray(attributes.Normal);
                }
                
                GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.IndexBuffer);
            }
        },

        SetObjectUniforms:
        {
            value: function SetObjectUniforms(material, uniforms)
            {
                GL.uniformMatrix4fv(uniforms.Matrix.ModelView, false, __MODELVIEW__.PeekMatrix());
                GL.uniformMatrix3fv(uniforms.Matrix.Normal, false, this.CalculateNormalMatrix());
                
                GL.uniform3fv(uniforms.Material.Ambient, material.Ambient);
                GL.uniform3fv(uniforms.Material.Diffuse, material.Diffuse);
                GL.uniform3fv(uniforms.Material.Specular, material.Specular);
                GL.uniform1f(uniforms.Material.Shininess, material.Shininess);
                GL.uniform1f(uniforms.Material.Alpha, material.Alpha);
            
                if (!!material.Image)
                {
                    GL.activeTexture(GL.TEXTURE0);
                    GL.bindTexture(GL.TEXTURE_2D, material.Image);
                    GL.uniform1i(uniforms.Material.HasImageMap, true);
                    GL.uniform1i(uniforms.Sampler.Image, 0);
                }
                else
                {
                    GL.bindTexture(GL.TEXTURE_2D, null);
                    GL.uniform1i(uniforms.Material.HasImageMap, false);
                }
                
                if (!!material.Bump)
                {
                    GL.activeTexture(GL.TEXTURE1);
                    GL.bindTexture(GL.TEXTURE_2D, material.Bump);
                    GL.uniform1i(uniforms.Material.HasBumpMap, true);
                    GL.uniform1i(uniforms.Sampler.Bump, 1);
                }
                else
                {
                    GL.bindTexture(GL.TEXTURE_2D, null);
                    GL.uniform1i(uniforms.Material.HasBumpMap, false);
                }
            }
        },

        SetGlobalUniforms:
        {
            value: function SetGlobalUniform()
            {            
                var i = __SHADER__.length;
                while (--i >= 0)
                {
                    var point_count = 0;
                    
                    GL.useProgram(__SHADER__[i].Program);                
                    var uniforms = __SHADER__[i].Uniforms.Light;
                    
                    var j = __LIGHT__.length;
                    while (--j >= 0)
                    {
                        var light = __LIGHT__[i];
                        
                        if (!!light)
                        {
                            switch (light.Type)
                            {
                                case "AMBIENTLIGHT":
                                    GL.uniform3fv(uniforms.Ambient.Colour, light.Colour);
                                    GL.uniform1f(uniforms.Ambient.Intensity, light.Intensity);
                                break;
                                    
                                case "DIRECTIONALLIGHT":
                                    GL.uniform3fv(uniforms.Directional.Colour, light.Colour);
                                    GL.uniform1f(uniforms.Directional.Intensity, light.Intensity);
                                    GL.uniform3fv(uniforms.Directional.Direction, light.Direction);
                                break;
                                    
                                case "POINTLIGHT":
                                    __MODELVIEW__.PushMatrix();
                                    __MODELVIEW__.Transform(light.Transform);
                                    var pos = __MODELVIEW__.PopMatrix();

                                    GL.uniform3fv(uniforms.Point[point_count].Colour, light.Colour);
                                    GL.uniform1f(uniforms.Point[point_count].Intensity, light.Intensity);
                                    GL.uniform3f(uniforms.Point[point_count].Position, pos.M41, pos.M42, pos.M43);
                                    GL.uniform1f(uniforms.Point[point_count].Radius, light.Radius);
                                    GL.uniform1f(uniforms.Point[point_count].Angle, light.Angle);

                                    point_count++;
                                break;
                            }
                        }
                    }

                    GL.uniform1i(uniforms.PointCount, point_count);
                    
                    // SET UNIFORM FOR NUMBER OF POINT LIGHTS
                    GL.uniformMatrix4fv(__SHADER__[i].Uniforms.Matrix.Projection, false, __PROJECTION__.GetViewer());
                }
                
                GL.useProgram(null);
            }
        },

        CalculateNormalMatrix:
        {
            value: function CalculateNormalMatrix()
            {
                var mat = __MODELVIEW__.PeekMatrix();
                FWGE.Game.Maths.Matrix4.Inverse(mat);
                return FWGE.Game.Maths.Matrix3.Create
                (
                    mat.M11, mat.M21, mat.M31,
                    mat.M12, mat.M22, mat.M32,
                    mat.M13, mat.M23, mat.M33
                );
            }
        },

        Draw:
        {
            value: function Draw(vertexCount)
            {
                console.log(vertexCount);
                GL.drawElements(GL.TRIANGLES, vertexCount, GL.UNSIGNED_SHORT, 0);
            }
        },

        FinalDraw:
        {
            value: function FinalDraw()
            {

            }
        }
    });

    __PROJECTION__.ProjectionUpdate();
};


/**
 * @constructor FWGEPrototype
 * @module      {}
 */
function FWGEPrototype()
{
    Object.defineProperties(this,
    {
        /**
         * @property    Game: {GameEngine}
         * @description The main engine.
		 * @see         FWGE.Game
         */
        Game: {value: new GameEngine()},

        /**
         * @property    Physics: {PhysicsEngine}
         * @description The physics engine.
		 * @see         FWGE.Physics
         */
        Physics: {value: new PhysicsEngine()},

        /**
         * @property    Render: {RenderEngine}
         * @description The rendering engine.
		 * @see         Render
         */
        Render: {value: new RenderEngine()},

        /**
         * @function    Init: void
         * @description Initializes the webgl context and the seperate engines
         * @param       request:     {Object}
         *              > canvas:    {HTMLCanvasElement}
         *              > height:    {Number}                [nullable]
         *              > width:     {Number}                [nullable]
         *              > clear:     {Float32Array}          [nullable]
         */
        Init: 
        {
            value: function Init(request)
            {
                if (!request) request = {};
                if (!request.clear || !(request.clear instanceof Float32Array) || request.clear.length === 4)
                    request.clear = [0, 0, 0, 0];

                GL = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

                if (!GL)
                    throw "Webgl context could not be initialized.";

                GL.clearColor(request.clear[0] || 0, request.clear[1] || 0, request.clear[2] || 0, request.clear[3] || 0);

                this.Game.Init();
                this.Physics.Init();
                this.Render.Init();
            }
        }
    });
}

window.FWGE = new FWGEPrototype();



})();


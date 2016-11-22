/*!
 *  @param      request
 *      @param  name
 *      @param  material
 *      @param  mesh
 *      @param  transform
 *      @param  physics
 *      @param  animation
 *      @param  begin
 *      @param  update
 *      @param  end
 */
function GameObject(request)
{
    var $ = this;
    
    if (!request) request = {};
    if (!request.name) request.name = "GameObject";
    
    if (!request.material) request.material    = undefined;
    if (!request.mesh) request.mesh = undefined;
    if (!request.transform) request.transform   = new Transform({ gameobject: $ });
    if (!request.physicsitem) request.physicsitem = undefined;
    if (!request.animation) request.animation   = undefined;
    if (!request.lightitem) request.lightitem   = undefined;
    
    if (!request.begin)         request.begin       = function(){};
    if (!request.update)        request.update      = function(){};
    if (!request.end)           request.end         = function(){};
    
    console.log(request);
    
    GameItem.call($, $, "GAMEOBJECT");
    
    var _Name           = request.name;
    var _Material       = request.material;
    var _Mesh           = request.mesh;
    var _Transform      = request.transform;
    var _PhysicsItem    = request.physicsitem;
    var _Animation      = request.animation;
    var _LightItem      = request.lightitem;
    var _ParticleSystem = request.particlesystem;
    
    var _Begin          = request.begin;
    var _Update         = request.update;
    var _End            = request.end;
    
    Object.defineProperties($,
    {
        ID:         { value: "[go-" + IDCounter.next() + "]" },
        Children:   { value: [] },
        Transform:  { value: request.transform },
        Name:
        {
            get: function getName(){ return _Name; },
            set: function setName()
            {
                if (typeof arguments[0] === 'string')
                    _Name = arguments[0];
            }
        },
        Material:
        {
            get: function getMaterial() { return _Material; },
            set: function setMaterial()
            {
                if (arguments[0] instanceof Material || arguments[0] === undefined)
                    _Material = arguments[0];
            }
        },
        Mesh:
        {
            get: function getMesh() { return _Mesh; },
            set: function setMesh()
            {
                if (arguments[0] instanceof Mesh || arguments[0] === undefined)
                    _Mesh = arguments[0];
            }
        },
        PhysicsItem:
        {
            get: function getPhysicsItem() { return _PhysicsItem; },
            set: function setPhysicsItem()
            {
                if (arguments[0] instanceof PhysicsItem || arguments[0] === undefined)
                    _PhysicsItem = arguments[0];
            }
        },
        Animation:
        {
            get: function getAnimation() { return _Animation; },
            set: function setAnimation()
            {
                if (arguments[0] instanceof Animation || arguments[0] === undefined)
                    _Animation = arguments[0];
            }
        },
        ParticleSystem:
        {
            get: function getParticleSystem() { return _ParticleSystem; },
            set: function setParticleSystem()
            {
                if (arguments[0] instanceof ParticleSystem || arguments[0] === undefined)
                    _ParticleSystem = arguments[0];
            }
        },
        Begin:
        {
            get: function getBegin() { return _Begin; },
            set: function setBegin()
            {
                if (typeof arguments[0] === 'function' || arguments[0] === undefined)
                    _Begin = arguments[0];
            }
        },
        Update:
        {
            get: function getUpdate() { return _Update; },
            set: function setUpdate()
            {
                if (typeof arguments[0] === 'function' || arguments[0] === undefined)
                    _Update = arguments[0];
            }
        },
        End:
        {
            get: function getEnd() { return _End; },
            set: function setEnd()
            {
                if (typeof arguments[0] === 'function' || arguments[0] === undefined)
                    _End = arguments[0];
            }
        }
    });
    
    __OBJECT__.push($);
}
Object.defineProperties(GameObject.prototype,
{
    constructor: { value: GameObject },
    Clone:
    {
        value: function Clone()
        {                
            var clone = new GameObject
            ({
                name:           this.name,
                material:       this.Material,
                mesh:           this.Mesh,
                transform:      new Transform
                ({
                    position:   this.Transform.Position,
                    rotation:   this.Transform.Rotation,
                    scale:      this.Transform.Scale,
                    shear:      this.Transform.Shear
                }),
                physics:        this.Physics,
                animation:      this.Aniamation
            });
            
            for (var i = 0; i < this.Children.length; ++i)
                clone.Children.push(this.Children[i].Clone());
            
            return clone;
        }
    },
    Destroy:
    {
        value: function Destroy()
        {
            var timeout = typeof arguments[0] === 'number' ? arguments[0] : 0;
            setTimeout(function()
            {
                var i = __OBJECT__.length;
                while (--i >= 0)
                    if (__OBJECT__[i] === this)
                        __OBJECT__.slice(i, 1)
            });
        }
    },
    ObjectUpdate:
    {
        value: function ObjectUpdate()
        {
            this.Update();
            this.Transform.TransformUpdate();
            if (!!this.PhysicsItem)     this.PhysicsItem.PhysicsUpdate();
            if (!!this.PhysicsItem)     this.PhysicsItem.PhysicsUpdate();
            if (!!this.Animation)       this.Animation.AnimationUpdate();
            if (!!this.LightItem)       this.LightItem.LightUpdate();
            if (!!this.ParticleSystem)  this.ParticleSystem.ParticleSystemUpdate();
        }
    }
});


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
    if (!request.type) request.type = "";
    request.type += "DIRECTIONALLIGHT ";
    
    LightItem.call(this, request);

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


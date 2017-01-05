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


/*!
 * @constructor Matrix2
 * @description This library contains the methods required for 2x2 matrices.
 *              They are represented as a Float32Array of length 4.
 * @module      FWGE.Game.Maths 
 */
function Matrix2()
{    
    Object.defineProperties(this,
    {
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @param       {Float32Array}  [nullable, override: 1]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @param       {Number}        [nullable, override: 2]
         * @return      Float32Array
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
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 1]
         * @param       {Float32Array}  [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @param       {Number}        [override: 2]
         * @return      Float32Array
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
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @return      Float32Array
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
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @return      Float32Array
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
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @return      Float32Array
         */
        Determinant:
        {
            value: function Determinant()
            {
                if (arguments[0] instanceof Float32Array && arguments[0].length === 4)
                    return arguments[0][0] * arguments[0][3] - arguments[0][2] * arguments[0][1];
            }
        },
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @return      Float32Array
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
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @return      Float32Array
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
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @return      Float32Array
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
        
        /*!
         * @function    Create
         * @description Creates an new Float32Array with the <code>Type</code>
         *              set to <code>"MATRIX2"</code>. It also has the appropriate
         *              value indexers: M11, M12, M21, M22.
         * @return      Float32Array
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


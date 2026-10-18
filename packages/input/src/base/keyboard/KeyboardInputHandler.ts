import { KeyState } from "../InputState";
import { KeyboardState } from "./KeyboardState";

export const NUM_KEYBOARD_KEYS: number = 256;

export class KeyboardInputHandler
{
    public readonly State: KeyboardState;
    
    private readonly _keyTicks: Uint8Array = new Uint8Array(NUM_KEYBOARD_KEYS);

    constructor(
        private readonly _canvas: HTMLCanvasElement,
        private readonly _keyDelay: number = 0.0,
        private readonly _keys: Uint8ClampedArray
    ) {
        this.State = new KeyboardState(_keys);
    }
    
    Start(): void        
    {
        this._canvas.ownerDocument.documentElement.addEventListener('keydown', this.keydown.bind(this));
        this._canvas.ownerDocument.documentElement.addEventListener('keyup', this.keyup.bind(this));
    }

    Update(delta: number): void
    {
        for (let i = 0 ; i < this._keys.length; ++i)
        {
            if (this._keyTicks[i] === 0)
            {
                switch(this._keys[i])
                {
                    case KeyState.PRESSED:
                    case KeyState.DOUBLE_PRESSED:
                        this._keys[i] = KeyState.DOWN;
                        break

                    case KeyState.RELEASED:
                        this._keys[i] = KeyState.UP;
                        break
                }
            }
            else
            {
                this._keyTicks[i] = 0;
            }
        }
    }

    Stop(): void
    {
        this._canvas.ownerDocument.documentElement.removeEventListener('keydown', this.keydown.bind(this));
        this._canvas.ownerDocument.documentElement.removeEventListener('keyup', this.keyup.bind(this));
    }

    private keydown(e: KeyboardEvent)
    {
        // e.preventDefault();

        if (this._keys[e.which] === KeyState.UP)
        {
            this._keys[e.which] = KeyState.PRESSED;
            this._keyTicks[e.which] = 1;
        }
        else if (this._keys[e.which] === KeyState.RELEASED)
        {
            this._keys[e.which] = KeyState.DOUBLE_PRESSED;
            this._keyTicks[e.which] = 1;
        }
    }

    private keyup(e: KeyboardEvent)
    {
        // e.preventDefault();
        this._keys[e.which] = KeyState.RELEASED;
    }
}

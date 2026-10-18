import { ButtonState, WheelState } from "../InputState";
import { MouseState } from "./MouseState";

export class MouseInputHandler
{
    public readonly State: MouseState;
    
    constructor(
        private readonly _canvas: HTMLCanvasElement,
        private readonly _mouseMovement: Float32Array, 
        private readonly _mouseButtons: Uint8ClampedArray,
        private readonly _dimensions: Uint8ClampedArray,
        private readonly _offset: Float32Array
    ) {
        this.State = new MouseState(_mouseMovement, _mouseButtons);
    }

    Start(): void
    {
        this._canvas.addEventListener('resize', this._resize.bind(this));
        this._canvas.addEventListener('click', this._click.bind(this));
        this._canvas.addEventListener('dblclick', this._dblclick.bind(this));
        this._canvas.addEventListener('mousedown', this._mousedown.bind(this));
        this._canvas.addEventListener('mouseup', this._mouseup.bind(this));
        this._canvas.addEventListener('mousemove', this._mousemove.bind(this));
        this._canvas.addEventListener('contextmenu', this._contextmenu.bind(this));
        this._canvas.addEventListener('wheel', this._wheel.bind(this));
        this._resize();
    }

    Update(_?: number): void { }

    Reset(): void
    {
        this._mouseMovement[0] = 0;
        this._mouseMovement[1] = 0;
        this._mouseButtons[0] = 0;
    }
    
    Stop(): void
    {
        this._canvas.removeEventListener('resize', this._resize.bind(this));
        this._canvas.removeEventListener('click', this._click.bind(this));
        this._canvas.removeEventListener('dblclick', this._dblclick.bind(this));
        this._canvas.removeEventListener('mousedown', this._mousedown.bind(this));
        this._canvas.removeEventListener('mouseup', this._mouseup.bind(this));
        this._canvas.removeEventListener('mousemove', this._mousemove.bind(this));
        this._canvas.removeEventListener('contextmenu', this._contextmenu.bind(this));
        this._canvas.removeEventListener('wheel', this._wheel.bind(this));
        
        this.Reset();
    }

    private _resize()
    {
        const { top, left, width, height } = this._canvas.getBoundingClientRect();
        this._dimensions[0] = top;
        this._dimensions[1] = left;
        this._dimensions[2] = width;
        this._dimensions[3] = height;
        this._offset[0] = left + (width / 2);
        this._offset[1] = top + (height / 2);
    }

    private _click(e: MouseEvent): void
    {
        e.preventDefault()
    }
    
    private _dblclick(e: MouseEvent): void
    {
        e.preventDefault()
    }
    
    private _mousedown(e: MouseEvent): void
    {
        e.preventDefault()

        this._mouseButtons[e.button + 1] = ButtonState.PRESSED
    }
    
    private _mouseup(e: MouseEvent): void
    {
        e.preventDefault()

        this._mouseButtons[e.button + 1] = ButtonState.RAISED
    }
    
    private _mousemove(e: MouseEvent): void
    {
        e.preventDefault()
        
        this._mouseMovement[0] = e.movementX
        this._mouseMovement[1] = e.movementY
        this._mouseMovement[2] = e.clientX
        this._mouseMovement[3] = e.clientY
        this._mouseMovement[4] = e.clientX - this._dimensions[1] - (this._dimensions[2] / 2)
        this._mouseMovement[5] = -e.clientY + this._dimensions[0] + (this._dimensions[3] / 2)
    }
    
    private _contextmenu(e: MouseEvent): void
    {
        e.preventDefault()
    }
    
    private _wheel(e: WheelEvent): void
    {
        e.preventDefault()

        this._mouseButtons[0] = e.deltaY > 0
            ? WheelState.DOWN
            : e.deltaY < 0 
                ? WheelState.UP
                : WheelState.CENTERED
    }
}

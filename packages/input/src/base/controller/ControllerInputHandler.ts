import { FixedLengthArray } from "@fwge/common";
import { ControllerState } from "./ControllerState";

export class ControllerInputHandler
{
    public readonly State: FixedLengthArray<ControllerState, 8>;
    
    private readonly _controllers: FixedLengthArray<Gamepad | null, 8> = [null, null, null, null, null, null, null, null];
    private readonly _controllerReset = {
        axes: [0,0,0,0],
        buttons: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].map((value) => ({value}))
    }
    
    constructor(
        private readonly _canvas: HTMLCanvasElement,
        private readonly _controllerAxes: Float32Array,
        private readonly _controllerButtons: Uint8ClampedArray
    ) { 
        this.State = [
            new ControllerState(_controllerAxes,  0, _controllerButtons,   0),
            new ControllerState(_controllerAxes,  4, _controllerButtons,  16),
            new ControllerState(_controllerAxes,  8, _controllerButtons,  32),
            new ControllerState(_controllerAxes, 12, _controllerButtons,  48),
            new ControllerState(_controllerAxes, 16, _controllerButtons,  64),
            new ControllerState(_controllerAxes, 20, _controllerButtons,  80),
            new ControllerState(_controllerAxes, 24, _controllerButtons,  96),
            new ControllerState(_controllerAxes, 28, _controllerButtons, 112),
        ];
    }

    public Start(): void        
    {
        this._canvas.ownerDocument.documentElement.addEventListener('gamepadconnected', this.addController.bind(this))
        this._canvas.ownerDocument.documentElement.addEventListener('gamepaddisconnected', this.removeController.bind(this))
    }

    public Update(): void
    {
        const controllers = navigator.getGamepads() as FixedLengthArray<Gamepad | null, 4>;
        for (let i = 0; i < controllers.length; ++i)
        {
            const controller = controllers[i];
            let axesOffset = i * 4;
            let buttonsOffset = i * 16;

            if (!controller && this.State[i].Active)
            {
                this.State[i].Active = false;
            }
            else if (controller && !this.State[i].Active)
            {
                this.State[i].Active = true;
            }
            
            let update = controller ?? this._controllerReset;

            this._controllerAxes[axesOffset + 0] =  update.axes[0];
            this._controllerAxes[axesOffset + 1] = -update.axes[1];
            this._controllerAxes[axesOffset + 2] =  update.axes[2];
            this._controllerAxes[axesOffset + 3] = -update.axes[3];

            this._controllerButtons[buttonsOffset +  0] = update.buttons[ 0].value;
            this._controllerButtons[buttonsOffset +  1] = update.buttons[ 1].value;
            this._controllerButtons[buttonsOffset +  2] = update.buttons[ 2].value;
            this._controllerButtons[buttonsOffset +  3] = update.buttons[ 3].value;
            this._controllerButtons[buttonsOffset +  4] = update.buttons[ 4].value;
            this._controllerButtons[buttonsOffset +  5] = update.buttons[ 5].value;
            this._controllerButtons[buttonsOffset +  6] = update.buttons[ 6].value;
            this._controllerButtons[buttonsOffset +  7] = update.buttons[ 7].value;
            this._controllerButtons[buttonsOffset +  8] = update.buttons[ 8].value;
            this._controllerButtons[buttonsOffset +  9] = update.buttons[ 9].value;
            this._controllerButtons[buttonsOffset + 10] = update.buttons[10].value;
            this._controllerButtons[buttonsOffset + 11] = update.buttons[11].value;
            this._controllerButtons[buttonsOffset + 12] = update.buttons[12].value;
            this._controllerButtons[buttonsOffset + 13] = update.buttons[13].value;
            this._controllerButtons[buttonsOffset + 14] = update.buttons[14].value;
            this._controllerButtons[buttonsOffset + 15] = update.buttons[15].value;
        }
    }

    public Stop(): void        
    {
        this._canvas.ownerDocument.documentElement.removeEventListener('gamepadconnected', this.removeController.bind(this)) 
        this._canvas.ownerDocument.documentElement.removeEventListener('gamepaddisconnected', this.removeController.bind(this))       
    }

    private addController(e: Event)
    {
        const controller = (e as GamepadEvent).gamepad;
        this._controllers[controller.index] = controller;
    }
    
    private removeController(e: Event)
    {
        const controller = (e as GamepadEvent).gamepad;
        this._controllers[controller.index] = null;
    }
}

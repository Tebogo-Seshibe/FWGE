import { CompositeDataView, GL } from "@fwge/common";
import { ControllerInputHandler } from "../base/controller/ControllerInputHandler";
import { KeyboardInputHandler, NUM_KEYBOARD_KEYS } from "../base/keyboard/KeyboardInputHandler";
import { MouseInputHandler } from "../base/mouse/MouseInputHandler";
import { Input } from "../components";
import { Registry, System } from "@fwge/ecs";

export class InputSystem extends System
{
    private inputView!: number;
    private readonly inputDataView = new CompositeDataView(
    {
        keyboard:
        {
            type: Uint8ClampedArray,
            length: NUM_KEYBOARD_KEYS
        },
        mouseMovement:
        {
            type: Float32Array,
            length: 6
        },
        mouseButtons:
        {
            type: Uint8ClampedArray,
            length: 6
        },
        controllerAxes:
        {
            type: Float32Array,
            length: 32
        },
        controllerButtons:
        {
            type: Uint8ClampedArray,
            length: 128
        },
        dimensions:
        {
            type: Uint8ClampedArray,
            length: 4
        },
        offset:
        {
            type: Float32Array,
            length: 2
        }
    });
    
    private readonly keyboard: KeyboardInputHandler = new KeyboardInputHandler(
        GL.canvas as HTMLCanvasElement,
        0.2,
        this.inputDataView.View('keyboard')
    );

    private readonly mouse: MouseInputHandler = new MouseInputHandler(
        GL.canvas as HTMLCanvasElement,
        this.inputDataView.View('mouseMovement'),
        this.inputDataView.View('mouseButtons'),
        this.inputDataView.View('dimensions'),
        this.inputDataView.View('offset')
    );
    
    private readonly controllers: ControllerInputHandler = new ControllerInputHandler(
        GL.canvas as HTMLCanvasElement,
        this.inputDataView.View('controllerAxes')!,
        this.inputDataView.View('controllerButtons')!
    );

    Init(): void
    {
        this.inputView = Registry.RegisterView([Input], (entity) => entity.Active);
    }
    
    Start(): void
    {
        this.keyboard.Start();
        this.mouse.Start();
        this.controllers.Start();
    }

    Update(delta: number): void
    {
        this.keyboard.Update(delta);
        this.mouse.Update();
        this.controllers.Update();

        for (const entityId of Registry.GetView(this.inputView))
        {
            const input = Registry.GetComponent(entityId, Input)!;
            input.OnInput(
                delta, 
                this.keyboard.State, 
                this.mouse.State, 
                this.controllers.State
            );
        }

        this.mouse.Reset();
    }

    Stop(): void        
    {
        this.keyboard.Stop();
        this.mouse.Stop();
        this.controllers.Stop();
    }
}

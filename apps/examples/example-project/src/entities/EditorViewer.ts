import { GL, Maths, Matrix3, Matrix4, Vector3 } from "@fwge/common";
import { PerspectiveCamera, Transform } from "@fwge/core";
import { Entity } from "@fwge/ecs";
import { ButtonState, ControllerState, Input, KeyState, KeyboardState, WheelState } from "@fwge/input";
import { EditorTag } from "../components/EditorTag";

export class EditorViewer extends Entity
{    
    // private readonly target: Vector3 = Vector3.Zero;
    private readonly up: Vector3 = Vector3.Zero;
    private readonly right: Vector3 = Vector3.Zero;
    private readonly forward: Vector3 = Vector3.Zero;
    private readonly movement: Vector3 = Vector3.Zero;
    private readonly rotationMatrix: Matrix3 = Matrix3.Zero;

    private readonly zoomSpeed: number = 50;
    private readonly rotationSpeed: number = 10;
    private readonly panSpeed: number = 10;

    private transform!: Transform;
    private cameraTransform!: Transform;
    private camera!: PerspectiveCamera;
    private locked = false;
    private deadzone = 0.2;

    Init()
    {        
        this.camera = new PerspectiveCamera({ farClipping: 100 });
        this.cameraTransform = new Transform({ position: [0, 1, 0], rotation: [17, 0, 0] });
        this.transform = new Transform({ position: [0, 22, 30] });

        this.AddChild(
            new Entity()
                .AddComponents(
                    new EditorTag(),
                    this.cameraTransform,
                    this.camera,
                )
        );

        this.AddComponents(
            new EditorTag(),
            this.transform,
            new Input(
            {
                onInput: (delta, keyboard, mouse, controllers): void =>
                {
                    const controller = controllers[0];
                    if (mouse.Wheel !== WheelState.CENTERED)
                    {
                        const scrollAmount = mouse.Wheel === WheelState.UP
                            ? this.zoomSpeed
                            : -this.zoomSpeed;
                        this.Zoom(scrollAmount * delta);
                    }

                    if (controller.Active)
                    {
                        const axes = [
                            Math.abs(controller.RightStick.X) < this.deadzone ? 0 :  controller.RightStick.X,
                            Math.abs(controller.RightStick.Y) < this.deadzone ? 0 : -controller.RightStick.Y 
                        ] as const;
                        this.PanController(delta, controller);
                        this.Rotate(
                            axes[0] * delta * this.rotationSpeed,
                            axes[1] * delta * this.rotationSpeed
                        );
                    }
                    else if (mouse.Left === ButtonState.PRESSED)
                    {
                        if (!this.locked)
                        {
                            this.locked = true;
                            (GL.canvas as HTMLCanvasElement).requestPointerLock(); 
                        }

                        this.Rotate(
                            mouse.Offset.X * delta * this.rotationSpeed,
                            mouse.Offset.Y * delta * this.rotationSpeed
                        );
                        this.Pan(delta, keyboard);
                    }
                    else
                    {
                        if (this.locked)
                        {
                            this.locked = false;
                            document.exitPointerLock(); 
                        }
                    }
                },
            })
        );
    }
    
    private Rotate(deltaTheta: number, deltaPhi: number): void
    {
        this.cameraTransform.Rotation.X = Maths.clamp(this.cameraTransform.Rotation.X + deltaPhi, -80, 80);
        this.transform.Rotation.Y += deltaTheta;
    }
    
    private Zoom(delta: number): void
    {
        this.camera.FieldOfView -= delta;
    }

    private Pan(delta: number, keyboard: KeyboardState): void
    {
        const wPressed = keyboard.KeyW !== KeyState.RELEASED && keyboard.KeyW !== KeyState.UP;
        const aPressed = keyboard.KeyA !== KeyState.RELEASED && keyboard.KeyA !== KeyState.UP;
        const sPressed = keyboard.KeyS !== KeyState.RELEASED && keyboard.KeyS !== KeyState.UP;
        const dPressed = keyboard.KeyD !== KeyState.RELEASED && keyboard.KeyD !== KeyState.UP;
        const qPressed = keyboard.KeyQ !== KeyState.RELEASED && keyboard.KeyQ !== KeyState.UP;
        const ePressed = keyboard.KeyE !== KeyState.RELEASED && keyboard.KeyE !== KeyState.UP;
        const shiftPressed = keyboard.KeyShift !== KeyState.RELEASED && keyboard.KeyShift !== KeyState.UP;
        const movementSpeed = this.panSpeed * (shiftPressed ? 2 : 1);

        this.rotationMatrix.Set(Matrix4.RotationMatrix(this.transform.Rotation).Matrix3);
        Matrix3.MultiplyVector(this.rotationMatrix, 0, 0, -1, this.forward);
        Matrix3.MultiplyVector(this.rotationMatrix, 1, 0, 0, this.right);

        if ((wPressed && sPressed) || (!wPressed && !sPressed))
        {
            this.forward.Set(0, 0, 0);
        }
        else if (!wPressed && sPressed)
        {
            this.forward.Negate();
        }

        if ((dPressed && aPressed) || (!dPressed && !aPressed))
        {
            this.right.Set(0, 0, 0);
        }
        else if (!dPressed && aPressed)
        {
            this.right.Negate();
        }

        this.up.Set(0, movementSpeed * delta, 0);

        if ((qPressed && ePressed) || (!qPressed && !ePressed))
        {
            this.up.Set(0, 0, 0);
        }
        else if (!qPressed && ePressed)
        {
            this.up.Negate();
        }

        Vector3.Add(this.forward, this.right, this.movement);
        if (this.movement.Length !== 0)
        {
            this.movement.Scale(movementSpeed * delta / this.movement.Length);
        }

        this.transform.Position.Add(this.movement).Add(this.up);
    }

    private PanController(delta: number, controller: ControllerState): void
    {
        const leftBumperPressed = controller.LeftBumper === ButtonState.PRESSED;
        const rightBumperPressed = controller.RightBumper === ButtonState.PRESSED;
        const leftStickPressed = controller.LeftStickButton === ButtonState.PRESSED;
        const movementSpeed = this.panSpeed * (leftStickPressed ? 2 : 1);

        const axes = [
            Math.abs(controller.LeftStick.X) < this.deadzone ? 0 :  controller.LeftStick.X,
            Math.abs(controller.LeftStick.Y) < this.deadzone ? 0 : -controller.LeftStick.Y 
        ] as const;

        this.rotationMatrix.Set(Matrix4.RotationMatrix(this.transform.Rotation).Matrix3);
        Matrix3.MultiplyVector(this.rotationMatrix, 0, 0, axes[1], this.forward);
        Matrix3.MultiplyVector(this.rotationMatrix, axes[0], 0, 0, this.right);

        this.up.Set(0, 0, 0);
        if (leftBumperPressed)
        {
            this.up.Add(0, 1, 0)
        }
        if (rightBumperPressed)
        {
            this.up.Subtract(0, 1, 0)
        }
        this.up.Scale(delta * 5);

        Vector3.Add(this.forward, this.right, this.movement);
        if (this.movement.Length !== 0)
        {
            this.movement.Scale(movementSpeed * delta / this.movement.Length);
        }

        this.transform.Position.Add(this.movement).Add(this.up);
    }
}

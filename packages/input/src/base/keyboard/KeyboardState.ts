import { FixedLengthArray } from "@fwge/common";
import { KeyState } from "../InputState";

export class KeyboardState
{
    public readonly Keys: Readonly<FixedLengthArray<KeyState, 256>>;

    get KeyTilde(): KeyState
    {
        return this.Keys[192];
    }

    get Key0(): KeyState
    {
        return this.Keys[48];
    }

    get Key1(): KeyState
    {
        return this.Keys[49];
    }

    get Key2(): KeyState
    {
        return this.Keys[50];
    }

    get Key3(): KeyState
    {
        return this.Keys[51];
    }

    get Key4(): KeyState
    {
        return this.Keys[52];
    }

    get Key5(): KeyState
    {
        return this.Keys[53];
    }

    get Key6(): KeyState
    {
        return this.Keys[54];
    }

    get Key7(): KeyState
    {
        return this.Keys[55];
    }

    get Key8(): KeyState
    {
        return this.Keys[56];
    }

    get Key9(): KeyState
    {
        return this.Keys[57];
    }

    get KeyHyphen(): KeyState
    {
        return this.Keys[189];
    }

    get KeyEquals(): KeyState
    {
        return this.Keys[187];
    }

    get KeyA(): KeyState
    {
        return this.Keys[65];
    }

    get KeyB(): KeyState
    {
        return this.Keys[66];
    }

    get KeyC(): KeyState
    {
        return this.Keys[67];
    }

    get KeyD(): KeyState
    {
        return this.Keys[68];
    }

    get KeyE(): KeyState
    {
        return this.Keys[69];
    }

    get KeyF(): KeyState
    {
        return this.Keys[70];
    }

    get KeyG(): KeyState
    {
        return this.Keys[71];
    }

    get KeyH(): KeyState
    {
        return this.Keys[72];
    }

    get KeyI(): KeyState
    {
        return this.Keys[73];
    }

    get KeyJ(): KeyState
    {
        return this.Keys[74];
    }

    get KeyK(): KeyState
    {
        return this.Keys[75];
    }

    get KeyL(): KeyState
    {
        return this.Keys[76];
    }

    get KeyM(): KeyState
    {
        return this.Keys[77];
    }

    get KeyN(): KeyState
    {
        return this.Keys[78];
    }

    get KeyO(): KeyState
    {
        return this.Keys[79];
    }

    get KeyP(): KeyState
    {
        return this.Keys[80];
    }

    get KeyQ(): KeyState
    {
        return this.Keys[81];
    }

    get KeyR(): KeyState
    {
        return this.Keys[82];
    }

    get KeyS(): KeyState
    {
        return this.Keys[83];
    }

    get KeyT(): KeyState
    {
        return this.Keys[84];
    }

    get KeyU(): KeyState
    {
        return this.Keys[85];
    }

    get KeyV(): KeyState
    {
        return this.Keys[86];
    }

    get KeyW(): KeyState
    {
        return this.Keys[87];
    }

    get KeyX(): KeyState
    {
        return this.Keys[88];
    }

    get KeyY(): KeyState
    {
        return this.Keys[89];
    }

    get KeyZ(): KeyState
    {
        return this.Keys[90];
    }

    get KeyComma(): KeyState
    {
        return this.Keys[188];
    }

    get KeyPeriod(): KeyState
    {
        return this.Keys[190];
    }

    get KeySlash(): KeyState
    {
        return this.Keys[191];
    }

    get KeySpace(): KeyState
    {
        return this.Keys[32];
    }

    get KeyBackspace(): KeyState
    {
        return this.Keys[8];
    }

    get KeyEnter(): KeyState
    {
        return this.Keys[13];
    }

    get KeyInsert(): KeyState
    {
        return this.Keys[45];
    }

    get KeyDelete(): KeyState
    {
        return this.Keys[46];
    }

    get KeyTab(): KeyState
    {
        return this.Keys[9];
    }

    get KeyHome(): KeyState
    {
        return this.Keys[36];
    }

    get KeyEnd(): KeyState
    {
        return this.Keys[35];
    }

    get KeyPgUp(): KeyState
    {
        return this.Keys[33];
    }

    get KeyPgDown(): KeyState
    {
        return this.Keys[34];
    }

    get KeyUp(): KeyState
    {
        return this.Keys[38];
    }

    get KeyDown(): KeyState
    {
        return this.Keys[40];
    }

    get KeyLeft(): KeyState
    {
        return this.Keys[37];
    }

    get KeyRight(): KeyState
    {
        return this.Keys[39];
    }

    get Numpad0(): KeyState
    {
        return this.Keys[96];
    }

    get Numpad1(): KeyState
    {
        return this.Keys[97];
    }

    get Numpad2(): KeyState
    {
        return this.Keys[98];
    }

    get Numpad3(): KeyState
    {
        return this.Keys[99];
    }

    get Numpad4(): KeyState
    {
        return this.Keys[100];
    }

    get Numpad5(): KeyState
    {
        return this.Keys[101];
    }

    get Numpad6(): KeyState
    {
        return this.Keys[102];
    }

    get Numpad7(): KeyState
    {
        return this.Keys[103];
    }

    get Numpad8(): KeyState
    {
        return this.Keys[104];
    }

    get Numpad9(): KeyState
    {
        return this.Keys[105];
    }

    get KeyShift(): KeyState
    {
        return this.Keys[16];
    }

    get KeyCtrl(): KeyState
    {
        return this.Keys[17];
    }

    get KeyAlt(): KeyState
    {
        return this.Keys[18];
    }

    get KeyPauseBreak(): KeyState
    {
        return this.Keys[19];
    }

    get KeyEsc(): KeyState
    {
        return this.Keys[27];
    }

    get KeyStart(): KeyState
    {
        return this.Keys[91];
    }

    get KeyContextMenu(): KeyState
    {
        return this.Keys[93];
    }

    get KeyF1(): KeyState
    {
        return this.Keys[112];
    }

    get KeyF2(): KeyState
    {
        return this.Keys[113];
    }

    get KeyF3(): KeyState
    {
        return this.Keys[114];
    }

    get KeyF4(): KeyState
    {
        return this.Keys[115];
    }

    get KeyF5(): KeyState
    {
        return this.Keys[116];
    }

    get KeyF6(): KeyState
    {
        return this.Keys[117];
    }

    get KeyF7(): KeyState
    {
        return this.Keys[118];
    }

    get KeyF8(): KeyState
    {
        return this.Keys[119];
    }

    get KeyF9(): KeyState
    {
        return this.Keys[120];
    }

    get KeyF10(): KeyState
    {
        return this.Keys[121];
    }

    get KeyF11(): KeyState
    {
        return this.Keys[122];
    }

    get KeyF12(): KeyState
    {
        return this.Keys[123];
    }

    get KeyCapsLock(): KeyState
    {
        return this.Keys[20];
    }

    get KeyNumLock(): KeyState
    {
        return this.Keys[144];
    }

    get KeyScrollLock(): KeyState
    {
        return this.Keys[145];
    }
    
    constructor(keys: Uint8ClampedArray)
    {
        this.Keys = keys as any as FixedLengthArray<KeyState, 256>;
    }
}

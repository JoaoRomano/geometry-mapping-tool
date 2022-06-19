import { Vector2 } from "three";

export interface Tool {
    active: boolean;

    activate():boolean;
    deactivate():boolean;
    onMouseMove(pointer:Vector2):void;
    onMouseDown(pointer:Vector2):void;
}
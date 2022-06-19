import { Vector2, Vector3 } from "three";

export const equalsVector2 = (v1: Vector2, v2: Vector2): boolean => {
    return v1.x == v2.x && v1.y == v2.y;
}

export const equalsVector3 = (v1: Vector3, v2: Vector3): boolean => {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
}

export const convertDegreesToRadians = (degrees: number): number => {
    return degrees * Math.PI / 180;
}

export const convertRadiansToDegrees = (radians: number): number => {
    return radians * 180 / Math.PI;
}

export const createVector2 = (P1: Vector2, P2: Vector2): Vector2 => {
    return new Vector2(P2.x - P1.x, P2.y - P1.y);
}

export const createVector3 = (P1: Vector3, P2: Vector3): Vector3 => {
    return new Vector3(P2.x - P1.x, P2.y - P1.y, P2.z - P1.z);
}

export const perpendicularVector2 = (vector: Vector2): Vector2 => {
    // x1 * x2 + y1 * y2 = 0
    if (vector.x == 0.0 && vector.y == 0.0) {
        return new Vector2(0.0, 0.0);
    } else if (vector.y == 0.0 && vector.x != 0.0) {
        const y2 = 1;
        const x2 = -(vector.y * y2) / vector.x;
        return new Vector2(x2, y2);
    } else {
        const x2 = 1;
        const y2 = -(vector.x * x2) / vector.y;
        return new Vector2(x2, y2);
    }
}

export const medianVector2 = (P1: Vector2, P2: Vector2): Vector2 => {
    return new Vector2((P2.x + P1.x) / 2, (P2.y + P1.y) / 2);
}

export const medianVector3 = (P1: Vector3, P2: Vector3): Vector3 => {
    return new Vector3((P2.x + P1.x) / 2, (P2.y + P1.y) / 2, (P2.z + P1.z) / 2);
}

export const distanceBetweenTwoPointsVector2 = (P1: Vector2, P2: Vector2): number => {
    return Math.sqrt(Math.pow(P2.x - P1.x, 2) + Math.pow(P2.y - P1.y, 2));
}

export const distanceBetweenTwoPointsVector3 = (P1: Vector3, P2: Vector3): number => {
    return Math.sqrt(Math.pow(P2.x - P1.x, 2) + Math.pow(P2.y - P1.y, 2) + Math.pow(P2.z - P1.z, 2));
}

export const generateAngle = (P1: Vector2, P2: Vector2): number => {
    return new Vector2(P2.x - P1.x, P2.y - P1.y).normalize().angle();
}

export const vectorialProduct = (a: Vector3, b: Vector3): Vector3 => {
    return new Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}

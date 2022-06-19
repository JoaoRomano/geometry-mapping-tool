import { Group, Mesh, Vector3 } from "three";
import { LabelModel } from "../LabelModel";

export interface PointProjection3DModel {
    position: Vector3;
    projection: Mesh;
    label: LabelModel;
    group: Group; 
}
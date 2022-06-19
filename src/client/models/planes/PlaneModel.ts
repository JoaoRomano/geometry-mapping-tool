import { Vector3, Mesh, Group, BoxGeometry, MeshBasicMaterial } from "three";
import { DIMENSIONS } from "../../config";
import { LabelModel } from "../LabelModel";

export class PlaneModel {
    position: Vector3;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    plane: Mesh;
    label: LabelModel;
    group: Group;

    constructor(label: string, position: Vector3, width: number, height: number, rotationX?: number, rotationY?: number, rotationZ?: number, labelPosition?: Vector3) {
        this.position = position;
        this.rotationX = rotationX;
        this.rotationY = rotationY;
        this.rotationZ = rotationZ;

        this.label = new LabelModel(
            label, 
            labelPosition ? labelPosition.x : this.position.x, 
            labelPosition ? labelPosition.y : this.position.y + DIMENSIONS.projectionPoint3D.labelExcess.y, 
            labelPosition ? labelPosition.z : this.position.z
        );
        
        const planeGeometry = new BoxGeometry(width, height, 0.1, 1, 1, 1);
        const planeMaterial = new MeshBasicMaterial({ color: '#00FF00', transparent: true, opacity: 0.5 });
        this.plane = new Mesh(planeGeometry, planeMaterial);
        this.plane.position.set(this.position.x, this.position.y, this.position.z);
        if (this.rotationX) {
            this.plane.rotation.x = this.rotationX;
        }
        if (this.rotationY) {
            this.plane.rotation.y = this.rotationY;
        }
        if (this.rotationZ) {
            this.plane.rotation.z = this.rotationZ;
        }

        this.group = new Group();
        this.group.add(this.plane, this.label.object);
    }
}
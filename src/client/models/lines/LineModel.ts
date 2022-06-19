import { Vector3, Mesh, Group, CylinderBufferGeometry, MeshBasicMaterial } from "three";
import { DIMENSIONS, COLORS } from "../../config";
import { LabelModel } from "../LabelModel";

export class LineModel {
    position: Vector3;
    length: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    line: Mesh;
    label: LabelModel;
    group: Group;

    constructor(label: string, position: Vector3, length: number, rotationX?: number, rotationY?: number, rotationZ?: number, labelPosition?: Vector3) {
        this.position = position;
        this.length = length;
        this.rotationX = rotationX;
        this.rotationY = rotationY;
        this.rotationZ = rotationZ;

        this.label = new LabelModel(
            label, 
            labelPosition ? labelPosition.x + DIMENSIONS.projectionPoint3D.labelExcess.x : this.position.x + DIMENSIONS.projectionPoint3D.labelExcess.x, 
            labelPosition ? labelPosition.y + DIMENSIONS.projectionPoint3D.labelExcess.y : this.position.y + DIMENSIONS.projectionPoint3D.labelExcess.y, 
            labelPosition ? labelPosition.z : this.position.z
        );

        const line_geometry = new CylinderBufferGeometry(0.05, 0.05, this.length, 32, 1);
        const line_material = new MeshBasicMaterial( { color: COLORS.pointColor } );
        this.line = new Mesh(line_geometry, line_material);
        this.line.position.set(this.position.x, this.position.y, this.position.z);
        if (this.rotationX) {
            this.line.rotation.x = this.rotationX;
        }
        if (this.rotationY) {
            this.line.rotation.y = this.rotationY;
        }
        if (this.rotationZ) {
            this.line.rotation.z = this.rotationZ;
        }

        this.group = new Group();
        this.group.add(this.line, this.label.object);
    }
}
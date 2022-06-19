import { BoxBufferGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { DIMENSIONS, COLORS, UI } from "../../config";
import { LabelModel } from "../LabelModel";

export class LineProjection3DModel {
    position: Vector3;
    length: number;
    rotationX?: number;
    rotationY?: number;
    projection: Mesh;
    label: LabelModel;
    group: Group; 

    constructor(label: string, position: Vector3, angle: number, length: number, rotationX?: number, rotationY?: number, labelPosition?: Vector3) {
        this.position = position;
        this.rotationX = rotationX;
        this.rotationY = rotationY;
        this.length = length;

        this.label = new LabelModel(
            label, 
            labelPosition ? labelPosition.x + DIMENSIONS.projectionPoint3D.labelExcess.x : this.position.x + DIMENSIONS.projectionPoint3D.labelExcess.x, 
            labelPosition ? labelPosition.y + DIMENSIONS.projectionPoint3D.labelExcess.y : this.position.y + DIMENSIONS.projectionPoint3D.labelExcess.y, 
            labelPosition ? labelPosition.z + DIMENSIONS.projectionPoint3D.labelExcess.x : this.position.z + DIMENSIONS.projectionPoint3D.labelExcess.x,
            UI.classes.projection3D
        );

        const line_geometry = new BoxBufferGeometry(0.05, 0.05, this.length, 1, 1, 1);
        const line_material = new MeshBasicMaterial( { color: COLORS.projection3DColor } );
        this.projection = new Mesh(line_geometry, line_material);
        this.projection.position.set(this.position.x, this.position.y, this.position.z);
        
        if (this.rotationX) {
            this.projection.rotation.x = this.rotationX;
        }
        
        if (this.rotationY) {
            this.projection.rotation.y = this.rotationY;
        }

        this.group = new Group();
        this.group.add(this.projection, this.label.object);
    }
}
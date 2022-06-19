import { BufferGeometry, CylinderGeometry, Group, Line, LineDashedMaterial, LineSegments, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { COLORS, DIMENSIONS, UI } from "../../config";
import { LabelModel } from "../LabelModel";
import { PointProjection3DModel } from "./PointProjection3DModel";

export class HorizontalPointProjection3DModel implements PointProjection3DModel {
    position: Vector3;
    projection: Mesh;
    line: Line;
    label: LabelModel;
    group: Group;

    constructor(position: Vector3, label: string) {
        this.position = position;
        
        this.label = new LabelModel(
            label, 
            this.position.x, 
            this.position.y + DIMENSIONS.projectionPoint3D.labelExcess.x, 
            this.position.z,
            UI.classes.projection3D
        );
        
        const point_geometry = new CylinderGeometry(DIMENSIONS.projectionPoint3D.radius, DIMENSIONS.projectionPoint3D.radius, DIMENSIONS.projectionPoint3D.cylinderProjectionHeight, DIMENSIONS.projectionPoint3D.widthSegments);
        const point_material = new MeshBasicMaterial( { color: COLORS.projection3DColor } );
        this.projection = new Mesh(point_geometry, point_material);
        this.projection.position.set(this.position.x, this.position.y, this.position.z);

        this.group = new Group();
        this.group.add(this.projection, this.label.object);
        
        let linePoints = [];
        linePoints.push(new Vector3(this.position.x, 0, this.position.z));
        linePoints.push(new Vector3(0, 0, this.position.z));
        const lineGeometry = new BufferGeometry().setFromPoints( linePoints );
        const lineMaterial = new LineDashedMaterial({ color: COLORS.projection3DColor, dashSize: DIMENSIONS.projectionPoint3D.dashSize, gapSize: DIMENSIONS.projectionPoint3D.gapSize });
        this.line = new LineSegments(lineGeometry, lineMaterial);
        this.line.computeLineDistances();

        this.group.add(this.line);
    }
}
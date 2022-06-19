import { BufferGeometry, Group, Line, LineDashedMaterial, LineSegments, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { COLORS, DIMENSIONS } from "../../config";
import { LabelModel } from "../LabelModel";

export class PointModel {
    position: Vector3;
    label: LabelModel;
    point: Mesh;
    horizontalLine: Line;
    frontalLine: Line;
    group: Group;

    constructor(position: Vector3, label: string) {
        this.position = position;
        
        this.label = new LabelModel(
            label, 
            this.position.x + DIMENSIONS.point3D.labelExcess.x, 
            this.position.y + DIMENSIONS.point3D.labelExcess.y, 
            this.position.z
        );

        const point_geometry = new SphereGeometry(DIMENSIONS.point3D.radius, DIMENSIONS.point3D.widthSegments, DIMENSIONS.point3D.heightSegments);
        const point_material = new MeshBasicMaterial( { color: COLORS.pointColor } );
        this.point = new Mesh(point_geometry, point_material);
        this.point.position.set(this.position.x, this.position.y, this.position.z);

        let horizontalLinePoints = [];
        horizontalLinePoints.push(new Vector3(this.position.x, this.position.y, this.position.z));
        horizontalLinePoints.push(new Vector3(this.position.x, 0, this.position.z));
        const horizontalLineGeometry = new BufferGeometry().setFromPoints( horizontalLinePoints );
        const horizontalLineMaterial = new LineDashedMaterial({ color: COLORS.lineColor, dashSize: DIMENSIONS.point3D.dashSize, gapSize: DIMENSIONS.point3D.gapSize });
        this.horizontalLine = new LineSegments(horizontalLineGeometry, horizontalLineMaterial);
        this.horizontalLine.computeLineDistances();

        let frontalLinePoints = [];
        frontalLinePoints.push(new Vector3(this.position.x, this.position.y, this.position.z));
        frontalLinePoints.push(new Vector3(0, this.position.y, this.position.z));
        const frontalLineGeometry = new BufferGeometry().setFromPoints( frontalLinePoints );
        const frontalLineMaterial = new LineDashedMaterial({ color: COLORS.lineColor, dashSize: DIMENSIONS.point3D.dashSize, gapSize: DIMENSIONS.point3D.gapSize });
        this.frontalLine = new LineSegments(frontalLineGeometry, frontalLineMaterial);
        this.frontalLine.computeLineDistances();

        this.group = new Group();
        this.group.add(this.point, this.label.object, this.horizontalLine, this.frontalLine);
    }
}
import { BufferGeometry, CircleGeometry, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { COLORS, DIMENSIONS } from "../../config";
import { LabelModel } from "../LabelModel";

export class PointProjectionModel {
    x: number;
    y: number;
    radius: number;
    projection: Mesh;
    line: Line;
    label: LabelModel;
    group: Group;
    
    constructor(label: string, x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = DIMENSIONS.projectionPointMonge.radius; 

        const projectionGeometry = new CircleGeometry(this.radius, DIMENSIONS.projectionPointMonge.widthSegments);
        const projectionMaterial = new MeshBasicMaterial( { color: COLORS.pointColor } );
        this.projection = new Mesh(projectionGeometry, projectionMaterial);
        this.projection.position.set(this.x, this.y, 10);

        let linePoints = [];
        linePoints.push(new Vector3(this.x, this.y, 10));
        linePoints.push(new Vector3(this.x, 0, 10));
        const lineGeometry = new BufferGeometry().setFromPoints( linePoints );
        const lineMaterial = new LineBasicMaterial({ color: COLORS.lineColor });
        this.line = new Line(lineGeometry, lineMaterial);

        this.label = new LabelModel(label, x + DIMENSIONS.projectionPointMonge.labelExcess.x, y + DIMENSIONS.projectionPointMonge.labelExcess.y, 0);

        this.group = new Group();
        this.group.add(this.line, this.projection, this.label.object);
        this.group.name = `point_projection_${this.label.labels.join()}`;
    }

    addProjection(label: string):void {
        this.label.addLabel(label);
    }

    setColorDefault(): void {
        this.line.material = new LineBasicMaterial({ color: COLORS.lineColor });
        this.projection.material = new MeshBasicMaterial({ color: COLORS.lineColor });
        this.label.setColorDefault();
    }

    setColor(color: string): void {
        this.line.material = new LineBasicMaterial({ color: color });
        this.projection.material = new MeshBasicMaterial({ color: color });
        this.label.setColor(color);
    }
}
import { CircleGeometry, Group, Mesh, MeshBasicMaterial, Vector2, Vector3 } from "three";
import { COLORS, DIMENSIONS } from "../../config";
import { LabelModel } from "../LabelModel";

export class PointPreviewModel {
    position: Vector2;
    radius: number;
    point: Mesh;
    label: LabelModel;
    group: Group;

    constructor(x: number, y: number) {
        this.position = new Vector2(x, y);
        this.radius = DIMENSIONS.previewPoint.radius;
        const projectionGeometry = new CircleGeometry(this.radius, DIMENSIONS.previewPoint.circleSegments);
        const projectionMaterial = new MeshBasicMaterial( { color: COLORS.previewColor, opacity: COLORS.previewOpacity } );
        this.point = new Mesh(projectionGeometry, projectionMaterial);
        this.point.position.set(this.position.x, this.position.y, 0);
        this.label = new LabelModel(
            `(${-this.position.x.toFixed(1)},${this.position.y.toFixed(1)})`,
            this.position.x + DIMENSIONS.previewPoint.labelExcess.x,
            this.position.y + DIMENSIONS.previewPoint.labelExcess.y, 
            0, 
            'point-tool'
        );
        this.group = new Group();
        this.group.add(this.point, this.label.object)
    }

    setPosition(position: Vector2):void {
        this.position.x = position.x;
        this.position.y = position.y;
        this.point.position.set(this.position.x, this.position.y, 0);
        this.label.setPosition(new Vector3(
            this.position.x + DIMENSIONS.previewPoint.labelExcess.x, 
            this.position.y + DIMENSIONS.previewPoint.labelExcess.y, 
            0
        ));
    }

    setLabels(labels: string[]):void {
        this.label.setLabels(labels);
    }
}
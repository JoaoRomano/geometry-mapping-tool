import { BufferGeometry, Color, Group, Line, LineBasicMaterial, Vector2, Vector3 } from "three";
import { COLORS, DIMENSIONS } from "../../config";
import { LabelModel } from "../LabelModel";

type LineProjectionLabelPosition = 'positive' | 'negative';

export class LineProjectionModel {
    line: Line;
    label: LabelModel;
    group: Group;

    constructor(label: string, p1: Vector2, p2: Vector2, labelPosition: LineProjectionLabelPosition, color?: Color) {
        const points = [];
        points.push(new Vector3(p1.x, p1.y, 0), new Vector3(p2.x, p2.y, 0));
        const lineGeometry = new BufferGeometry().setFromPoints(points);
        const lineMaterial = new LineBasicMaterial({ color: color ? color : COLORS.lineColor });
        this.line = new Line(lineGeometry, lineMaterial);

        if (labelPosition == 'positive') {
            this.label = new LabelModel(label, p1.x + DIMENSIONS.lineProjection.labelExcess.x, p1.y + DIMENSIONS.lineProjection.labelExcess.y, 0);
        } else {
            this.label = new LabelModel(label, p2.x + DIMENSIONS.lineProjection.labelExcess.x, p2.y + DIMENSIONS.lineProjection.labelExcess.y, 0);
        }

        this.group = new Group();
        this.group.add(this.line, this.label.object);
        this.group.name = `line_projection_${this.label.labels.join()}`;
    }

    addProjection(label: string):void {
        this.label.addLabel(label);
    }

    setColorDefault(): void {
        this.line.material = new LineBasicMaterial({ color: COLORS.lineColor });
        this.label.setColorDefault();
    }

    setColor(color: string): void {
        this.line.material = new LineBasicMaterial({ color: color });
        this.label.setColor(color);
    }
}
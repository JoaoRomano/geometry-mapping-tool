import { ArcCurve, BufferGeometry, Group, Line, LineBasicMaterial, Vector2 } from "three";
import { COLORS, DIMENSIONS, UI } from "../../config";
import { convertRadiansToDegrees } from "../../utils";
import { LabelModel } from "../LabelModel";
import { PointPreviewModel } from "./PointPreviewModel";

export class AnglePreviewModel {
    position: Vector2;
    radians: number;
    point: PointPreviewModel;
    firstCurve: Line;
    secondCurve: Line;
    firstLabel: LabelModel;
    secondLabel: LabelModel;
    group: Group;

    constructor(position: Vector2, radians: number) {
        this.position = position;
        this.radians = radians;
        this.point = new PointPreviewModel(this.position.x, this.position.y);
        const lineMaterial = new LineBasicMaterial({ color: COLORS.previewColor, opacity: COLORS.previewOpacity });
        
        // Create Curve
        if (radians < Math.PI / 2) {
            let curve = new ArcCurve(
                this.position.x, 
                this.position.y,
                DIMENSIONS.previewAngle.curveRadius,
                0,
                radians,
                false
            );
            let points = curve.getPoints(DIMENSIONS.previewAngle.curvePoints);
            const firstCurveGeometry = new BufferGeometry().setFromPoints(points);
            this.firstCurve = new Line(firstCurveGeometry, lineMaterial);

            curve = new ArcCurve(
                this.position.x,
                this.position.y,
                DIMENSIONS.previewAngle.curveRadius,
                Math.PI,
                Math.PI + radians,
                false
            );
            points = curve.getPoints(DIMENSIONS.previewAngle.curvePoints);
            const secondCurveGeometry = new BufferGeometry().setFromPoints(points);
            this.secondCurve = new Line(secondCurveGeometry, lineMaterial);
        } else {
            let curve = new ArcCurve(
                this.position.x, 
                this.position.y,
                DIMENSIONS.previewAngle.curveRadius,
                radians,
                Math.PI,
                false
            );
            let points = curve.getPoints(DIMENSIONS.previewAngle.curvePoints);
            const firstCurveGeometry = new BufferGeometry().setFromPoints(points);
            this.firstCurve = new Line(firstCurveGeometry, lineMaterial);

            curve = new ArcCurve(
                this.position.x,
                this.position.y,
                DIMENSIONS.previewAngle.curveRadius,
                Math.PI + radians,
                2 * Math.PI,
                false
            );
            points = curve.getPoints(DIMENSIONS.previewAngle.curvePoints);
            const secondCurveGeometry = new BufferGeometry().setFromPoints(points);
            this.secondCurve = new Line(secondCurveGeometry, lineMaterial);
        }

        // Create Label
        if (radians <= Math.PI / 2) {
            this.firstLabel = new LabelModel(
                convertRadiansToDegrees(this.radians).toFixed(1) + 'º',
                this.point.position.x + Math.cos(radians) * DIMENSIONS.previewAngle.labelRadius + DIMENSIONS.previewAngle.labelExcess.x,
                this.point.position.y + Math.sin(radians) * DIMENSIONS.previewAngle.labelRadius - DIMENSIONS.previewAngle.labelExcess.y,
                0,
                UI.classes.preview
            );
            this.secondLabel = new LabelModel(
                convertRadiansToDegrees(this.radians).toFixed(1) + 'º',
                this.point.position.x - Math.cos(radians) * DIMENSIONS.previewAngle.labelRadius - DIMENSIONS.previewAngle.labelExcess.x,
                this.point.position.y - Math.sin(radians) * DIMENSIONS.previewAngle.labelRadius + DIMENSIONS.previewAngle.labelExcess.y,
                0,
                UI.classes.preview
            );
        } else {
            this.firstLabel = new LabelModel(
                convertRadiansToDegrees(Math.PI - this.radians).toFixed(1) + 'º',
                this.point.position.x + Math.cos(radians) * DIMENSIONS.previewAngle.labelRadius - DIMENSIONS.previewAngle.labelExcess.x,
                this.point.position.y + Math.sin(radians) * DIMENSIONS.previewAngle.labelRadius - DIMENSIONS.previewAngle.labelExcess.y,
                0,
                UI.classes.preview
            );
            this.secondLabel = new LabelModel(
                convertRadiansToDegrees(Math.PI - this.radians).toFixed(1) + 'º',
                this.point.position.x - Math.cos(radians) * DIMENSIONS.previewAngle.labelRadius + DIMENSIONS.previewAngle.labelExcess.x,
                this.point.position.y - Math.sin(radians) * DIMENSIONS.previewAngle.labelRadius + DIMENSIONS.previewAngle.labelExcess.y,
                0,
                UI.classes.preview
            );
        }

        this.group = new Group();
        this.group.add(this.firstCurve, this.secondCurve, this.firstLabel.object, this.secondLabel.object);
    }

    removeLabels(): void {
        this.firstLabel.removeLabels();
        this.secondLabel.removeLabels();
    }
}
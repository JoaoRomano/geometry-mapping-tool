import { BufferGeometry, Group, Line, LineBasicMaterial, Vector2, Vector3 } from "three";
import { COLORS } from "../../config";

export class LinePreviewModel {
    position1: Vector2;
    position2: Vector2;
    line: Line;
    group: Group;

    constructor(position1: Vector2, position2: Vector2) {      
        this.position1 = position1;
        this.position2 = position2;  
        const points = [];
        points.push(new Vector3(position1.x, position1.y, 0), new Vector3(position2.x, position2.y, 0));
        const lineGeometry = new BufferGeometry().setFromPoints(points);
        const lineMaterial = new LineBasicMaterial({ color: COLORS.previewColor, opacity: COLORS.previewOpacity });
        this.line = new Line(lineGeometry, lineMaterial);

        this.group = new Group();
        this.group.add(this.line);
    }

    getVector(): Vector2 {
        return new Vector2(this.position2.x - this.position1.x, this.position2.y - this.position1.y);
    }
}
import { Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { UI } from "../config";

const LABEL_SEPARATOR = ' = ';

export class LabelModel {
    labels: string[];
    position: Vector3;
    className: string;
    object: CSS2DObject;

    constructor(text: string, x: number, y: number, z: number, className?: string) {
        this.labels = [];
        this.labels.push(text);
        this.position = new Vector3(x, y, z);
        this.className = className ? className : UI.classes.label;

        const labelDiv = document.createElement('div');
        labelDiv.className = className ? className : UI.classes.label;
        labelDiv.textContent = this.labels.join(LABEL_SEPARATOR);
        this.object = new CSS2DObject(labelDiv);
        this.object.position.set(this.position.x, this.position.y, this.position.z);
    }

    setLabels(labels: string[]) {
        this.labels = labels;
        this.object.element.innerText = this.labels.join(LABEL_SEPARATOR);
    }

    setPosition(position: Vector3):void {
        this.position = position;
        this.object.position.set(this.position.x, this.position.y, this.position.z);
    }

    setColorDefault(): void {
        this.object.element.style.color = '#000000';
    }

    setColor(color: string): void {
        this.object.element.style.color = color;
    }

    addLabel(label: string):void {
        this.labels.push(label);
        this.object.element.innerText = this.labels.join(LABEL_SEPARATOR);
    }

    removeLabel(label: string) {
        this.labels.splice(this.labels.indexOf(label), 1);
        this.object.element.innerText = this.labels.join(LABEL_SEPARATOR);
    }
    
    removeLabels():void {
        this.object.element.remove();
    }
}
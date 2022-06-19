import { Geometry3DScene } from "../scenes/Geometry3DScene";
import { GeometryMongeScene } from "../scenes/GeometryMongeScene";
import { GeometryMongeAuxillaryLineTool } from "./GeometryMongeAuxillaryLineTool";
import { GeometryMongeDeleteTool } from "./GeometryMongeDeleteTool";
import { GeometryMongeLineTool } from "./GeometryMongeLineTool";
import { GeometryMongePlaneTool } from "./GeometryMongePlaneTool";
import { GeometryMongePointTool } from "./GeometryMongePointTool";
import { Tool } from "./Tool";

interface ITools {
    pointTool: GeometryMongePointTool,
    lineTool: GeometryMongeLineTool,
    planeTool: GeometryMongePlaneTool,
    auxillaryLineTool: GeometryMongeAuxillaryLineTool,
    deleteTool: GeometryMongeDeleteTool,
}

export class ToolBox {
    tools: ITools;
    activeTool: Tool | null;
    toolboxElement: HTMLElement | null;

    constructor(sceneMonge: GeometryMongeScene, scene3D: Geometry3DScene) {
        this.tools = {
            pointTool: new GeometryMongePointTool(sceneMonge, scene3D),
            lineTool: new GeometryMongeLineTool(sceneMonge, scene3D),
            planeTool: new GeometryMongePlaneTool(sceneMonge, scene3D),
            auxillaryLineTool: new GeometryMongeAuxillaryLineTool(sceneMonge, scene3D),
            deleteTool: new GeometryMongeDeleteTool(sceneMonge, scene3D),
        };
        this.activeTool = null;
        this.toolboxElement = document.getElementById("geometryMongeToolbox");
        this.setControls();
    }

    selectTool(key: string):void {
        switch (key) {
            case 'h':                
                this.tools.pointTool.setType('horizontal');
                this.setTool(this.tools.pointTool);
                break;
            case 'f':                
                this.tools.pointTool.setType('frontal');
                this.setTool(this.tools.pointTool);
                break;
            case 'l':
                this.tools.lineTool.setType('horizontal');
                this.setTool(this.tools.lineTool);
                break;
            case 'k':
                this.tools.lineTool.setType('frontal');
                this.setTool(this.tools.lineTool);
                break;
            case 'p':
                this.tools.planeTool.setType('horizontal');
                this.setTool(this.tools.planeTool);
                break;
            case 'o':
                this.tools.planeTool.setType('frontal');
                this.setTool(this.tools.planeTool);
                break;
            case 'u':
                this.tools.auxillaryLineTool.setMode('parallel');
                this.setTool(this.tools.auxillaryLineTool);
                break;
            case 'i':
                this.tools.auxillaryLineTool.setMode('perpendicular');
                this.setTool(this.tools.auxillaryLineTool);
                break;
            case 'd':
                this.setTool(this.tools.deleteTool);
                break;
            default:
                break;
        }
    }

    setTool(tool: Tool):void {
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        this.activeTool = tool;
        if (!tool.activate()) {
            this.activeTool = null;
        };
    }

    setControls(): void {
        this.setToolboxControls();
        this.setToolSelectControls();
    }

    setToolboxControls(): void {
        let pointToolElement = document.getElementById("pointTool");
            if (pointToolElement) {
                pointToolElement.addEventListener("mouseover", () => {
                    if (pointToolElement) {
                        pointToolElement.style.overflow = 'unset';
                    }
                });
                pointToolElement.addEventListener("mouseout", () => {
                    if (pointToolElement) {
                        pointToolElement.style.overflow = 'hidden';
                    }
                })
            }
            let lineToolElement = document.getElementById("lineTool");
            if (lineToolElement) {
                lineToolElement.addEventListener("mouseover", () => {
                    if (lineToolElement) {
                        lineToolElement.style.overflow = 'unset';
                    }
                });
                lineToolElement.addEventListener("mouseout", () => {
                    if (lineToolElement) {
                        lineToolElement.style.overflow = 'hidden';
                    }
                })
            }
            let planeToolElement = document.getElementById("planeTool");
            if (planeToolElement) {
                planeToolElement.addEventListener("mouseover", () => {
                    if (planeToolElement) {
                        planeToolElement.style.overflow = 'unset';
                    }
                });
                planeToolElement.addEventListener("mouseout", () => {
                    if (planeToolElement) {
                        planeToolElement.style.overflow = 'hidden';
                    }
                });
            }
            let auxillaryLineToolElement = document.getElementById("auxillaryLineTool");
            if (auxillaryLineToolElement) {
                auxillaryLineToolElement.addEventListener("mouseover", () => {
                    if (auxillaryLineToolElement) {
                        auxillaryLineToolElement.style.overflow = 'unset';
                    }
                });
                auxillaryLineToolElement.addEventListener("mouseout", () => {
                    if (auxillaryLineToolElement) {
                        auxillaryLineToolElement.style.overflow = 'hidden';
                    }
                });
            }
    }

    setToolSelectControls(): void {
        let horizontalPointToolElement = document.getElementById("horizontalPointTool");
        if (horizontalPointToolElement) {
            horizontalPointToolElement.addEventListener("click", () => {
                this.tools.pointTool.setType('horizontal');
                this.setTool(this.tools.pointTool);
            }) 
        }
        let frontalPointToolElement = document.getElementById("frontalPointTool");
        if (frontalPointToolElement) {
            frontalPointToolElement.addEventListener("click", () => {
                this.tools.pointTool.setType('frontal');
                this.setTool(this.tools.pointTool);
            }) 
        }
        let horizontalLineToolElement = document.getElementById("horizontalLineTool");
        if (horizontalLineToolElement) {
            horizontalLineToolElement.addEventListener("click", () => {
                this.tools.lineTool.setType('horizontal');
                this.setTool(this.tools.lineTool);
            }) 
        }
        let frontalLineToolElement = document.getElementById("frontalLineTool");
        if (frontalLineToolElement) {
            frontalLineToolElement.addEventListener("click", () => {
                this.tools.lineTool.setType('frontal');
                this.setTool(this.tools.lineTool);
            }) 
        }
        let horizontalPlaneToolElement = document.getElementById("horizontalPlaneTool");
        if (horizontalPlaneToolElement) {
            horizontalPlaneToolElement.addEventListener("click", () => {
                this.tools.planeTool.setType('horizontal');
                this.setTool(this.tools.planeTool);
            }) 
        }
        let frontalPlaneToolElement = document.getElementById("frontalPlaneTool");
        if (frontalPlaneToolElement) {
            frontalPlaneToolElement.addEventListener("click", () => {
                this.tools.planeTool.setType('frontal');
                this.setTool(this.tools.planeTool);
            }) 
        }
        let parallelLineToolElement = document.getElementById("parallelLineTool");
        if (parallelLineToolElement) {
            parallelLineToolElement.addEventListener("click", () => {
                this.tools.auxillaryLineTool.setMode('parallel');
                this.setTool(this.tools.auxillaryLineTool);
            }) 
        }
        let perpendicularLineToolElement = document.getElementById("perpendicularLineTool");
        if (perpendicularLineToolElement) {
            perpendicularLineToolElement.addEventListener("click", () => {
                this.tools.auxillaryLineTool.setMode('perpendicular');
                this.setTool(this.tools.auxillaryLineTool);
            }) 
        }
        let deleteToolElement = document.getElementById("deleteTool");
        if (deleteToolElement) {
            deleteToolElement.addEventListener("click", () => {
                this.setTool(this.tools.deleteTool);
            }) 
        }
    }
}
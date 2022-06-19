import Stats from "three/examples/jsm/libs/stats.module";
import { Geometry3DRenderer } from "./renderers/Geometry3DRenderer";
import { GeometryMongeRenderer } from "./renderers/GeometryMongeRenderer";

const stats = Stats()
document.body.appendChild(stats.dom)

let geometry3DRenderer = Geometry3DRenderer.getInstance();
let geometryMongeRenderer = GeometryMongeRenderer.getInstance();

function animate():void {
    requestAnimationFrame(animate);
    if (geometry3DRenderer != null) {
        geometry3DRenderer.update();
    }
    if (geometryMongeRenderer != null) {
        geometryMongeRenderer.update();
    }

    stats.update();
}

animate();

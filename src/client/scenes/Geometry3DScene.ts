import { AxesHelper, Color, DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Scene, Vector3 } from "three";
import { COLORS, DIMENSIONS } from "../config";
import { IGeometryScene } from "./IGeometryScene";

export class Geometry3DScene implements IGeometryScene {
    scale: number;
    scene: Scene;

    constructor(scale: number, color: Color) {
        this.scale = scale;
        this.scene = new Scene();
        this.scene.background = color;

        this.baseObjects();
    }

    baseObjects():void {
        const plane_geometry = new PlaneGeometry(DIMENSIONS.scene3D.planeWidth, DIMENSIONS.scene3D.planeHeight);
        const x_plane_material = new MeshBasicMaterial( { color: COLORS.plane3DX, side: DoubleSide, transparent: true, opacity: 0.7 } );
        const y_plane_material = new MeshBasicMaterial( { color: COLORS.plane3DY, side: DoubleSide, transparent: true, opacity: 0.7 } );

        const x_plane = new Mesh(plane_geometry, x_plane_material);
        const y_plane = new Mesh(plane_geometry, y_plane_material);

        x_plane.rotateOnAxis( new Vector3(0, 1, 0), Math.PI / 2 );
        y_plane.rotateOnAxis( new Vector3(1, 0, 0), Math.PI / 2 );

        this.scene.add(x_plane);
        this.scene.add(y_plane);

        /* 
        An axis object to visualize the 3 axes in a simple way.
        The X axis is red. The Y axis is green. The Z axis is blue.
        X axis = afastamento
        Y axis = cota
        Z axis = abcissa
        */
        const axesHelper = new AxesHelper(this.scale);
        this.scene.add(axesHelper);
    }

    injectObjects():void {
    }

    addObject(object: Object3D):void {
        this.scene.add(object);
    }

    removeObject(object: Object3D):void {
        this.scene.remove(object);
    }
}
export const UI = {
    classes: {
        elementMonge: 'geometryMonge',
        element3D: 'geometry3D',
        label: 'label',
        preview: 'point-tool',
        projection3D: 'label-projection-3d',
    },
}

export const DIMENSIONS = {
    scene3D: {
        planeWidth: 20,
        planeHeight: 20,
    },
    sceneMonge: {
        pi0Height: 0.5,
    },
    renderer3D: {
        fov: 75,
        far: 1000,
        near: 0.1,
        scale: 20,
    },
    rendererMonge: {
        far: 1000,
        near: 0,
        viewSize: 10,
        viewSizeExcess: {
            x: 1,
            y: 1,
        },
    },
    lineProjection: {
        labelExcess: {
            x: 0.5,
            y: 0.5,
        },
    },
    point3D: {
        labelExcess: {
            x: 0.5,
            y: 0.5,
            z: 0.5,
        },
        dashSize: 0.3,
        gapSize: 0.1,
        radius: 0.1,
        widthSegments: 32,
        heightSegments: 16,
    },
    projectionPoint3D: {
        cylinderProjectionHeight: 0.1,
        dashSize: 0.3,
        gapSize: 0.1,
        radius: 0.1,
        labelExcess: {
            x: 0.5,
            y: 0.5,
        },
        widthSegments: 32,
    },
    projectionPointMonge: {
        radius: 0.1,
        labelExcess: {
            x: 0.4,
            y: 0.4,
        },
        widthSegments: 32,
    },
    previewPoint: {
        circleSegments: 32,
        radius: 0.1,
        labelExcess: {
            x: 1,
            y: 0.5,
        },
    },
    previewAngle: {
        curveRadius: 2,
        curvePoints: 50,
        labelRadius: 3,
        labelExcess: {
            x: 0.5,
            y: 0.5,
        },
    }
}

export const COLORS = {
    background3D: 0xaaaaaa,
    backgroundMonge: 0xffffff,
    plane3DX: 0x00ffff,
    plane3DY: 0xff00ff,
    plane3DZ: 0xffff00,
    pointColor: 0x000000, // black
    projection3DColor: 0x000000,
    lineColor: 0x000000, // black
    previewColor: 0xA9A9A9, // gray
    previewOpacity: 0.5,
}

type greekLettersOptions = {
    [key: string]: string
}

export const GREEK_LETTERS: greekLettersOptions = {
    alpha: '%CE%B1',
    beta: '%CE%B2',
    gamma: '%CE%B3',
    delta: '%CE%B4',
    epsilon: '%CE%B5',
    zeta: '%CE%B6',
    eta: '%CE%B7',
    theta: '%CE%B8',
    thetasym: '%CF%91',
    iota: '%CE%B9',
    kappa: '%CE%BA',
    lambda: '%CE%BB',
    mu: '%CE%BC',
    nu: '%CE%BD',
    xi: '%CE%BE',
    omicron: '%CE%BF',
    pi: '%CF%80',
    piv: '%CF%96',
    rho: '%CF%81',
    sigmaf: '%CF%82',
    sigma: '%CF%83',
    tau: '%CF%84',
    upsilon: '%CF%85',
    phi: '%CF%86',
    chi: '%CF%87',
    psi: '%CF%88',
    omega: '%CF%89',
}

export const GREEK_LETTERS_REGEX = `(${Object.keys(GREEK_LETTERS).join('|')})`;
export const GREEK_LETTERS_VALUES_REGEX = `(${Object.values(GREEK_LETTERS).map((value) => decodeURI(value)).join('|')})`;
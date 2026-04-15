import * as BABYLON from "@babylonjs/core";

function createTextTexture({
    text,
    width = 128,
    height = 128,
    font = "Bold 40px Arial",
    fillStyle = "#ffffff",
    scene,
    textureName,
}) {
    const texture = new BABYLON.DynamicTexture(
        textureName,
        { width, height },
        scene,
        true,
    );

    const ctx = texture.getContext();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = font;
    ctx.fillStyle = fillStyle;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
    texture.update();

    return texture;
}

function createLabelMaterial(name, texture, color, scene) {
    const material = new BABYLON.StandardMaterial(name, scene);
    material.diffuseTexture = texture;
    material.emissiveColor = color ?? new BABYLON.Color3(1, 1, 1);
    material.specularColor = new BABYLON.Color3(0, 0, 0);
    material.backFaceCulling = false;
    return material;
}

export function createSimpleAxisLabel(text, color, scene) {
    try {
        const fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;

        const texture = createTextTexture({
            text,
            width: 128,
            height: 128,
            font: "Bold 40px Arial",
            fillStyle,
            scene,
            textureName: `label_${text}`,
        });

        const material = createLabelMaterial(`labelMat_${text}`, texture, color, scene);

        const plane = BABYLON.MeshBuilder.CreatePlane(
            `labelPlane_${text}`,
            { width: 0.7, height: 0.7 },
            scene,
        );

        plane.material = material;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return plane;
    } catch (error) {
        console.warn(`Error creando etiqueta simple ${text}:`, error);
        return null;
    }
}

export function createAxisLabel3D(text, color, scene) {
    try {
        const fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;

        const texture = createTextTexture({
            text,
            width: 256,
            height: 256,
            font: "Bold 48px Arial",
            fillStyle,
            scene,
            textureName: `labelTex_${text}`,
        });

        const material = createLabelMaterial(`labelMat_${text}`, texture, color, scene);

        const plane = BABYLON.MeshBuilder.CreatePlane(
            `label3D_${text}`,
            { width: 0.6, height: 0.6 },
            scene,
        );

        plane.material = material;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return plane;
    } catch (error) {
        console.warn(`Error creando etiqueta 3D ${text}:`, error);
        return null;
    }
}

export function createNumberLabel(text, x, y, z, scene) {
    try {
        const texture = createTextTexture({
            text,
            width: 128,
            height: 128,
            font: "bold 32px Arial",
            fillStyle: "#cccccc",
            scene,
            textureName: `numTex_${text}_${x}_${y}_${z}`,
        });

        const material = createLabelMaterial(
            `numMat_${text}_${x}_${y}_${z}`,
            texture,
            new BABYLON.Color3(1, 1, 1),
            scene,
        );

        const plane = BABYLON.MeshBuilder.CreatePlane(
            `num_${text}_${x}_${y}_${z}`,
            { width: 0.35, height: 0.35 },
            scene,
        );

        plane.material = material;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        plane.position = new BABYLON.Vector3(x, y, z);

        return plane;
    } catch (error) {
        console.warn(`Error creando número ${text}:`, error);
        return null;
    }
}

export function createTextPlane(text, position, scene) {
    try {
        const texture = new BABYLON.DynamicTexture(
            `textTexture_${text}`,
            { width: 128, height: 64 },
            scene,
            true,
        );

        texture.drawText(text, 10, 38, "bold 18px Arial", "white", "transparent", true);

        const material = new BABYLON.StandardMaterial(`textMat_${text}`, scene);
        material.diffuseTexture = texture;
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        material.backFaceCulling = false;

        const plane = BABYLON.MeshBuilder.CreatePlane(
            `textPlane_${text}`,
            { width: 0.8, height: 0.4 },
            scene,
        );

        plane.material = material;
        plane.position = new BABYLON.Vector3(
            position.x,
            position.y + 0.3,
            (position.z || 0) + 0.2,
        );
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return plane;
    } catch (error) {
        console.warn(`Error creando texto ${text}:`, error);
        return null;
    }
}

export function createETABSAxes(scene) {
    if (!scene) return [];

    try {
        const created = [];

        const xColor = new BABYLON.Color3(0.9, 0.3, 0.3);
        const yColor = new BABYLON.Color3(0.3, 0.3, 0.9);
        const zColor = new BABYLON.Color3(0.3, 0.9, 0.3);

        const xAxis = BABYLON.MeshBuilder.CreateLines(
            "xAxis",
            { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(12, 0, 0)] },
            scene,
        );
        const xMat = new BABYLON.StandardMaterial("xMat", scene);
        xMat.diffuseColor = xColor;
        xMat.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
        xAxis.material = xMat;
        created.push(xAxis);

        const zAxis = BABYLON.MeshBuilder.CreateLines(
            "zAxis",
            { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 12, 0)] },
            scene,
        );
        const zMat = new BABYLON.StandardMaterial("zMat", scene);
        zMat.diffuseColor = zColor;
        zMat.emissiveColor = new BABYLON.Color3(0, 0.2, 0);
        zAxis.material = zMat;
        created.push(zAxis);

        const yAxis = BABYLON.MeshBuilder.CreateLines(
            "yAxis",
            { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 12)] },
            scene,
        );
        const yMat = new BABYLON.StandardMaterial("yMat", scene);
        yMat.diffuseColor = yColor;
        yMat.emissiveColor = new BABYLON.Color3(0, 0, 0.2);
        yAxis.material = yMat;
        created.push(yAxis);

        return created;
    } catch (error) {
        console.warn("Error creando ejes ETABS:", error);
        return [];
    }
}

export function createAxisWithNumbers(scene, name, color, x, y, z) {
    try {
        const created = [];

        const start = new BABYLON.Vector3(x, y, z);
        const end = new BABYLON.Vector3(
            x + (name === "X" ? 8 : 0),
            y + (name === "Y" ? 8 : 0),
            z + (name === "Z" ? 8 : 0),
        );

        const axis = BABYLON.MeshBuilder.CreateLines(
            `${name}Axis`,
            { points: [start, end] },
            scene,
        );

        const mat = new BABYLON.StandardMaterial(`${name}Mat`, scene);
        mat.diffuseColor = color;
        mat.emissiveColor = color.scale(0.3);
        axis.material = mat;
        created.push(axis);

        const arrow = BABYLON.MeshBuilder.CreateCylinder(
            `${name}Arrow`,
            {
                height: 0.35,
                diameterTop: 0,
                diameterBottom: 0.15,
                tessellation: 8,
            },
            scene,
        );

        if (name === "X") {
            arrow.position = new BABYLON.Vector3(7.85, 0, 0);
            arrow.rotation.z = Math.PI / 2;
        } else if (name === "Y") {
            arrow.position = new BABYLON.Vector3(0, 7.85, 0);
        } else {
            arrow.position = new BABYLON.Vector3(0, 0, 7.85);
            arrow.rotation.x = Math.PI / 2;
        }

        arrow.material = mat;
        created.push(arrow);

        const textPlane = createAxisLabel3D(name, color, scene);
        if (textPlane) {
            if (name === "X") textPlane.position = new BABYLON.Vector3(9, -0.5, 0);
            else if (name === "Y") textPlane.position = new BABYLON.Vector3(0, 9, -0.5);
            else textPlane.position = new BABYLON.Vector3(0, -0.5, 9);

            created.push(textPlane);
        }

        for (let i = 1; i <= 7; i++) {
            let posX = 0;
            let posY = 0;
            let posZ = 0;

            if (name === "X") {
                posX = i;
                posY = -0.4;
            } else if (name === "Y") {
                posX = -0.4;
                posY = i;
            } else {
                posZ = i;
                posY = -0.4;
            }

            const label = createNumberLabel(`${i}`, posX, posY, posZ, scene);
            if (label) created.push(label);
        }

        return created;
    } catch (error) {
        console.warn(`Error creando eje ${name} con numeración:`, error);
        return [];
    }
}
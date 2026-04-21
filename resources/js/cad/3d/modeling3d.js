// js/cad/3d/modeling3d.js
import { Beam, Node as StructuralNode } from "../shapes.js";

function getSelectedNodes(cadSystem) {
    return cadSystem.selectedNodesState?.selectedObjects?.length
        ? cadSystem.selectedNodesState.selectedObjects
        : [];
}

function getNodesToModify(cadSystem) {
    const selected = getSelectedNodes(cadSystem);
    if (selected.length > 0) return selected;
    return cadSystem.nodes ?? [];
}

function renumberModel(cadSystem) {
    cadSystem.nodes.forEach((node, index) => { node.id = index + 1; });
    cadSystem.shapes.forEach((beam, index) => { beam.id = index + 1; });
}

export function activate3DDrawingMode(cadSystem) {
    cadSystem.setState(cadSystem.trussDrawingState3D);
    
    const simple3DState = {
        currentPlane: "XY",
        handleMouseDown: (event, stateContext, mouse) => {
            event.preventDefault();
            const worldPos = stateContext.grid.screenToWorld(mouse);
            let x = worldPos.x, y = worldPos.y, z = 0;
            
            if (cadSystem.simple3DPlane === "XZ") {
                x = worldPos.x; z = worldPos.y; y = 0;
            } else if (cadSystem.simple3DPlane === "YZ") {
                y = worldPos.x; z = worldPos.y; x = 0;
            }
            
            let node = stateContext.closestNode(mouse);
            if (!node) {
                node = new StructuralNode({ x, y }, stateContext.nodes.length + 1, z);
                stateContext.nodes.push(node);
            }
            
            if (!cadSystem.tempBeam) {
                cadSystem.tempBeam = new Beam(stateContext.globalE, stateContext.globalA);
            }
            
            const done = cadSystem.tempBeam.addNode(node);
            if (done) {
                stateContext.shapes.push(cadSystem.tempBeam);
                cadSystem.tempBeam.id = stateContext.shapes.length;
                cadSystem.tempBeam = new Beam(stateContext.globalE, stateContext.globalA);
                cadSystem.tempBeam.addNode(node);
            }
            stateContext.sync3D();
        },
        handleKeyDown: (event) => {
            if (event.key === "1") cadSystem.simple3DPlane = "XY";
            if (event.key === "2") cadSystem.simple3DPlane = "XZ";
            if (event.key === "3") cadSystem.simple3DPlane = "YZ";
        },
        handleMouseMove: () => {},
        handleMouseUp: () => {},
        handleMouseWheel: () => {},
        draw: () => {},
    };
    
    cadSystem.simple3DPlane = "XY";
    cadSystem.tempBeam = null;
    cadSystem.currentState = simple3DState;
    
    if (!cadSystem.show3DView) {
        cadSystem.toggleView3D();
    }
}

export function elevateSelectedNodes(cadSystem, step = 1) {
    const nodes = getNodesToModify(cadSystem);
    if (!nodes.length) {
        cadSystem.showMessage?.("⚠️ No hay nodos para elevar", "warning");
        return;
    }
    nodes.forEach((node) => { node.position.z = (node.position.z || 0) + step; });
    const selected = getSelectedNodes(cadSystem);
    const message = selected.length > 0
        ? `⬆️ ${selected.length} nodos elevados +${step}m`
        : `⬆️ Todos los nodos elevados +${step}m`;
    cadSystem.showMessage?.(message);
    cadSystem.sync3D();
}

export function lowerSelectedNodes(cadSystem, step = 1) {
    const nodes = getNodesToModify(cadSystem);
    if (!nodes.length) {
        cadSystem.showMessage?.("⚠️ No hay nodos para bajar", "warning");
        return;
    }
    nodes.forEach((node) => { node.position.z = Math.max(0, (node.position.z || 0) - step); });
    const selected = getSelectedNodes(cadSystem);
    const message = selected.length > 0
        ? `⬇️ ${selected.length} nodos bajados -${step}m`
        : `⬇️ Todos los nodos bajados -${step}m`;
    cadSystem.showMessage?.(message);
    cadSystem.sync3D();
}

export function extrudeToNewFloor(cadSystem, floorHeight = 3) {
    if (!cadSystem.nodes?.length) {
        cadSystem.showMessage?.("⚠️ No hay estructura para extruir", "warning");
        return;
    }
    
    const baseNodes = [...cadSystem.nodes];
    const currentMaxZ = Math.max(...baseNodes.map((n) => n.position.z || 0));
    const newZ = currentMaxZ + floorHeight;
    const topLevelNodes = baseNodes.filter((n) => (n.position.z || 0) === currentMaxZ);
    const nodeMap = new Map();
    const newNodes = [];
    
    topLevelNodes.forEach((node) => {
        const newNode = new StructuralNode(
            { x: node.position.x, y: node.position.y },
            cadSystem.nodes.length + newNodes.length + 1,
            newZ
        );
        cadSystem.nodes.push(newNode);
        newNodes.push(newNode);
        nodeMap.set(node.id, newNode);
    });
    
    topLevelNodes.forEach((originalNode) => {
        const newNode = nodeMap.get(originalNode.id);
        if (!newNode) return;
        const column = new Beam(cadSystem.globalE, cadSystem.globalA);
        column.addNode(originalNode);
        column.addNode(newNode);
        cadSystem.shapes.push(column);
    });
    
    const topLevelBeams = cadSystem.shapes.filter(
        (beam) => beam.node1 && beam.node2 &&
            (beam.node1.position.z || 0) === currentMaxZ &&
            (beam.node2.position.z || 0) === currentMaxZ
    );
    
    topLevelBeams.forEach((beam) => {
        const newNode1 = nodeMap.get(beam.node1.id);
        const newNode2 = nodeMap.get(beam.node2.id);
        if (!newNode1 || !newNode2) return;
        const newBeam = new Beam(cadSystem.globalE, cadSystem.globalA);
        newBeam.addNode(newNode1);
        newBeam.addNode(newNode2);
        cadSystem.shapes.push(newBeam);
    });
    
    renumberModel(cadSystem);
    cadSystem.sync3D();
    cadSystem.showMessage?.(`🏗️ Nuevo piso creado a ${newZ}m de altura`);
}

export function extrudeTo3D(cadSystem, floorHeight = 3, numFloors = 1) {
    if (!cadSystem.nodes?.length) {
        cadSystem.showMessage?.("⚠️ No hay nodos para extruir", "warning");
        return;
    }
    
    const groundNodes = cadSystem.nodes.filter((node) => (node.position.z || 0) === 0);
    if (!groundNodes.length) {
        cadSystem.showMessage?.("⚠️ No hay nodos en planta baja", "warning");
        return;
    }
    
    for (let floor = 1; floor <= numFloors; floor++) {
        const z = floor * floorHeight;
        const floorNodes = groundNodes.map((node) => {
            const newNode = new StructuralNode(
                { x: node.position.x, y: node.position.y },
                cadSystem.nodes.length + 1,
                z
            );
            cadSystem.nodes.push(newNode);
            return newNode;
        });
        
        groundNodes.forEach((node, idx) => {
            const column = new Beam(cadSystem.globalE, cadSystem.globalA);
            column.addNode(node);
            column.addNode(floorNodes[idx]);
            cadSystem.shapes.push(column);
        });
    }
    
    renumberModel(cadSystem);
    cadSystem.sync3D();
    cadSystem.showMessage?.(`✅ ${numFloors} piso(s) agregados correctamente`);
}

export function selectAllNodes(cadSystem) {
    cadSystem.setState(cadSystem.selectedNodesState, { selectedNodes: [...cadSystem.nodes] });
    cadSystem.showMessage?.(`✅ ${cadSystem.nodes.length} nodos seleccionados`);
}

export function selectNodesByHeight(cadSystem, minZ, maxZ) {
    const selected = cadSystem.nodes.filter((node) => {
        const z = node.position.z || 0;
        return z >= minZ && z <= maxZ;
    });
    cadSystem.setState(cadSystem.selectedNodesState, { selectedNodes: selected });
    cadSystem.showMessage?.(`✅ ${selected.length} nodos seleccionados (altura ${minZ}-${maxZ}m)`);
}

export function createTestFrame(scene) {
    // ... mantén tu implementación existente ...
    console.log("createTestFrame - implementar");
}

export function showTestFrame(cadSystem) {
    // ... mantén tu implementación existente ...
    console.log("showTestFrame - implementar");
}
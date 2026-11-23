export function overlayFrame(host, plane) {
    const left = Math.max(host.left, plane.left), top = Math.max(host.top, plane.top);
    const right = Math.min(host.right, plane.right), bottom = Math.min(host.bottom, plane.bottom);
    return {left:left-host.left,top:top-host.top,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
}

export function fitViewport(points, width, height) {
    const valid = points.filter(point=>Number.isFinite(Number(point.x))&&Number.isFinite(Number(point.y)));
    if (!valid.length || width<=0 || height<=0) return null;
    const xs=valid.map(p=>Number(p.x)),ys=valid.map(p=>Number(p.y));
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    return {centerX:(minX+maxX)/2,centerY:(minY+maxY)/2,scale:Math.min(width/Math.max(maxX-minX,1),height/Math.max(maxY-minY,1))*.75};
}

export function isCanvasPoint(point, width, height) {
    return point.x>=0&&point.y>=0&&point.x<=width&&point.y<=height;
}

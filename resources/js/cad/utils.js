export function mousePositionFrom(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const style = getComputedStyle(canvas);

  // Adjust for the CSS padding and border of the canvas
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingTop = parseFloat(style.paddingTop);
  const borderLeft = parseFloat(style.borderLeftWidth);
  const borderTop = parseFloat(style.borderTopWidth);

  // Calculate the mouse position
  const x = event.clientX - rect.left - paddingLeft - borderLeft;
  const y = event.clientY - rect.top - paddingTop - borderTop;

  return {
    x: (x / (rect.width - paddingLeft - borderLeft * 2)) * canvas.width,
    y: (y / (rect.height - paddingTop - borderTop * 2)) * canvas.height,
  };
}

export const MOUSE_BUTTONS = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
};

export function isMouseButton(event, button) {
  return event.button === button;
}

//---------------------------------
// Distance to line segment.
// Adapted from http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
export function sqr(x) {
  return x * x;
}
export function pointDistanceSquared(v, w) {
  return sqr(v.x - w.x) + sqr(v.y - w.y);
}
export function pointDistance(v, w) {
  return Math.sqrt(sqr(v.x - w.x) + sqr(v.y - w.y));
}
export function distanceToSegmentSquared(p, v, w) {
  var l2 = pointDistanceSquared(v, w);
  if (l2 === 0) return pointDistanceSquared(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return pointDistanceSquared(p, v);
  if (t > 1) return pointDistanceSquared(p, w);
  return pointDistanceSquared(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}
export function distanceToSegment(p, v, w) {
  return Math.sqrt(distanceToSegmentSquared(p, v, w));
}
//---------------------------------
export function formatCoordinate(coordinate) {
  // Return shortest possible string representation, up to 2 digits of precision
  //   9.00  -> "9"
  //   9.10  -> "9.1"
  //   9.12  -> "9.12"
  //   9.123 -> "9.12"
  return Number(coordinate.toFixed(2)).toString();
}
export function removeFromArray(array, element) {
  const index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

function countDecimalZeros(num) {
  const decimalPart = num.toString().split(".")[1] || ""; // Get decimal part or empty string
  const trimmed = decimalPart.replace(/0+$/, ""); // Remove trailing zeros
  return trimmed.length - trimmed.replace(/^0+/, "").length;
}

export function axisToFixed(axis) {
  const numZeros = countDecimalZeros(axis);
  const toFixed = numZeros + 4 > 100 ? 100 : numZeros + 4;
  return axis.toFixed(toFixed);
}

export function midPoint(p1, p2) {
  return { x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5 };
}

export function unitVector(p1, p2) {
  return {
    x: (p1.x - p2.x) / pointDistance(p2, p1),
    y: (p1.y - p2.y) / pointDistance(p2, p1),
  };
}

export function pointDistanceToSegment(p, a, b) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLen2 = abx * abx + aby * aby;
  if (abLen2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);

  let t = (apx * abx + apy * aby) / abLen2;
  t = Math.max(0, Math.min(1, t));

  const cx = a.x + t * abx;
  const cy = a.y + t * aby;

  return Math.hypot(p.x - cx, p.y - cy);
}

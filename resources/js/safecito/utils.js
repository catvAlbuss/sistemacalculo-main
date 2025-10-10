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

export function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const style = getComputedStyle(canvas);

  // Adjust for the CSS padding and border of the canvas
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingTop = parseFloat(style.paddingTop);
  const borderLeft = parseFloat(style.borderLeftWidth);
  const borderTop = parseFloat(style.borderTopWidth);

  // Calculate the mouse position
  const x = evt.clientX - rect.left - paddingLeft - borderLeft;
  const y = evt.clientY - rect.top - paddingTop - borderTop;

  return {
    x: (x / (rect.width - paddingLeft - borderLeft * 2)) * canvas.width,
    y: (y / (rect.height - paddingTop - borderTop * 2)) * canvas.height,
  };
}

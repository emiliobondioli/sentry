export function isNullOrUndef(value) {
  return value === null || typeof value === "undefined";
}
export function isArray(value) {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.substr(0, 7) === "[object" && type.substr(-6) === "Array]") {
    return true;
  }
  return false;
}
export function isObject(value) {
  return (
    value !== null &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}
export function valueOrDefault(value, defaultValue) {
  return typeof value === "undefined" ? defaultValue : value;
}
export function clone(source) {
  if (isArray(source)) {
    return source.map(clone);
  }
  if (isObject(source)) {
    const target = Object.create(null);
    const keys = Object.keys(source);
    const klen = keys.length;
    let k = 0;
    for (; k < klen; ++k) {
      target[keys[k]] = clone(source[keys[k]]);
    }
    return target;
  }
  return source;
}
export function isValidKey(key) {
  return ["__proto__", "prototype", "constructor"].indexOf(key) === -1;
}
export function _merger(key, target, source, options) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    merge(tval, sval, options);
  } else {
    target[key] = clone(sval);
  }
}
export function merge(target, source, options) {
  const sources = isArray(source) ? source : [source];
  const ilen = sources.length;
  if (!isObject(target)) {
    return target;
  }
  options = options || {};
  const merger = options.merger || _merger;
  for (let i = 0; i < ilen; ++i) {
    source = sources[i];
    if (!isObject(source)) {
      continue;
    }
    const keys = Object.keys(source);
    for (let k = 0, klen = keys.length; k < klen; ++k) {
      merger(keys[k], target, source, options);
    }
  }
  return target;
}
export function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}
export function unclipArea(ctx) {
  ctx.restore();
}

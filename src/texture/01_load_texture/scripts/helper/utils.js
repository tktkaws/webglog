const utils = {
  lerp,
};

// 線形補間
function lerp(a, b, n) {
  let current = (1 - n) * a + n * b;
  if (Math.abs(b - current) < 0.001) current = b;
  return current;
}

export { utils };

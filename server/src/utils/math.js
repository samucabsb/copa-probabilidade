export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

export function poisson(k, lambda) {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

export function toPercent(value) {
  return Number((value * 100).toFixed(2));
}

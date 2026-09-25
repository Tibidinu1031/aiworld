// Least-squares polynomial fitting with a Legendre basis (stable up to degree ~12).
function legendre(x, n) {
  const p = [1, x];
  for (let k = 2; k <= n; k++) p.push(((2 * k - 1) * x * p[k - 1] - (k - 1) * p[k - 2]) / k);
  return p.slice(0, n + 1);
}

function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / d;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / (M[i][i] || 1e-12));
}

export function polyfit(xs, ys, degree, ridge = 1e-10) {
  const m = degree + 1;
  const A = Array.from({ length: m }, () => new Array(m).fill(0));
  const b = new Array(m).fill(0);
  xs.forEach((x, i) => {
    const p = legendre(x, degree);
    for (let r = 0; r < m; r++) {
      b[r] += p[r] * ys[i];
      for (let c = 0; c < m; c++) A[r][c] += p[r] * p[c];
    }
  });
  for (let r = 0; r < m; r++) A[r][r] += ridge;
  const coef = solve(A, b);
  return (x) => legendre(x, degree).reduce((s, v, i) => s + v * coef[i], 0);
}

export function mse(f, xs, ys) {
  return xs.reduce((s, x, i) => s + (f(x) - ys[i]) ** 2, 0) / xs.length;
}

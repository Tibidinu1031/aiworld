// A tiny multi-layer perceptron trained with backpropagation and SGD.
// Hidden layers use tanh, ReLU or sigmoid; the output is one sigmoid neuron
// trained with binary cross-entropy.
const ACT = {
  tanh: { f: (x) => Math.tanh(x), d: (y) => 1 - y * y },
  relu: { f: (x) => (x > 0 ? x : 0), d: (y) => (y > 0 ? 1 : 0) },
  sigmoid: { f: (x) => 1 / (1 + Math.exp(-x)), d: (y) => y * (1 - y) },
};

export class MLP {
  constructor(sizes, act = 'tanh', seed = 1) {
    this.sizes = sizes;
    this.act = ACT[act] ? act : 'tanh';
    let s = seed;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-9, rnd()))) * Math.cos(2 * Math.PI * rnd());
    this.W = [];
    this.B = [];
    for (let l = 1; l < sizes.length; l++) {
      const nIn = sizes[l - 1];
      const nOut = sizes[l];
      const scale = this.act === 'relu' ? Math.sqrt(2 / nIn) : Math.sqrt(1 / nIn);
      this.W.push(Array.from({ length: nOut }, () => Array.from({ length: nIn }, () => gauss() * scale)));
      this.B.push(Array.from({ length: nOut }, () => (this.act === 'relu' ? 0.05 : 0)));
    }
  }

  get paramCount() {
    let n = 0;
    for (let l = 0; l < this.W.length; l++) n += this.W[l].length * (this.W[l][0].length + 1);
    return n;
  }

  forward(x) {
    const acts = [x];
    let a = x;
    const L = this.W.length;
    for (let l = 0; l < L; l++) {
      const W = this.W[l];
      const B = this.B[l];
      const out = new Array(W.length);
      const last = l === L - 1;
      for (let j = 0; j < W.length; j++) {
        let z = B[j];
        const row = W[j];
        for (let i = 0; i < row.length; i++) z += row[i] * a[i];
        out[j] = last ? 1 / (1 + Math.exp(-z)) : ACT[this.act].f(z);
      }
      acts.push(out);
      a = out;
    }
    return acts;
  }

  predict(x) {
    const acts = this.forward(x);
    return acts[acts.length - 1][0];
  }

  // One SGD step on a mini-batch. Returns the average loss of the batch.
  trainBatch(xs, ys, lr) {
    const L = this.W.length;
    const gW = this.W.map((W) => W.map((row) => row.map(() => 0)));
    const gB = this.B.map((B) => B.map(() => 0));
    let loss = 0;
    for (let n = 0; n < xs.length; n++) {
      const acts = this.forward(xs[n]);
      const p = acts[L][0];
      const y = ys[n];
      loss += -(y * Math.log(p + 1e-9) + (1 - y) * Math.log(1 - p + 1e-9));
      // Backpropagate the error from the output layer to the first layer.
      let delta = [p - y];
      for (let l = L - 1; l >= 0; l--) {
        const aPrev = acts[l];
        const W = this.W[l];
        for (let j = 0; j < W.length; j++) {
          gB[l][j] += delta[j];
          for (let i = 0; i < aPrev.length; i++) gW[l][j][i] += delta[j] * aPrev[i];
        }
        if (l > 0) {
          const nd = new Array(aPrev.length).fill(0);
          for (let i = 0; i < aPrev.length; i++) {
            let s = 0;
            for (let j = 0; j < W.length; j++) s += W[j][i] * delta[j];
            nd[i] = s * ACT[this.act].d(aPrev[i]);
          }
          delta = nd;
        }
      }
    }
    const k = lr / xs.length;
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < this.W[l].length; j++) {
        this.B[l][j] -= k * gB[l][j];
        for (let i = 0; i < this.W[l][j].length; i++) this.W[l][j][i] -= k * gW[l][j][i];
      }
    }
    return loss / xs.length;
  }
}

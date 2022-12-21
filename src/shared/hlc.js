class HLC {
  constructor(now, node, count = 0) {
    this.ts = now;
    this.count = count;
    this.node = node;
  }

  increment() {
    let now = Math.round(new Date().getTime() / 1000)
    if (now > this.ts) {
      this.ts = now;
      this.count = 0;
      this.node = this.node;
    } else {
      this.count = this.count + 1;
    }
  }

  compare(other) {
    if (this.ts == other.ts) {
      if (this.count === other.count) {
        if (this.node === other.node) {
          return 0;
        }
        return this.node < other.node ? -1 : 1;
      }
      return this.count - other.count;
    }
    return this.ts - other.ts;
  }

  receive(remote) {
    let now = Math.round(new Date().getTime() / 1000)
    if (now > this.ts && now > remote.ts) {
      this.ts = now;
      this.count = 0;
      return
    } 

    if (this.ts == remote.ts) {
      this.count = Math.max(this.count, remote.count) + 1;
    } else if (this.ts > remote.ts) {
      this.count = this.count + 1;
    } else {
      this.ts = remote.ts;
      this.count = remote.count + 1;
    }
  }

  toString() {
    return (
      this.ts.toString().padStart(15, '0') +
      ':' +
      this.count.toString(36).padStart(5, '0') +
      ':' +
      this.node
    );
  }

  static fromString(str) {
    const [ts, count, ...node] = str.split(':');
    return new HLC(parseInt(ts), node.join(), parseInt(count, 36));
  }
}

export default HLC;

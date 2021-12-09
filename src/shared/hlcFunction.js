const toString = ({ts, count, node}) => {
  return (
    ts.toString().padStart(15, '0') +
    ':' +
    count.toString(36).padStart(5, '0') +
    ':' +
    node
  );
};

const fromString = str => {
  const [ts, count, ...node] = str.split(':');
  return {
    ts: parseInt(ts),
    count: parseInt(count, 36),
    node: node.join(':'),
  };
};

const increment = ({ts, count, node}, now) => {
  if (now > ts) {
    return {ts: now, count: 0, node: node};
  }
  return {ts: ts, count: count + 1, node: node};
};

export {toString, fromString, increment};

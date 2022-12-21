const parseHlcFromRemote = response => {
  let syncTs = ts;
  let syncCount = count;
  let syncNode = node;
  let localHlc;

  let responseData = response.map(value => {
    // Melakukan parsing dari string HLC server
    let remoteHlc = HLC.fromString(value.hlc);

    // Membuat HLC dari data lokal
    localHlc = new HLC(syncTs, syncNode, syncCount);

    // Melakukan operasi penerimaan event baru dari peladen pada HLC lokal
    localHlc.receive(remoteHlc);

    syncTs = localHlc.ts;
    syncCount = localHlc.count;
    syncNode = localHlc.node;

    value.hlc = localHlc.toString();

    return value;
  });

  // Melakukan pembaruan ts, count, dan node pada clock lokal yang disimpan di Redux
  dispatch(
    update({ts: localHlc.ts, count: localHlc.count, node: localHlc.node}),
  );

  return responseData;
};

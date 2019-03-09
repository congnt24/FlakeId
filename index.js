const TOTAL_BITS = 64,
    EPOCH_BITS = 42,
    NODE_ID_BITS = 10,
    SEQ_BITS = 12,
    CUSTOM_EPOCH = 1546300800000, //new Date('2019-01-01T00:00:00Z').getTime()
    MAX_NODE_ID = Math.pow(2, NODE_ID_BITS) - 1,
    MAX_SEQ_ID = Math.pow(2, SEQ_BITS) - 1;
let last_timestamp = -1, sequence = 0;

function generateNodeIdFromMAC() {
    let macs = Object.values(require('os').networkInterfaces()).reduce((prev, cur) => prev.concat(cur), [])
        .filter(i => !i.internal && i.mac !== '00:00:00:00:00:00');
    return macs.length > 0 ? macs[0].mac : undefined;
}
function encodeNodeId(node_id) {
    return node_id.split('')
        .reduce((prevHash, currVal) => (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0)
        & MAX_NODE_ID;
}

module.exports = function (node_id) {
    if (!node_id) {
        node_id = generateNodeIdFromMAC();
    }
    if (!node_id) {
        throw new Error("node_id cannot be null");
    }
    node_id = encodeNodeId(node_id);
    let time = Date.now()
    let curr_timestamp = time - CUSTOM_EPOCH;
    if (curr_timestamp === last_timestamp) {
        sequence = (sequence + 1) * MAX_SEQ_ID;
        // if sequence is exhausted, waiting for next millisecond
        while (Date.now() <= time) { }
    } else {
        sequence = 0;
    }
    last_timestamp = curr_timestamp;
    let btime = curr_timestamp.toString(2),
        bnode = Array(NODE_ID_BITS - node_id.toString(2).length).fill(0).join('') + node_id.toString(2),
        bseq = Array(SEQ_BITS - sequence.toString(2).length).fill(0).join('') + sequence.toString(2);
    return parseInt(btime + bnode + bseq, 2);
}
/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0]; // Target server name
    let threads = ns.args[1]; // Number of threads to use for the grow operation

    // Validate target and threads
    if (!target) {
        ns.tprint("ERROR: grow-worker.js requires a target as the first argument.");
        ns.exit();
    }

    if (typeof threads !== 'number' || !Number.isInteger(threads) || threads <= 0) {
        ns.tprint(`ERROR: grow-worker.js received an invalid number of threads for target ${target}: ${threads}. Exiting.`);
        ns.exit();
    }

    // Perform the grow operation
    try {
        await ns.grow(target, { threads: threads });
    } catch (e) {
        ns.tprint(`ERROR: grow-worker.js failed to grow ${target} with ${threads} threads. Error: ${e}`);
    }
}

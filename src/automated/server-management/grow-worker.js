/** @param {NS} ns */
export async function main(ns) {
    let threads = ns.args[0]; // Number of threads to use for the grow operation
    const target = ns.args[1]; // Target server name

    // Validate threads and target
    if (typeof threads !== 'number' || !Number.isInteger(threads) || threads <= 0) {
        ns.tprint(`ERROR: grow-worker.js received an invalid number of threads: ${threads}. Exiting.`);
        ns.exit();
    }

    if (!target) {
        ns.tprint("ERROR: grow-worker.js requires a target as the second argument.");
        ns.exit();
    }

    // Perform the grow operation
    try {
        await ns.grow(target, { threads: threads });
    } catch (e) {
        ns.tprint(`ERROR: grow-worker.js failed to grow ${target} with ${threads} threads. Error: ${e}`);
    }
}

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0]; // Target server name
    let threads = ns.args[1]; // Number of threads to use

    // Validate target and threads
    if (!target) {
        ns.tprint("ERROR: hack-worker.js requires a target as the first argument.");
        ns.exit();
    }

    if (typeof threads !== 'number' || !Number.isInteger(threads) || threads <= 0) {
        ns.tprint(`ERROR: hack-worker.js received an invalid number of threads for target ${target}: ${threads}. Exiting.`);
        ns.exit();
    }

    // Perform the hack operation
    try {
        await ns.hack(target, { threads: threads });
    } catch (e) {
        ns.tprint(`ERROR: hack-worker.js failed to hack ${target} with ${threads} threads. Error: ${e}`);
    }
}

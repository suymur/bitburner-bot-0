/** @param {NS} ns */
export async function main(ns) {
    let threads = ns.args[0]; // Number of threads to use for the weaken operation
    const target = ns.args[1]; // Target server name

    // Validate threads and target
    if (typeof threads !== 'number' || !Number.isInteger(threads) || threads <= 0) {
        ns.tprint(`ERROR: weaken-worker.js received an invalid number of threads: ${threads}. Exiting.`);
        ns.exit(); // Exit cleanly if threads argument is invalid
    }

    if (!target) {
        ns.tprint("ERROR: weaken-worker.js requires a target as the second argument.");
        ns.exit(); // Exit cleanly if critical argument is missing
    }

    // Perform the weaken operation
    try {
        await ns.weaken(target, { threads: threads });
    } catch (e) {
        ns.tprint(`ERROR: weaken-worker.js failed to weaken ${target} with ${threads} threads. Error: ${e}`);
    }
}

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0]; // Target server name
    let threads = ns.args[1]; // Number of threads to use for the weaken operation

    // Validate target and threads
    if (!target) {
        ns.tprint("ERROR: weaken-worker.js requires a target as the first argument.");
        ns.exit(); // Exit cleanly if critical argument is missing
    }

    // Ensure threads is a valid number.
    if (typeof threads !== 'number' || !Number.isInteger(threads) || threads <= 0) {
        ns.tprint(`ERROR: weaken-worker.js received an invalid number of threads for target ${target}: ${threads}. Exiting.`);
        ns.exit(); // Exit cleanly if threads argument is invalid
    }

    // Perform the weaken operation
    try {
        await ns.weaken(target, { threads: threads });
    } catch (e) {
        ns.tprint(`ERROR: weaken-worker.js failed to weaken ${target} with ${threads} threads. Error: ${e}`);
    }
}

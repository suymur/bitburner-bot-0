/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0]; // Target server name
    let threads = ns.args[1]; // Number of threads to use

    // Validate target and threads
    if (!target) {
        ns.tprint("ERROR: weaken-worker.js requires a target as the first argument.");
        ns.exit(); // Exit cleanly if critical argument is missing
    }

    // Ensure threads is a valid number. If not, default to 1 or exit.
    // It's safer to exit if threads is clearly invalid, as 1 thread might not be intended.
    if (typeof threads !== 'number' || !Number.isInteger(threads) || threads <= 0) {
        ns.tprint(`ERROR: weaken-worker.js received an invalid number of threads for target ${target}: ${threads}. Exiting.`);
        ns.exit(); // Exit cleanly if threads argument is invalid
    }

    // Perform the weaken operation
    // The try-catch block will catch any runtime errors from ns.weaken,
    // such as "Too many threads requested" if the game's internal check
    // still somehow gets an invalid number, or if RAM becomes insufficient.
    try {
        await ns.weaken(target, { threads: threads });
    } catch (e) {
        // Log the error but don't re-throw to prevent a full script crash.
        // The dispatcher should ideally handle retries or re-evaluations.
        ns.tprint(`ERROR: weaken-worker.js failed to weaken ${target} with ${threads} threads. Error: ${e}`);
    }
}

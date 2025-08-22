/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0]; // Target server name
    const threads = ns.args[1]; // Number of threads to use

    if (!target || threads === undefined) {
        ns.tprint("ERROR: hack-worker.js requires a target and threads as arguments.");
        return;
    }

    // Perform the hack operation
    await ns.hack(target, { threads: threads });
}

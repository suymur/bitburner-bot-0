/** @param {NS} ns */
export async function main(ns) {
    // This script is intended to be imported as a library, not run directly.
    ns.tprint("ERROR: lib-server-scanner.js is a library and should not be run directly.");
}

/**
 * Scans the network, attempts to gain root access on unrooted servers,
 * and returns a list of all rooted servers.
 * @param {NS} ns
 * @returns {string[]} An array of server hostnames that are rooted.
 */
export function scanAndGetRootedServers(ns) {
    const servers = ['home']; // Start with home
    const visited = new Set();
    const rootedServers = new Set();

    // Add port-opening programs you own to this list
    const portPrograms = [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe"
    ];

    let currentScan = ['home'];
    let i = 0;

    while (currentScan.length > 0) {
        const server = currentScan.shift();

        if (visited.has(server)) {
            continue;
        }
        visited.add(server);

        // Attempt to nuke if not rooted
        if (!ns.hasRootAccess(server) && server !== 'home') {
            let portsOpened = 0;
            for (const program of portPrograms) {
                if (ns.fileExists(program, "home")) {
                    try {
                        switch (program) {
                            case "BruteSSH.exe": ns.brutessh(server); break;
                            case "FTPCrack.exe": ns.ftpcrack(server); break;
                            case "relaySMTP.exe": ns.relaysmtp(server); break;
                            case "HTTPWorm.exe": ns.httpworm(server); break;
                            case "SQLInject.exe": ns.sqlinject(server); break;
                        }
                        portsOpened++;
                    } catch (e) {
                        // ns.tprint(`WARN: Could not use ${program} on ${server}: ${e}`);
                    }
                }
            }

            if (portsOpened >= ns.getServerNumPortsRequired(server)) {
                try {
                    ns.nuke(server);
                    ns.tprint(`SUCCESS: Gained root access on ${server}`);
                } catch (e) {
                    ns.tprint(`ERROR: Failed to nuke ${server} even with enough ports open: ${e}`);
                }
            } else {
                // ns.tprint(`INFO: Not enough port programs to nuke ${server}. Needed: ${ns.getServerNumPortsRequired(server)}, Have: ${portsOpened}`);
            }
        }

        if (ns.hasRootAccess(server)) {
            rootedServers.add(server);
        }

        // Add connected servers to the scan queue
        const connectedServers = ns.scan(server);
        for (const connectedServer of connectedServers) {
            if (!visited.has(connectedServer)) {
                currentScan.push(connectedServer);
            }
        }
    }
    return Array.from(rootedServers);
}

/**
 * Gets a list of all hackable servers (rooted, not home, not darkweb, not purchased, has money).
 * @param {NS} ns
 * @returns {string[]} An array of hackable server hostnames.
 */
export function getHackableServers(ns) {
    const rootedServers = scanAndGetRootedServers(ns);
    const hackableServers = [];

    for (const server of rootedServers) {
        // Skip home, servers with no money, or servers we can't hack yet
        // Also skip "darkweb" as it's not a hackable server.
        if (server === 'home' || ns.getServerMaxMoney(server) === 0 || ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel() || server === "darkweb") {
            continue;
        }
        // For now, we'll assume any other rooted server is a public server that can be hacked.
        // If you later acquire purchased servers, and ns.getServerPurchasedByPlayer() is still unavailable,
        // we'll need another way to identify and exclude them if desired.
        hackableServers.push(server);
    }
    return hackableServers;
}

/**
 * Copies worker scripts to a specified host if they are not already present.
 * @param {NS} ns
 * @param {string} host The target host to copy scripts to.
 * @returns {Promise<boolean>} True if all scripts were copied or already existed, false otherwise.
 */
export async function copyWorkerScripts(ns, host) {
    const workerScripts = [
        "/src/automated/server-management/weaken-worker.js",
        "/src/automated/server-management/grow-worker.js",
        "/src/automated/server-management/hack-worker.js",
    ];

    let allCopied = true;
    for (const script of workerScripts) {
        if (!ns.fileExists(script, host)) {
            // ns.scp is an async function, so we need to await it.
            if (await ns.scp(script, host, "home")) {
                ns.tprint(`INFO: Copied ${script} to ${host}`);
            } else {
                ns.tprint(`ERROR: Failed to copy ${script} to ${host}`);
                allCopied = false;
            }
        }
    }
    return allCopied;
}

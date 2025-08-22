import { scanAndGetRootedServers, getHackableServers, copyWorkerScripts } from "/src/lib/lib-server-scanner.js";

/** @param {NS} ns */
export async function main(ns) {
    // ns.disableScriptLog(); // Disable script logging for cleaner output - Temporarily commented out due to API version

    const workerScripts = {
        weaken: "/src/automated/server-management/weaken-worker.js",
        grow: "/src/automated/server-management/grow-worker.js",
        hack: "/src/automated/server-management/hack-worker.js",
    };

    const minSecurityThresh = 5; // How much above min security we tolerate before weakening
    const minMoneyThresh = 0.75; // How much below max money we tolerate before growing

    while (true) {
        // 1. Get all available hacking hosts (rooted servers with RAM)
        let hackingHosts = scanAndGetRootedServers(ns).filter(server => ns.getServerMaxRam(server) > 0);
        // Filter out home if it's running other critical scripts and we want to reserve its RAM
        // For now, we'll include home.

        // Ensure worker scripts are on all hacking hosts
        // Await the copyWorkerScripts function as it is now asynchronous
        // This loop will now correctly wait for all SCP operations to complete for each host.
        for (const host of hackingHosts) {
            await copyWorkerScripts(ns, host);
        }

        // Re-filter hacking hosts to only include those that have the worker scripts
        // This check is still good to ensure the files are truly there,
        // especially if copyWorkerScripts failed for some reason.
        // With the fix in copyWorkerScripts, this filter should now be more reliable.
        hackingHosts = hackingHosts.filter(host => ns.fileExists(workerScripts.weaken, host));


        // 2. Get all hackable targets
        const targets = getHackableServers(ns);

        if (targets.length === 0) {
            ns.tprint("INFO: No hackable targets found. Sleeping...");
            await ns.sleep(10000);
            continue;
        }

        // 3. Iterate through targets and determine what needs to be done
        for (const target of targets) {
            const serverMoney = ns.getServerMoneyAvailable(target);
            const serverMaxMoney = ns.getServerMaxMoney(target);
            const serverSecurity = ns.getServerSecurityLevel(target);
            const serverMinSecurity = ns.getServerMinSecurityLevel(target);

            const moneyThresh = serverMaxMoney * minMoneyThresh;
            const securityThresh = serverMinSecurity + minSecurityThresh;

            let action = null;
            if (serverSecurity > securityThresh) {
                action = 'weaken';
            } else if (serverMoney < moneyThresh) {
                action = 'grow';
            } else {
                action = 'hack';
            }

            // 4. Dispatch the action to an available host
            if (action) {
                const scriptToRun = workerScripts[action];
                const scriptRam = ns.getScriptRam(scriptToRun, "home"); // RAM cost is same regardless of host

                // Find a host with enough RAM
                let bestHost = null;
                let maxThreads = 0;

                for (const host of hackingHosts) {
                    const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
                    if (availableRam >= scriptRam) {
                        const currentThreads = Math.floor(availableRam / scriptRam);
                        if (currentThreads > maxThreads) {
                            maxThreads = currentThreads;
                            bestHost = host;
                        }
                    }
                }

                if (bestHost && maxThreads > 0) {
                    // Kill any existing workers on this target to prevent conflicts and re-dispatch
                    // This is a simple approach for now. A more advanced dispatcher would track PIDs.
                    ns.scriptKill(workerScripts.weaken, target);
                    ns.scriptKill(workerScripts.grow, target);
                    ns.scriptKill(workerScripts.hack, target);

                    ns.tprint(`INFO: Dispatching ${action} on ${target} using ${maxThreads} threads on ${bestHost}`);
                    ns.exec(scriptToRun, bestHost, maxThreads, target, Date.now()); // Add a unique arg to prevent caching issues
                } else {
                    ns.tprint(`WARN: No available host with enough RAM to ${action} ${target}. Script RAM: ${scriptRam}`);
                }
            }
        }
        await ns.sleep(1000); // Wait for 1 second before next dispatch cycle
    }
}

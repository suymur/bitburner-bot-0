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

    // Track problematic hosts to avoid repeatedly trying to dispatch to them if they fail
    const problematicHosts = new Map(); // Map<hostname, timestamp_until_retry>
    const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes before retrying a problematic host

    while (true) {
        // Clean up problematic hosts map
        const now = Date.now();
        for (const [host, retryTime] of problematicHosts.entries()) {
            if (now >= retryTime) {
                problematicHosts.delete(host);
                ns.tprint(`INFO: ${host} removed from problematic hosts list. Will retry dispatching.`);
            }
        }

        // 1. Get all available hacking hosts (rooted servers with RAM)
        let hackingHosts = scanAndGetRootedServers(ns).filter(server => ns.getServerMaxRam(server) > 0);
        // Filter out home if it's running other critical scripts and we want to reserve its RAM
        // For now, we'll include home.

        // Ensure worker scripts are on all hacking hosts
        for (const host of hackingHosts) {
            await copyWorkerScripts(ns, host);
        }

        // Re-filter hacking hosts to only include those that have the worker scripts
        hackingHosts = hackingHosts.filter(host => ns.fileExists(workerScripts.weaken, host));

        // Filter out currently problematic hosts
        hackingHosts = hackingHosts.filter(host => !problematicHosts.has(host));

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
                let scriptRam = ns.getScriptRam(scriptToRun, "home"); // RAM cost is same regardless of host

                // Defensive check: If scriptRam is 0 or negative, we cannot run the script.
                if (scriptRam <= 0) {
                    ns.tprint(`ERROR: Script RAM for ${scriptToRun} is ${scriptRam}. Cannot dispatch.`);
                    continue; // Skip this dispatch cycle for this target/action
                }

                // Find a host with enough RAM
                let bestHost = null;
                let maxThreads = 0;

                for (const host of hackingHosts) {
                    const totalRam = ns.getServerMaxRam(host);
                    const usedRam = ns.getServerUsedRam(host);
                    const availableRam = totalRam - usedRam;

                    ns.tprint(`DEBUG: Host ${host} RAM: Total=${totalRam.toFixed(2)}GB, Used=${usedRam.toFixed(2)}GB, Available=${availableRam.toFixed(2)}GB`);

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

                    ns.tprint(`INFO: Dispatching ${action} on ${target} using ${maxThreads} threads on ${bestHost}. Script RAM: ${scriptRam.toFixed(2)}GB.`);
                    
                    // Execute the script and check the PID
                    const pid = ns.exec(scriptToRun, bestHost, 1, maxThreads, target, Date.now());

                    if (pid === 0) {
                        ns.tprint(`ERROR: Failed to exec ${scriptToRun} on ${bestHost} for ${target}. PID was 0. Marking host as problematic.`);
                        problematicHosts.set(bestHost, Date.now() + RETRY_DELAY_MS);
                    } else {
                        ns.tprint(`DEBUG: Successfully exec'd ${scriptToRun} on ${bestHost} with PID ${pid}.`);
                    }
                } else {
                    ns.tprint(`WARN: No available host with enough RAM to ${action} ${target}. Script RAM: ${scriptRam.toFixed(2)}GB.`);
                }
            }
        }
        await ns.sleep(1000); // Wait for 1 second before next dispatch cycle
    }
}

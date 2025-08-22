/** @param {NS} ns */
export async function main(ns) {
    const target = "n00dles";

    // Check if we have root access. If not, try to get it.
    if (!ns.hasRootAccess(target)) {
        ns.tprint(`INFO: Attempting to gain root access on ${target}...`);
        try {
            // Try to open ports if we have the programs.
            // This script assumes you might not have them yet,
            // so it will proceed even if it can't open ports.
            // You'll need to manually nuke if you don't have enough port openers.
            if (ns.fileExists("BruteSSH.exe", "home")) {
                ns.brutessh(target);
            }
            if (ns.fileExists("FTPCrack.exe", "home")) {
                ns.ftpcrack(target);
            }
            if (ns.fileExists("relaySMTP.exe", "home")) {
                ns.relaysmtp(target);
            }
            if (ns.fileExists("HTTPWorm.exe", "home")) {
                ns.httpworm(target);
            }
            if (ns.fileExists("SQLInject.exe", "home")) {
                ns.sqlinject(target);
            }

            ns.nuke(target);
            ns.tprint(`SUCCESS: Gained root access on ${target}!`);
        } catch (e) {
            ns.tprint(`ERROR: Could not gain root access on ${target}. Error: ${e}`);
            ns.tprint(`       You might need to manually run 'nuke ${target}' or acquire more port-opening programs.`);
            return; // Exit if we can't get root access
        }
    }

    ns.tprint(`INFO: Starting hacking operations on ${target}...`);

    while (true) {
        const moneyThresh = ns.getServerMaxMoney(target) * 0.75; // Hack when money is above 75%
        const securityThresh = ns.getServerMinSecurityLevel(target) + 5; // Weaken when security is 5 above min

        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            ns.tprint(`INFO: Weakening ${target} (Security: ${ns.getServerSecurityLevel(target).toFixed(2)} > ${securityThresh.toFixed(2)})`);
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is below our threshold, grow it
            ns.tprint(`INFO: Growing ${target} (Money: $${ns.getServerMoneyAvailable(target).toFixed(2)} < $${moneyThresh.toFixed(2)})`);
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            ns.tprint(`INFO: Hacking ${target} (Money: $${ns.getServerMoneyAvailable(target).toFixed(2)} / $${ns.getServerMaxMoney(target).toFixed(2)})`);
            await ns.hack(target);
        }
        // Small delay to prevent spamming the game log too quickly, though Bitburner handles this somewhat.
        await ns.sleep(100);
    }
}

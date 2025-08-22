# Bitburner Omni-Bot Automation Suite

This repository contains a progressive suite of Bitburner scripts designed to automate and optimize gameplay from early-game bootstrapping to advanced endgame strategies. The project follows a modular and iterative development approach, as outlined in `concept.md`.

## Current Progress

We have made significant progress towards a more automated and scalable hacking system.

*   **Stage 1: Initial Setup & Basic Hacking (Completed)**
    *   **`src/early-game/semi-automated/early-n00dles-hacker.js`**: A foundational script for early game, now superseded by the dispatcher for broader automation.

*   **Stage 2: Server Management & Expansion (In Progress - Core Dispatcher Implemented)**
    *   **`src/automated/server-management/dispatcher-main.js`**: The central orchestrator for our hacking operations. It scans the network, identifies targets, determines optimal actions (weaken, grow, hack), and dispatches worker scripts to available servers.
    *   **`src/automated/server-management/weaken-worker.js`**: A lightweight script executed by the dispatcher to perform `ns.weaken` on a target.
    *   **`src/automated/server-management/grow-worker.js`**: A lightweight script executed by the dispatcher to perform `ns.grow` on a target.
    *   **`src/automated/server-management/hack-worker.js`**: A lightweight script executed by the dispatcher to perform `ns.hack` on a target.
    *   **`src/lib/lib-server-scanner.js`**: A utility library used by the dispatcher to scan the network, attempt to gain root access on new servers, and identify hackable targets.

## What You Can Do Now

You can now run the `dispatcher-main.js` script to automate hacking across all available rooted servers.

**How to Use the Dispatcher:**

1.  **Ensure Files are Present:**
    *   `src/automated/server-management/dispatcher-main.js`
    *   `src/automated/server-management/weaken-worker.js`
    *   `src/automated/server-management/grow-worker.js`
    *   `src/automated/server-management/hack-worker.js`
    *   `src/lib/lib-server-scanner.js`

2.  **Copy Worker Scripts to Hacking Hosts:**
    The worker scripts (`weaken-worker.js`, `grow-worker.js`, `hack-worker.js`) need to be present on *any server you want to use as a hacking host* (e.g., `home`, `n00dles`, or any other server you gain root access to).
    *   From your Bitburner terminal, for each worker script and each host you want to use:
        ```bash
        run ns.scp("src/automated/server-management/weaken-worker.js", "home")
        run ns.scp("src/automated/server-management/grow-worker.js", "home")
        run ns.scp("src/automated/server-management/hack-worker.js", "home")
        # If you have n00dles rooted and want to use it:
        run ns.scp("src/automated/server-management/weaken-worker.js", "n00dles")
        run ns.scp("src/automated/server-management/grow-worker.js", "n00dles")
        run ns.scp("src/automated/server-management/hack-worker.js", "n00dles")
        # ... and so on for any other rooted servers you acquire.
        ```
    *   *Note:* The `lib-server-scanner.js` and `dispatcher-main.js` only need to be on your `home` server.

3.  **Run the Dispatcher:**
    *   Open your terminal in Bitburner.
    *   Navigate to the dispatcher's directory: `cd src/automated/server-management/`
    *   Run the script: `run dispatcher-main.js`

**What to Expect:**

*   The dispatcher will continuously scan your network for servers.
*   It will attempt to gain root access on unrooted servers using any port-opening programs you possess.
*   It will identify hackable targets (servers with money and within your hacking level).
*   For each target, it will determine if it needs to be weakened, grown, or hacked.
*   It will then find an available server (from your `home` server, purchased servers, or rooted public servers that have the worker scripts copied to them) with enough RAM.
*   It will `ns.exec` the appropriate worker script on that server, allocating as many threads as possible.
*   You will see `INFO` messages in your terminal indicating which actions are being dispatched to which servers.

## Next Steps

Our immediate next steps will focus on refining the dispatcher and expanding its capabilities:

1.  **Automated Worker Deployment:** Implement a system within the dispatcher or a helper script to automatically `ns.scp` worker scripts to newly rooted servers.
2.  **Target Prioritization:** Enhance the dispatcher's logic to intelligently prioritize hacking targets for maximum income.
3.  **Purchased Server Automation:** Integrate logic for automatically purchasing and upgrading private servers to expand our hacking network.
4.  **Job Queue Implementation:** Develop a robust job queue system to manage and prioritize hacking tasks more effectively.

Stay tuned for more updates as we progress through the development stages outlined in `concept.md`!

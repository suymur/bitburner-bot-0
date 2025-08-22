# Bitburner Script Concept: Omni-Bot

## 1. Introduction
*   This script aims to be a comprehensive Bitburner automation suite, designed to maximize progress and income with minimal user intervention.
*   It will automate core gameplay loops such as hacking, server management, faction reputation grinding, and augmentation purchasing, allowing the player to focus on strategic decisions or simply let the game run in the background.

## 2. Overall Vision / End Goal
*   The fully realized Omni-Bot will be a self-sufficient Bitburner AI. It will continuously analyze the game state, identify the most profitable or beneficial actions, and execute them.
*   It will encompass:
    *   **Dynamic Hacking:** Intelligent selection and exploitation of target servers for optimal income.
    *   **Infrastructure Management:** Automated purchasing, upgrading, and deployment of scripts across home and purchased servers.
    *   **Faction & Augmentation Progression:** Proactive reputation grinding and strategic augmentation purchases to accelerate power growth.
    *   **Early Game Acceleration:** Specific routines to quickly gain initial momentum (e.g., early hacking, crime for karma).
    *   **Resource Optimization:** Efficient use of RAM and CPU cycles across all running scripts.
    *   **Resilience:** Ability to recover from unexpected states or game restarts.
*   The ultimate goal is to achieve endgame status (all augmentations, high stats, corporation/gang management) with high efficiency.

## 3. Progressive Development Stages

### Stage 1: Initial Setup & Basic Hacking
*   **Goal:** Get a foundational hacking script running and establish a basic income stream.
*   **Features:**
    *   Identify a suitable initial target server (e.g., `n00dles`).
    *   Gain root access (`nuke`) if not already done.
    *   Basic `grow`, `weaken`, `hack` loop on a single target. Prioritize `weaken` if security is high, then `grow` if money is low, otherwise `hack`.
    *   Simple server selection: initially hardcoded, then perhaps the server with the highest `maxMoney` that can be hacked.
*   **Key Learnings/Challenges:**
    *   Understanding `ns.hack`, `ns.grow`, `ns.weaken` functions and their arguments.
    *   Basic server iteration using `ns.scan`.
    *   Handling `nuke` requirements (ports, `brutessh`, `ftpcrack`, etc.).
    *   Managing script execution and ensuring continuous operation.

### Stage 2: Server Management & Expansion
*   **Goal:** Automate server purchasing and expand hacking operations to multiple targets and servers.
*   **Features:**
    *   Purchase new private servers when affordable, up to the maximum allowed.
    *   Upgrade purchased servers (RAM) to the maximum possible as funds allow.
    *   Distribute hacking scripts (`hack.js`, `grow.js`, `weaken.js`) across all available servers (home, purchased, and compromised public servers) using `ns.scp`.
    *   Automate `scan` and `nuke` for new public servers found, adding them to the pool of available hacking hosts.
    *   Basic load balancing: distribute threads for `hack`, `grow`, `weaken` across available RAM on all hosts.
*   **Key Learnings/Challenges:**
    *   `ns.purchaseServer`, `ns.upgradeRam`, `ns.deleteServer`.
    *   `ns.scp` for script distribution.
    *   `ns.exec` for running scripts remotely and managing their PIDs.
    *   Efficiently managing available RAM across a growing network of servers.
    *   Maintaining a list of owned/compromised servers.

### Stage 3: Advanced Hacking & Target Prioritization
*   **Goal:** Optimize hacking for maximum income, handle multiple targets efficiently, and introduce batching.
*   **Features:**
    *   Dynamic target selection: Prioritize servers based on a calculated "value" (e.g., `maxMoney` / `minSecurity` ratio, or estimated income per second).
    *   Implement a "batching" system: Orchestrate `weaken`, `grow`, `hack` operations to finish in a specific order and timing window for optimal efficiency (e.g., `weaken` finishes just before `grow`, `grow` finishes just before `hack`, and `hack` finishes last).
    *   Monitor server security and money levels in real-time and adjust operations accordingly.
    *   Basic logging/reporting to the terminal or a log file for script status and income.
    *   Introduce a "controller" script that manages all hacking operations, rather than individual `hack/grow/weaken` scripts running independently.
*   **Key Learnings/Challenges:**
    *   Advanced server statistics (`ns.getServerMoneyAvailable`, `ns.getServerSecurityLevel`, `ns.getServerMinSecurity`, `ns.getServerMaxMoney`).
    *   Accurate timing functions (`ns.getHackTime`, `ns.getGrowTime`, `ns.getWeakenTime`) and network latency considerations.
    *   Asynchronous operations and managing multiple script instances and their PIDs for batching.
    *   Developing a robust target prioritization algorithm.

### Stage 4: Faction & Augmentation Automation
*   **Goal:** Automate joining factions, grinding reputation, and purchasing augmentations to accelerate player stats.
*   **Features:**
    *   Identify joinable factions based on current stats and reputation.
    *   Automate reputation grinding through various means (e.g., `ns.workForFaction`, crime, hacking contracts). Prioritize based on augmentation availability.
    *   Purchase augmentations when affordable and reputation requirements are met.
    *   Handle `ns.singularity` functions for managing jobs, factions, and augmentations.
    *   Implement a "soft reset" mechanism: after purchasing augmentations, automatically restart the main hacking script and re-evaluate targets.
*   **Key Learnings/Challenges:**
    *   Understanding faction mechanics, prerequisites, and reputation gain rates.
    *   `ns.singularity` API for managing player actions.
    *   Prioritizing augmentation purchases for optimal progression.
    *   Managing the "install augmentations" process and script restarts.

### Stage 5: Stock Market & Crime (Optional/Advanced)
*   **Goal:** Integrate advanced money-making strategies beyond hacking.
*   **Features:**
    *   Basic stock market trading: Implement a simple algorithm to buy low and sell high, focusing on volatility or momentum.
    *   Automate crime for karma, money, or specific stat gains (e.g., strength for combat factions).
    *   Integrate these income streams with the main money management system.
*   **Key Learnings/Challenges:**
    *   Stock market API (`ns.stock`) and its nuances.
    *   Crime mechanics, success rates, and risk assessment.
    *   Balancing these activities with hacking to maximize overall income/progress.

## 4. Core Principles / Design Philosophy
*   **Modularity:** Break down functionality into small, reusable scripts or functions.
*   **Efficiency:** Optimize for RAM usage and CPU cycles, especially for core hacking loops.
*   **Robustness:** Handle errors gracefully, recover from unexpected states, and be resilient to game restarts.
*   **Automation:** Minimize manual intervention; the script should be as self-sufficient as possible.
*   **Scalability:** The script should perform well from early game to endgame, adapting to increasing resources.
*   **Readability:** Code should be well-commented and easy to understand for future modifications.

## 5. Future Considerations / Stretch Goals
*   **Corporation Management:** Automate the creation and management of a corporation for passive income.
*   **Gang Management:** Automate gang operations for karma and money.
*   **Sleeve Management:** Automate sleeve actions for training, crime, or faction work.
*   **Advanced UI/Dashboard:** Create a simple in-game overlay or log to display key metrics (money/sec, current target, next augmentation, etc.).
*   **BitNode Specific Optimizations:** Adapt strategies for different BitNodes.
*   **Neural Network / AI Integration:** (Highly advanced) Use machine learning to predict optimal actions or stock market movements.

## 6. Technologies / Libraries (if applicable)
*   Bitburner Netscript API (`ns` object).
*   Potentially custom utility functions for common tasks (e.g., server scanning, RAM calculation).
*   `ns.singularity` for player actions.
*   `ns.stock` for stock market.

## 7. Development Workflow
*   **Iterative Development:** Focus on completing one stage before moving to the next, ensuring each stage is stable.
*   **Unit Testing (Manual):** Test individual script components in isolation.
*   **Integration Testing (Manual):** Test how different scripts interact.
*   **Version Control:** Use Bitburner's built-in save system and potentially external tools for backup.
*   **Logging:** Implement verbose logging during development to debug issues.
*   **File Management:** Organize scripts into logical directories (e.g., `/hack`, `/lib`, `/singularity`).

# Thoughts and Design Discussions

This document serves as a scratchpad for brainstorming, discussing architectural patterns, and outlining complex features before they are formalized in `concept.md` or implemented in code.

---

## 1. Scaling Early-Game Hacking: From Single Script to Distributed Operations

### Current State: `early-n00dles-hacker.js`
Our current `early-n00dles-hacker.js` is a single, monolithic script that performs all `hack`, `grow`, and `weaken` operations on a single target (`n00dles`). It's simple and effective for the very early game.

### Problem Statement: Limitations of the Single Script Approach
As we progress, we'll encounter:
*   **More Targets:** We'll want to hack multiple servers simultaneously.
*   **More Hacking Sources:** We'll acquire more RAM (home server upgrades, purchased servers, compromised public servers) that can be used for hacking.
*   **Inefficiency:** A single script can only focus on one target at a time, and it doesn't efficiently utilize distributed RAM.

### Proposed Evolution: Distributed Hacking Operations

The idea is to break down the monolithic script into smaller, specialized "worker" scripts that can be distributed and executed across multiple servers.

**Initial thought on breaking down the script:**

Instead of one script doing `if (weaken) { ... } else if (grow) { ... } else { hack }`, we could have:
*   `weaken-worker.js`: A script that just performs `ns.weaken(target)`.
*   `grow-worker.js`: A script that just performs `ns.grow(target)`.
*   `hack-worker.js`: A script that just performs `ns.hack(target)`.

These worker scripts would be lightweight and take `target` as an argument.

### Orchestration: The Need for a Dispatcher

If we have multiple worker scripts and multiple servers, we need something to decide:
1.  Which server to hack (target selection).
2.  Which operation (`weaken`, `grow`, `hack`) is needed for that target.
3.  Which available server (home, purchased, compromised) should run the worker script.
4.  How many threads to allocate for that operation on that server.

This points directly to the concept of a **Job Dispatcher**.

---

## 2. Job Dispatcher vs. Edge Node Intelligence

This is a crucial architectural decision for managing our distributed hacking operations.

### Option A: Centralized Job Dispatcher (Controller-Worker Model)

*   **Concept:** A single, main script (the "Dispatcher" or "Controller") runs on the `home` server (or a powerful purchased server).
    *   It continuously scans the network for hackable targets.
    *   It assesses the state of each target (money, security).
    *   It determines what operations (`weaken`, `grow`, `hack`) are needed for which targets.
    *   It then finds available RAM on *any* of our controlled servers (home, purchased, compromised public servers).
    *   It `ns.exec`'s the appropriate worker script (`weaken-worker.js`, `grow-worker.js`, `hack-worker.js`) on the chosen server, passing the target and number of threads.
    *   It keeps track of running jobs and available RAM.

*   **Pros:**
    *   **Centralized Logic:** Easier to manage target prioritization, load balancing, and overall strategy from one place.
    *   **Global View:** The dispatcher has a complete picture of all targets and all available hacking resources.
    *   **Dynamic Scaling:** Can easily reallocate threads or switch targets based on real-time needs.
    *   **Simpler Workers:** Worker scripts are very lean, just performing their single task.

*   **Cons:**
    *   **Single Point of Failure:** If the dispatcher crashes, all hacking stops.
    *   **RAM Usage:** The dispatcher itself might consume significant RAM on the `home` server, especially as complexity grows.
    *   **Network Overhead:** Constant `ns.exec` calls and potential `ns.kill` calls.

### Option B: Distributed Intelligence (Edge Node Autonomy)

*   **Concept:** Each controlled server (home, purchased, compromised) runs its *own* "smart" script (an "Edge Node" or "Autonomous Agent").
    *   Each edge node would scan the network (or receive a list of targets from a very lightweight central script).
    *   Each edge node would decide *for itself* which target to hack and which operation to perform, based on its local RAM and a shared strategy.
    *   It would then run its own `hack`, `grow`, `weaken` operations locally.

*   **Pros:**
    *   **Resilience:** No single point of failure; if one node crashes, others continue.
    *   **Reduced Network Overhead:** Less `ns.exec` traffic.
    *   **Distributed RAM Usage:** Logic is spread out.

*   **Cons:**
    *   **Coordination Challenges:** How do nodes avoid hacking the same target inefficiently? How do they share target lists? How do they ensure optimal overall resource allocation?
    *   **Redundant Logic:** Each node would need to contain the target selection and operation logic, leading to more complex worker scripts and potential for inconsistencies.
    *   **Global Optimization Difficult:** Harder to achieve optimal overall system performance without a central coordinator.

### Initial Recommendation: Centralized Job Dispatcher (Option A)

For our initial stages, and given the Bitburner API, a **Centralized Job Dispatcher** seems more manageable and powerful. The `ns.exec` and `ns.kill` functions, combined with `ns.scan` and server info functions, lend themselves well to a controller-worker model. We can mitigate the single point of failure by making the dispatcher robust and potentially having a simple "restart dispatcher" script.

This approach aligns well with the "auto scaling server" idea, as the dispatcher would be responsible for deciding where to run jobs and how many threads to use, effectively scaling operations across available RAM.

---

## 3. Job Queue: Enhancing the Dispatcher

If we go with a centralized dispatcher, how does it manage the *tasks* it needs to perform? This is where a **Job Queue** comes in.

*   **Concept:** The dispatcher doesn't just immediately `exec` a script. Instead, it identifies a need (e.g., "server X needs to be weakened by Y security points," "server Z needs to be grown by A money"). It then creates a "job" object representing this need.
*   These job objects are placed into a queue.
*   The dispatcher then continuously pulls jobs from the queue and tries to fulfill them by `ns.exec`'ing worker scripts on available servers.

*   **Pros:**
    *   **Prioritization:** Jobs in the queue can be prioritized (e.g., `weaken` jobs for high-security servers always go first).
    *   **Load Balancing:** The dispatcher can intelligently assign jobs to servers with available RAM, ensuring efficient use of resources.
    *   **Flexibility:** New types of jobs (e.g., "purchase server," "upgrade RAM," "join faction") can be added to the queue system.
    *   **State Management:** Easier to track what needs to be done and what's currently running.

*   **Considerations for a Job Queue:**
    *   **Data Structure:** How will the queue be implemented? An array? A custom class?
    *   **Persistence:** How do we ensure the queue state survives a game restart? (Bitburner's `ns.read`/`ns.write` to a file, or `ns.getScriptLogs` for simple cases).
    *   **Job Definition:** What information does a "job" object need to contain (target, operation, threads, priority, estimated completion time)?

### Next Steps for Discussion:

*   **Defining Worker Scripts:** Let's detail the exact arguments and behavior of `weaken-worker.js`, `grow-worker.js`, and `hack-worker.js`.
*   **Dispatcher Logic:** How will the dispatcher scan, identify needs, and allocate resources?
*   **Job Object Structure:** What will a job look like?
*   **RAM Calculation:** How do we accurately calculate available RAM and required RAM for workers?

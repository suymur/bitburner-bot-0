# Bitburner Omni-Bot Automation Suite

This repository contains a progressive suite of Bitburner scripts designed to automate and optimize gameplay from early-game bootstrapping to advanced endgame strategies. The project follows a modular and iterative development approach, as outlined in `concept.md`.

## Current Progress

We have successfully implemented the very first script, focusing on the initial stages of the game.

*   **Stage 1: Initial Setup & Basic Hacking (In Progress)**
    *   **`src/early-game/semi-automated/early-n00dles-hacker.js`**: A foundational script to gain root access and perform basic hack/grow/weaken operations on the `n00dles` server. This script is designed for players just starting out, right after the tutorial.

## What You Can Do Now

You can use the `early-n00dles-hacker.js` script to start earning money and gain early experience.

**How to Use `early-n00dles-hacker.js`:**

1.  **Copy the script:** Ensure `early-n00dles-hacker.js` is in your Bitburner game's `src/early-game/semi-automated/` directory.
2.  **Run the script:**
    *   Open your terminal in Bitburner.
    *   Navigate to the script's directory: `cd src/early-game/semi-automated/`
    *   Run the script: `run early-n00dles-hacker.js`

**What to Expect:**

*   The script will first attempt to gain root access on `n00dles`.
    *   If you have enough port-opening programs (e.g., `BruteSSH.exe`, `FTPCrack.exe`), it will automatically `nuke` the server.
    *   If you don't have enough programs, it will print an error message and instruct you to manually `nuke n00dles` once you acquire the necessary programs or skills.
*   Once root access is established, the script will enter a continuous loop, performing `weaken`, `grow`, and `hack` operations on `n00dles` to keep its security low and money high, maximizing your early income.

## Next Steps

Our immediate next steps will focus on expanding the early-game capabilities and moving towards more automated processes:

1.  **Generalize Early Hacking:** Modify the current script or create a new one to dynamically find and hack *any* accessible early-game server, not just `n00dles`.
2.  **Automate Root Access:** Develop a more robust system for automatically gaining root access on new servers as programs are acquired.
3.  **Basic Server Purchasing:** Begin automating the purchase of early private servers to expand our network.

Stay tuned for more updates as we progress through the development stages outlined in `concept.md`!

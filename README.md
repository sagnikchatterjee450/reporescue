# RepoRescue — AI Codebase Copilot, Tutor & Error Solver

> **RepoRescue** is an open-source onboarding and engineering intelligence copilot. It turns complex, unfamiliar repositories into clear architectural roadmaps, provides guided tours with **Tutor**, and repairs broken code with **DevFix**.

---

## Table of Contents

- [Core Modules](#core-modules)
- [Module 1: Tutor (Interactive Onboarding)](#module-1-tutor-interactive-onboarding)
- [Module 2: RepoRescue (Health & Architecture Copilot)](#module-2-reporescue-health--architecture-copilot)
- [Module 3: DevFix (Error Diagnostic & Repair Engine)](#module-3-devfix-error-diagnostic--repair-engine)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Running Automated Tests](#running-automated-tests)
- [Deployment](#deployment)

---

## Core Modules

| Module | Route | Purpose |
| :--- | :--- | :--- |
| **Tutor** | `/tutor`, `/tutor/:owner/:repo` | Turns any GitHub repo into an interactive onboarding experience with Mermaid diagrams, guided tour, citation-guarded Q&A, and `ONBOARDING.md` export. |
| **RepoRescue** | `/` | Health scorecards, code complexity, test coverage metrics, README improvement, and contribution tasks. |
| **DevFix** | `/devfix` | Diagnoses compiler errors, runtime exceptions, and stack traces across 12+ languages, explaining what happened, why, and how to fix it in code. |

---

## Module 1: Tutor (Interactive Onboarding)

**Tutor** turns any GitHub repository into an interactive onboarding guide.

### Key Capabilities

1. **Overview Dashboard:** Executive summary, intended audience, tech stack badges with reasoning, and repository health snapshot.
2. **Architecture Diagrams:**
   - **System Overview:** High-level topology diagram in Mermaid.
   - **Module Dependency Graph:** Visual component-to-module dependencies.
   - **Sequence Flows:** Step-by-step execution sequences for 1–3 critical flows.
   - **Interactive Node Graph:** Clickable module nodes with instant file inspection.
   - **Export Tools:** 1-click SVG download, high-resolution PNG download, and Mermaid source view/copy with auto-repair.
3. **Guided Tour:** 8 to 15 ordered steps (title, files to open, why it matters, what to notice, minutes) with:
   - **Difficulty Modes:** *New to Programming*, *Experienced (New to Stack)*, and *Senior Architecture*.
   - **Role Filters:** *Frontend*, *Backend*, *DevOps*, *Docs/Design*, and *Reviewer*.
   - **Progress Tracking:** Interactive checklist tracking your onboarding percentage.
4. **Multi-Depth Code Explainer:**
   - Explain any file, function, or line range at **ELI5**, **Junior Developer**, or **Senior Architecture** depth.
   - **Where Used:** Inspect direct callers and dependencies across the codebase.
   - **Rescue This Action:** 1-click jump sending the file into RepoRescue's deep analysis flow.
5. **Chat with the Repo:**
   - Streaming Q&A with conversational memory.
   - **Citation Guard:** Automatically verifies each cited path against the repository tree. Valid citations are clickable chips opening the file; invalid paths are marked `(unverified)`.
   - Explicit guard: If a behavior is not defined in the codebase, the AI explicitly states so.
6. **Setup Coach:**
   - Step-by-step checklist for install, configure, test, and run.
   - 1-click terminal command copying with clipboard feedback.
   - Troubleshooting tips for common installation traps.
   - Environment variable table with required status, default values, and examples.
7. **First Contribution Finder:**
   - Beginner-friendly issues ranked by difficulty (*Easy*, *Medium*, *Hard*).
   - Involved files, test verification instructions, and interactive Pull Request checklist.
8. **Learn & Verify:**
   - 3 to 5 interactive multiple-choice quiz questions per module.
   - Instant scoring with architecture explanations for right and wrong options.
9. **What's Changed:**
   - Digest of recent PRs and commits explaining architectural impact on system invariants.
10. **Glossary & Conventions:**
    - Project domain vocabulary and where each term is used.
    - Code conventions and formatting rules with code samples.
    - Known gotchas, race conditions, and mitigation strategies.
11. **Export & Share:**
    - 1-click download of a standard, formatted `ONBOARDING.md` document.
    - Copy shareable link to any specific tour step or diagram.
12. **Compare:**
    - Side-by-side architecture and onboarding complexity comparison between two repositories.

### Ingestion & Privacy
- **GitHub Ingestion:** Works with public GitHub repositories or private repositories using an in-memory Personal Access Token (never persisted or logged).
- **Smart Filtering:** Automatically excludes `node_modules`, `.git`, build output, lockfiles, images, binaries, and minified files.
- **IndexedDB Caching:** Cached by repository URL + commit SHA in IndexedDB with in-memory fallback.
- **Local Ollama Option:** Selectable in Settings or top bar to route requests locally through `http://localhost:11434` (`gemma4:e4b` / `gemma4:26b`).

---

## Module 2: RepoRescue (Health & Architecture Copilot)

- **Health Dashboard:** Code complexity (cyclomatic metrics), test coverage estimation, and dependency freshness.
- **Repository Map:** Interactive coordinate-based component graph.
- **Start Here Path:** Step-by-step file reading order for open source contributors.
- **README Improvement:** Analyzes documentation gaps and proposes copy-paste Markdown patches.
- **Cross-Linking:** Click **"Learn this repo in Tutor"** from any RepoRescue screen to instantly open Tutor with the same repository preloaded.

---

## Module 3: DevFix (Error Diagnostic & Repair Engine)

- Accessible via `/devfix` or the top navigation bar.
- Supported languages: TypeScript, JavaScript, Python, Go, Rust, Java, C++, C#, PHP, Ruby, SQL, Bash.
- Three diagnostic pillars:
  1. **What Happened:** Plain-English summary and compiler/runtime behavior.
  2. **Why Might It Happen:** Root cause analysis, edge case triggers, and production risk factors.
  3. **How to Fix:** Complete syntax-highlighted corrected code, diff explanation, and prevention best practices.

---

## Getting Started Locally

### Prerequisites
- Node.js >= 20.x
- npm >= 9.x
- (Optional) `GEMINI_API_KEY` for server-side AI synthesis. If not set, intelligent structured heuristic models are automatically served.

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/repo-rescue.git
cd repo-rescue

# Install dependencies
npm install

# (Optional) Setup environment variables
cp .env.example .env
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- RepoRescue Home: `http://localhost:3000/`
- Tutor Onboarding: `http://localhost:3000/tutor`
- DevFix Error Solver: `http://localhost:3000/devfix`

---

## Running Automated Tests

RepoRescue uses [Vitest](https://vitest.dev/) for sub-second automated testing of file filtering, citation guards, and diagram auto-repair utilities:

```bash
npm test
```

Unit test suites:
- `isIngestableFile`: Verifies ignoring build artifacts, lockfiles, binaries, and oversized files.
- `getFilePriorityScore`: Asserts priority weighting for README, manifests, and entry points.
- `verifyFilePath` & `extractAndGuardCitations`: Tests citation verification and false-positive prevention.
- `sanitizeAndRepairMermaid`: Asserts syntax auto-repair on bracket labels and arrow notations.
- `generateOnboardingMarkdown`: Validates generated `ONBOARDING.md` document structure.

---

## Deployment

Build the client assets and bundle the backend server:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

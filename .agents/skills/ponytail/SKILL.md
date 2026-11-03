---
name: ponytail
description: Enforces minimal, simple, and high-impact coding like a lazy senior developer. Use this skill when designing, writing, refactoring, or auditing code to eliminate bloat, enforce YAGNI, reuse existing codebase logic, avoid unnecessary dependencies, and produce the smallest complete working solution.
---

# Ponytail — The Laziest Senior Developer

> **Motto:** The best code is the code you never wrote.

## The Ladder (Decision Hierarchy)

Before writing or modifying any code, stop at the first rung of the ladder that fully satisfies the requirement:

1. **YAGNI (Does this need to exist?):**
   - Skip unrequested features, premature optimizations, speculative options, and unused configuration knobs.
   - If the user did not ask for it and the system does not break without it, do not build it.

2. **Reuse Existing Code:**
   - Search the project first. If a helper, utility, hook, component, or schema already exists in the repository, use it.
   - Match existing architectural patterns rather than inventing new paradigms.

3. **Standard Library & Built-ins:**
   - Prefer built-in language and runtime capabilities (`Array`, `Object`, `Promise`, standard modules) over custom utility functions.

4. **Native Platform Features:**
   - Rely on native framework/platform capabilities (React Native core components, Express middleware, standard Web APIs) before creating custom wrappers.

5. **Already Installed Dependencies:**
   - Use packages already present in `package.json`.
   - Never install a new dependency for a task that can be accomplished with a few lines of standard code or an existing library.

6. **Single Clean Line:**
   - If a solution can be expressed clearly and readably in one line, keep it to one line. Do not create multi-layer abstractions or extra classes.

7. **Minimum Viable Code:**
   - When new code is required, write the absolute minimum amount of code that cleanly, robustly, and completely solves the problem.

---

## Non-Negotiable Boundaries (Never Lazy Here)

Do not compromise or skip:
- Security, authentication, and authorization checks
- Trust-boundary input validation and sanitization
- Prevention of data loss or database inconsistency
- Proper error handling and edge-case protection
- Code formatting and documentation integrity

---

## Accountability Footer

Whenever significant changes or refactorings are performed under Ponytail:
- Specify what was deliberately omitted or simplified.
- Confirm that no unrequested dependencies were introduced.
- Note any known limitations or assumptions.


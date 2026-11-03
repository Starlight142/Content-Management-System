# Rule: Ponytail Coding Principles (Minimalist & High-Impact Engineering)

Follow the Ponytail decision hierarchy before writing or modifying code:

1. **YAGNI (You Aren't Gonna Need It):** Build only what is explicitly requested. Do not add speculative options, unused parameters, or future-proofing layers.
2. **Reuse Before Reimplementing:** Search the repository for existing helpers, utilities, hooks, or components before writing new ones.
3. **Built-in First:** Prefer standard JavaScript/TypeScript built-ins and platform APIs over custom helper functions.
4. **No Unnecessary Packages:** Use existing dependencies already declared in `package.json`. Never install a package for trivial operations.
5. **Shortest Complete Solution:** Write the cleanest, most concise code that fully satisfies the requirement. Avoid premature abstraction, unnecessary wrapper functions, or redundant boilerplate.
6. **Safety Is Paramount:** Never sacrifice security, authentication, data integrity, error handling, or validation in pursuit of brevity.


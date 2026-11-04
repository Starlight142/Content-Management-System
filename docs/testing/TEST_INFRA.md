# E2E Test Infra: Draftly Production Workflow & Stage Approval System

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internals.
- Zero extra dependencies: Uses Node.js native `node:test` and `node:assert` (Ponytail Rung 3 & 5).
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise + Workload Testing.

## Feature Inventory & Test Coverage
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 |
|---|---------|--------|:------:|:------:|:------:|
| 1 | Dynamic Default Dates | R1 | 5 | 5 | ✓ |
| 2 | Position-Based Action Locking | R1 | 5 | 5 | ✓ |
| 3 | Sequential Workflow Stage Pipeline (1->2->3->4->5) | R3 | 5 | 5 | ✓ |
| 4 | Manager Approval & Stage Unlocking | R3 | 5 | 5 | ✓ |
| 5 | Role-Consistent Review State Synchronization | R4 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Node.js native test runner (`node --test tests/automated_verification.test.js`) in `master/backend`.
- Test execution time: <1 second.
- Exit code 0 indicates all tests pass.

## Coverage Thresholds
- Tier 1: Feature Coverage (isolated functionality per feature)
- Tier 2: Boundary & Corner Cases (unauthorized roles, missing dates, multiple stages)
- Tier 3: Cross-Feature Combinations (position locking combined with sequential stage gating)
- Tier 4: Real-World Studio Application Scenarios (end-to-end media production cycle from Scripting to Sound Design)

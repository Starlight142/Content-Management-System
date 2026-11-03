---
name: diagram-design
description: Create branded architecture, architecture delta, IT current-state, flowchart, sequence, state machine, ER/data model, timeline, swimlane, quadrant, radar, polar chart, loop/flywheel, tree, org chart, layer stack, Venn, pyramid, heatmap, Gantt, Sankey, fishbone, kanban, user journey, service blueprint, deployment, dependency graph, and UML diagrams as self-contained HTML/SVG files with clean editorial typography and design systems.
---

# Diagram Design — Editorial-Quality Visuals

Create technical, system, and architecture diagrams as self-contained HTML files with inline SVG and CSS, following an opinionated editorial design system. Avoids generic "AI slop", default box layouts, and unstyled Mermaid outputs.

---

## 1. Core Philosophy

- **Deletion as High-Quality Design:** The best diagram is the simplest one that carries the intended meaning. Every node represents a distinct idea. Two nodes that always travel together are merged into one node.
- **Informative Connections:** Every connection carries information. If the relationship is obvious from the layout or grouping, remove the line. Use orthogonal (horizontal/vertical) routes with subtle corner radiuses rather than diagonal tangles.
- **Editorial Accent:** Use an accent color (e.g. coral, amber, or brand primary) sparingly for 1–2 focal nodes per diagram. Do not color-code every node randomly.
- **Hierarchy Over Uniformity:** Container nodes, service nodes, databases, and client devices must have distinct visual weights, paddings, and font sizes.

---

## 2. Universal Anti-Patterns (Avoid "AI Slop")

| Anti-Pattern | Why It Fails | What to Do Instead |
| :--- | :--- | :--- |
| **Dark mode + neon cyan/purple glow** | Appears "technical" without real design decisions. | Use clean high-contrast paper backgrounds (light `#f8fafc` or deep refined slate `#0f172a` with crisp hairlines). |
| **Monospace font everywhere** | Degrades reading ergonomics for prose and titles. | Use clean Sans-Serif (Geist, Inter, system-ui) for labels; reserve Monospace strictly for ports, URLs, IPs, and code identifiers. |
| **Identical boxes for every node** | Destroys visual hierarchy and roles. | Differentiate containers, microservices, databases (cylinders or stacked pills), and third-party APIs. |
| **Floating inside legends** | Clutters the primary reading area. | Place legend/metadata in an unobtrusive bottom-right or top-left position outside the primary flow. |
| **Drop shadows & heavy gradients** | Dated visual clutter. | Flat, crisp borders (hairlines: 1px–1.5px) and subtle surface tinting. |

---

## 3. Design Tokens & Structure

All generated diagrams must be self-contained HTML files containing inline `<svg>` and `<style>`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Diagram</title>
  <style>
    :root {
      --bg: #ffffff;
      --paper: #f8fafc;
      --ink: #0f172a;
      --muted: #64748b;
      --border: #cbd5e1;
      --accent: #2563eb;
      --accent-soft: #eff6ff;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    body {
      margin: 0;
      padding: 40px;
      display: flex;
      justify-content: center;
      background: var(--paper);
      font-family: var(--font-sans);
    }
    svg {
      max-width: 100%;
      height: auto;
      background: var(--bg);
      border-radius: 12px;
      border: 1px solid var(--border);
    }
  </style>
</head>
<body>
  <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <!-- Inline SVG Diagram Primitives -->
  </svg>
</body>
</html>
```

---

## 4. Supported Diagram Types (45 Types)

1. **System & Cloud:** Architecture, Architecture Delta, Infrastructure, Medallion Pipeline, Deployment Topology.
2. **Process & Flow:** Flowchart, Swimlane, BPMN-style Pipeline, Decision Tree, Service Blueprint.
3. **Behavioral & Interaction:** Sequence Diagram, State Machine, Event-Driven Choreography.
4. **Data & Schema:** ER Diagram, Relational Schema, Document Collection Models, Dependency Graph.
5. **Organizational & Strategy:** Team Org Chart, Wardley Map, User Journey Map, Kanban Flow, Quadrants.
6. **Quantitative & Metric:** Timeline / Roadmap, Gantt, Sankey Flow, Heatmap, Waterfall, Treemap.

---

## 5. Execution Workflow

When invoked to create or design a diagram:
1. **Analyze Meaning & Relationships:** Determine what story the diagram tells (e.g. Request Flow, Data Transformation, Authorization Boundary).
2. **Select Type & Semantic Pattern:** Choose the optimal layout from the 45 types.
3. **Establish Clear Visual Hierarchy:** Focus on 1–2 key points with the accent color; keep secondary nodes in muted surface tones.
4. **Output Standalone HTML:** Save the diagram as a standalone `.html` file that can be opened in any browser or embedded into project documentation.


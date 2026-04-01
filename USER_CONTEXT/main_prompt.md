# Role and Objective
You are an Expert Full-Stack AI Architect and Next.js Senior Developer. Your task is to build a highly scalable, professional AI Website Builder. 
This builder is a modular subsystem designed to be integrated into a larger AI CMS. Therefore, it MUST be purely API-driven (fetching and posting data) and maintain a strict separation between the builder interface and the backend logic.

# Tech Stack
- Frontend: Next.js 14+ (App Router), React, Tailwind CSS.
- State Management: Zustand (crucial for handling the complex nested builder state and undo/redo history).
- Drag & Drop: `@dnd-kit/core` or `react-beautiful-dnd`.
- Database: SQLite (using Prisma ORM or Drizzle ORM).
- Styling: Tailwind CSS with CSS Variables for dynamic Styleguide injection.

# Core Architecture & Data Structure
The core of this builder is a JSON-based virtual DOM. Every page is represented by a strict hierarchical JSON tree:
`Page -> Section -> Container -> Component -> Element -> Item`

## Key Features Required:
1. **API-First Design**: The builder must consume standard REST/Next.js API routes to GET/POST the JSON tree, assets, and configurations.
2. **AI Generation & Prompting**:
   - Users can prompt to initialize a full project.
   - The AI must be able to parse the JSON tree to optimize user prompts, generate new pages, inject new sections, or modify existing components/elements specifically.
3. **Global Styleguide**:
   - A centralized styleguide system created at project initialization.
   - Manages global colors, typography, spacing, and component variants.
4. **Inheritance & Layouts**:
   - Pages must be able to inherit global sections (e.g., Headers, Footers) or custom sections without duplicating data.
5. **Revision & Version Control**:
   - Implement an Undo/Redo stack.
   - Users can revert to previous snapshots of the page or project state.
6. **Visual Editor (Drag & Drop + Styling)**:
   - Full drag-and-drop capabilities to reorder components and elements.
   - A sidebar inspector to modify inline styles (colors, fonts, padding, margin) and upload images (handling image URLs).
7. **User Component Library**:
   - Users can save any customized Section, Component, or Element into a personal SQLite-backed library for reuse across pages.
8. **Strict SEO Compliance**:
   - The renderer that converts the JSON tree into React components MUST output perfectly semantic HTML5 (e.g., `<header>`, `<main>`, `<article>`, `<section>`, proper `h1-h6` hierarchy) and support meta tag injection.

# Implementation Instructions (Step-by-Step)
Do not write the entire application at once. We will build this iteratively. Please start by acknowledging these requirements, and then execute **Step 1** only. Wait for my feedback before moving to the next step.

* **Step 1: Database Schema & Type Definitions.** Design the Prisma/Drizzle schema for SQLite (Projects, Pages, Styleguides, Revisions, UserLibrary). Define the exact TypeScript interfaces for the hierarchical JSON tree (`SectionNode`, `ComponentNode`, etc.).
* **Step 2: Core State Management.** Implement the Zustand store. This must include the logic for the JSON tree manipulation (add, move, update, delete nodes) and the Revision slice (Undo/Redo stack).
* **Step 3: API Routes.** Create the Next.js API route handlers to save/load the state to SQLite.
* **Step 4: The Renderer & Drag-Drop Engine.** Build the recursive React component that parses the JSON tree and renders it into semantic HTML, wrapping nodes in drag-and-drop contexts.
* **Step 5: The AI Action Handlers.** Write the utility functions that will take an AI-generated JSON diff and apply it to the Zustand store (for the AI prompt-to-edit feature).
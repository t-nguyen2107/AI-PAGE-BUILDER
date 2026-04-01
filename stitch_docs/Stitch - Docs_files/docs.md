earn

Stitch via MCP
Connect IDEs and CLIs to Stitch using the Model Context Protocol.

The Stitch Model Context Protocol (MCP) server allows your favorite AI tools like Cursor, Antigravity, or the Gemini CLI to directly interact with your Stitch projects.

Understanding Remote MCP
Most MCP servers you use are Local. They read files on your hard drive or run scripts on your machine. Stitch is a Remote MCP server. It lives in the cloud.

Because it is remote, it requires a secure “handshake” to ensure that the AI agent acting on your behalf actually has permission to modify your designs.

API Keys vs OAuth
The Stitch MCP server supports two authentication methods:

API Keys: Persistent keys generated in the Stitch Settings page.
OAuth: A browser-based authentication flow required by specific AI clients that do not support manual key entry, or for environments where storing persistent secrets on disk is restricted.
When to use which
In most cases, API Keys are the easiest approach. They are the fastest way to get your tool connected. However, OAuth is worth the extra minute of setup in specific situations.

Scenario	Use API Keys if…	Use OAuth if…
Client Support	Your tool (e.g., Cursor, Antigravity, or the Gemini CLI) accepts an API key in a config file or environment variable.	Your tool (e.g., web-based tools) requires a “Sign In” flow and doesn’t provide a way to manually input a key.
Storage Policy	You are on a private machine where saving a secret key in a local .json or .env file is standard practice.	You are in a “Zero-Trust” or ephemeral environment where saving persistent secrets to the hard drive is blocked or risky.
Revocation	You are comfortable manually deleting a key from the Stitch Settings page and then finding/removing it from your local files.	You want the ability to “Log Out” and instantly invalidate the tool’s access via the Stitch Settings page without hunting for local files.
Session Logic	You want a connection that stays active indefinitely until you manually change it.	You prefer a session-based connection that can be set to expire or require a re-approval after a period of inactivity.
API Key Setup
Go to your Stitch Settings page.
Scroll to the API Keys section
Click on “Create API Key” to generate a new API key.
Copy the API key and save it in a secure location.

Storing API Keys
Never store your API key in a place where it can be exposed to the public. Never commit your API key to a public repository. Don’t include your API key in client-side code that can be viewed by others.

MCP Client Setup
Gemini CLI
Install the Stitch extension for the Gemini CLI.

Terminal window
gemini extensions install https://github.com/gemini-cli-extensions/stitch

Cursor
Create a .cursor/mcp.json file with the following entry:

{
  "mcpServers": {
    "stitch": {
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "YOUR-API-KEY"
      }
    }
  }
}

Antigravity
In the Agent Panel, click the three dots in the top right and select MCP Servers. Click, Manage MCP Servers. Select “View raw config” and add the following entry:

{
  "mcpServers": {
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "YOUR-API-KEY"
      }
    }
  }
}

VSCode
Open the Command Palette (Cmd+Shift+P) and type “MCP: Add Server”. Select “Add MCP Server”. Select HTTP to add a remote MCP server. Enter the Stitch MCP URL, https://stitch.googleapis.com/mcp. Set the name to “stitch” and confirm.

Then modify the mcp.json file to add the API key:

{
  "servers": {
    "stitch": {
      "url": "https://stitch.googleapis.com/mcp",
      "type": "http",
      "headers": {
        "Accept": "application/json",
        "X-Goog-Api-Key": "YOUR-API-KEY"
      }
    }
  }
}

Claude Code
Use the claude mcp command to authenticate and add the following entry:

Terminal window
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: api-key" -s user

OAuth Setup
We need to generate two secrets to allow your MCP Client to talk to Stitch:

Project ID: The container for your work.
Access Token: The short lived key for to verify authentication for the project.
1. Install the Google Cloud SDK
Stitch relies on the gcloud CLI for secure authentication. If you don’t have it, you can install it globally through this quickstart, or you can install it as a standalone like the instructions below.

Standalone
Terminal window
# Download and install (simplified for standard environments)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Set local configuration to avoid prompts
export CLOUDSDK_CORE_DISABLE_PROMPTS=1

Homebrew
Terminal window
brew install --cask google-cloud-sdk

2. Double-Layer Authentication
You need to log in twice. Once as You (the user), and once as the Application (your local code/MCP client).

Terminal window
# 1. User Login (Opens Browser)
gcloud auth login

# 2. Application Default Credentials (ADC) Login
# This allows the MCP server to "impersonate" you securely.
gcloud auth application-default login

3. Configure the Project & Permissions
Select your working project and enable the Stitch API. You must also grant your user permission to consume services.

Terminal window
# Replace [YOUR_PROJECT_ID] with your actual Google Cloud Project ID
PROJECT_ID="[YOUR_PROJECT_ID]"

gcloud config set project "$PROJECT_ID"

# Enable the Stitch API
gcloud beta services mcp enable stitch.googleapis.com --project="$PROJECT_ID"

# Grant Service Usage Consumer role
USER_EMAIL=$(gcloud config get-value account)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:$USER_EMAIL" \
    --role="roles/serviceusage.serviceUsageConsumer" \
    --condition=None

4. Generate the Secrets (.env)
Finally, we generate the Access Token and save it to a .env file.

This overwrites any existing .env file

Terminal window
# Print the token
TOKEN=$(gcloud auth application-default print-access-token)

# Note: This overwrites any existing .env file
echo "GOOGLE_CLOUD_PROJECT=$PROJECT_ID" > .env
echo "STITCH_ACCESS_TOKEN=$TOKEN" >> .env

echo "Secrets generated in .env"

5. Keeping it Fresh
Note: Access Tokens are temporary (usually lasting 1 hour). When your MCP client stops responding or says “Unauthenticated,” you need to:

Re-run the commands in Step 4 to update your .env file
Copy the new STITCH_ACCESS_TOKEN value from .env into your MCP client config file
Most MCP clients don’t automatically read from .env files, so you’ll need to manually update the token in your config file each time it expires.

Setting up your MCP Client
Copy the values from your .env file into your MCP client configuration. Replace the placeholders below with the actual values from your .env file:

<YOUR_PROJECT_ID> → Value of GOOGLE_CLOUD_PROJECT from .env
<YOUR_ACCESS_TOKEN> → Value of STITCH_ACCESS_TOKEN from .env
[!IMPORTANT] You will need to manually update the Authorization header in your config file every hour when the access token expires. See Step 5 above for the refresh workflow.

Cursor
Create a .cursor/mcp.json file with the following entry:

{
  "mcpServers": {
    "stitch": {
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_ACCESS_TOKEN>",
        "X-Goog-User-Project": "<YOUR_PROJECT_ID>"
      }
    }
  }
}

Antigravity
In the Agent Panel, click the three dots in the top right and select MCP Servers. Click Manage MCP Servers. Select “View raw config” and add the following entry:

{
  "mcpServers": {
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_ACCESS_TOKEN>",
        "X-Goog-User-Project": "<YOUR_PROJECT_ID>"
      }
    }
  }
}

VSCode
Open the Command Palette (Cmd+Shift+P) and type “MCP: Add Server”. Select “Add MCP Server”. Select HTTP to add a remote MCP server. Enter the Stitch MCP URL, https://stitch.googleapis.com/mcp. Set the name to “stitch” and confirm.

Then modify the mcp.json file to add the headers:

{
  "servers": {
    "stitch": {
      "url": "https://stitch.googleapis.com/mcp",
      "type": "http",
      "headers": {
        "Accept": "application/json",
        "Authorization": "Bearer <YOUR_ACCESS_TOKEN>",
        "X-Goog-User-Project": "<YOUR_PROJECT_ID>"
      }
    }
  }
}

Claude Code
Use the claude mcp command to add the server:

Terminal window
claude mcp add stitch \
  --transport http https://stitch.googleapis.com/mcp \
  --header "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  --header "X-Goog-User-Project: <YOUR_PROJECT_ID>" \
  -s user

# -s user: saves to $HOME/.claude.json
# -s project: saves to ./.mcp.json

Gemini CLI
Install the Stitch extension for the Gemini CLI:

Terminal window
gemini extensions install https://github.com/gemini-cli-extensions/stitch

Available Tools
Once authenticated, your AI assistant will have access to the following tools to manage your Stitch workflow. See the Reference for full schemas and details.

Project Management
create_project: Creates a new container for your UI work.
title (string): The display name of the project.
get_project: Retrieves specific details for a single project.
name (string): The resource name of the project.
list_projects: Retrieves a list of all your active designs.
filter (string): Filters by owned or shared projects.
Screen Management
list_screens: Fetches all screens within a specific project.
projectId (string): The ID of the project to inspect.
get_screen: Retrieves specific details for a single screen.
name (string): The resource name of the screen.
AI Generation
generate_screen_from_text: Creates a new design from a text prompt.
projectId (string): The ID of the project.
prompt (string): The text prompt to generate a design from.
modelId (string): The model to use (GEMINI_3_FLASH or GEMINI_3_1_PRO).
edit_screens: Edits existing screens using a text prompt.
projectId (string): The ID of the project.
selectedScreenIds (string[]): The screen IDs to edit.
prompt (string): The edit instruction.
generate_variants: Generates design variants of existing screens.
projectId (string): The ID of the project.
selectedScreenIds (string[]): The screen IDs to generate variants for.
prompt (string): Text guiding variant generation.
variantOptions (object): Variant configuration (count, creative range, aspects).
Design Systems
create_design_system: Creates a new design system with foundational design tokens.
designSystem (object): The design system configuration (display name, theme).
projectId (string): Optional. The project to associate the design system with.
update_design_system: Updates an existing design system.
name (string): The resource name of the design system asset.
projectId (string): The project ID.
designSystem (object): The updated design system content.
list_design_systems: Lists all design systems for a project.
projectId (string): Optional. The project ID to list design systems for.
apply_design_system: Applies a design system to one or more screens.
projectId (string): The project ID.
selectedScreenInstances (array): Screen instances to update (from get_project).
assetId (string): The design system asset ID (from list_design_systems).

MCP

Getting Started
Get up and running and learn a few tips and tricks along the way.

The Stitch MCP takes the power of generating designs from within the Stitch editor and right into your IDE, CLI, or whatever AI tool of choice. You can convert your designs right into your codebase and generate new screens. This gives you programmable and automatable control with Stitch.

Before we begin
Authentication
Before anything else, you’ll need to authenticate with the Stitch MCP. This guide assumes you’ve already authenticated with the Stitch MCP. Check out our Setup and Authentication Guide to get started.

What coding agent to use?
You can use any coding agent of your choice. The Stitch MCP server integrates into coding agents with support for remote HTTP MCP servers.

What we’re building
A Stitch to React component system. Write a prompt and get a well structured set of React components from your Stitch design.

Prompting Stitch
Write a prompt asking to see your Stitch Projects and each screen within that project.

PROMPT

Action
Show me my Stitch projects.
Format
List out each screen under each project and its screen id.
You’ll see a response that looks something like below, although it will vary across tools and model choice.

Terminal window
1. Raffinato Coffee Store App
Created: Jan 14, 2026 • Desktop • Light Mode • Private

Screens (3):

- Home Menu
- Full Menu
- Checkout

Each Stitch Project can contain a series of screens. These screens are what contain the code and the images of your design.

Prompting for fun
The magic of MCP tools is the integration of contextual data retrieval with AI model intelligence. You can ask for understanding of your Stitch projects or instruct the agent to generate new designs and code based upon context on your local machine. Or, you can just ask it a fun question.

PROMPT

For fun
Tell me what my Stitch Projects say about me as a developer.
This one is a lot of fun. If you run it and want to share, give us a shout on Twitter / X. Alright, back to real work.

Prompting for code
Once the agent knows what project or screen you want to work with, you can access the code or the generated image.

PROMPT

Project + Screen
Download the HTML code for the Full Menu screen in the Raffinato project.
Tool Guidance
Use a utility such as curl -L
Action
Create a file named ./tmp/${screen-name}.html with the HTML code.
The HTML file is a complete <html> document with a Tailwind CSS configuration specific to that design.

HTML to other UI frameworks
LLMs excel at converting HTML to many different UI systems. This HTML file serves as a foundation. By prompting an agent not only can you convert HTML to React, Vue, or Handlebars but even UI frameworks outside of the web platform, such as Flutter and Jetpack Compose.

Prompting for images
Just like above, you can ask an agent for the image of your Stitch screen.

PROMPT

Project + Screen
Download the image for the Full Menu screen in the Raffinato project.
Tool Guidance
Use a utility such as curl -L
Action
Create a file named ./tmp/${screen-name}.png containing the image.
Now you’ll have a local copy of your image. However, not much has happened yet. So let’s move this quickly along and convert an entire screen to React components.

Using Agent Skills with Stitch MCP
Many coding agents support the Agent Skill Open Standard. A skill encapsulates an instruction based prompt with a set of resources such as specific tool calls from a MCP server. This skill paradigm is a great fit for generating a React component system from the Stitch MCP.

Creating the React component system
The add-skill library lets you install agent skills to the most commonly used coding agents right from a GitHub URL.

Terminal window
npx add-skill google-labs-code/stitch-skills --skill react:components --global

This skill provides the details to an agent to understand what Stitch tools to use, steps to run, and best practices for separating React components. If you want to check out exactly what it does, see our Stitch Agent Skills GitHub repo.

After it’s installed, you can write a prompt to trigger this skill and let it do the work.

PROMPT

Skill Trigger
Convert the Landing Page screen in the Podcast Project.

Learn

What is DESIGN.md?
A design system document that AI agents read to generate consistent UI across your project.


Every project has a visual identity: colors, fonts, spacing, component styles. Traditionally, this lives in a Figma file, a brand PDF, or a designer’s head. None of these are readable by an AI agent.

DESIGN.md changes that. It’s a plain-text design system document that both humans and agents can read, edit, and enforce. Think of it as the design counterpart to AGENTS.md:

File	Who reads it	What it defines
README.md	Humans	What the project is
AGENTS.md	Coding agents	How to build the project
DESIGN.md	Design agents	How the project should look and feel
What it gives you
When a design agent like Stitch reads your DESIGN.md, every screen it generates follows the same visual rules: your color palette, your typography, your component patterns. Without it, each screen stands alone. With it, they look like they belong together.

DESIGN.md is a living artifact, not a static config file. It evolves as your design evolves. The agent generates it, you refine it, and it’s re-applied to screens as you iterate.

How they’re created
There are three paths to a DESIGN.md, from effortless to precise.

Creating a design system from a prompt in Stitch
Let the agent generate it
Describe the vibe. The agent translates your aesthetic intent into tokens and guidelines.

PROMPT

A playful coffee shop ordering app with warm colors, rounded corners, and a friendly feel

Stitch generates a complete design system (colors, typography, spacing, component styles) and summarizes it as a DESIGN.md.

Derive from branding
If you already have a brand, provide a URL or image. The agent extracts your palette, typography, and style patterns to build the DESIGN.md from what already exists.

Importing a design system from a website URL in Stitch
Write it by hand
Advanced users can author a DESIGN.md directly, encoding exact design preferences. Every section is just markdown. No special syntax, no tooling required.

Example
Below is a minimal DESIGN.md for a dark-themed productivity app:

# Design System

## Overview
A focused, minimal dark interface for a developer productivity tool.
Clean lines, low visual noise, high information density.

## Colors
- **Primary** (#2665fd): CTAs, active states, key interactive elements
- **Secondary** (#475569): Supporting UI, chips, secondary actions
- **Surface** (#0b1326): Page backgrounds
- **On-surface** (#dae2fd): Primary text on dark backgrounds
- **Error** (#ffb4ab): Validation errors, destructive actions

## Typography
- **Headlines**: Inter, semi-bold
- **Body**: Inter, regular, 14–16px
- **Labels**: Inter, medium, 12px, uppercase for section headers

## Components
- **Buttons**: Rounded (8px), primary uses brand blue fill
- **Inputs**: 1px border, subtle surface-variant background
- **Cards**: No elevation, relies on border and background contrast

## Do's and Don'ts
- Do use the primary color sparingly, only for the most important action
- Don't mix rounded and sharp corners in the same view
- Do maintain 4:1 contrast ratio for all text

This is what the agent reads when generating your next screen. For the complete format specification, see The format.

Learn

The DESIGN.md format
The sections, tokens, and structure of a DESIGN.md file.

A DESIGN.md file has two faces. The markdown is what you read and edit, a human-friendly summary of your design system. Underneath, Stitch maintains structured tokens, the precise values it uses to enforce consistency during generation.

This page documents what goes in the markdown.

Sections
Every DESIGN.md follows the same structure. Sections can be omitted if they’re not relevant to your project, but the order should be preserved.

Overview
A holistic description of the design’s look and feel. This is where you describe the personality: is it playful or professional? Dense or spacious? This section guides the agent’s high-level decisions when no specific token applies.

## Overview
A calm, professional interface for a healthcare scheduling platform.
Accessibility-first design with high contrast and generous touch targets.

Colors
The primary, secondary, tertiary, and neutral palettes. Each color should include its hex value and its role describing what the agent should use it for.

## Colors
- **Primary** (#2665fd): CTAs, active states, key interactive elements
- **Secondary** (#6074b9): Supporting actions, chips, toggle states
- **Tertiary** (#bd3800): Accent highlights, badges, decorative elements
- **Neutral** (#757681): Backgrounds, surfaces, non-chromatic UI

The agent also generates named colors from these base values: surface, on-primary, error, outline, and dozens more. These follow Material color role conventions and are available in the structured tokens.

Typography
The font families and their roles across the typographic hierarchy: display, headline, title, body, and label levels.

## Typography
- **Headline Font**: Inter
- **Body Font**: Inter
- **Label Font**: Inter

Headlines use semi-bold weight. Body text uses regular weight at 14–16px.
Labels use medium weight at 12px with uppercase for section headers.

The relationship between headline and body fonts matters. Using the same family (like Inter) conveys uniformity. Mixing families (e.g., a serif headline with a sans-serif body) creates visual contrast the agent will intentionally carry through.

Elevation
How the design conveys depth and hierarchy. Some designs use shadows; others stay flat.

## Elevation
This design uses no shadows. Depth is conveyed through border contrast
and surface color variation (surface, surface-container, surface-bright).

If elevation is used, specify the shadow properties (spread, blur, color) and which components should be elevated.

Components
Style guidance for component atoms. Focus on the components most relevant to your application.

Component	What to specify
Buttons	Variants (primary, secondary, tertiary), sizing, padding, corner radius, states
Chips	Selection, filter, and action variants
Lists	Item styling, dividers, leading/trailing elements
Inputs	Text fields, text areas, labels, helper text, error states
Checkboxes	Checked, unchecked, indeterminate states
Radio buttons	Selected and unselected states
Tooltips	Positioning, colors, timing
## Components
- **Buttons**: Rounded (8px), primary uses brand blue fill, secondary uses outline
- **Inputs**: 1px border, surface-variant background, 12px padding
- **Cards**: No elevation, 1px outline border, 12px corner radius

You can suggest components based on your project’s context. For example, a navigation bar for a mobile app or a data table for a dashboard.

Do’s and Don’ts
Practical guidelines and common pitfalls. These act as guardrails when creating designs.

## Do's and Don'ts
- Do use the primary color only for the single most important action per screen
- Don't mix rounded and sharp corners in the same view
- Do maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Don't use more than two font weights on a single screen

The dual representation
The markdown you see is one side. Stitch also stores a structured version of the same information: hex values, font enums, spacing scales, and the full named color palette. When you edit the markdown, Stitch reconciles both representations.

This means you can be approximate in the markdown (“warm colors, rounded feel”) and Stitch will translate that into precise tokens. Or you can be exact (#2665fd, 8px radius) and Stitch will respect those values literally.

Both representations describe the same design system. The markdown is for collaboration. The tokens are for enforcement.
Learn

View, edit, and export
Work with your design system in the Stitch UI. View tokens, tweak values, and export with your project.

View the design system
Open the Design System panel to see the active design system for any screen. The panel shows the resolved tokens: colors, fonts, roundedness, spacing, and component patterns.

If the project has multiple design systems, the panel displays the one applied to the currently selected screen.

Set a default design system
To apply a design system to all future screens in a project, select it as the project default. New screens generated after this point will automatically inherit its tokens.

Existing screens are not retroactively updated. To bring them into alignment, apply the design system to them individually.

Edit via the Design System panel
The Design System panel supports direct edits to the active design system. Changes you make here update both the structured tokens and the DESIGN.md summary.

Editable properties include:

Color palette: primary, secondary, tertiary, and neutral base colors
Typography: headline, body, and label font families
Roundedness: corner radius scale
For more granular changes (component guidelines, do’s and don’ts, or the overview narrative), edit the DESIGN.md markdown directly.

Export with your project
When you export a project, the DESIGN.md file is included in the zip alongside the generated screens. This gives downstream consumers (developers, other design tools, or other agents) a portable record of the design system.

The exported DESIGN.md is a standalone document. It doesn’t depend on Stitch to be useful.
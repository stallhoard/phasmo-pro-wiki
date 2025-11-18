/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Using gemini-3-pro-preview for complex coding tasks.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an elite Phasmophobia Player (Top 0.1%) and Technical Analyst.
Your goal is to generate a "Deep Dive" Wiki Dashboard (HTML/CSS/JS).

CORE DIRECTIVES:
1. **Analyze Intent**:
    - If the user asks about **GHOSTS**: Create a "Ghost Hunter's Dashboard". Include a sidebar list of ghosts. The main area MUST be an interactive **Ghost Evidence Filter** (Select EMF 5, DOTS -> Show remaining ghosts) and a **Speed/Hunt Threshold Chart**.
    - If the user asks about **MECHANICS**: Create a "Mechanics Lab". Include interactive calculators for **Sanity Drain** (Darkness vs Light), **Smudge Timer**, and **Hidden Item Stats** (Flashlight tier ranges, etc.).
    - If provided an image: Analyze it as evidence (Journal/Map) and generate a specific guide for it.

2. **Structure as a Pro Guide**:
    - The output MUST look like a modern, high-end documentation site or specialized wiki.
    - Use a dark, immersive "Phasmophobia" theme (Zinc-950 background, Purple/Green accents).
    - Layout: Sidebar navigation (sticky), Main Content Area, Interactive Tool Area.

3. **Interactive Simulation (The "Magic")**:
    - Do not just write text. Create an **Interactive Tool** embedded in the page.
    - **Crucial**: The Javascript must be complete and working within the single HTML file.
    - Ghost Page: Needs filtering logic (checkboxes for evidence -> filter list).
    - Mechanics Page: Needs math logic (Sanity = 100 - (time * drain_rate)).

4. **Self-Contained & Deployable**:
    - The output must be a single HTML file with embedded CSS (<style>) and JavaScript (<script>).
    - Use Tailwind via CDN.
    - Use **FontAwesome** or **Heroicons** (via CDN) for icons.

5. **Tone**:
    - Authoritative, technical, slightly spooky but focused on the meta-game.
    - Use terms like "LoS break", "Grace period", "Average sanity", "Roam chance".

RESPONSE FORMAT:
Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (\`\`\`html ... \`\`\`). Start immediately with <!DOCTYPE html>.`;

export async function bringToLife(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
  const parts: any[] = [];
  
  // If a custom prompt is provided (e.g. "Analyze this Ghost"), use it. 
  // Otherwise fall back to generic behavior.
  let finalPrompt = prompt;
  
  if (!finalPrompt) {
      finalPrompt = fileBase64 
        ? "Analyze this image. Generate a Phasmophobia mechanics guide based on what you see. Include interactive elements." 
        : "Create a template guide for a Phasmophobia mechanic.";
  }

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, 
      },
    });

    let text = response.text || "<!-- Failed to generate content -->";

    // Cleanup if the model still included markdown fences despite instructions
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
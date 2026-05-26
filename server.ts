import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Security Assistant API
  app.post("/api/ask", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      const systemInstruction = `You are "CyberSOC Nexus", an advanced Enterprise AI Threat Investigation Assistant and Incident Responder for a top-tier SOC.
Your primary role is to assist human analysts with threat investigation, forensic analysis, log correlation, and PCAP analysis.

When analyzing packets, IP addresses, or uploaded files (simulated PCAPs/logs), you MUST:
1. Identify potential attack patterns and Indicators of Compromise (IOCs).
2. Classify threats (e.g. DDoS, Brute-force, Exfiltration) and map them to MITRE ATT&CK tactics/techniques where applicable.
3. Assess the threat severity (Critical, High, Medium, Low) and provide a confidence score.
4. Explain the attack briefly (What it is, how it works, potential impact).
5. Recommend prioritized, actionable mitigation steps (e.g. "Block IP on Firewall", "Isolate Endpoint").

If the user asks to "Generate incident report" or similar, output a professional Incident Report format with:
- Executive Summary
- Attack Overview (Severity, MITRE mapping)
- Timeline of Events
- Indicators of Compromise (IOCs)
- Affected Assets
- Mitigation Recommendations & Next Steps

If asked a basic educational question (e.g. 'How does TCP work?'), provide a beginner-friendly explanation suitable for junior analysts.
Be professional, technical, authoritative, yet clear. Use Markdown extensively for structure (headers, bold tags, code blocks for IPs/ports). Do not invent fake protocols.`;

      let response;
      let retries = 0;
      const maxRetries = 5;
      
      while (retries <= maxRetries) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.3,
            }
          });
          break; // Success
        } catch (error: any) {
          const isUnavailable = error.message?.includes('503') || error.message?.includes('UNAVAILABLE') || error.message?.toLowerCase().includes('high demand');
          if (isUnavailable && retries < maxRetries) {
            retries++;
            const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
            console.log(`Model busy, retrying in ${Math.round(delay)}ms... (Attempt ${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }

      res.json({ text: response?.text || "No response generated." });
    } catch (error: any) {
      const isUnavailable = error.message?.includes('503') || error.message?.includes('UNAVAILABLE') || error.message?.toLowerCase().includes('high demand');
      if (!isUnavailable) {
         console.error("AI Error:", error.message || error);
      }
      res.status(isUnavailable ? 429 : 500).json({ 
        error: isUnavailable ? 'The AI model is currently experiencing high demand. Please try again later.' : (error.message || "Failed to generate AI response") 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

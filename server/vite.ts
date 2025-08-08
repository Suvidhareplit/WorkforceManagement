import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// This is a simplified version for local development without Vite
export async function setupVite(app: Express, server: Server) {
  log('Development mode: Vite integration disabled for local backend');
  // No Vite integration in local development mode
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "public");

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
      if (fs.existsSync(path.resolve(distPath, "index.html"))) {
        res.sendFile(path.resolve(distPath, "index.html"));
      } else {
        res.status(200).send('API Server Running');
      }
    });
  } else {
    log('No static files to serve');
    // Simple response for API-only mode
    app.use("/", (_req, res) => {
      res.status(200).send('API Server Running');
    });
  }
}

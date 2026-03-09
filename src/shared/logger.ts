import { debug } from "debug"

// Determine dev mode at module load time - must be done before any loggers are created
const devMode: boolean = process.env.NODE_ENV === "development" || !("update_url" in chrome.runtime.getManifest())

// Enable debug mode for all mbfc namespaces BEFORE any loggers are created
// This ensures consistent behavior: debug module is used in both dev and production
// In dev mode, all mbfc:* namespaces are enabled; in production, they are disabled by default
if (devMode) {
  debug.enable("mbfc:*")
}

/**
 * Check if the extension is running in development mode
 * @returns true if in development mode, false otherwise
 */
export const isDevMode = (): boolean => devMode

/**
 * Create a logger for a specific namespace
 * Uses the debug module consistently in both dev and production environments
 * @param namespace - The namespace for the logger (e.g., "mbfc:background")
 * @returns A debug logger function
 */
export const logger = (namespace: string): debug.Debugger => debug(namespace)

// Log that debug mode is enabled (after exports so loggers can be created)
if (devMode) {
  const log = logger("mbfc:logger")
  log("Debug mode enabled for mbfc:*")
}

import { MockMate } from "./mock";
import { setupMockUpdateRoute } from "./config";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Function to load the OpenAPI spec from either JSON or YAML
function loadApiSpec(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".yaml" || ext === ".yml") {
      // Parse YAML spec
      return yaml.load(fs.readFileSync(filePath, "utf-8"));
    } else if (ext === ".json") {
      // Parse JSON spec
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } else {
      throw new Error(
        "Unsupported file format. Please provide a JSON or YAML OpenAPI spec.",
      );
    }
  } catch (error) {
    console.error("Error loading OpenAPI spec:", error.message);
    process.exit(1);
  }
}

export function getMockMate(apiSpecPath: string): MockMate {

  // Load the API spec
  const apiSpec = loadApiSpec(apiSpecPath);

  // Initialize MockMate with the API spec
  const mockMate = new MockMate(apiSpec);

  // Setup the mock update route for customization
  setupMockUpdateRoute(mockMate);

  return mockMate;
}

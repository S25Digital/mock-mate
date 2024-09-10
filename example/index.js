const { getMockMate } =require("../dist");

// Path to your OpenAPI spec file
const filePath = "../example/api.yml";

// Initialize the Mock Mate instance
const mockMate = getMockMate(filePath);

// Start the mock server
mockMate.start();

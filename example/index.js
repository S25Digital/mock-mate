const path = require("path");
const { getMockMate } =require("../dist");

// Path to your OpenAPI spec file
const filePath = path.join(__dirname, "/api.yml");

// Initialize the Mock Mate instance
const mockMate = getMockMate(filePath);

mockMate.updateMockConfig(
  '/Consent',
  'post',
  409,
  { code: 409, msg: 'Conflict: Consent already exists' },
  [{ field: 'txnid', value: 'conflict-id' }]
);

// Start the mock server
mockMate.start();

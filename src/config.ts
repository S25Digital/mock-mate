import { MockMate } from './mock';

// Expose an endpoint to allow updating the mock configuration
export function setupMockUpdateRoute(mockMate: MockMate) {
  mockMate.app.post('/mock/update', (req, res) => {
    const { path, method, statusCode, responseBody } = req.body;

    if (!path || !method || !statusCode || !responseBody) {
      return res.status(400).json({ msg: 'Invalid update request, missing required fields' });
    }

    mockMate.updateMockConfig(path, method, statusCode, responseBody);
    res.status(200).json({ msg: 'Mock updated successfully' });
  });
}

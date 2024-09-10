# Mock Mate

**Mock Mate** is a powerful and flexible API mocking tool that generates API mocks from OpenAPI specifications (supports both YAML and JSON formats). It allows developers to easily simulate API endpoints for testing and development purposes. With built-in customization options, users can update mock responses dynamically without altering the mock setup.

## Features

- **Automatic API Mock Generation**: Automatically generate API mocks from OpenAPI specs (YAML/JSON).
- **Supports Multiple Formats**: Works with both YAML and JSON OpenAPI specs.
- **Dynamic Response Updates**: Customize API responses on the fly via an update endpoint.
- **Flexible and Extensible**: Easily mock any endpoint and customize default responses for your tests.
- **Ideal for Development and Testing**: Simulate real API behavior in local environments or CI pipelines.

## Installation

To install **Mock Mate**, first clone the repository or add it as a dependency in your project.

### Using npm

```bash
npm install @s25digital/mock-mate
```

## Usage

### 1. Add an OpenAPI Spec

**Mock Mate** can use either YAML or JSON OpenAPI specs to generate mocks. Place your OpenAPI spec file in your project.

Example OpenAPI spec (YAML):

```yaml
openapi: 3.0.0
info:
  title: Mock Mate API
  version: 1.0.0
paths:
  /Consent:
    post:
      summary: Create a consent
      responses:
        '200':
          description: Consent created
          content:
            application/json:
              example:
                ver: '2.0.0'
                txnid: '123456789'
                timestamp: '2023-06-26T11:39:57.153Z'
                ConsentHandle: '654024c8-29c8-11e8-8868-0289437bf331'
        '400':
          description: Bad Request
          content:
            application/json:
              example:
                code: 400
                msg: 'Bad Request'
```

### 2. Initialize Mock Mate

In your project, import **Mock Mate**, provide your OpenAPI spec file, and start the server.

```typescript
import { MockMate } from '@s25digital/mock-mate';
import { setupMockUpdateRoute } from '@s25digital/mock-mate/config';

// Load your OpenAPI spec file
const apiSpec = /* Load your OpenAPI spec here (YAML or JSON) */;

// Initialize Mock Mate
const mockMate = new MockMate(apiSpec);

// Optionally set up dynamic route updates
setupMockUpdateRoute(mockMate);

// Start the mock server
mockMate.start();
```

### 3. Run Mock Mate

To run the mock server, simply execute your code. Mock Mate will automatically generate the API routes and responses based on your OpenAPI spec.

```bash
node dist/index.js
```

### 4. Dynamic Mock Updates

Mock Mate provides a `/mock/update` endpoint that allows you to dynamically modify the default responses during runtime.

To update a mock response for a specific route:

```bash
curl -X POST http://localhost:3000/mock/update -H "Content-Type: application/json" -d '{
  "path": "/Consent",
  "method": "POST",
  "statusCode": 409,
  "responseBody": {
    "code": 409,
    "msg": "Conflict: Consent already exists"
  }
}'
```

This will update the response for the `POST /Consent` endpoint to return a `409 Conflict` status.

## Docker Support

Mock Mate also includes Docker support for easy deployment in testing environments. You can build the Docker image and run the mock server as a container.

### 1. Build the Docker Image

```bash
docker build -t mock-mate:latest .
```

### 2. Run the Docker Container

```bash
docker run -d -p 3000:3000 mock-mate:latest
```

The mock server will now be available on `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you'd like to contribute to Mock Mate.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
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

### 2. Initialize and Start Mock Mate

In your project, you can use the `getMockMate` function to load the OpenAPI spec file and initialize the mock server.

```typescript
import { getMockMate } from 'mock-mate';

// Path to your OpenAPI spec file
const filePath = './path-to-your-openapi-spec.yaml';

// Initialize the Mock Mate instance
const mockMate = getMockMate(filePath);

// Start the mock server
mockMate.start();
```

This will start the mock server with the API paths and endpoints defined in the OpenAPI spec.

### 3. Dynamic Mock Updates

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

## Loading YAML and JSON OpenAPI Specs

The updated `index.ts` provides a function to automatically load the API spec from either a YAML or JSON file, based on its extension.

- **YAML Spec**: If the file has a `.yaml` or `.yml` extension, it will be parsed as YAML.
- **JSON Spec**: If the file has a `.json` extension, it will be parsed as JSON.

```typescript
import { getMockMate } from 'mock-mate';

// Load the API spec and initialize Mock Mate
const mockMate = getMockMate('./path-to-your-openapi-spec.yaml');

// Start the mock server
mockMate.start();
```

### 4. Docker Support

Mock Mate also includes Docker support for easy deployment in testing environments. You can build the Docker image and run the mock server as a container.

#### 1. Build the Docker Image

```bash
docker build -t mock-mate:latest .
```

#### 2. Run the Docker Container

```bash
docker run -d -p 3000:3000 mock-mate:latest
```

The mock server will now be available on `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you'd like to contribute to Mock Mate.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
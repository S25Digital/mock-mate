import express, { Request, Response, Application } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import bodyParser from 'body-parser';

interface MockResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

interface Condition {
  field: string;
  value: string | number;
}

interface ConditionalResponse extends MockResponse {
  conditions?: Condition[]; // Conditions to match
}

type MockConfig = {
  [key: string]: ConditionalResponse[]; // Store multiple conditional responses per endpoint
};

export class MockMate {
  private app: Application;
  private defaultConfig: MockConfig = {}; // Store default responses
  private dynamicConfig: MockConfig = {}; // Store dynamically updated responses

  constructor(private apiSpec: OpenAPIV3.Document, private port: number = 3000) {
    this.app = express();
    this.app.use(bodyParser.json());
    this.initializeMockEndpoints();
  }

  // Initialize the mock endpoints based on the OpenAPI spec
  private initializeMockEndpoints(): void {
    const paths = this.apiSpec.paths;

    if (!paths) {
      throw new Error('No paths defined in OpenAPI spec');
    }

    Object.keys(paths).forEach((path) => {
      const methods = paths[path] as OpenAPIV3.PathItemObject;
      Object.keys(methods).forEach((method) => {
        if (this.isHttpMethod(method)) {
          this.setupEndpoint(path, method as keyof OpenAPIV3.PathItemObject);
        }
      });
    });
  }

  // Helper function to check if the method is a valid HTTP method in OpenAPI spec
  private isHttpMethod(method: string): method is keyof OpenAPIV3.PathItemObject {
    return ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method);
  }

  // Setup each endpoint dynamically
  private setupEndpoint(path: string, method: keyof OpenAPIV3.PathItemObject): void {
    const endpointKey = `${method.toUpperCase()} ${path}`;

    // Setup default response for the endpoint
    this.defaultConfig[endpointKey] = this.generateDefaultResponse(path, method);

    // Register the route on the express app
    this.app[method.toLowerCase() as keyof Application](path, (req: Request, res: Response) => {
      this.handleRequest(req, res, endpointKey);
    });
  }

  // Generate default response based on OpenAPI spec
  private generateDefaultResponse(path: string, method: keyof OpenAPIV3.PathItemObject): ConditionalResponse[] {
    const methodSpec = this.apiSpec.paths[path]?.[method];

    if (!methodSpec) {
      throw new Error(`Method ${method} not defined for path ${path}`);
    }

    const responses = (methodSpec as OpenAPIV3.OperationObject).responses;

    if (!responses) {
      throw new Error(`No responses defined for path ${path} and method ${method}`);
    }

    const statusCode = parseInt(Object.keys(responses)[0], 10);
    const response = responses[statusCode] as OpenAPIV3.ResponseObject;

    return [
      {
        statusCode,
        body: response?.content?.['application/json']?.example || {},
      },
    ];
  }

  // Handle incoming requests and find the appropriate response based on the dynamic conditions
  private handleRequest(req: Request, res: Response, endpointKey: string): void {
    const config = this.dynamicConfig[endpointKey] || this.defaultConfig[endpointKey];
    const matchedResponse = this.findMatchingResponse(req, config);

    if (matchedResponse) {
      res.status(matchedResponse.statusCode).json(matchedResponse.body);
    } else {
      res.status(404).json({ message: 'No matching response found' });
    }
  }

  // Find the matching response based on the request body and defined conditions
  private findMatchingResponse(req: Request, responses: ConditionalResponse[]): ConditionalResponse | undefined {
    return responses.find((response) => {
      if (!response.conditions || response.conditions.length === 0) {
        return true; // No conditions mean this is the default response
      }

      return response.conditions.every((condition) => req.body[condition.field] === condition.value);
    });
  }

  // Method to allow updates to dynamic configuration with conditions
  public updateMockConfig(
    path: string,
    method: keyof OpenAPIV3.PathItemObject,
    statusCode: number,
    responseBody: Record<string, unknown>,
    conditions?: Condition[],
  ): void {
    const endpointKey = `${method.toUpperCase()} ${path}`;
    const newResponse: ConditionalResponse = { statusCode, body: responseBody, conditions };

    if (!this.dynamicConfig[endpointKey]) {
      this.dynamicConfig[endpointKey] = [];
    }

    this.dynamicConfig[endpointKey].push(newResponse);
  }

  // Start the mock server
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Mock Mate server running on port ${this.port}`);
    });
  }
}

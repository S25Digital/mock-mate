import express, { Request, Response, Application } from "express";
import { OpenAPIV3 } from "openapi-types";
import bodyParser from "body-parser";

// Define types for the configuration objects
interface MockResponse {
  statusCode: number;
  body: Record<string, unknown>; // A generic object for the response body
}

type MockConfig = {
  [key: string]: MockResponse;
};

export class MockMate {
  public app: Application;
  private defaultConfig: MockConfig = {}; // Store default responses
  private dynamicConfig: MockConfig = {}; // Store dynamically updated responses

  constructor(
    private apiSpec: OpenAPIV3.Document,
    private port: number = 3000,
  ) {
    this.app = express();
    this.app.use(bodyParser.json());
    this.initializeMockEndpoints();
  }

  // Initialize the mock endpoints based on the OpenAPI spec
  private initializeMockEndpoints(): void {
    const paths = this.apiSpec.paths;

    if (!paths) {
      throw new Error("No paths defined in OpenAPI spec");
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
  private isHttpMethod(
    method: string,
  ): method is keyof OpenAPIV3.PathItemObject {
    return [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
    ].includes(method);
  }

  // Setup each endpoint dynamically
  private setupEndpoint(
    path: string,
    method: keyof OpenAPIV3.PathItemObject,
  ): void {
    const endpointKey = `${method.toUpperCase()} ${path}`;

    // Setup default response for the endpoint
    this.defaultConfig[endpointKey] = this.generateDefaultResponse(
      path,
      method,
    );

    // Register the route on the express app
    this.app[method.toLowerCase() as keyof Application](
      path,
      (req: Request, res: Response) => {
        const response =
          this.dynamicConfig[endpointKey] || this.defaultConfig[endpointKey];
        res.status(response.statusCode).json(response.body);
      },
    );
  }

  // Generate default response based on OpenAPI spec
  private generateDefaultResponse(
    path: string,
    method: keyof OpenAPIV3.PathItemObject,
  ): MockResponse {
    const methodSpec = this.apiSpec.paths[path]?.[method];

    if (!methodSpec) {
      throw new Error(`Method ${method} not defined for path ${path}`);
    }

    const responses = (methodSpec as OpenAPIV3.OperationObject).responses;

    if (!responses) {
      throw new Error(
        `No responses defined for path ${path} and method ${method}`,
      );
    }

    // Select the first response (commonly 200 or an error response)
    const statusCode = parseInt(Object.keys(responses)[0], 10);
    const response = responses[statusCode] as OpenAPIV3.ResponseObject;

    const defaultResponse: MockResponse = {
      statusCode,
      body: response?.content?.["application/json"]?.example || {},
    };

    return defaultResponse;
  }

  // Method to allow updates to dynamic configuration
  public updateMockConfig(
    path: string,
    method: keyof OpenAPIV3.PathItemObject,
    statusCode: number,
    responseBody: Record<string, unknown>,
  ): void {
    const endpointKey = `${method.toUpperCase()} ${path}`;
    this.dynamicConfig[endpointKey] = { statusCode, body: responseBody };
  }

  // Start the mock server
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Mock Mate server running on port ${this.port}`);
    });
  }
}

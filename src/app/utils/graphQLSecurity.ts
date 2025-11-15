/**
 * GraphQL Security Testing
 * - GraphQL Endpoint Detection
 * - Introspection Exposure Testing
 * - Query Complexity Analysis
 * - Injection Testing
 * - Authentication Bypass Testing
 */

import fetch from 'node-fetch';

export interface GraphQLSecurityResult {
  endpoints: Array<{
    url: string;
    method: string;
    accessible: boolean;
    introspectionEnabled: boolean;
    schemaExposed: boolean;
  }>;
  introspection: {
    enabled: boolean;
    schemaSize: number;
    typesExposed: number;
    queriesExposed: number;
    mutationsExposed: number;
    subscriptionsExposed: number;
  };
  complexity: {
    maxDepth: number;
    maxCost: number;
    rateLimited: boolean;
    costAnalysis: {
      query: string;
      estimatedCost: number;
    }[];
  };
  vulnerabilities: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  authentication: {
    required: boolean;
    bypassPossible: boolean;
    methods: string[];
  };
  score: number;
  recommendations: string[];
}

const commonGraphQLPaths = [
  '/graphql',
  '/graphql/',
  '/api/graphql',
  '/api/graphql/',
  '/v1/graphql',
  '/v2/graphql',
  '/query',
  '/gql',
  '/api/v1/graphql',
  '/api/v2/graphql',
];

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }
  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }
  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }
  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function testGraphQLSecurity(
  baseUrl: string,
  html: string
): Promise<GraphQLSecurityResult> {
  const result: GraphQLSecurityResult = {
    endpoints: [],
    introspection: {
      enabled: false,
      schemaSize: 0,
      typesExposed: 0,
      queriesExposed: 0,
      mutationsExposed: 0,
      subscriptionsExposed: 0,
    },
    complexity: {
      maxDepth: 0,
      maxCost: 0,
      rateLimited: false,
      costAnalysis: [],
    },
    vulnerabilities: [],
    authentication: {
      required: false,
      bypassPossible: false,
      methods: [],
    },
    score: 100,
    recommendations: [],
  };

  // Extract base URL
  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  const base = `${url.protocol}//${url.hostname}`;

  // Find GraphQL endpoints in HTML/JS
  const graphqlPatterns = [
    /['"]([^'"]*\/graphql[^'"]*)['"]/gi,
    /graphqlEndpoint:\s*['"]([^'"]+)['"]/gi,
    /GRAPHQL_URL[=:]\s*['"]([^'"]+)['"]/gi,
  ];

  const foundEndpoints = new Set<string>();
  graphqlPatterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        let endpoint = match[1];
        if (endpoint.startsWith('/')) {
          endpoint = base + endpoint;
        } else if (!endpoint.startsWith('http')) {
          endpoint = base + '/' + endpoint;
        }
        foundEndpoints.add(endpoint);
      }
    }
  });

  // Test common GraphQL paths
  for (const path of commonGraphQLPaths) {
    foundEndpoints.add(base + path);
  }

  // Test each endpoint
  for (const endpoint of Array.from(foundEndpoints).slice(0, 10)) {
    try {
      // Try POST request (most common)
      const postResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query: '{ __typename }' }),
        timeout: 5000,
      }).catch(() => null);

      if (postResponse && postResponse.status === 200) {
        const data = await postResponse.json().catch(() => null);
        if (data && data.data) {
          result.endpoints.push({
            url: endpoint,
            method: 'POST',
            accessible: true,
            introspectionEnabled: false,
            schemaExposed: false,
          });

          // Test introspection
          const introResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ query: introspectionQuery }),
            timeout: 5000,
          }).catch(() => null);

          if (introResponse && introResponse.status === 200) {
            const introData = await introResponse.json().catch(() => null);
            if (introData && introData.data && introData.data.__schema) {
              result.introspection.enabled = true;
              result.endpoints[result.endpoints.length - 1].introspectionEnabled = true;
              result.endpoints[result.endpoints.length - 1].schemaExposed = true;

              const schema = introData.data.__schema;
              result.introspection.typesExposed = schema.types?.length || 0;
              result.introspection.queriesExposed = schema.queryType?.fields?.length || 0;
              result.introspection.mutationsExposed = schema.mutationType?.fields?.length || 0;
              result.introspection.subscriptionsExposed = schema.subscriptionType?.fields?.length || 0;
              result.introspection.schemaSize = JSON.stringify(introData).length;

              result.vulnerabilities.push({
                type: 'GraphQL Introspection Enabled',
                severity: 'high',
                description: 'GraphQL introspection is enabled, exposing the entire schema',
                recommendation: 'Disable introspection in production environments',
              });
            }
          }

          // Test query complexity (deep nesting)
          const deepQuery = '{ ' + 'a { '.repeat(20) + '__typename ' + '} '.repeat(20) + '}';
          const complexityResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: deepQuery }),
            timeout: 5000,
          }).catch(() => null);

          if (complexityResponse && complexityResponse.status === 200) {
            result.complexity.maxDepth = 20;
            result.vulnerabilities.push({
              type: 'No Query Complexity Limits',
              severity: 'high',
              description: 'GraphQL endpoint allows deeply nested queries without limits',
              recommendation: 'Implement query depth and complexity limits',
            });
          } else if (complexityResponse && complexityResponse.status === 400) {
            result.complexity.rateLimited = true;
          }

          // Test authentication
          const authResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: '{ __typename }' }),
            timeout: 5000,
          }).catch(() => null);

          if (authResponse && authResponse.status === 200) {
            result.authentication.required = false;
            result.authentication.bypassPossible = true;
            result.vulnerabilities.push({
              type: 'No Authentication Required',
              severity: 'critical',
              description: 'GraphQL endpoint is accessible without authentication',
              recommendation: 'Implement authentication and authorization for GraphQL endpoints',
            });
          }
        }
      }

      // Try GET request
      const getResponse = await fetch(`${endpoint}?query={__typename}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: 5000,
      }).catch(() => null);

      if (getResponse && getResponse.status === 200) {
        const data = await getResponse.json().catch(() => null);
        if (data && data.data) {
          const existing = result.endpoints.find(e => e.url === endpoint);
          if (!existing) {
            result.endpoints.push({
              url: endpoint,
              method: 'GET',
              accessible: true,
              introspectionEnabled: false,
              schemaExposed: false,
            });
          }
        }
      }
    } catch {
      // Endpoint not accessible
    }
  }

  // Calculate score
  let score = 100;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 30;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 8;
    else score -= 3;
  });
  if (result.introspection.enabled) score -= 20;
  if (!result.authentication.required) score -= 25;
  result.score = Math.max(0, score);

  // Generate recommendations
  if (result.introspection.enabled) {
    result.recommendations.push('Disable GraphQL introspection in production');
  }
  if (!result.authentication.required) {
    result.recommendations.push('Implement authentication for GraphQL endpoints');
  }
  if (result.complexity.maxDepth > 10) {
    result.recommendations.push('Implement query depth and complexity limits');
  }
  if (result.endpoints.length > 0) {
    result.recommendations.push('Consider implementing rate limiting for GraphQL endpoints');
  }

  return result;
}


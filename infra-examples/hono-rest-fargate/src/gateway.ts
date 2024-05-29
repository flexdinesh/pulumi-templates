import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export function createHTTPGateway({
  loadBalancer,
  project,
  stack,
}: {
  loadBalancer: awsx.lb.ApplicationLoadBalancer;
  project: string;
  stack: string;
}) {
  // Create an API Gateway v2 HTTP API
  const gateway = new aws.apigatewayv2.Api(`${stack}-http-gateway`, {
    protocolType: "HTTP",
  });
  // const gateway = new aws.apigatewayv2.Api(`${stack}-http-gateway`, {
  //   protocolType: "HTTP",
  //   routeKey: "$default", // A single proxy route to handle all requests
  // });

  // An integration to forward requests from the HTTP API to the Load Balancer’s DNS name.
  const integration = new aws.apigatewayv2.Integration(
    "http-gateway-integration",
    {
      apiId: gateway.id,
      integrationType: "HTTP_PROXY",
      integrationUri: pulumi.interpolate`http://${loadBalancer.loadBalancer.dnsName}`, // Use the DNS name of the LB
      integrationMethod: "ANY", // Accept any HTTP method
      payloadFormatVersion: "1.0",
    }
  );

  // Create a route for the HTTP API that uses the integration
  const route = new aws.apigatewayv2.Route("http-gateway-api-route", {
    apiId: gateway.id,
    routeKey: "$default", // A default catch-all route
    target: pulumi.interpolate`integrations/${integration.id}`,
  });

  // Deploy the API Gateway to make it available
  const deployment = new aws.apigatewayv2.Deployment(
    "http-gateway-deployment",
    {
      apiId: gateway.id,
    }, 
    {
      dependsOn: [gateway, integration, route]
    }
  );

  // Ensure the route is linked to the deployment
  const stage = new aws.apigatewayv2.Stage("http-gateway-stage", {
    apiId: gateway.id,
    name: stack,
    deploymentId: deployment.id,
    autoDeploy: true,
  });

  return {
    gateway,
    deployment,
    stage,
  };
}

// doesn't work for some reason
export function createRESTGateway({
  loadBalancer,
  project,
  stack,
}: {
  loadBalancer: awsx.lb.ApplicationLoadBalancer;
  project: string;
  stack: string;
}) {
  // Create a REST API Gateway
  const gateway = new aws.apigateway.RestApi(
    `${project}-${stack}-gateway`,
    {},
    {
      dependsOn: [loadBalancer],
    }
  );

  // Create a resource to capture the path part of the URI
  const proxyResource = new aws.apigateway.Resource(`proxy-resource`, {
    restApi: gateway.id,
    parentId: gateway.rootResourceId,
    pathPart: "{proxy+}",
  });

  // Set up a proxy method on the resource
  const proxyMethod = new aws.apigateway.Method("proxy-method", {
    restApi: gateway.id,
    resourceId: proxyResource.id,
    httpMethod: "ANY",
    authorization: "NONE",
  });

  // Set up a proxy integration to the load balancer
  const integration = new aws.apigateway.Integration("integration", {
    restApi: gateway.id,
    resourceId: proxyResource.id,
    httpMethod: proxyMethod.httpMethod,
    type: "HTTP_PROXY",
    uri: pulumi.interpolate`http://${loadBalancer.loadBalancer.dnsName}/{proxy}`, // The target endpoint
    integrationHttpMethod: "ANY",
    passthroughBehavior: "WHEN_NO_MATCH",
  });

  // Deploy the API Gateway
  const deployment = new aws.apigateway.Deployment(
    "deployment",
    {
      restApi: gateway.id,
      // stageName: stack,
    },
    { dependsOn: [integration] }
  );

  // Create a Stage, associated with the Log Group
  const stage = new aws.apigateway.Stage("stage", {
    deployment: deployment.id,
    restApi: gateway.id,
    stageName: stack,
    // accessLogSettings: {
    //   destinationArn: logGroup.arn,
    //   format: JSON.stringify({
    //     requestId: "$context.requestId",
    //     ip: "$context.identity.sourceIp",
    //     caller: "$context.identity.caller",
    //     user: "$context.identity.user",
    //     requestTime: "$context.requestTime",
    //     httpMethod: "$context.httpMethod",
    //     resourcePath: "$context.resourcePath",
    //     status: "$context.status",
    //     protocol: "$context.protocol",
    //     responseLength: "$context.responseLength",
    //   }),
    // },
  });

  return {
    gateway,
    deployment,
    stage,
  };
}

export function gatewayLogs() {
  // Create a CloudWatch Log Group for API Gateway logging
  const logGroup = new aws.cloudwatch.LogGroup("apiLogs", {
    retentionInDays: 7,
  });

  // IAM role that API Gateway will assume to push logs to CloudWatch
  let logRole = new aws.iam.Role("apiGatewayLoggingRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "apigateway.amazonaws.com",
    }),
  });

  // Attach the policy that grants permission to write to CloudWatch Logs
  new aws.iam.RolePolicy("apiGatewayLoggingPolicy", {
    role: logRole.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:DescribeLogGroups",
            "logs:DescribeLogStreams",
            "logs:PutLogEvents",
            "logs:GetLogEvents",
            "logs:FilterLogEvents",
          ],
          Effect: "Allow",
          Resource: "*",
        },
      ],
    },
  });

  // Attach the necessary policy to the IAM role for API Gateway
  // const attachment = new aws.iam.RolePolicyAttachment(
  //   "apiGatewayLogsPolicyAttachment",
  //   {
  //     role: role,
  //     // https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#set-up-access-logging-permissions
  //     policyArn:
  //       "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs",
  //   }
  // );

  // Create a gateway account
  // This integrates the API Gateway with the CloudWatch logging using the created IAM role
  new aws.apigateway.Account("account", {
    cloudwatchRoleArn: logRole.arn, // Set the IAM role for logging
  });

  return {
    logRole,
    logGroup,
  };
}

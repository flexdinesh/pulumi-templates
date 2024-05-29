import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

export function createApiGateway({
  project,
  stack,
  lambda,
}: {
  stack: string;
  project: string;
  lambda: aws.lambda.Function;
}) {
  const gateway = new apigateway.RestAPI(`${project}-${stack}-gateway`, {
    stageName: stack,
    routes: [
      {
        path: "/",
        method: "GET",
        eventHandler: lambda,
      },
      {
        path: "/{proxy+}",
        method: "ANY",
        eventHandler: lambda,
      },
    ],
  });

  return {
    gateway,
  };
}

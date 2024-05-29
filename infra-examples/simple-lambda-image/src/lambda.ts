import * as docker from "@pulumi/docker";
import * as aws from "@pulumi/aws";

export function createLambda({
  image,
  role,
  project,
  stack,
  provider,
}: {
  image: docker.Image;
  role: aws.iam.Role;
  project: string;
  stack: string;
  provider?: aws.Provider;
}) {
  const lambda = new aws.lambda.Function(
    `${project}-${stack}-handler`,
    {
      packageType: "Image",
      imageUri: image.repoDigest,
      role: role.arn,
      timeout: 6,
      memorySize: 512,
      tracingConfig: {
        mode: "Active",
      },
    },
    { provider }
  );

  const functionUrl = new aws.lambda.FunctionUrl(
    `${project}-${stack}-handler-url`,
    {
      functionName: lambda.name,
      authorizationType: "NONE",
    },
    { provider }
  );

  return {
    lambda,
    functionUrl,
  };
}

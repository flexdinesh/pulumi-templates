import * as docker from "@pulumi/docker";
import * as aws from "@pulumi/aws";

export function createLambda({
  image,
  role,
  project,
  stack,
}: {
  image: docker.Image;
  role: aws.iam.Role;
  project: string;
  stack: string;
}) {
  const lambda = new aws.lambda.Function(`${project}-${stack}-handler`, {
    packageType: "Image",
    imageUri: image.repoDigest,
    role: role.arn,
    timeout: 6,
    memorySize: 512,
    tracingConfig: {
      mode: "Active",
    },
  });

  const functionUrl = new aws.lambda.FunctionUrl(
    `${project}-${stack}-handler-url`,
    {
      functionName: lambda.name,
      authorizationType: "NONE",
    }
  );

  return {
    lambda,
    functionUrl,
  };
}

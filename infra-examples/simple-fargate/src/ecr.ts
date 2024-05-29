import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

export function buildImageAndPushToECR({
  project,
  stack,
}: {
  stack: string;
  project: string;
}) {
  const repo = new aws.ecr.Repository(`${project}-${stack}-repo`, {
    forceDelete: true,
  });

  const authToken = aws.ecr.getAuthorizationTokenOutput({
    registryId: repo.registryId,
  });

  const image = new docker.Image(
    `${project}-${stack}-image`,
    {
      build: {
        context: "./example",
        dockerfile: "./example/Dockerfile",
      },
      imageName: pulumi.interpolate`${repo.repositoryUrl}:latest`,
      registry: {
        username: pulumi.secret(authToken.apply((token) => token.userName)),
        password: pulumi.secret(authToken.apply((token) => token.password)),
        server: repo.repositoryUrl,
      },
    },
    {
      dependsOn: [repo],
    }
  );

  return {
    repo,
    image,
  };
}

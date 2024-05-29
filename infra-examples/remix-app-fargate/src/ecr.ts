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
        args: {
          DOCKER_BUILDKIT: "1",
        },
        // docker context is always the monorepo root
        context: "../../",
        // relative path to our dockerfile
        dockerfile: "../../apps-examples/remix-app/dockerfiles/fargate/Dockerfile",
        platform: "linux/amd64",
        target: "fargate",
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

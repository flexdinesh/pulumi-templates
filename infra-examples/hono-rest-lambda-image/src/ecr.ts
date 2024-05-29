import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

export function buildImageAndPushToECR({
  project,
  stack,
  provider,
}: {
  stack: string;
  project: string;
  provider?: aws.Provider;
}) {
  const repo = new aws.ecr.Repository(
    `${project}-${stack}-repo`,
    {
      forceDelete: true,
    },
    { provider }
  );

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
        dockerfile: "../../apps-examples/hono-rest/dockerfiles/lambda-image/Dockerfile",
        platform: "linux/amd64",
        target: "lambda",
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
      provider,
    }
  );

  return {
    repo,
    image,
  };
}

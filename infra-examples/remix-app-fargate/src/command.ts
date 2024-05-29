import * as docker from "@pulumi/docker";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";

export function invalidateCloudFrontDistribution({
  distribution,
  image,
}: {
  distribution: aws.cloudfront.Distribution;
  image: docker.Image
}) {
  const cmd = new command.local.Command(
    "script:invalidate-cloudfront-distribution",
    {
      create: pulumi.interpolate`aws cloudfront create-invalidation --distribution-id ${distribution.id} --paths "/*"`,
      environment: {
        // invalidate cache on every new image build
        imageUri: image.repoDigest,
      },
    }
  );

  return cmd;
}

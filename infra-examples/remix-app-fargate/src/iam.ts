import * as aws from "@pulumi/aws";

export function createOriginAccessIdentity({
  project,
  stack,
}: {
  stack: string;
  project: string;
}) {
  const oai = new aws.cloudfront.OriginAccessIdentity(
    `${project}-${stack}-oai`
  );
  return oai;
}

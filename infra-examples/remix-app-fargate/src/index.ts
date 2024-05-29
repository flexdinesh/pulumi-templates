import * as pulumi from "@pulumi/pulumi";

import { createOriginAccessIdentity } from "./iam";
import { invalidateCloudFrontDistribution } from "./command";
import { buildImageAndPushToECR } from "./ecr";
import { uploadToS3 } from "./s3";
import { PublicAssets } from "./custom-resources/public-assets";
import { createCloudFrontDistribution } from "./cloudfront";
import { createFargateService } from "./fargate";

// Get the current stack reference
const stack = pulumi.getStack();
const project = pulumi.getProject();
const awsConfig = new pulumi.Config("aws");
const region = awsConfig.require("region");
const remixConfig = new pulumi.Config("remix");
const publicDirectoryName = remixConfig.require("publicDirectoryName");
const immutableAssetsDirectoryName = remixConfig.require(
  "immutableAssetsDirectoryName"
);

/*
  1. Create ECR repo
  2. Build docker image
  3. Create Fargate service, task definitions, ECS cluster and Application Load Balancer
  4. Create origin access identity for CloudFront and S3
  5. Copy built assets from image to current dir
  6. Create S3 bucket and upload assets
  7. Create an S3 bucket to receive CloudFront logs
  8. Create CloudFront distribution, set access, set log bucket, set routing rules for assets bucket and ALB
  9. Invalidate all existing cache from CloudFront distribution
*/

const { repo, image } = buildImageAndPushToECR({
  project,
  stack,
});

const { service, loadBalancer } = createFargateService({
  image,
  project,
  stack,
});

const oai = createOriginAccessIdentity({
  project,
  stack,
});

const publicAssets = new PublicAssets(
  `${project}-${stack}-assets-to-upload`,
  {
    // assets will be copied to this path by
    // scripts/copy-files-from-docker-image.sh
    path: `./${publicDirectoryName}`,
    image,
  },
  {
    dependsOn: [image],
  }
);

const { bucket } = uploadToS3({
  project,
  stack,
  publicAssets,
  oai,
  // will be copied to this dir from docker image when
  // scripts/copy-files-from-docker-image.sh is run
  publicDirectoryName,
  immutableAssetsDirectoryName,
});

const distribution = createCloudFrontDistribution({
  bucket,
  loadBalancer,
  oai,
  project,
  stack,
  region,
});

const invalidationCommand = invalidateCloudFrontDistribution({
  distribution,
  image,
});

export const ecrRepoName = repo.name;
export const ecrRepoUrl = repo.repositoryUrl;
export const imageUri = image.repoDigest;
export const bucketName = bucket.bucket;
export const bucketDomainName = bucket.bucketDomainName;
export const loadBalancerUrl = pulumi.interpolate`http://${loadBalancer.loadBalancer.dnsName}`;
export const cloudfrontUrl = distribution.domainName;

import * as pulumi from "@pulumi/pulumi";

import { createLambdaRole, createOriginAccessIdentity } from "./iam";
import { createLambda } from "./lambda";
import { invalidateCloudFrontDistribution } from "./command";
import { buildImageAndPushToECR } from "./ecr";
import { uploadToS3 } from "./s3";
import { PublicAssets } from "./custom-resources/public-assets";
import { createCloudFrontDistribution } from "./cloudfront";

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
  3. Copy built assets from image to current dir
  4. Create origin access identity for CloudFront and S3
  5. Create S3 bucket and upload assets
  6. Create lambda role
  7. Create lambda function
  8. Enable functionUrl for lambda function
  9. Create an S3 bucket to receive CloudFront logs
  10. Create CloudFront distribution, set access, set log bucket, set routing rules for assets bucket and Lambda function
  11. Invalidate all existing cache from CloudFront distribution
*/

const { repo, image } = buildImageAndPushToECR({
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

const lambdaRole = createLambdaRole({ project, stack });

const { lambda, functionUrl } = createLambda({
  image,
  role: lambdaRole,
  project,
  stack,
});

const distribution = createCloudFrontDistribution({
  bucket,
  lambda,
  functionUrl,
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
export const lambdaFunctionName = lambda.name;
export const functionUrlOutput = functionUrl.functionUrl;
export const bucketName = bucket.bucket;
export const bucketDomainName = bucket.bucketDomainName;
export const cloudfrontUrl = distribution.domainName;

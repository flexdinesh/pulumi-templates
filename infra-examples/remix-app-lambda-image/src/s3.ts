import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { PublicAssets } from "./custom-resources/public-assets";
import { UploadAssets } from "./custom-resources/upload-assets";

export function uploadToS3({
  publicAssets,
  oai,
  project,
  stack,
  publicDirectoryName,
  immutableAssetsDirectoryName,
}: {
  oai: aws.cloudfront.OriginAccessIdentity;
  project: string;
  stack: string;
  publicAssets: PublicAssets;
  publicDirectoryName: string;
  immutableAssetsDirectoryName: string;
}) {
  // Create an S3 bucket
  const bucket = new aws.s3.Bucket(`${project}-${stack}-assets-bucket`, {
    forceDestroy: true,
  });

  // Apply a Public Access Block policy to the bucket
  const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock(
    `${project}-${stack}-assets-bucket-public-access-block`,
    {
      bucket: bucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: false,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    }
  );

  // Create an S3 Bucket Policy with an Origin Access Identity
  const bucketPolicy = new aws.s3.BucketPolicy(
    `${project}-${stack}-assets-bucket-policy`,
    {
      bucket: bucket.id,
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: oai.iamArn,
            },
            Action: "s3:GetObject",
            Resource: [pulumi.interpolate`${bucket.arn}/*`],
          },
        ],
      },
    },
    {
      dependsOn: [oai, bucketPublicAccessBlock, bucket],
    }
  );

  const objects = new UploadAssets(
    `${project}-${stack}-upload-assets`,
    {
      bucket,
      project,
      stack,
      files: publicAssets.files,
      publicDirectoryName,
      immutableAssetsDirectoryName,
    },
    {
      dependsOn: [bucket, publicAssets],
    }
  );

  // Export the name of the bucket
  return {
    bucket,
    objects,
    oai,
  };
}

export function createCloudFrontLogBucket({
  project,
  stack,
  oai,
}: {
  oai: aws.cloudfront.OriginAccessIdentity;
  project: string;
  stack: string;
}) {
  const bucket = new aws.s3.Bucket(
    `${project}-${stack}-cloudfront-logs-bucket`,
    {
      forceDestroy: true, // Ensure bucket can be deleted even if there are logs present.
      lifecycleRules: [
        {
          enabled: true,
          expiration: {
            // Optionally, configure automatic expiration of log files.
            days: 90,
          },
        },
      ],
    }
  );

  const bucketOwnershipControls = new aws.s3.BucketOwnershipControls(
    `${project}-${stack}-cloudfront-logs-bucket-ownership-control`,
    {
      bucket: bucket.id,
      rule: {
        objectOwnership: "BucketOwnerPreferred",
      },
    },
    {
      dependsOn: [bucket],
    }
  );

  return bucket;
}

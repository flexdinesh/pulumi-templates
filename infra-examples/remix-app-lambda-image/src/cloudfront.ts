import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { createCloudFrontLogBucket } from "./s3";

export function createCloudFrontDistribution({
  bucket,
  lambda,
  functionUrl,
  oai,
  project,
  stack,
  region,
}: {
  bucket: aws.s3.Bucket;
  lambda: aws.lambda.Function;
  functionUrl: aws.lambda.FunctionUrl;
  oai: aws.cloudfront.OriginAccessIdentity;
  project: string;
  stack: string;
  region: string;
}) {
  const logBucket = createCloudFrontLogBucket({
    project,
    stack,
    oai,
  });

  const { assetsPolicy } = createCachePolicies({
    project,
    stack,
  });

  const distribution = new aws.cloudfront.Distribution(
    `${project}-${stack}-distribution`,
    {
      enabled: true,
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
      },
      origins: [
        {
          domainName: bucket.bucketDomainName,
          originId: bucket.arn,
          s3OriginConfig: {
            originAccessIdentity: oai.cloudfrontAccessIdentityPath,
          },
        },
        {
          domainName: pulumi.interpolate`${functionUrl.urlId}.lambda-url.${region}.on.aws`,
          originId: lambda.arn,
          customOriginConfig: {
            originProtocolPolicy: "https-only",
            httpPort: 80,
            httpsPort: 443,
            originSslProtocols: ["TLSv1.2"],
          },
        },
      ],
      defaultCacheBehavior: {
        targetOriginId: lambda.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: [
          "GET",
          "HEAD",
          "OPTIONS",
          "PUT",
          "POST",
          "PATCH",
          "DELETE",
        ],
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        defaultTtl: 0,
        maxTtl: 31536000, // 1 year
        minTtl: 0,
        forwardedValues: {
          queryString: true,
          headers: ["Origin"],
          cookies: {
            forward: "all",
          },
        },
      },
      orderedCacheBehaviors: [
        // TODO: convert cache behaviours into a custom resource
        // so they can update when new dir/files get added to public dir
        {
          pathPattern: `/build/*`,
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          targetOriginId: bucket.arn,
          cachePolicyId: assetsPolicy.id,
          compress: true,
          viewerProtocolPolicy: "redirect-to-https",
        },
        {
          pathPattern: `/favicon.ico`,
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          targetOriginId: bucket.arn,
          cachePolicyId: assetsPolicy.id,
          compress: true,
          viewerProtocolPolicy: "redirect-to-https",
        },
      ],
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      loggingConfig: {
        bucket: logBucket.bucketDomainName,
        includeCookies: false,
        prefix: "logs/",
      },
    },
    {
      dependsOn: [oai, bucket, logBucket, lambda, assetsPolicy],
    }
  );

  return distribution;
}

function createCachePolicies({
  project,
  stack,
}: {
  project: string;
  stack: string;
}) {
  const assetsPolicy = new aws.cloudfront.CachePolicy(
    `${project}-${stack}-assets-cache-policy`,
    {
      defaultTtl: 31536000, // 1 year
      maxTtl: 31536000, // 1 year
      minTtl: 0,
      parametersInCacheKeyAndForwardedToOrigin: {
        cookiesConfig: {
          cookieBehavior: "none",
        },
        headersConfig: {
          headerBehavior: "none",
        },
        queryStringsConfig: {
          queryStringBehavior: "all",
        },
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      },
    }
  );

  return {
    assetsPolicy,
  };
}

export function createCustomDomainCertificate({
  stack,
  project,
  customDomainName,
}: {
  stack: string;
  project: string;
  customDomainName: string;
}) {
  const cert = new aws.acm.Certificate(`${project}-${stack}-certificate`, {
    domainName: customDomainName,
    validationMethod: "DNS",
  });

  return cert;
}

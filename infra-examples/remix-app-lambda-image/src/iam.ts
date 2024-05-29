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

export function createLambdaRole({
  project,
  stack,
}: {
  stack: string;
  project: string;
}) {
  const lambdaRole = new aws.iam.Role(
    `${project}-${stack}-lambda-default-role`,
    {
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: { Service: "lambda.amazonaws.com" },
          },
        ],
      }),
    }
  );

  // Attach the AWS managed policy for Lambda Execution access to the IAM Role
  new aws.iam.RolePolicyAttachment(
    `${project}-${stack}-lambda-ddb-lambda-ex-role`,
    {
      role: lambdaRole,
      policyArn:
        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    }
  );

  // Attach the AWS managed policy to enable xray
  new aws.iam.RolePolicyAttachment(`${project}-${stack}-lambda-xray-role`, {
    role: lambdaRole,
    policyArn: "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess",
  });

  // Attach the AWS managed policy for DynamoDB access to the IAM Role
  new aws.iam.RolePolicyAttachment(
    `${project}-${stack}-lambda-ddb-access-role`,
    {
      role: lambdaRole,
      policyArn: "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
    }
  );

  return lambdaRole;
}

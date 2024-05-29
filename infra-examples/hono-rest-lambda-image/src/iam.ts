import * as aws from "@pulumi/aws";

export function createLambdaRole({
  project,
  stack,
  provider,
}: {
  stack: string;
  project: string;
  provider?: aws.Provider;
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
    },
    { provider }
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
  new aws.iam.RolePolicyAttachment("mylambda-role-xray", {
    policyArn: "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess",
    role: lambdaRole,
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

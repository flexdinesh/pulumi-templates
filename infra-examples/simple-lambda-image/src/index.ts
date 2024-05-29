import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { createLambdaRole } from "./iam";
import { createLambda } from "./lambda";
import { buildImageAndPushToECR } from "./ecr";

// Get the current stack reference
const stack = pulumi.getStack();
const project = pulumi.getProject();

const { repo, image } = buildImageAndPushToECR({
  project,
  stack,
});

const lambdaRole = createLambdaRole({ project, stack });

const { lambda, functionUrl } = createLambda({
  image,
  role: lambdaRole,
  project,
  stack,
});

export const ecrRepoName = repo.name;
export const ecrRepoUrl = repo.repositoryUrl;
export const imageUri = image.repoDigest;
export const lambdaFunctionName = lambda.name;
export const functionUrlOutput = functionUrl.functionUrl;

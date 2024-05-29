import * as pulumi from "@pulumi/pulumi";

import { buildImageAndPushToECR } from "./ecr";
import { createFargateService } from "./fargate";
import { createHTTPGateway } from "./gateway";

// Get the current stack reference
const stack = pulumi.getStack();
const project = pulumi.getProject();
const awsConfig = new pulumi.Config("aws");
const region = awsConfig.require("region");

/*
  1. Create ECR repo
  2. Build docker image
  3. Create ECS cluster
  4. Create Fargate task definition
  5. Create Fargate service
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

const { gateway, deployment, stage } = createHTTPGateway({
  stack,
  project,
  loadBalancer,
});

export const ecrRepoName = repo.name;
export const ecrRepoUrl = repo.repositoryUrl;
export const imageUri = image.repoDigest;
export const loadBalancerUrl = pulumi.interpolate`http://${loadBalancer.loadBalancer.dnsName}`;
// Export the URL of the API Gateway
export const gatewayUrl = pulumi.interpolate`https://${gateway.id}.execute-api.${region}.amazonaws.com/${stage.name}/`;

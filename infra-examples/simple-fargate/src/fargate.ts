import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";
import * as aws from "@pulumi/aws";

// https://www.pulumi.com/registry/packages/aws/how-to-guides/ecs-fargate/
export function createFargateService({
  image,
  project,
  stack,
}: {
  image: docker.Image;
  project: string;
  stack: string;
}) {
  // ALB to access the container
  const loadBalancer = new awsx.lb.ApplicationLoadBalancer(
    `${stack}-alb`,
    {
      internal: false,
      // enableDeletionProtection: true,
    }
  );

  const cluster = new aws.ecs.Cluster(`${project}-${stack}-cluster`, {});
  // Create a Fargate Service that runs the task definition.
  const service = new awsx.ecs.FargateService(`${stack}-fargate-service`, {
    cluster: cluster.arn,
    assignPublicIp: true,
    // desiredCount: 1,
    taskDefinitionArgs: {
      container: {
        name: `${project}-${stack}-container`,
        image: image.repoDigest,
        cpu: 128,
        memory: 512,
        essential: true,
        portMappings: [
          {
            containerPort: 80,
            targetGroup: loadBalancer.defaultTargetGroup,
          },
        ],
      },
    },
  });

  return {
    service,
    loadBalancer,
  };
}

// Create a new security group for the load balancer
// const lbSecurityGroup = new aws.ec2.SecurityGroup("lbSecurityGroup", {
//   ingress: [
//       { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
//   ],
//   egress: [
//       { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
//   ],
// });

// Create a new security group for the load balancer
// const lbSecurityGroup = new aws.ec2.SecurityGroup("lbSecurityGroup", {
//   ingress: [
//       { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
//   ],
//   egress: [
//       { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
//   ],
// });

// // Create a new load balancer
// const lb = new aws.lb.LoadBalancer("lb", {
//   internal: false,
//   loadBalancerType: "application",
//   securityGroups: [lbSecurityGroup.id],
//   subnets: aws.ec2.getSubnetIds({}).then(subnets => subnets.ids),
// });

// // Create a target group for the load balancer
// const targetGroup = new aws.lb.TargetGroup("targetGroup", {
//   port: 80,
//   protocol: "HTTP",
//   targetType: "ip",
//   vpcId: aws.ec2.getVpc({}).then(vpc => vpc.id),
// });

// // Create a listener for the load balancer
// const listener = new aws.lb.Listener("listener", {
//   loadBalancerArn: lb.arn,
//   port: 80,
//   defaultActions: [{
//       type: "forward",
//       targetGroupArn: targetGroup.arn,
//   }],
// });
// Create the HTTP Listener and redirect to HTTPS
// const httpListener = new aws.lb.Listener("http-listener", {
//   loadBalancerArn: loadBalancer.loadBalancer.arn,
//   port: 80,
//   defaultActions: [{
//       type: "redirect",
//       redirect: {
//           port: "443",
//           protocol: "HTTPS",
//           statusCode: "HTTP_301"
//       },
//   }],
// });

// // Create the HTTPS Listener
// const httpsListener = new aws.lb.Listener("https-listener", {
//   loadBalancerArn: loadBalancer.loadBalancer.arn,
//   port: 443,
//   protocol: "HTTPS",
//   sslPolicy: "ELBSecurityPolicy-2016-08",
//   certificateArn: "your-certificate-arn", // Replace with your actual certificate ARN
//   defaultActions: [
//     {
//       type: "forward",
//       targetGroupArn: loadBalancer.defaultTargetGroup.arn,
//     },
//   ],
// });

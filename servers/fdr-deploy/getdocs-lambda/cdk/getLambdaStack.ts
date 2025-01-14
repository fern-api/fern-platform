import { EnvironmentType } from "@fern-fern/fern-cloud-sdk/api";
import { Duration, Fn, Stack } from "aws-cdk-lib";
import { IVpc, SecurityGroup, SubnetType } from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

interface GetDocsLambdaProps {
  vpc: IVpc;
  environmentType: EnvironmentType;
  rdsProxyEndpoint: string;
  redisEndpoint: string;
  redisSecurityGroupID: string;
  cacheSecurityGroupID: string;
  venusURL: string;
}

export class GetDocsLambda extends Construct {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: GetDocsLambdaProps) {
    super(scope, id);

    // Get the RDS Proxy security group from the shared resources stack
    const rdsProxySecurityGroupId = Fn.importValue("RDSProxySecurityGroupId");
    const rdsProxySecurityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      "imported-rds-proxy-sg",
      rdsProxySecurityGroupId
    );
    const redisSecurityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      "imported-redis-proxy-sg",
      props.redisSecurityGroupID
    );
    const cacheSecurityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      "imported-cache-sg",
      props.cacheSecurityGroupID
    );

    // Create the Lambda function
    this.lambdaFunction = new lambda.Function(this, "get-docs-lambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../dist")),
      vpc: props.vpc,
      securityGroups: [
        rdsProxySecurityGroup,
        redisSecurityGroup,
        cacheSecurityGroup,
      ],
      environment: {
        RDS_PROXY_ENDPOINT: props.rdsProxyEndpoint,
        REDIS_ENDPOINT: props.redisEndpoint,
        NODE_ENV: props.environmentType.toLowerCase(),
        VENUS_URL: props.venusURL,
      },
      timeout: Duration.seconds(30),
      memorySize: 256,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      allowPublicSubnet: true,
    });

    // Add permissions for the Lambda to access the RDS Proxy
    this.lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["rds-db:connect"],
        resources: [
          `arn:aws:rds-db:${Stack.of(this).region}:${Stack.of(this).account}:dbuser:*/*`,
        ],
      })
    );
  }
}

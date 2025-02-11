import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Create a VPC for networking
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2, 
    });

    //S3 Bucket for static files
    const bucket = new s3.Bucket(this, 'MyBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true, 
    });

    //RDS PostgreSQL database instance
    const dbInstance = new rds.DatabaseInstance(this, 'PostgresDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      allocatedStorage: 20, // 20 GB of storage
      maxAllocatedStorage: 100, // Allow it to grow up to 100 GB
      credentials: rds.Credentials.fromGeneratedSecret('postgres'), // Auto-generate DB credentials
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Destroy the DB when the stack is destroyed (for development only)
      deletionProtection: false, // Disable deletion protection (for development)
    });

    //EC2 instance
    const ec2Instance = new ec2.Instance(this, 'MyEC2', {
      instanceType: new ec2.InstanceType('t3.micro'),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      vpc,
    });
  }
}

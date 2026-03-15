import { aws_ec2 as ec2, aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MovieShortStack, MovieShortStackProps } from './movie-short-stack';

export type MovieShortEc2StackProps = MovieShortStackProps & {
  s3AccessPolicy: iam.PolicyStatement;
};

export class MovieShortEc2Stack extends MovieShortStack {
  public readonly vpc: ec2.IVpc;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: MovieShortEc2StackProps) {
    super(scope, id, props);

    // Use default VPC
    this.vpc = ec2.Vpc.fromLookup(this, `VPC`, {
      isDefault: true,
    });

    // Create Security Group
    this.securityGroup = new ec2.SecurityGroup(
      this,
      `MovieShortSG${props.envName}`,
      {
        vpc: this.vpc,
        description: 'Allow ssh, http, https and mysql access',
        allowAllOutbound: true,
      },
    );

    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH',
    );
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP',
    );
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS',
    );
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow App Port',
    );
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3306),
      'Allow MySQL',
    );

    // EC2 Role
    const ec2Role = new iam.Role(this, `MovieShortEc2Role${props.envName}`, {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonSSMManagedInstanceCore',
      ),
    );
    ec2Role.addToPolicy(props.s3AccessPolicy);

    // User Data
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'sudo apt-get update -y',
      'sudo apt-get install -y git curl unzip mysql-server',

      // Install Node.js
      'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -',
      'sudo apt-get install -y nodejs',

      // Start MySQL
      'sudo systemctl start mysql',
      'sudo systemctl enable mysql',

      // Basic MySQL Config (creating a database)
      "sudo mysql -e 'CREATE DATABASE IF NOT EXISTS movieshort_db;'",

      // Clone and setup app
      'sudo mkdir -p /home/ubuntu/app',
      'sudo chown ubuntu:ubuntu /home/ubuntu/app',
      'cd /home/ubuntu/app',
      'sudo -u ubuntu git clone https://github.com/kienkhua9999/project_audio_be.git .',
      'sudo -u ubuntu npm install',
      'sudo npm install -g pm2',

      // Note: User will need to manually configure .env and run migrations
      "echo 'EC2 Setup Complete' > /home/ubuntu/setup_finished.txt"
    );

    // EC2 Instance
    this.instance = new ec2.Instance(
      this,
      `MovieShortInstance${props.envName}`,
      {
        vpc: this.vpc,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          props.isProd ? ec2.InstanceSize.MEDIUM : ec2.InstanceSize.SMALL,
        ),
        machineImage: ec2.MachineImage.fromSsmParameter(
          '/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id',
        ),
        securityGroup: this.securityGroup,
        role: ec2Role,
        userData: userData,
        // keyName: props.isProd ? 'movie-short-prod' : 'movie-short-dev',
        blockDevices: [
          {
            deviceName: '/dev/sda1',
            volume: ec2.BlockDeviceVolume.ebs(10, {
              volumeType: ec2.EbsDeviceVolumeType.GP3,
            }),
          },
        ],
      },
    );

    // Create Elastic IP
    const eip = new ec2.CfnEIP(this, `MovieShortEIP${props.envName}`, {
      domain: 'vpc',
    });

    // Associate Elastic IP with Instance
    new ec2.CfnEIPAssociation(this, `MovieShortEIPAssoc${props.envName}`, {
      eip: eip.ref,
      instanceId: this.instance.instanceId,
    });
  }
}

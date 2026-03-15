import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvName, MovieShortStackProps } from './stacks/movie-short-stack';
import { MovieShortEc2Stack } from './stacks/movie-short-ec2-stack';
import { MovieShortS3Stack } from './stacks/movie-short-s3-stack';

export class ProdStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const baseProps: MovieShortStackProps = {
      envName: (process.env.envName as EnvName) || 'Prod',
      isProd: true,
      env: props?.env,
    };

    const s3 = new MovieShortS3Stack(this, 'MovieShortS3Prod', baseProps);

    new MovieShortEc2Stack(this, 'MovieShortEc2Prod', {
      ...baseProps,
      s3AccessPolicy: s3.s3AccessPolicy,
    });
  }
}

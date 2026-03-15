import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export type EnvName = 'Prod' | 'Dev';

export type MovieShortStackProps = StackProps & {
  isProd: boolean;
  envName: EnvName;
  stageName?: string;
};

export class MovieShortStack extends Stack {
  isProd: boolean;
  appName = 'MovieShort';
  envName: EnvName;
  stageName: string;

  constructor(scope: Construct, id: string, props: MovieShortStackProps) {
    super(scope, id, props);
    this.isProd = props.envName === 'Prod';

    this.envName = props.envName;
    this.stageName = props.stageName ?? 'no-stage';
  }
}

#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { DevStage } from '../lib/dev-stage';
import { ProdStage } from '../lib/prod-stage';

const app = new cdk.App();

dotenv.config();

const env: cdk.StackProps['env'] = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const environment = app.node.tryGetContext('environment') || 'Dev';

if (!['Dev', 'Prod'].includes(environment)) {
  throw new Error('environment is invalid');
}

if (environment === 'Dev') {
  new DevStage(app, 'MovieShortDev', { env });
} else {
  new ProdStage(app, 'MovieShortProd', { env });
}

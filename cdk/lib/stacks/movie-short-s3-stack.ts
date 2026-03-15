import {
  aws_iam as iam,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MovieShortStack, MovieShortStackProps } from './movie-short-stack';

export type MovieShortS3StackProps = MovieShortStackProps & {};

export class MovieShortS3Stack extends MovieShortStack {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly s3AccessPolicy: iam.PolicyStatement;

  constructor(scope: Construct, id: string, props: MovieShortS3StackProps) {
    super(scope, id, props);

    const bucketName =
      process.env.AWS_BUCKET ||
      `movie-short-bucket-${props.envName.toLowerCase()}`;

    this.bucket = new s3.Bucket(this, `MovieShortBucket${props.envName}`, {
      bucketName: bucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    /*
    this.distribution = new cloudfront.Distribution(
      this,
      `MovieShortDistribution${props.envName}`,
      {
        defaultBehavior: {
          origin: new origins.S3Origin(this.bucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        },
        comment: `CloudFront distribution for ${props.envName} movie files`,
      },
    );
    */

    this.s3AccessPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
      resources: [this.bucket.bucketArn, `${this.bucket.bucketArn}/*`],
    });
  }
}

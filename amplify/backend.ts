import { defineBackend } from '@aws-amplify/backend';
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({
  auth,
  data,
});

const customBucketStack = backend.createStack("custom-bucket-stack");

// Import existing bucket
const customBucket = Bucket.fromBucketAttributes(customBucketStack, "MyCustomBucket", {
  bucketArn: `arn:aws:s3:::baff-demo-storage-browser-test2`,
  region: "us-east-1"
});

backend.addOutput({
  storage: {
    aws_region: customBucket.env.region,
    bucket_name: customBucket.bucketName,
    buckets: [
      {
        aws_region: customBucket.env.region,
        bucket_name: customBucket.bucketName,
        name: customBucket.bucketName,
        paths: {
          "public/*": {
            guest: ["get", "list"],
            authenticated: ["get", "list", "write", "delete"],
          },
          "admin/*": {
            authenticated: ["get", "list"],
            groupsadmin: ["get", "list", "write", "delete"],
          },
        },
      }
    ]
  },
});

const unauthPolicy = new Policy(backend.stack, "customBucketUnauthPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject"],
      resources: [`${customBucket.bucketArn}/public/*`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [
        `${customBucket.bucketArn}`,
        `${customBucket.bucketArn}/*`
      ],
      conditions: {
        StringLike: {
          "s3:prefix": ["public/", "public/*"],
        },
      },
    }),
  ],
});

// Add the policies to the unauthenticated user role
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  unauthPolicy,
);

const authPolicy = new Policy(backend.stack, "customBucketAuthPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject", "s3:ListBucket"],
      resources: [
        `${customBucket.bucketArn}`,
        `${customBucket.bucketArn}/*`
      ],
      conditions: {
        StringLike: {
          "s3:prefix": ["public/", "public/*"],
        },
      },
    }),
  ],
});

// Add the policies to the authenticated user role
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  authPolicy,
);

// add cors policy to the bucket
// customBucket.addCorsRule({
//   allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT, HttpMethods.DELETE],
//   allowedOrigins: ["*"],
//   allowedHeaders: ["*"],
// });

/*
  Define an inline policy to attach to "admin" user group role
  This policy defines how authenticated users with 
  "admin" user group role can access your existing bucket
*/ 
const adminPolicy = new Policy(backend.stack, "customBucketAdminPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "s3:GetObject",
        "s3:PutObject", 
        "s3:DeleteObject"
      ],
      resources: [ `${customBucket.bucketArn}/admin/*`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [
        `${customBucket.bucketArn}`
        `${customBucket.bucketArn}/*`
      ],
      conditions: {
        StringLike: {
          "s3:prefix": ["admin/*", "admin/"],
        },
      },
    }),
  ],
});


// Add the policies to the "admin" user group role
backend.auth.resources.groups["admin"].role.attachInlinePolicy(adminPolicy);
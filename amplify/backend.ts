import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

// Define the backend with just auth and data resources
const backend = defineBackend({
  auth,
  data,
});

// Add storage configuration directly without using CDK constructs
backend.addOutput({
  storage: {
    aws_region: "us-east-1",
    bucket_name: "baff-demo-storage-browser-test2",
    buckets: [
      {
        aws_region: "us-east-1",
        bucket_name: "baff-demo-storage-browser-test2",
        name: "baff-demo-storage-browser-test2",
        paths: {
          "public/*": {
            guest: ["get", "list"],
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

// Note: This simplified version doesn't include the IAM policies
// that were previously defined using aws-cdk-lib. You'll need to
// manually set up these permissions in the AWS console or use
// a different approach that doesn't rely on aws-cdk-lib.
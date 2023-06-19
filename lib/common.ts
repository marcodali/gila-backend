import {
  IResource,
  MockIntegration,
  PassthroughBehavior,
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';
import { readdirSync } from 'fs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';

type entityTable = {
  [key: string]: Table;
}

export const getDirectories = (path: string) =>
  readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
    .map(dirent => dirent.name);

export const getFiles = (path: string) =>
    readdirSync(path, { withFileTypes: true })
      .filter(dirent => dirent.isFile()
        && !dirent.name.endsWith('.d.ts')
        && !dirent.name.endsWith('.js'))
      .map(dirent => dirent.name.slice(0, -3)); // removes extension .ts from filename

export const DynamoTable = (
    c: Construct,
    tableName: string,
    partitionKeyName: string,
): Table => new Table(c, tableName, {
    partitionKey: {
      name: partitionKeyName,
      type: AttributeType.STRING
    },
    tableName: tableName,

    /**
     * The default removal policy is RETAIN,
     * which means that cdk destroy will not attempt to delete
     * the new table, and it will remain in your account until manually deleted.
     * By setting the policy to DESTROY,
     * cdk destroy will delete the table (even if it has data in it)
     */
    removalPolicy: RemovalPolicy.DESTROY,
});

type myEnv = {
  [key: string]: string;
}

export const nodeFnProps = (
  primaryKeyName: string,
  table: Table,
  tables?: entityTable,
): NodejsFunctionProps => {
  const environment: myEnv = {};
  environment['PRIMARY_KEY'] = primaryKeyName;
  environment['TABLE_NAME'] = table.tableName;

  if (tables) {
    Object.entries(tables).forEach(([entity, table]) => environment[`TABLE_${
      entity.toUpperCase()
    }`] = table.tableName);
  }
  
  return {
    bundling: {
      externalModules: [
        'aws-sdk',
      ],
    },
    depsLockFilePath: join(__dirname, '..', 'lambdas', 'package-lock.json'),
    environment,
    runtime: Runtime.NODEJS_14_X,
  };
};

export const matchNormalizedNameWithHTTPVerb = (
  entityName: string,
  filename: string,
): string => {
  const needle = filename
    .replace(entityName, '')
    .replace('One', '')
  let result: string = needle.toUpperCase();;
  if (needle == 'Create') {
    result = 'POST';
  }
  return result;
};

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod('OPTIONS', new MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })
};

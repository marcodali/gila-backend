import { IResource, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { App, Stack, RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path'

export class GilaStack extends Stack {
  constructor(app: App, id: string) {
    super(app, id);

    const usersDynamoTable = new Table(this, 'users', {
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING
      },
      tableName: 'users',

      /**
       * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new table, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will delete the table (even if it has data in it)
       */
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk',
        ],
      },
      depsLockFilePath: join(__dirname + '/../', 'lambdas', 'package-lock.json'),
      environment: {
        PRIMARY_KEY: 'userId',
        TABLE_NAME: usersDynamoTable.tableName,
      },
      runtime: Runtime.NODEJS_14_X,
    }

    // Create a Lambda function for each of the user CRUD operations
    const createUser = new NodejsFunction(this, 'createUser', {
      entry: join(__dirname + '/../', 'lambdas', 'users', 'create.ts'),
      ...nodeJsFunctionProps,
    });
    const deleteUser = new NodejsFunction(this, 'deleteUser', {
      entry: join(__dirname + '/../', 'lambdas', 'users', 'delete.ts'),
      ...nodeJsFunctionProps,
    });
    const getAllUsers = new NodejsFunction(this, 'getAllUsers', {
      entry: join(__dirname + '/../', 'lambdas', 'users', 'get-all.ts'),
      ...nodeJsFunctionProps,
    });
    const getOneUser = new NodejsFunction(this, 'getOneUser', {
      entry: join(__dirname + '/../', 'lambdas', 'users', 'get-one.ts'),
      ...nodeJsFunctionProps,
    });
    const updateUser = new NodejsFunction(this, 'updateUser', {
      entry: join(__dirname + '/../', 'lambdas', 'users', 'update.ts'),
      ...nodeJsFunctionProps,
    });
    

    // Grant the Lambda function access to the DynamoDB table
    usersDynamoTable.grantWriteData(createUser);
    usersDynamoTable.grantReadWriteData(deleteUser);
    usersDynamoTable.grantReadData(getAllUsers);
    usersDynamoTable.grantReadData(getOneUser);
    usersDynamoTable.grantReadWriteData(updateUser);

    // Integrate the Lambda functions with the API Gateway resource
    const userCreateIntegration = new LambdaIntegration(createUser);
    const userDeleteIntegration = new LambdaIntegration(deleteUser);
    const userGetAllIntegration = new LambdaIntegration(getAllUsers);
    const userGetOneIntegration = new LambdaIntegration(getOneUser);
    const userUpdateIntegration = new LambdaIntegration(updateUser);

    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(this, 'gilaApi', {
      restApiName: 'Gila Service'
    });

    const users = api.root.addResource('users');
    users.addMethod('GET', userGetAllIntegration);
    users.addMethod('POST', userCreateIntegration);
    addCorsOptions(users);

    const singleUser = users.addResource('{id}');
    singleUser.addMethod('GET', userGetOneIntegration);
    singleUser.addMethod('PATCH', userUpdateIntegration);
    singleUser.addMethod('DELETE', userDeleteIntegration);
    addCorsOptions(singleUser);
  }
}

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
}

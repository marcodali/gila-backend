import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { App, Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import {
  getDirectories,
  getFiles,
  DynamoTable,
  nodeFnProps,
  addCorsOptions,
  matchNormalizedNameWithHTTPVerb,
} from './common';

type entityTable = {
  [key: string]: Table;
}

type entityFnProps = {
  [key: string]: NodejsFunctionProps;
}

type entityNodejsFunction = {
  [key: string]: Map<string, NodejsFunction>;
}

export class GilaStack extends Stack {
  constructor(app: App, id: string) {
    super(app, id);

    /**
     * read all folder names inside lambdas directory,
     * exclude of course node_modules/
     */
    const myEntitiesTable: entityTable = {};
    const myEntitiesFnProps: entityFnProps = {};
    const myEntitiesNodejsFunction: entityNodejsFunction = {};

    const entities = getDirectories(join(__dirname, '..', 'lambdas'));
    const tables = entities.map(
      entity => DynamoTable(this, entity, `${entity}Id`)
    );
    const props = entities.map(
      (entity, index) => nodeFnProps(`${entity}Id`, tables[index])
    );
    
    entities.map((entity, index) => myEntitiesTable[entity] = tables[index]);
    entities.map((entity, index) => myEntitiesFnProps[entity] = props[index]);

    /**
     * Create a Lambda function for each of the user CRUD operations,
     * for every entity folder read the filenames inside
     * and create a nodejs function with it
     */
    entities.map(entity => {
      const filenameFnMap = new Map<string, NodejsFunction>();
      getFiles(join(__dirname, '..', 'lambdas', entity))
        .map(filename => {
          let normalizedName: string;
          if (filename.split('-').length > 1) {
            normalizedName = `${entity}${
              filename
                .split('-').map(x => x[0].toUpperCase() + x.slice(1)).join('')
            }`
          } else {
            normalizedName = `${entity}${
              filename[0].toUpperCase() + filename.slice(1)
            }`;
          }
          filenameFnMap.set(normalizedName, new NodejsFunction(
            this,
            normalizedName,
            {
              entry: join(__dirname, '..', 'lambdas', entity, `${filename}.ts`),
              ...myEntitiesFnProps[entity],
            },
          ));
        });
      myEntitiesNodejsFunction[entity] = filenameFnMap;
    });

    /**
     * For very entity; grant lambda functions access
     * to their respective DynamoDB tables
     */
    entities.map(entity => {
      for (const nodeFunction of myEntitiesNodejsFunction[entity].values()) {
        myEntitiesTable[entity].grantReadWriteData(nodeFunction);
      }
    });

    // Create a unique API Gateway resource for the stack
    const api = new RestApi(this, 'gilaApi', {
      restApiName: 'Gila Service'
    });

    /**
     * Integrate the Lambda functions with the API Gateway resource
     */
    entities.map(entity => {
      const myGenericResource = api.root.addResource(entity);
      // associate the lamda integration for every generic nodejsFunction
      for (const [normalizedName, nodeFunction] of myEntitiesNodejsFunction[entity]) {
        if (!normalizedName.endsWith('One')) {
          myGenericResource.addMethod(
            matchNormalizedNameWithHTTPVerb(entity, normalizedName),
            new LambdaIntegration(nodeFunction),
          );
        }
      }
      addCorsOptions(myGenericResource);

      const singleResource = myGenericResource.addResource('{id}');
      for (const [normalizedName, nodeFunction] of myEntitiesNodejsFunction[entity]) {
        if (normalizedName.endsWith('One')) {
          singleResource.addMethod(
            matchNormalizedNameWithHTTPVerb(entity, normalizedName),
            new LambdaIntegration(nodeFunction),
          );
        }
      }
      addCorsOptions(singleResource);
    });
  }
}

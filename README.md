# Nodejs AWS Lambda DynamoDB seed

This project will help you to generate your backend in minutes, not days, not weeks

## Installation/deployment instructions

- Run `npm install` to install the project dependencies
- Run `npx sls dynamodb install` to install the project dependencies
- Run `yarn deploy` to deploy this stack to AWS

## Test your service

There are 5 lambda functions per entity; **create**, **update**, **getAll**, **get** and **delete**. The only one default entity is the following:

- User

> :warning: All endpoints deployed are protected with an AWS API KEY. You need to pass the API KEY value displayed after a sucessful deploy as a header named **x-api-key** in every request to allow API Gateway to route the request to its corresponding lambda function.

### Locally

In order to test your lambda functions locally, run the following commands:

- `yarn gs` run this command every time you update your Dtos / Models
- `yarn start` hot reload is enabled but the local dynamodb is flushed on every restart

## Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `core` - containing shared code base between your lambdas
- `database` - containing services and methods to access dbs
- `dtos` - containing interfaces for create and update your entities
- `functions` - containing the actual individual lambda javascript code
- `models` - containing the required and optional properties for each entity

```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   └── user
│   │
│   └── core                    # Lambda shared code
│       ├── response.ts         # formatJSONResponse fn
│       └── middyfy.ts          # middy middleware
│
├── package.json
├── tsconfig.json               # Typescript compiler configuration
└── webpack.config.js           # Webpack configuration
```

## 3rd party libraries

- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [uuid](https://github.com/uuidjs/uuid) - For the creation of RFC4122 UUIDs
- [validator](https://www.npmjs.com/package/@middy/validator) - Type validation for `event.body` object

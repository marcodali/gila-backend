## System Design

Backend:
* API Gateway
* SQS
* Lambda

FrontEnd:
* S3
* CloudFront
* React

DynamoDB as storage for:
* log events
* user management
* notifications type
* category names

## API REST

* GET /users/:id
* POST /users/

* GET /notifications/:type
* POST /notifications/

* GET /category/:name
* POST /category/

* GET /events/:id
* POST /events/

## Posible Bottlenecks

* Create new event
    * Solution: SQS
* Send channel notifications to subscribed users
    * Solution: rate limit API call

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

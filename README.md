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

## Possible Bottlenecks

* Create new event
    * Solution: SQS
* Send channel notifications to subscribed users
    * Solution: rate limit API call

## Useful commands

* `npm run build`   compile typescript to js
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk destroy`     Removes all the resources deployed at AWS for this project

import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import httpErrorHandler from "@middy/http-error-handler";
import validator from '@middy/validator'
import { transpileSchema } from '@middy/validator/transpile'

const middyfy = (handler, inputSchema = null) => {
  if (inputSchema) {
    return middy(handler)
      .use(middyJsonBodyParser())
      .use(validator({ eventSchema: transpileSchema(inputSchema) }))
      .use({
        onError: (request) => {
          const response = request.response;
          const error = <any>request.error;
          if (response.statusCode != 400) return;
          if (!error.expose || !error.cause) return;
          response.headers["Content-Type"] = "application/json";
          response.body = JSON.stringify({ message: response.body, validationErrors: error.cause });
        },
      })
      .use(httpErrorHandler())
  }
  return middy(handler)
    .use(middyJsonBodyParser())
    .use(httpErrorHandler())
}

export default middyfy;
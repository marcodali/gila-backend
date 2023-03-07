export const formatJSONResponse = (statusCode: number, response: any = null) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: response === null ? undefined : JSON.stringify(response)
  }
}

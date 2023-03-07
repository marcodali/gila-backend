const schema = {
	"$schema": "http://json-schema.org/draft-07/schema#",
	"definitions": {
		"Category": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string"
				},
				"name": {
					"type": "string"
				}
			},
			"required": [
				"name"
			]
		},
		"CreateCategory": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"name": {
							"type": "string"
						}
					},
					"required": [
						"name"
					]
				}
			},
			"required": [
				"body"
			]
		},
		"UpdateCategory": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"name": {
							"type": "string"
						}
					}
				}
			},
			"required": [
				"body"
			]
		},
		"Event": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string"
				},
				"datetime": {
					"type": "number"
				},
				"categoryList": {
					"type": "array",
					"items": {
						"type": "string"
					}
				},
				"channelList": {
					"type": "array",
					"items": {
						"type": "string"
					}
				},
				"userList": {
					"type": "array",
					"items": {
						"type": "string"
					}
				}
			},
			"required": [
				"categoryList",
				"channelList",
				"datetime",
				"userList"
			]
		},
		"CreateEvent": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"datetime": {
							"type": "number"
						},
						"categoryList": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"channelList": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"userList": {
							"type": "array",
							"items": {
								"type": "string"
							}
						}
					},
					"required": [
						"categoryList",
						"channelList",
						"datetime",
						"userList"
					]
				}
			},
			"required": [
				"body"
			]
		},
		"UpdateEvent": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"datetime": {
							"type": "number"
						},
						"categoryList": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"channelList": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"userList": {
							"type": "array",
							"items": {
								"type": "string"
							}
						}
					}
				}
			},
			"required": [
				"body"
			]
		},
		"Notification": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string"
				},
				"name": {
					"type": "string"
				}
			},
			"required": [
				"name"
			]
		},
		"CreateNotification": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"name": {
							"type": "string"
						}
					},
					"required": [
						"name"
					]
				}
			},
			"required": [
				"body"
			]
		},
		"UpdateNotification": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"name": {
							"type": "string"
						}
					}
				}
			},
			"required": [
				"body"
			]
		},
		"User": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string"
				},
				"name": {
					"type": "string"
				},
				"email": {
					"type": "string"
				},
				"phone": {
					"type": "string"
				},
				"categoriesSubscribed": {
					"type": "array",
					"items": {
						"type": "string"
					}
				},
				"channelsSubscribed": {
					"type": "array",
					"items": {
						"type": "string"
					}
				}
			},
			"required": [
				"categoriesSubscribed",
				"channelsSubscribed",
				"email",
				"name",
				"phone"
			]
		},
		"CreateUser": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"name": {
							"type": "string"
						},
						"email": {
							"type": "string"
						},
						"phone": {
							"type": "string"
						},
						"categoriesSubscribed": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"channelsSubscribed": {
							"type": "array",
							"items": {
								"type": "string"
							}
						}
					},
					"required": [
						"categoriesSubscribed",
						"channelsSubscribed",
						"email",
						"name",
						"phone"
					]
				}
			},
			"required": [
				"body"
			]
		},
		"UpdateUser": {
			"type": "object",
			"properties": {
				"body": {
					"type": "object",
					"properties": {
						"id": {
							"type": "string"
						},
						"name": {
							"type": "string"
						},
						"email": {
							"type": "string"
						},
						"phone": {
							"type": "string"
						},
						"categoriesSubscribed": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"channelsSubscribed": {
							"type": "array",
							"items": {
								"type": "string"
							}
						}
					}
				}
			},
			"required": [
				"body"
			]
		}
	}
} as const;
export default schema.definitions;
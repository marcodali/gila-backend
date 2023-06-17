#!/bin/bash
mv jest.config.js jest.config.ts
rm -rf node_modules/ lambdas/node_modules/ cdk.out/
find . -name "*.js" -type f -delete
find . -name "*.d.ts" -type f -delete
mv jest.config.ts jest.config.js
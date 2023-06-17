#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GilaStack } from './lib/gila-stack';

const app = new cdk.App();
new GilaStack(app, 'GilaStack');

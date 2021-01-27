import { DynamoDB, S3} from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
}
const dynamodb: DocumentClient = new DynamoDB.DocumentClient(AWS_CONFIG)
const bucket = new S3(AWS_CONFIG)

export {dynamodb, bucket}

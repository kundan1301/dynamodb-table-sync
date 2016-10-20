# Sync two and more dynamodb table

###### dynamodb has limit on number of indexes. We can only create 5 global index in dynamodb. If our use case need more than 5 indexes, we will have to create more than one replica of a table. To keep these replica table in sync we can use this module. This module should be used with aws dynamodb stream trigger and aws lambda.

###### How to use:

```javascript
/*
arg1: dynamodbMap => map of AWS.DynamoDB object and AWS region 
arg2: config=> map of master table and array of map of slave table name and aws region of that table 
arg3: event => event passed by lambda
arg4: callback function

see below code for more example
*/

const syncTable = require('dynamodb-table-sync').syncTable;
var AWS = require('aws-sdk');
exports.handler = function(event, context) {
	var dynamodbMap = {};
	dynamodbMap['us-east-1']=new AWS.DynamoDB({"endpoint":"https://dynamodb.us-east-1.amazonaws.com","region":"us-east-1"});
	//dynamodbMap['eu-west-1']=new AWS.DynamoDB({"endpoint":"https://dynamodb.eu-west-1.amazonaws.com","region":"eu-west-1"});
	// test is the master table
	// test1,test2,test2 is the replica table of test

	var config = {"test1":[{name:"test2",region:"us-east-1"},{name:"test3",region:"us-east-1"}/*,{name:"test4",region:"eu-west-1"}*/]}
	syncTable(dynamodbMap,config,event,function(err,data){
		err && console.log(err);
		data && console.log(data);
		context.succeed();
	});
}
```
 
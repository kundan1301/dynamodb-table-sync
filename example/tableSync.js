const syncTable = require('dynamodb-table-sync').syncTable;
var AWS = require('aws-sdk');
exports.handler = function(event, context) {
	var dynamodbMap = {};
	dynamodbMap['us-east-1']=new AWS.DynamoDB({"endpoint":"https://dynamodb.us-east-1.amazonaws.com","region":"us-east-1"});
	//dynamodbMap['eu-west-1']=new AWS.DynamoDB({"endpoint":"https://dynamodb.eu-west-1.amazonaws.com","region":"eu-west-1"});
	var config = {"test1":[{name:"test2",region:"us-east-1"},{name:"test3",region:"us-east-1"}/*,{name:"test4",region:"eu-west-1"}*/]}
	syncTable(dynamodbMap,config,event,function(err,data){
		err && console.log(err);
		data && console.log(data);
		context.succeed();
	});
}

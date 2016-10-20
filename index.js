var train = require('async-train');
function deleteItem(dynamodb,record,tableName,callback){
	var attrMap = {};
	for(var k in record.dynamodb.Keys){
        attrMap[k]=record.dynamodb.Keys[k];
    }
    var params = {};
    params['TableName'] = tableName;
    params['Key'] = attrMap;
    dynamodb.deleteItem(params,function(err,data){
        callback(err,data);
    });
}
function updateItem(dynamodb,record,tableName,callback){
	var params = {};
	var primaryKeyMap = getPrimaryKeyMap(record.dynamodb.Keys);
	var updateKeyMap=getUpdateKeyMap(primaryKeyMap,record.dynamodb.NewImage,record.dynamodb.OldImage);
    params['Key']=primaryKeyMap;
    params['TableName'] = tableName;
    params['AttributeUpdates'] = updateKeyMap;
    dynamodb.updateItem(params,function(err,data){
        callback(err,data);
    });
}


function getPrimaryKeyMap(primaryKeysOfSourceTable){
	var keyMap = {};
	for(var k in primaryKeysOfSourceTable){
    	keyMap[k]=primaryKeysOfSourceTable[k];
    }
    return keyMap;
}

function getUpdateKeyMap(primaryKeys,newImage,oldImage){
	var updateMap = {};
	for(var k in newImage ){
		if(!primaryKeys.hasOwnProperty(k)){
			updateMap[k]={Action:'PUT'};
    		updateMap[k]['Value'] = newImage[k];
		}
	}
	for(var t in oldImage ){
		if(!newImage.hasOwnProperty(t) && !primaryKeys.hasOwnProperty(t)){
			updateMap[t]={Action:'DELETE'};
		}
	}
	return updateMap;
}


function syncTable(dynamodbMap,config,event,callback){
	function processEvent(record,cb){
		var sourceARN = record.eventSourceARN;
		var sourceTableName = sourceARN.substr(sourceARN.indexOf('table/')+6,sourceARN.indexOf("/stream")-(sourceARN.indexOf("table/")+6))
		if(!sourceTableName){
			cb(null,new Error('No Master Table Found'));
			return;
		}
		var destTables = config[sourceTableName];
		if(!destTables){
			cb(null,new Error('No Slave Table Found'));
			return;
		}
		var eventName = record.eventName;
		if(!eventName){
			cb(null, new Error('No Event Name Found'));
			return;
			
		}
		function doUpdate(tableInfo, cb1){
			if(eventName.toLowerCase() == 'modify' || eventName.toLowerCase() == 'insert' )
				updateItem(dynamodbMap[tableInfo.region],record,tableInfo.name,cb1);
			else
				deleteItem(dynamodbMap[tableInfo.region],record,tableInfo.name,cb1);
		}
		train.mapConcurrentLimit(destTables,100,doUpdate,function(err,data){
			cb(err,data);
		});
	}
	train.mapConcurrentLimit(event.Records,100,processEvent,function(err,data){
			callback(err,data);
	});
}
exports.syncTable=syncTable;

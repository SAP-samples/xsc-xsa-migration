await $.import("sap.hana.xs.libs.dbutils", "xsds"); 
var XSDS = $.sap.hana.xs.libs.dbutils.xsds; 
var metadata = 
{"entityName":"sap.hana.democontent.epm.data::Util.Messages",
"tableName":"\"SAP_HANA_DEMO\".\"sap.hana.democontent.epm.data::Util.Messages\"",
"schemaName":"SAP_HANA_DEMO",
"revMapping":{"TEXT":"TEXT","DESCRIPTION":"DESCRIPTION","LANGUAGE":"LANGUAGE","MESSAGENUMBER":"MESSAGENUMBER","MESSAGECLASS":"MESSAGECLASS"},
"keyFields":{"LANGUAGE":{"$seq":true,"$type":11},"MESSAGENUMBER":{"$seq":true,"$type":11},
"MESSAGECLASS":{"$seq":true,"$type":11}},"secondaryIndexes":[{"LANGUAGE":{"$seq":true,"$type":11},
"MESSAGENUMBER":{"$seq":true,"$type":11},"MESSAGECLASS":{"$seq":true,"$type":11}}],
"sqlMetadata":{"TEXT":{"$type":26,"$size":0},"DESCRIPTION":{"$type":11,"$size":0},
"LANGUAGE":{"$type":11,"$size":0,"$key":true},"MESSAGENUMBER":{"$type":11,"$size":0,"$key":true},
"MESSAGECLASS":{"$type":11,"$size":0,"$key":true}},
"cdsMetadata":{},"isCdsEntity":true,"isUnmanaged":false,"isFlexible":false,"isAuto":false,"entityId":1};
var mapping = {"TEXT":{"$column":"TEXT"},"DESCRIPTION":{"$column":"DESCRIPTION"},"LANGUAGE":{"$column":"LANGUAGE","$key":true},
"MESSAGENUMBER":{"$column":"MESSAGENUMBER","$key":true},"MESSAGECLASS":{"$column":"MESSAGECLASS","$key":true}}; 
var entity = XSDS.Entities.makeEntity('sap.hana.democontent.epm.data::Util.Messages', 
'"SAP_HANA_DEMO"."sap.hana.democontent.epm.data::Util.Messages"', mapping, metadata, { $noimport: true });
export default {XSDS,metadata,mapping,entity};

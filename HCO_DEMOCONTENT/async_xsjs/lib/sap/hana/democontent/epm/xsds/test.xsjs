await $.import("sap.hana.xs.libs.dbutils", "xsds");
var XSDS = $.sap.hana.xs.libs.dbutils.xsds;

var responseBody = '';
var so_items;
var result;
var rs, pstmt, pc;

var conn = await $.db.getConnection();


var bp = XSDS.$importEntity("sap.hana.democontent.epm.data", "MD.BusinessPartner", {}, { $schemaName: "SAP_HANA_DEMO" });
var prod = XSDS.$importEntity("sap.hana.democontent.epm.data", "MD.Products" , {} , { $schemaName: "SAP_HANA_DEMO" });
var soHeader = XSDS.$importEntity("sap.hana.democontent.epm.data", "SO.Header", {}, { $schemaName: "SAP_HANA_DEMO" });
var soItem = XSDS.$importEntity("sap.hana.democontent.epm.data", "SO.Item", {}, { $schemaName: "SAP_HANA_DEMO" });
var emp = XSDS.$importEntity("sap.hana.democontent.epm.data", "MD.Employees", {}, { $schemaName: "SAP_HANA_DEMO" });
var empdetails = emp.$get({ EMPLOYEEID: '0000000033' });

responseBody = JSON.stringify(soHeader.$_mapping) + '\n';

//var bpdetails = bp.$get({ PARTNERID: lv_bp_id });

var newSO = new soHeader(
{   SALESORDERID:'01234568',
    HISTORY:{CREATEDBY:empdetails,CREATEDAT:new Date() },
    NOTEID:'NOTE1234',
    PARTNER: null,//bpdetails,
	CURRENCY:'EUR',
	LIFECYCLESTATUS:'N',
	BILLINGSTATUS:'I',
	DELIVERYSTATUS:'I' }
);
newSO.$save();
XSDS.Transaction.$commit();

//responseBody += 'SO = ' + JSON.stringify(newSO) + '\n';

var sodetails = soHeader.$get({ SALESORDERID:'01234567' });

$.response.status = $.net.http.CREATED;
await $.response.setBody(responseBody);
export default {XSDS,responseBody,so_items,result,rs,pstmt,pc,conn,bp,prod,soHeader,soItem,emp,empdetails,newSO,sodetails};

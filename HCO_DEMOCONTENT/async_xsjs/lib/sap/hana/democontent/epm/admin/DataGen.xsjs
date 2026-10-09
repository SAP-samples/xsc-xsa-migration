await $.import("sap.hana.democontent.epm.services", "messages");
await $.import("sap.hana.democontent.epm.services", "session");
await $.import("sap.hana.democontent.epm.admin", "dghelper");

var SESSIONINFO = $.sap.hana.democontent.epm.services.session;
var MESSAGES = $.sap.hana.democontent.epm.services.messages;
var dg = $.sap.hana.democontent.epm.admin.dghelper;
var bpDict = dg.getBuinessPartners();
var prodDict = dg.getProducts();

var aStartDate = $.request.parameters.get('startdate');
if (aStartDate) {
    aStartDate = aStartDate.replace("'","");
}
var aEndDate = $.request.parameters.get('enddate');
if (aEndDate) {
    aEndDate = aEndDate.replace("'","");
}

//encodeURI() used to avoid SQL injection
var aNoRec = encodeURI($.request.parameters.get('noRec'));
var aCmd = encodeURI($.request.parameters.get('cmd'));

if (aCmd === "getSize") {
    dg.getTableSize();
} else if (aCmd === "getSessionInfo") {
    SESSIONINFO.fillSessionInfo();
} else {
    var conn = await $.hdb.getConnection();
    var resbody;
    try{
    	
    	//check if DG is being executed already and a thread is running in the system
    	var query = 'select * from "SYS"."M_SERVICE_THREADS" where "THREAD_METHOD" = \'HTTP\' AND "THREAD_STATE" = \'Running\' AND "THREAD_DETAIL" like \'%/sap/hana/democontent/epm/admin/%\'';
    	
    	var rs = await conn.executeQuery(query);
    	var threads = rs.length;
    	await conn.close();
    	if (threads > 0){
    		$.response.status = $.net.http.SERVICE_UNAVAILABLE;
    	} else {
    	    switch (aCmd) {
                case "reseed":
                	dg.reloadSeed();
                	break;
                case "resetSequence":
                	dg.resetSequence();
                	break;
                case "replicatePO":
                	dg.replicatePurchaseOrders();
                	break;
                case "replicateTimeBasedPO":
                	dg.replicateTimeBasedPurchaseOrders(aStartDate, aEndDate, parseInt(aNoRec, 10) * 1000,bpDict,prodDict);
                	break;
                case "replicateTimeBasedSO":
                	dg.replicateTimeBasedSalesOrders(aStartDate, aEndDate, parseInt(aNoRec, 10) * 1000,bpDict,prodDict);
                	break;
                case "replicateSO":
                	dg.replicateSalesOrders();
                	break;
                case "synonym":
                	dg.generateSynonym();
                	break;
                default:
                	$.response.status = $.net.http.BAD_REQUEST;
                await $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
                
            }
    	}
    	
    } catch (e){
    	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    	await $.response.setBody(e.message);	
    }
}



export default {SESSIONINFO,MESSAGES,dg,bpDict,prodDict,aStartDate,aEndDate,aNoRec,aCmd};

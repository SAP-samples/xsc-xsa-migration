await $.import("sap.hana.democontent.epm.services", "session");
var SESSION = $.sap.hana.democontent.epm.services.session;

var conn = await $.db.getConnection();
var pstmt;
var rs;
var tblName;

async function getRS() {
	tblName = $.request.parameters.get('tblName');
	tblName = tblName.replace("'", "");
	tblName = tblName !== undefined ? tblName : 'USERS'; 
	
	var query = 'select * from "' + tblName + '"';
	pstmt = conn.prepareStatement(query);
	rs = await pstmt.executeQuery();
	return rs;

}

async function getJSON() {
	tblName = $.request.parameters.get('tblName');
	tblName = tblName.replace("'", "");
	tblName = tblName !== undefined ? tblName : 'USERS'; 
	
	var query = 'select * from "' + tblName + '"';
	pstmt = conn.prepareStatement(query);
	rs = await pstmt.executeQuery();
	
	return await SESSION.recordSetToJSON(rs);

}

async function outputExcel(body) {
	await $.response.setBody(body);
	$.response.contentType = 'application/vnd.ms-excel';
	$.response.headers.set('Content-Disposition',
			'attachment; filename=Excel.xls');
	$.response.status = $.net.http.OK;	
	
}

async function textTest() {
	var textOut = await SESSION.recordSetToText(getRS(),true,'\t');
	await outputExcel(textOut);
}

async function csvTest() {
	var csvOut = await SESSION.recordSetToText(getRS(),true,',');	
	await outputExcel(csvOut);	
}

async function setSessionTest() {
	await SESSION.set_session_variable('test', 'sap.hana.democontent.epm.services.SessionTest', 'Test1');
	await SESSION.set_session_variable('test2', 'sap.hana.democontent.epm.services.SessionTest', 'Test2');	
	await SESSION.set_session_variable('test3', 'sap.hana.democontent.epm.services.SessionTest', 'Test3');		
	await $.response.setBody('Several session variables set');
	$.response.status = $.net.http.OK;
	
}

async function sessionTest() {
	try {
	var body = await SESSION.get_session_variable('test','sap.hana.democontent.epm.services.SessionTest');		
	await $.response.setBody(body);
	$.response.status = $.net.http.OK;
	}
	catch(e){
		await $.response.setBody(e.toString());
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
	
}

async function sessionsTest() {
	$.response.contentType = 'application/json';
	var body = await SESSION.get_session_variables('sap.hana.democontent.epm.services.SessionTest');		
	await $.response.setBody(JSON.stringify(body));
	$.response.status = $.net.http.OK;
	
}

async function setApplicationTest() {
	await SESSION.set_application_variable('test', 'sap.hana.democontent.epm.services.SessionTest', 'Application Test1');
	await SESSION.set_application_variable('test2', 'sap.hana.democontent.epm.services.SessionTest', 'Application Test2');		
	await $.response.setBody('Several application variables set');
	$.response.status = $.net.http.OK;
	
}

async function applicationTest() {
	try{
    var body = await SESSION.get_application_variable('test','sap.hana.democontent.epm.services.SessionTest');

	await $.response.setBody(body);
	$.response.status = $.net.http.OK;
	}
	catch(e){
		await $.response.setBody(e.toString());
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}
}

async function applicationsTest() {
	$.response.contentType = 'application/json';	
    var body = await SESSION.get_application_variables('sap.hana.democontent.epm.services.SessionTest');	
	await $.response.setBody(JSON.stringify(body));
	$.response.status = $.net.http.OK;
	
}

async function tableTest() {
	
	var jsonOut = await getJSON();
	await SESSION.set_application_variable('tables', 'sap.hana.democontent.epm.services.SessionTest', JSON.stringify(jsonOut));

	$.response.contentType = 'application/json';
	var body = await SESSION.get_application_variable('tables','sap.hana.democontent.epm.services.SessionTest');
	
	
	await $.response.setBody(body);
	$.response.status = $.net.http.OK;
	
}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "getSessionInfo":
	await SESSION.fillSessionInfo();
	break;
case "textTest":
	await textTest();
	break;
case "csvTest":
	await csvTest();
	break;
case "setSessionTest":
	await setSessionTest();
	break;	
case "getSessionTest":
	await sessionTest();
	break;
case "getSessionsTest":
	await sessionsTest();
	break;	
case "setApplicationTest":
	await setApplicationTest();
	break;	
case "getApplicationTest":
	await applicationTest();
	break;
case "getApplicationsTest":
	await applicationsTest();
	break;	
case "getTableTest":
	await tableTest();
	break;	
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	await $.response.setBody('Invalid Request Command');
}
export default {SESSION,conn,pstmt,rs,tblName,getRS,getJSON,outputExcel,textTest,csvTest,setSessionTest,sessionTest,sessionsTest,setApplicationTest,applicationTest,applicationsTest,tableTest,aCmd};

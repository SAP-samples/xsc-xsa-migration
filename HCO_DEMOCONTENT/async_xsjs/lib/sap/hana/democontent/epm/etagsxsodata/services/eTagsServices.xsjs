async function readUserIdSequence() {
	var rs, overAllId, responseBody;
	var conn = await $.hdb.getConnection();
	rs = await conn.executeQuery('SELECT \"SAP_HANA_DEMO\".\"sap.hana.democontent.epm.data::userSeqId\".NEXTVAL as OverallId from Dummy');
	overAllId = '';
	if (rs.length !== 0) {
	    overAllId = rs[0].OVERALLID;
	    responseBody = overAllId.toString();
	    $.response.status = $.net.http.OK;
	    await $.response.setBody(responseBody);      
	}

}

//Clear the UserDetails Table data
async function clearJobLogs() {
	
    var conn = await $.hdb.getConnection();
    try{
        await conn.executeUpdate('DELETE FROM"sap.hana.democontent.epm.data::User.Details"');
        await conn.commit();
        await conn.close();
    }
    catch(e){
    	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    	await $.response.setBody("Error in deleting user details");
    }

}

async function processRequest() {
    
		try {
            switch ($.request.method) {
                //Handle your GET calls here
                case $.net.http.GET:
                	await readUserIdSequence();
                    break;
                case $.net.http.DEL:
                	await clearJobLogs();
                	break;
                default:
                    $.response.status = $.net.http.METHOD_NOT_ALLOWED;
                    await $.response.setBody("Wrong request method");
                    break;
            }
        } catch (e) {
        	$.response.status =  $.net.http.INTERNAL_SERVER_ERROR;
            await $.response.setBody("Failed to execute action: " + e.toString());
        }
}

await processRequest();
export default {readUserIdSequence,clearJobLogs,processRequest};

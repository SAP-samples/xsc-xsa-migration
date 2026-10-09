$.response.contentType = "text/html";
await $.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;
await $.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;



    var conn = await $.hdb.getConnection();
    var conn2 = await $.hdb.getConnection();
    var query;
    var rs;

    
  	try {
        // Business Partner Company Name  
        query = 'select * from"sap.hana.democontent.epm.data::Util.SeriesData" where "t" >= (select current_timestamp from dummy ) and "t" < (SELECT ADD_SECONDS (TO_TIMESTAMP (CURRENT_TIMESTAMP), 60*120) "add seconds" FROM DUMMY)';
        rs = await conn.executeQuery(query);
        await conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(e.message);                
    }
 
	
if (rs.length == 0) {
   

    try {
        // Business Partner Company Name
        query = 'alter sequence"sap.hana.democontent.epm.data::seriesData" RESTART WITH 1';
        rs = await conn2.executeUpdate(query);        
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(e.message);                
    }
	
	
    var procLoad = await conn2.loadProcedure('sap.hana.democontent.epm.Procedures::seriesData');
    var execProc = procLoad();
   	var procOut = execProc;
    var resultSets = execProc['$resultSets'];
 
   if(resultSets == 0)
   {
   await $.response.setBody("Currency Conversion Table Loaded");  
   }
    
  
   $.trace.debug(JSON.stringify(resultSets));
   $.response.contentType = 'application/json';   
   $.response.status = $.net.http.OK;
    
   }
   
   else
   {
   await $.response.setBody("Currency Conversion Table Already Contain Values");
   }
   
   await conn2.commit();
   await conn.close();
   await conn2.close();
    

export default {MESSAGES,SESSIONINFO,conn,conn2,query,rs};

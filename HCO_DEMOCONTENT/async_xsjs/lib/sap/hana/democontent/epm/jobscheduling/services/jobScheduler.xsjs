var paramName;
var paramValue;
var headerName;
var headerValue;
var contentType;
var jobName;
var jobDesc;
var xsCron, scheduleMsg, jobType, username, password, locale, starttime, endtime, active;

async function saveJobConfig() {

    var uri = "/sap/hana/democontent/epm/jobscheduling/jobs/" + jobName + ".xsjob";
    try {
        var myjob = await new $.jobs.Job({
            uri: uri
        });
        myjob.configure({
            user: username,
            password: password,
            locale: locale,
            status: active,
            start_time: {
                value: starttime,
                format: "MM DD YYYY HH:MI:SS"
            },
            end_time: {
                value: endtime,
                format: "MM DD YYYY HH:MI:SS"
            }
        });
    } catch (e) {
        scheduleMsg = "JOB_NOT_SAVED";
        return;
    }
}

async function deactivateJob() {

    var uri = "/sap/hana/democontent/epm/jobscheduling/jobs/" + jobName + ".xsjob";
    try {
        var myjob = await new $.jobs.Job({
            uri: uri
        });
        myjob.deactivate({
            user: username,
            password: password
        });
    } catch (e) {
        scheduleMsg = "JOB_NOT_DEACTIVATED";
        return;
    }


}

async function activateJob() {

    var uri = "/sap/hana/democontent/epm/jobscheduling/jobs/" + jobName + ".xsjob";
    try {
        var myjob = await new $.jobs.Job({
            uri: uri
        });
        myjob.activate({
            user: username,
            password: password
        });
    } catch (e) {
        scheduleMsg = "JOB_NOT_ACTIVATED";
        return;
    }


}


//to add a schedule to the XSJSJob
async function addScheduleXSJS() {
    var rs;

    //check if a job schedule by the name already exists
    var conn = await $.hdb.getConnection();
    rs = await conn.executeQuery('SELECT ID from"sap.hana.democontent.epm.data::JobsDemo.RuntimeSchedules" where NAME = ?', jobName);
   
    if (rs.length !== 0) {
        scheduleMsg = "JOB_EXISTS";
           return;
    }
   
    //if the job does not exist, create a new job
    var myjob = await new $.jobs.Job({
        uri: "/sap/hana/democontent/epm/jobscheduling/jobs/demoXSJS.xsjob"
    });
    var comment = 'RT XSJS Job:' + jobName;
    var jobId;
    try {
        jobId = myjob.schedules.add({
            description: jobDesc,
            xscron: xsCron,
            parameter: {
                description: comment
            }

        });
    } catch (e) {
        scheduleMsg = "SCHEDULE_NOT_ADDED";
        return;
    }



    //xsCron value should be something like * * * * * * 1:30/5
    //Insert Job Name

    ;
    await conn.executeUpdate('insert into \"SAP_HANA_DEMO\".\"sap.hana.democontent.epm.data::JobsDemo.RuntimeSchedules\"' + " values(?,?, ?)", jobName, jobId, jobType);
    await conn.commit();
    await conn.close();

}

//to add a schedule to the SQLScriptJob
async function addScheduleSQLScript() {
    var  rs;

    //check if a job schedule by the name already exists
    var conn = await $.hdb.getConnection();
    rs = await conn.executeQuery('SELECT ID from"sap.hana.democontent.epm.data::JobsDemo.RuntimeSchedules" where NAME = ?', jobName);
    //return if the job already exists
    if (rs.length !== 0) {
        scheduleMsg = "JOB_EXISTS";
        return;
    }
  
    //if the job does not exist, create a new job
    var myjob = await new $.jobs.Job({
        uri: "/sap/hana/democontent/epm/jobscheduling/jobs/demoSQLScript.xsjob"
    });
    //xsCron value should be something like * * * * * * 1:30/5
    var comment = 'RT SQL Job:' + jobName;
    var jobId;
    try {
        jobId = myjob.schedules.add({
            description: jobDesc,
            xscron: xsCron,
            parameter: {
                DESCRIPTION: comment
            }

        });
    } catch (e) {
        scheduleMsg = "SCHEDULE_NOT_ADDED";
        return;
    }




    //Insert Job Name
    ;
    await conn.executeUpdate('insert into \"SAP_HANA_DEMO\".\"sap.hana.democontent.epm.data::JobsDemo.RuntimeSchedules\"' + " values(?,?, ?)", jobName, jobId, jobType);
    await conn.commit();
    await conn.close();

}

//to remove a schedule from the XSJS/SQLScript Job
async function removeSchedule() {
    var rs, jobId, jobType;

    //check if the job exists
    var conn = await $.hdb.getConnection();
    rs = await conn.executeQuery('SELECT ID, JOBTYPE from"sap.hana.democontent.epm.data::JobsDemo.RuntimeSchedules" where NAME = ?', jobName);

    if (rs.length !== 0) {
        jobId = rs[0][0];
        jobType = rs[0][1];
    }

      //if the job does not exists, return
    if (rs.length !== 0) {
        jobId = rs[0][0];
        jobType = rs[0][1];
    } else {
        scheduleMsg = "JOB_NOT_EXISTS";
        return;
    }

    //delete the job schedule
    if (jobType === 'XSJS Job') {

        try {
            var myjobxs = await new $.jobs.Job({
                uri: "/sap/hana/democontent/epm/jobscheduling/jobs/demoXSJS.xsjob"
            });
         
            myjobxs.schedules["delete"]({
                id: parseInt(jobId, 10)
            });
        } catch (e) {
            scheduleMsg = "SCHEDULE_XSJS_NOT_REMOVED";
            return;
        }

    } else if (jobType === 'SQLScript Job') {

        try {
            var myjobsql = await new $.jobs.Job({
                uri: "/sap/hana/democontent/epm/jobscheduling/jobs/demoSQLScript.xsjob"
            });
           
            myjobsql.schedules["delete"]({
                id: parseInt(jobId, 10)
            });
        } catch (e) {
            scheduleMsg = "SCHEDULE_SQL_NOT_REMOVED";
            return;
        }

    }

    //delete the job name
    try {
        await conn.executeUpdate('DELETE from"sap.hana.democontent.epm.data::JobsDemo.RuntimeSchedules" where NAME = ?', jobName);
        await conn.commit();
    } catch (e) {
        scheduleMsg = "SCHEDULE_NOT_DELETED";
    }
}



//Implementation of GET call
function handleGet() {
    // Retrieve data here and return results in JSON/other format
    $.response.status = $.net.http.OK;
    return {
        "myResult": " GET success"
    };
}

//Clear the Details Table data
async function clearJobLogs() {
	
	//check if the job exists
    var conn = await $.hdb.getConnection();
    try{
        await conn.executeUpdate('DELETE FROM"sap.hana.democontent.epm.data::JobsDemo.Details"');
        await conn.commit();
        await conn.close();
    }
    catch(e){
    	scheduleMsg = "JOB_LOGS_NOT_DELETED";
    	await conn.close();
    	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    }

}

//Implementation of the DELTE call
async function handleDelete() {
	
	var terms = $.request.parameters.get("cmd");
	switch (terms) {
	 case "clearJobLogs":
		 await clearJobLogs();
     	break;
     default:
         $.response.status = $.net.http.METHOD_NOT_ALLOWED;
         await $.response.setBody("Wrong request method");
         break;
	
	}
	
	if(scheduleMsg === ""){
	    $.response.status = $.net.http.OK;
	    scheduleMsg = "JOB_LOGS_DELETE_SUCCESS";
	}
	    
    return {
        "myResult": scheduleMsg
    };
    
}



//Implementation of POST call
async function handlePost() {
    var bodyStr = $.request.body ? $.request.body.asString() : undefined;
    if (bodyStr === undefined) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        return {
            "myResult": "Missing BODY"
        };
    }

    var jobData = JSON.parse(bodyStr);
    if (jobData.jobAction === "addSchedule") {
        jobName = jobData.jobName;
        jobDesc = jobData.jobDesc;
        xsCron = jobData.xsCron;
        jobType = jobData.jobType;
        if (jobType === 'XSJS Job') {
            await addScheduleXSJS();
        } else if (jobType === 'SQLScript Job') {
            await addScheduleSQLScript();
        }

        if (scheduleMsg === "") {
            // Extract body insert data to DB and return results in JSON/other format
            $.response.status = $.net.http.OK;
            scheduleMsg = "SUCCESS";
        } else {
            await $.response.setBody(scheduleMsg);
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        }

    } else if (jobData.jobAction === "deleteSchedule") {
        jobName = jobData.jobName;
        username = jobData.username;
        password = jobData.password;
        await removeSchedule();
        if (scheduleMsg === "") {
            // Extract body insert data to DB and return results in JSON/other format
            $.response.status = $.net.http.OK;
            scheduleMsg = "SUCCESS";
        } else {
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            await $.response.setBody(scheduleMsg);
        }


    } else if (jobData.jobAction === "deactivateJob") {
        jobName = jobData.jobName;
        username = jobData.username;
        password = jobData.password;
        await deactivateJob();
        if (scheduleMsg === "") {
            // Extract body insert data to DB and return results in JSON/other format
            $.response.status = $.net.http.OK;
            scheduleMsg = "SUCCESS";
        } else {
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            await $.response.setBody(scheduleMsg);
        }

    } else if (jobData.jobAction === "activateJob") {
        jobName = jobData.jobName;
        username = jobData.username;
        password = jobData.password;
        await activateJob();
        if (scheduleMsg === "") {
            // Extract body insert data to DB and return results in JSON/other format
            $.response.status = $.net.http.OK;
            scheduleMsg = "SUCCESS";
        } else {
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            await $.response.setBody(scheduleMsg);
        }

    } else if (jobData.jobAction === "saveJobConfig") {
        jobName = jobData.jobName;
        username = jobData.username;
        password = jobData.password;
        locale = jobData.locale;
        starttime = jobData.starttime;
        endtime = jobData.endtime;
        active = jobData.active;
        await saveJobConfig();
        if (scheduleMsg === "") {
            // Extract body insert data to DB and return results in JSON/other format
            $.response.status = $.net.http.OK;
            scheduleMsg = "SUCCESS";
        } else {
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            await $.response.setBody(scheduleMsg);
        }

    }

    return {
        "myResult": scheduleMsg
    };

}

// Check Content type headers and parameters
async function validateInput() {

    // Check content-type is application/json
    contentType = $.request.contentType;
    if (contentType === null || contentType.startsWith("application/json") === false) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody("Wrong content type request use application/json");
        return false;
    }

    return true;
}
// Request process 
async function processRequest() {
    scheduleMsg = "";
    if (await validateInput()) {
        try {
            switch ($.request.method) {
                //Handle your GET calls here
                case $.net.http.GET:
                    await $.response.setBody(JSON.stringify(handleGet()));
                    break;
                    //Handle your POST calls here
                case $.net.http.POST:
                    await $.response.setBody(JSON.stringify(handlePost()));
                    break;
                    //Handle your other methods: PUT, DELETE
                case $.net.http.DEL:
                	await $.response.setBody(JSON.stringify(handleDelete()));
                	break;
                default:
                    $.response.status = $.net.http.METHOD_NOT_ALLOWED;
                    await $.response.setBody("Wrong request method");
                    break;
            }
            $.response.contentType = "application/json";
        } catch (e) {
            await $.response.setBody("Failed to execute action: " + e.toString());
        }
    }
}
// Call request processing  
await processRequest();
export default {paramName,paramValue,headerName,headerValue,contentType,jobName,jobDesc,xsCron,scheduleMsg,jobType,username,password,locale,starttime,endtime,active,saveJobConfig,deactivateJob,activateJob,addScheduleXSJS,addScheduleSQLScript,removeSchedule,handleGet,clearJobLogs,handleDelete,handlePost,validateInput,processRequest};

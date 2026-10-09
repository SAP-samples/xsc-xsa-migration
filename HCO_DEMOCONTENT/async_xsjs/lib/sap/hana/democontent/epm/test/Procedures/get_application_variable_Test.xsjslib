/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = await $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test get_application_variable.hdbprocedure
 * Mock the procedure, its dependent table
 *  i)Util.SSCOOKIE and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns application Variable
 */
describe('get_application_variable', function() {
	var testEnvironment = null;
	
/* returns the sale price for the given productId */
	function createApplicationData(){
	    var applicationData = [{
		    "SESSIONID" : "",
		    "NAME" : "John",
		    "APPLICATION" : "SHINE",
		    "EXPIRY" : "20.07.2017",
		    "DATA" : "SAP"
		 },
		 {
		    "SESSIONID" : "",
		    "NAME" : "Mark",
		    "APPLICATION" : "SHINE",
		    "EXPIRY" : "20.07.2017",
		    "DATA" : "SAP"
		 }
		 ];
/* Insert the data to test table */
     testEnvironment.fillTestTable("scookie",applicationData);		
	}
	
	async function getApplicationVariable(name, application) {
	    var callStatement = 'call ' + testEnvironment.getTestModelName()  + '(\'' + name + '\',\'' + application + '\',? )';
        var callable = jasmine.dbConnection.prepareCall(callStatement);
        await callable.execute();
        var resultSet = tableDataSet.createFromResultSet(callable.getResultSet());
        await callable.close();
        return resultSet;
	}
/**
 * Define the model definition
 * create an instance of mockstarEnvironment object : 'testEnvironment'
 * The test model and defined test tables are created
 */
	beforeOnce(function() {
		var definition = {
				schema : 'SAP_HANA_DEMO',
				model : {
					name : 'sap.hana.democontent.epm.Procedures/get_application_variable'
				},
				substituteTables : {
					"scookie" : 'sap.hana.democontent.epm.data::Util.SSCOOKIE'
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec */
	beforeEach(function() {
		testEnvironment.clearAllTestTables();
	});

/* check if it returns the application Variable  */
	 it('Should return application variable', async function() {
		 createApplicationData();
	    var expectedData ={
		    "SESSIONID" : [ "" ],
		    "NAME" : ["John"],
		    "APPLICATION" : ["SHINE"]
		};
	    
	    expect(await getApplicationVariable('John','SHINE')).toMatchData(expectedData, ["NAME"]);
	    
	});
}).addTags(["procedures"]);

export default {SqlExecutor,mockstarEnvironment,tableDataSet};

/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test jobsCreateEntry.hdbprocedure
 * Mock the procedure, its dependent table i)JobsDemo.Details and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns session variable for  the given sessionId
 */

describe('jobsCreateEntry', function() {
 var sqlExecutor = null;
 var testEnvironment = null;

/* returns the description */
 
/*Creates an entry in the JobsDemo.Details*/
 
async function createEntry(desc) {
	    var callStatement = 'call ' + testEnvironment.getTestModelName() + '(?)'; 
        var callable = jasmine.dbConnection.prepareCall(callStatement);
        callable.setString(1,desc);
        await callable.execute();
        await callable.close();
        var resultSet = sqlExecutor.execQuery('select SOURCE from ' + testEnvironment.getTestTableName('details') + 'where SOURCE = \'Inserted via XSUnit\'');
  
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
					name : 'sap.hana.democontent.epm.Procedures/jobsCreateEntry'
				},
				substituteTables : {
					"details" : 'sap.hana.democontent.epm.data::JobsDemo.Details'
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec */

	beforeEach(function() {
	sqlExecutor = new SqlExecutor(jasmine.dbConnection);
    testEnvironment.clearAllTestTables();
		});

/* check if it returns entry  */
	
	 it('Should create an entry', async function() {
		 
		 var result = await createEntry("Inserted via XSUnit");
		
		 var expectedResult = [ {SOURCE:'Inserted via XSUnit'}];
		    
		expect(result).toMatchData(expectedResult, [ "SOURCE" ]);
		
	
	});
}).addTags(["procedures"]);
export default {SqlExecutor,mockstarEnvironment};

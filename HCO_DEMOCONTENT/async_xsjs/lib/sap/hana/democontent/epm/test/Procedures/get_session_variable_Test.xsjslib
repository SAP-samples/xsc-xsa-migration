/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = await $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test get_session_variable.hdbprocedure
 * Mock the procedure, its dependent table i)Util.SSCOOKIE and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns session variable for  the given sessionId
 */
describe('get_session_variable', function() {
    var testEnvironment = null;
    
    function createSessionData(sessionId) {
            var sessionData = [{
                "SESSIONID": sessionId,
                "NAME": "SHINE",
                "APPLICATION": "SHINE",
                "EXPIRY": "20.07.2017",
                "DATA": "TEST"
            },
            {
                "SESSIONID": ++sessionId,
                "NAME": "SHINE",
                "APPLICATION": "SHINE",
                "EXPIRY": "20.07.2017",
                "DATA": "TEST"
            }];
            /* Insert the data to test table */
            testEnvironment.fillTestTable("scookie", sessionData);
        }
        
    /* returns the sessionData */
    async function getSessionVariable(sessionId, name, application) {
            var callStatement = 'call ' + testEnvironment.getTestModelName() + '(\'' + sessionId + '\', \'' + name + '\',\'' + application + '\',? )';
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
            schema: 'SAP_HANA_DEMO',
            model: {
                name: 'sap.hana.democontent.epm.Procedures/get_session_variable'
            },
            substituteTables: {
                "scookie": 'sap.hana.democontent.epm.data::Util.SSCOOKIE'
            }
        };
        testEnvironment = mockstarEnvironment.defineAndCreate(definition);
    });

/* clear the test tables before executing every spec */
    beforeEach(function() {
        testEnvironment.clearAllTestTables();
    });

/* check if it returns the session variable for the given sessionId */
    it('Should return the session variable', async function() {
        createSessionData(1000);
        var expectedData = {
            'SESSIONID': ['1000'],
            'NAME': ['SHINE'],
            'APPLICATION': ['SHINE'],
            'DATA': ['TEST']
        };
        expect(await getSessionVariable('1000','SHINE','SHINE')).toMatchData(expectedData, ["SESSIONID", "NAME"]);
    });
}).addTags(["procedures"]);
export default {SqlExecutor,mockstarEnvironment,tableDataSet};

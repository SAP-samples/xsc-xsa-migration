/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = await $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test set_session_variable.hdbprocedure
 * Mock the procedure, its dependent table i)Util.SSCOOKIE and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns session variable for  the given sessionId
 */

describe('set_session_variable', function() {

    var testEnvironment = null;
    var sqlExecutor = null;

    /* returns the session record */
    async function setSession(sessionId, name, application, expiry, data) {

        var callStatement = 'call ' + testEnvironment.getTestModelName() + '(\'' + sessionId + '\', \'' + name + '\',\'' + application + '\',\'' + expiry + '\',\'' + data + '\')';
        var callable = jasmine.dbConnection.prepareCall(callStatement);
        await callable.execute();
        await callable.close();

        var resultSet = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestTableName('scookie') + 'where SESSIONID = ' + sessionId);
        return resultSet;
    }


    beforeOnce(function() {

        var definition = {
            schema: 'SAP_HANA_DEMO',
            model: {
                name: 'sap.hana.democontent.epm.Procedures/set_session_variable'
            },
            substituteTables: {
                "scookie": 'sap.hana.democontent.epm.data::Util.SSCOOKIE'
            }
        };
        testEnvironment = mockstarEnvironment.defineAndCreate(definition);
    });

    /* clear the test tables before executing every spec */
    beforeEach(function() {
        sqlExecutor = new SqlExecutor(jasmine.dbConnection);
        testEnvironment.clearAllTestTables();
    });

    /*check if it returns the session */
    it('Should create a new entry', async function() {

        var sessionId = "19926";
        var name = "SHINE";
        var application = "SHINE";
        var expiry = "2025-07-18 21:16:00.0";
        var data = "TEST";

        var resultSet = await setSession(sessionId, name, application, expiry, data);

        var expectedData = {

            'SESSIONID': ['19926'],
            'NAME': ['SHINE'],
            'APPLICATION': ['SHINE'],
            'DATA': ['TEST']

        };


        expect(resultSet).toMatchData(expectedData, ["SESSIONID", "NAME"]);
    });


}).addTags(["procedures"]);


export default {SqlExecutor,mockstarEnvironment,tableDataSet};

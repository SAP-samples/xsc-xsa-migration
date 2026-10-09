/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var DateUtils = (await $.import("sap.hana.testtools.unit.util", "dateUtils")).DateUtils;

var fixTodaysDate = new Date(2014, 0, 1, 0, 0, 0, 0); // valid month values:'0-11'
var dateUtilsForFixedDate = new DateUtils(fixTodaysDate);

/**
 * Test suite to test AT_SUPPLIER.attributeview
 * Mock the model, its dependent tables
 *  i) 'sap.hana.democontent.epm.data::EPM.MD.BusinessPartner',
	ii) 'sap.hana.democontent.epm.data::EPM.MD.Addresses',
*  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependent tables
 */


describe('TIME_DIM', function() {
//	var sqlExecutor = null;
//	var tableUtils = null;
//    var testTables = []; // contains the user schema
//	var tableSchema = '_SYS_BI';
//	var originTables = ['M_TIME_DIMENSION'];
//	var originalModel = 'sap.hana.democontent.epm.models/AT_TIME_DIM';
//	var testModel = null;
	
	 var sqlExecutor = null;
	var testEnvironment = null;

/* Insert new Time dimensions */
	
	function insertTimeDim(){
	    var Time_Data = {
	    	"DATETIMESTAMP" : "2014-01-01" ,
     		"DATE_SQL" :   "2014-01-01",
		    "DATETIME_SAP" : "2014-01-01",
		    "DATE_SAP" : "20140101",
		    "YEAR" : "2014",
		    "QUARTER" : "01",
		    "MONTH" : "01",
		    "WEEK" : "01",
		    "WEEK_YEAR" : "2014",
		    "DAY_OF_WEEK" : "01",
		    "DAY" : "01",
		    "CALQUARTER" : "0001",
		    "CALMONTH" : "000101",
		    "CALWEEK" : "000101",
		    "YEAR_INT":2014,
		    "QUARTER_INT" : 1,
		    "MONTH_INT":1,
		    "WEEK_INT": 1,
		    "WEEK_YEAR_INT": 1,
		    "DAY_OF_WEEK_INT": 1,
		    "DAY_INT": 1,
		    "HOUR" : "00",
		    "MINUTE" : "00",
		    "SECOND" : "00"
		};
	    testEnvironment.fillTestTable("timeData", [Time_Data,Time_Data]);
	}
	
	beforeOnce(function() {
		var definition = {
				schema : 'SAP_HANA_DEMO',
				model : {
					schema : '_SYS_BIC',
					name : 'sap.hana.democontent.epm.models/TIME_DIM'
				},
				
				substituteTables : {
					"timeData" : {
						schema : '_SYS_BI',
						name : 'M_TIME_DIMENSION'
	   			       }
			     	}
				  };
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});

	it('should not return any result when there are no products', function() {
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData({}, [ "YEAR" ]);
	});

	it('should return one time based record', function() {
		insertTimeDim();
		var expectedData = {
 		    "YEAR" : [ "2014" ],
 			"QUARTER" : [ "01" ],
 			"MONTH" : [ "01" ],
            "DATETIMESTAMP" : [fixTodaysDate],
            "DATETIME_SAP" : ["2014-01-01"]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData(expectedData, [ "DATETIME_SAP" ]);
	});
	
	
});
export default {SqlExecutor,mockstarEnvironment,DateUtils,fixTodaysDate,dateUtilsForFixedDate};

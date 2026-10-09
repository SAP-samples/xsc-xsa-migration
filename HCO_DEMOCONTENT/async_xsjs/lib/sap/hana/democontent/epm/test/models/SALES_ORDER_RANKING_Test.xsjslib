/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALES_ORDER_RANKING.calculationview
 * Mock the model, its dependent view i)SALES_ORDER_RANKING_SQL (replace with a test table) and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs comparison of sales based on year
 */


describe('SALES_ORDER_RANKING', function() {

	var sqlExecutor = null;
	var testEnvironment = null;
	var salesOrderTestTable = mockstarEnvironment.userSchema + '.SALES_ORDER_RANKING_SQL';
	
 /* creates a test table to replace the view SALES_ORDER_RANKING_SQL*/
	
	function createTestTable() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		var createString= 'create column table '+ salesOrderTestTable + 
				  ' as (SELECT TOP 0 "COMPANY_NAME","SALES", "ORDERS", "SALES_RANK", "ORDER_RANK" FROM \"sap.hana.democontent.epm.models::SALESORDER_RANKING\") with no data';
		sqlExecutor.execSingleIgnoreFailing('drop table ' + salesOrderTestTable);
		sqlExecutor.execSingle(createString);
	}
	
/* Create Sales Order */
	
	function createSalesOrder(companyName,sales,salesRank,orderRank)
	{
	    sqlExecutor = new SqlExecutor(jasmine.dbConnection);
	    var ORDERS  = "4";
	    sqlExecutor.execSingle('insert into ' + salesOrderTestTable + ' values (\''+ companyName + '\',\''+ sales+ '\',\''+
	    		ORDERS+ '\',\''+salesRank+ '\',\''+orderRank+ '\')');
	}
	

	/**
	 * call the function to create test table
	 * Define the model definition
	 * create an instance of mockstarEnvironment object : 'testEnvironment'
	 * The test model and defined test tables are created
	 */
		
	beforeOnce(function() {
	
		createTestTable();
		var definition = {
				schema : '_SYS_BIC',
				model : {
					schema : '_SYS_BIC',
					name : 'sap.hana.democontent.epm.models/SALESORDER_RANKING'
				},
				substituteViews : {
					"salesOrder" : {
						name :'sap.hana.democontent.epm.models/SALESORDER_RANKING_SQL',
						testTable : salesOrderTestTable
					}
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});
	

	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});

	it('should not return any result when there are no salesorder', function() {
		var actualData = sqlExecutor.execQuery('select COMPANY_NAME from ' + testEnvironment.getTestModelName() );//+

		expect(actualData).toMatchData({}, [ "COMPANY_NAME" ]);
	});

	it('should return the result', function() {
	   
	   createSalesOrder("SAP",300,1,2);
	   
		var expectedData = {
		    "COMPANY_NAME" : ["SAP"],
			"SALES" : ['300'],
			 "ORDERS" : ["4"],
			"SALES_RANK" : ["1"],
			"ORDER_RANK" : ["2"]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData(expectedData, [ "SALES" ]);
	});
	

	
});
export default {SqlExecutor,mockstarEnvironment};

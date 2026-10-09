/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALES_ORDER_RANKING_SQL.calculationview
 * Mock the model, its dependent view i)SALES_ORDER_RANKING (replace with a test table) and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs comparison of sales based on year
 */

describe('SALES_ORDER_RANKING_SQL', function() {
	var sqlExecutor = null;
	var testEnvironment = null;
	var salesOrderTestTable = mockstarEnvironment.userSchema + '.SALES_ORDER_RANKING';
	
/* creates a test table to replace the view SALES_RANKING_SQL */
	
	function createTestTable() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		var createString= 'create column table '+ salesOrderTestTable +
		    ' as (select top 0 COMPANYNAME, SUM(NETAMOUNT) as NETAMOUNT, SALESORDERID as SALESORDERID,' +
		    ' DATE_SQL from \"sap.hana.democontent.epm.models::SALES_ORDER_RANKING\" group by COMPANYNAME,SALESORDERID,DATE_SQL) with no data';
		sqlExecutor.execSingleIgnoreFailing('drop table ' + salesOrderTestTable);
		sqlExecutor.execSingle(createString);
	}
	
/*Create Sales Orders */
	
	function createSalesOrder(companyName,salesorderID,netAmount,dateSQL)
	{
	    sqlExecutor = new SqlExecutor(jasmine.dbConnection);
	    sqlExecutor.execSingle('insert into ' + salesOrderTestTable + ' values (\''+ companyName + '\',\''+ salesorderID+ '\',\''+netAmount+ '\',\''+dateSQL+ '\')');
	
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
					name : 'sap.hana.democontent.epm.models/SALESORDER_RANKING_SQL'
				},
				substituteViews : {
					"salesOrder" : {
						name :'sap.hana.democontent.epm.models/SALES_ORDER_RANKING',
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
		var actualData = sqlExecutor.execQuery('select COMPANY_NAME from ' + testEnvironment.getTestModelName() +
		    " ('PLACEHOLDER' = ('$$IP_FR_DTE$$', '2013'), 'PLACEHOLDER' = ('$$IP_TO_DTE$$', '2014'))");
		expect(actualData).toMatchData({}, [ "COMPANY_NAME" ]);
	});

	it('should calculate the sales Amount', function() {
	    createSalesOrder("SAP",300,"1234","2013-03-03");
	    createSalesOrder("SAP",200,"1235","2013-06-03");

		var expectedData = {
		    "COMPANY_NAME" : ["SAP"],
			"SALES" : ['500.00']
		};
		var actualData = sqlExecutor.execQuery('select COMPANY_NAME , SALES from ' + testEnvironment.getTestModelName() +
		    " ('PLACEHOLDER' = ('$$IP_FR_DTE$$', '2013'), 'PLACEHOLDER' = ('$$IP_TO_DTE$$', '2014'))");
		expect(actualData).toMatchData(expectedData, [ "SALES" ]);
	});
	

	it("should calculate the sales rank & order rank",function(){
	    createSalesOrder("SAP",300,"1234","2013-03-03");
	    createSalesOrder("SAP",200,"1235","2013-06-03");
	    createSalesOrder("Google",100,"1236","2013-03-03");
	    createSalesOrder("Google",200,"1237","2013-06-03");
	    createSalesOrder("Google",100,"1238","2013-06-03");

		var actualData = sqlExecutor.execQuery('select COMPANY_NAME, SALES, SALES_RANK, ORDER_RANK  from ' + testEnvironment.getTestModelName() +
		    " ('PLACEHOLDER' = ('$$IP_FR_DTE$$', '2013'), 'PLACEHOLDER' = ('$$IP_TO_DTE$$', '2014')) where COMPANY_NAME='SAP'");
		var expectedData = {
		    "COMPANY_NAME" : ["SAP"],
			"SALES" : ['500.00'],
			"SALES_RANK" : ['1'],
			"ORDER_RANK" : ['2']
		};
		expect(actualData).toMatchData(expectedData, [ "SALES" ]);
	});
	

});

export default {SqlExecutor,mockstarEnvironment};

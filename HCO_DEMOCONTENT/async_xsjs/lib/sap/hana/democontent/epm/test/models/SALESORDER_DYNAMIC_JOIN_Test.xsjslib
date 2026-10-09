/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALESORDER_DYNAMIC_JOIN.calculationview
 * Mock the model, its dependent view i)SALES_ORDER_LITE (replace with a test table) and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs comparison of sales based on year
 */

describe('SALESORDER_DYNAMIC_JOIN', function() {

	var sqlExecutor = null;
	var testEnvironment = null;
	var salesOrderTestTable = mockstarEnvironment.userSchema + '.SALES_ORDER_LITE';

/* creates a test table to replace the view SALES_ORDER_LITE */
	
	function createTestTable() {
		var sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		var createString = 'create column table '+ salesOrderTestTable + ' as (select top 0 SUM(NETAMOUNT) as NETAMOUNT, PRODUCTID, PRODUCT_NAME, COUNTRY, REGION from \"sap.hana.democontent.epm.models::SALES_ORDER_LITE\" group by PRODUCTID, PRODUCT_NAME, COUNTRY, REGION) with no data';
		sqlExecutor.execSingleIgnoreFailing('drop table ' + salesOrderTestTable);
		sqlExecutor.execSingle(createString);
	}
	
	function createSalesOrder(netAmount,productId,productName,country,region)
	{
	    sqlExecutor = new SqlExecutor(jasmine.dbConnection);
	    sqlExecutor.execSingle('insert into ' + salesOrderTestTable + ' values (\''+ netAmount + '\',\''+ productId + '\',\''+ productName + '\',\''+ country + '\',\''+ region + '\')');
	}
	
	/**
	 * call the function to create test table
	 * Define the model definition
	 * create an instance of mockstarEnvironment object : 'testEnvironment'
	 * The test model and defined test tables are created
	 */
    
beforeOnce(function () {
	createTestTable();
	
	var definition = {
			schema : '_SYS_BIC',
			model : {
				schema : '_SYS_BIC',
				name : 'sap.hana.democontent.epm.models/SALESORDER_DYNAMIC_JOIN'
			},
			substituteViews : {
				"salesOrder" : {
					name :'sap.hana.democontent.epm.models/SALES_ORDER_LITE',
					testTable : salesOrderTestTable
				}
			}
	};
	testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
    });

/* clear the test tables before executing every spec */

    beforeEach(function () {
    	sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
    });

/* check if the test model is created and doesn't contain any data */
    
	it('should not return any result when there are no products', function() {
		var actualData = sqlExecutor.execQuery('select REGION from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData({}, [ "REGION" ]);
	});

	it('should calculate the sales Amount', function() {
	    createSalesOrder(200,'HT_1234','speaker','US','AMER');
	    createSalesOrder(300,'HT_1234','speaker','US','AMER');
		var expectedData = {
		    "REGION" : ["AMER"],
			"COUNTRY" : ["US"],
			"PRODUCTID" : ["HT_1234"],
			"PRODUCT_NAME" : ["speaker"],
			"TOTAL_SALES" : [1000],
		    "SALES" : [1000],
		    "SHARE_SALES" : [1]
		};
	var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName() );
		expect(actualData).toMatchData(expectedData, [ "REGION" ]);
	});
	
	
});


export default {SqlExecutor,mockstarEnvironment};

/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALES_YEAR_COMPARISON.calculationview
 * Mock the model, its dependant view i)SALES_ORDER_LITE (replace with a test table) and store it in a test Schema
 * Insert test data to the dependant tables
 * Check if the model performs comparison of sales based on year
 */
describe('SALES_YEAR_COMPARISON', function() {
	var sqlExecutor = null;
	var testEnvironment = null;
	var salesOrderTestTable = mockstarEnvironment.userSchema + '.SALES_ORDER_LITE';

/* creates a test table to replace the view SALES_ORDER_LITE */
	function createTestTable() {
		var sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		var createString = 'create column table '+ salesOrderTestTable + ' as (select top 0 SUM(NETAMOUNT) as NETAMOUNT, PRODUCT_CATEGORY, YEAR from \"sap.hana.democontent.epm.models::SALES_ORDER_LITE\" group by PRODUCT_CATEGORY, YEAR) with no data';
		sqlExecutor.execSingleIgnoreFailing('drop table ' + salesOrderTestTable);
		sqlExecutor.execSingle(createString);
	}

/* creates a sales order */
	function createSalesOrder(netAmount,productCategory,year){
	    var i; 
	    var aSalesOrderData = [];
	    for(i=0;i<netAmount.length;i++){
	        aSalesOrderData.push({
	            NETAMOUNT: netAmount[i],
			    PRODUCT_CATEGORY: productCategory[i],
			    YEAR : year[i]    
	        });
	    }
		testEnvironment.fillTestTable("salesOrder",aSalesOrderData);
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
					name : 'sap.hana.democontent.epm.models/SALES_YEAR_COMPARISON'
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
	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});

/* check if the test model is created and doesnt contain any data */
	it('should not return any result when there are no salesorder', function() {
		var actualData = sqlExecutor.execQuery('select PRODUCT_CATEGORY from ' + testEnvironment.getTestModelName() +" ('PLACEHOLDER' = ('$$IP_YEAR_1$$', '2013'), 'PLACEHOLDER' = ('$$IP_YEAR_2$$', '2014'))");
		expect(actualData).toMatchData({}, [ "PRODUCT_CATEGORY" ]);
	});

/* create sales orders and check if the test model calculates sales amount */
	it('should calculate the sales Amount', function() {
		createSalesOrder([200,200,200],["Speaker","Speaker","Speaker"],["2013","2013","2014"]);

		var expectedData = {
				"YEAR1_NET_AMOUNT" : [400],
				"YEAR2_NET_AMOUNT" : [200],
				"PRODUCT_CATEGORY" : ["Speaker"]
		};
		var actualData = sqlExecutor.execQuery('SELECT sum("YEAR1_NET_AMOUNT") AS "YEAR1_NET_AMOUNT", sum("YEAR2_NET_AMOUNT") AS "YEAR2_NET_AMOUNT", "PRODUCT_CATEGORY" FROM  ' + testEnvironment.getTestModelName() + " ('PLACEHOLDER' = ('$$IP_YEAR_1$$', '2013'), 'PLACEHOLDER' = ('$$IP_YEAR_2$$', '2014'))" + ' GROUP BY "PRODUCT_CATEGORY"');
		expect(actualData).toMatchData(expectedData, [ "YEAR1_NET_AMOUNT" ]);
	});

/* create sales orders and check if the test model performs sales comparison based on year */
	it('should calculate the sales year comparison based on product category', function() {
		createSalesOrder([200,200,200,100,400],["Speaker","Speaker","Speaker","Flat Screen","Flat Screen"],["2013","2013","2014","2013","2014"]);
		
		var expectedData = {
				"YEAR1_NET_AMOUNT" : [100,400],
				"YEAR2_NET_AMOUNT" : [400,200],
				"PRODUCT_CATEGORY" : ["Flat Screen","Speaker"]
		};
		var actualData = sqlExecutor.execQuery('SELECT sum("YEAR1_NET_AMOUNT") AS "YEAR1_NET_AMOUNT", sum("YEAR2_NET_AMOUNT") AS "YEAR2_NET_AMOUNT", "PRODUCT_CATEGORY" FROM  ' + testEnvironment.getTestModelName() + " ('PLACEHOLDER' = ('$$IP_YEAR_1$$', '2013'), 'PLACEHOLDER' = ('$$IP_YEAR_2$$', '2014'))" + ' GROUP BY "PRODUCT_CATEGORY"');
		expect(actualData).toMatchData(expectedData, [ "YEAR1_NET_AMOUNT" ]);
	});

}).addTags(["models"]);
export default {SqlExecutor,mockstarEnvironment};

/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test POITEM.attributeview Mock the model, its dependent
 * tables
 * i)sap.hana.democontent.epm.data::MD.Products,
 * ii)sap.hana.democontent.epm.data::Util.Texts,
 * iii)sap.hana.democontent.epm.data::PO.Item,
 * and store it in a test Schema Insert test data to the dependent tables Check
 * if the model performs join of its dependent tables
 */


describe('PO_ITEM', function() {
	var sqlExecutor = null;
	var testEnvironment = null;
/* Creates new PO orders with appropriate status for each orders */	

	function createProductData()
	{
	 	var productsData = [{
		    "PRODUCTID" : "123",
		    "NAMEID" : "9876"
		},
		{
		    "PRODUCTID" : "124",
		    "NAMEID" : "9877"
		}];
	 	testEnvironment.fillTestTable("prodData",productsData);
	
	}
	
	function createTextData()
	{
	    var textsData = [{
		    "TEXTID" : "9876",
		    "TEXT" : "Hello",
		    "LANGUAGE" : "E"
		},
		{
		    "TEXTID" : "9877",
		    "TEXT" : "Hello",
		    "LANGUAGE" : "E"
		}];
	    	testEnvironment.fillTestTable("utilText",textsData);
  
	}
	
	function creatItemData()
	{
	    var itemData = [{
		    "PURCHASEORDERID" : "1111",
		    "PURCHASEORDERITEM" : "3333",
		    "PRODUCT.PRODUCTID" : "123",
		    "CURRENCY" : "INR",
		    "GROSSAMOUNT" :"100.23",
		    "NETAMOUNT" : "234",
		    "TAXAMOUNT" : "123.45",
		    "QUANTITY" : "2",
		    "QUANTITYUNIT" : "EA",
		    "DELIVERYDATE" :"20140303"
		},
		{
		    "PURCHASEORDERID" : "1112",
		    "PURCHASEORDERITEM" : "3334",
		    "PRODUCT.PRODUCTID" : "124",
		    "CURRENCY" : "INR",
		    "GROSSAMOUNT" :"100.23",
		    "NETAMOUNT" : "234",
		    "TAXAMOUNT" : "123.45",
		    "QUANTITY" : "2",
		    "QUANTITYUNIT" : "EA",
		    "DELIVERYDATE" :"20140303"
		}];
	    	testEnvironment.fillTestTable("itemData",itemData);	
	    
	}	

/**
 * Define the model definition create an instance of mockstarEnvironment object :
 * 'testEnvironment' The test model and defined test tables are created
 */
	beforeOnce(function() {
		var definition = {
				schema : 'SAP_HANA_DEMO',
				model : {
					schema : '_SYS_BIC',
					name : 'sap.hana.democontent.epm.models/PO_ITEM'
				},
				substituteTables : {
					"prodData" : 'sap.hana.democontent.epm.data::MD.Products',
					"utilText" : 'sap.hana.democontent.epm.data::Util.Texts',
					 "itemData" : 'sap.hana.democontent.epm.data::PO.Item'
				}
				
			
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec */
	
	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});
/* check if the test model is created and doesn't contain any data */
	
	it('should not return any result when there are no products', function() {
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData({}, [ "PRODUCT_PRODUCTID" ]);
	});
/* Creates New Product Data along with Text Data and check check if the test model performs join on Products & Items*/
	
	it('should return one product', function() {
	    createProductData();
	    createTextData();
	    creatItemData();

		var expectedData = {
			"PRODUCT_PRODUCTID" : [ "123" ],
			"ProductName" : [ "Hello" ],
			"PURCHASEORDERITEM" : ["3333"],
			"GROSSAMOUNT" : [ 100.23 ],
			"NETAMOUNT" : [ 234 ]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName() + ' where PRODUCT_PRODUCTID = \'123\' ');
		expect(actualData).toMatchData(expectedData, [ "PRODUCT_PRODUCTID" ]);
	});
	

});

export default {SqlExecutor,mockstarEnvironment};

/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test PURCHASE_COMMON_CURRENCY_analyticview
 * Mock the model, its dependent tables i)PO.Header ii)PO.Item and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model returns purchase overview
 */
describe('PURCHASE_COMMON_CURRENCY', function() {
	var sqlExecutor = null;
	var testEnvironment = null;

/*Creates a new purchase order with the converted currency for gross amount for a given set of purchaseOrderId,productId,currency */
	function createPurchaseOrder(purchaseOrderId,productId,curr)
	{
	  var productData = [{
                "PRODUCTID" : productId,
                "CATEGORY"  : "Laptop"
            },
            {
                "PRODUCTID" : productId + 1,
                "CATEGORY"  : "Laptop"
            }];
            
            var poitemData = [{
                "PURCHASEORDERID" : purchaseOrderId,
                "PRODUCT.PRODUCTID" : productId,
                "PURCHASEORDERITEM" :"PC",
                "CURRENCY" : curr,
                "GROSSAMOUNT" : 100
            },
            {
                "PURCHASEORDERID" : purchaseOrderId + 1,
                "PRODUCT.PRODUCTID" : productId + 1,
                "PURCHASEORDERITEM" :"PC",
                "CURRENCY" : curr,
                "GROSSAMOUNT" : 100
            }];
            var poheaderData = [{
                "PARTNER.PARTNERID" : "0100000002",
                "PURCHASEORDERID" : purchaseOrderId,
                "HISTORY.CREATEDAT" :  "2014-03-05"
            },
            {
                "PARTNER.PARTNERID" : "0100000003",
                "PURCHASEORDERID" : purchaseOrderId + 1,
                "HISTORY.CREATEDAT" :  "2014-03-05"
            }];
            
            var businesspartnerData = [{
                "ADDRESSES.ADDRESSID" : "333",
                "PARTNERID" : "0100000002",
                "COMPANYNAME" : "SAP"
            },
            {
                "ADDRESSES.ADDRESSID" : "334",
                "PARTNERID" : "0100000003",
                "COMPANYNAME" : "SAP"
            }];
            var addressData = [{
                "ADDRESSID" : "333",
                "CITY" : "Bangalore",
                "POSTALCODE" : "5678"
            },
            {
                "ADDRESSID" : "334",
                "CITY" : "Bangalore",
                "POSTALCODE" : "5678"
            }];

		
		testEnvironment.fillTestTable("products",productData);
		testEnvironment.fillTestTable("poItem",poitemData);
		testEnvironment.fillTestTable("poHeader",poheaderData);
        testEnvironment.fillTestTable("businessPartner",businesspartnerData);
        testEnvironment.fillTestTable("address",addressData);
   
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
					schema : '_SYS_BIC',
					name : 'sap.hana.democontent.epm.models/PURCHASE_COMMON_CURRENCY'
				},
				substituteTables : {
				    "products" : 'sap.hana.democontent.epm.data::MD.Products',
				    "poItem" : 'sap.hana.democontent.epm.data::PO.Item',
					"poHeader" : 'sap.hana.democontent.epm.data::PO.Header',
					"businessPartner" :'sap.hana.democontent.epm.data::MD.BusinessPartner',
					"address":'sap.hana.democontent.epm.data::MD.Addresses'
				}
			
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec*/
	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});
	
/* check if the test model is created and doesn't contain any data */
	it('should not return any result when there are no purchase orders', function() {
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName() + " ('PLACEHOLDER' = ('$$IP_O_TARGET_CURRENCY$$', 'EUR'))");
		expect(actualData).toMatchData({}, [ "CURRENCY" ]);
	});

/*create purchase orders and check if the test model returns purchase overview with the converted currency(EUR) for the gross amount */
	it('should return one product with target currency = EUR', function() {
		var purchaseOrderId = 1111, productId = 1234, curr = "USD";
		createPurchaseOrder(purchaseOrderId,productId,curr);
	var expectedData = {
                
			"PURCHASEORDERITEM" :"PC",
			"PARTNERID": ["0100000002"],
            "PRODUCTID": ["1234"],
            "GROSSAMOUNT" : [100],
            "CONVGROSSAMOUNT" : [106.38]

            };
		 var actualData = sqlExecutor.execQuery('select * from ' +  testEnvironment.getTestModelName() + " ('PLACEHOLDER' = ('$$IP_O_TARGET_CURRENCY$$', 'EUR')) where \"PARTNERID\" = '0100000002' ");

            expect(actualData).toMatchData(expectedData, ["PARTNERID"]);
		
	});
	
/*create purchase orders and check if the test model returns purchase overview with the converted currency(USD) for the gross amount */	
	it('should return one product with target currency = USD', function() {
		var purchaseOrderId = 1111, productId = 1234, curr = "EUR";
		createPurchaseOrder(purchaseOrderId,productId,curr);
	var expectedData = {
                
			"PURCHASEORDERITEM" :"PC",
			"PARTNERID": ["0100000002"],
            "PRODUCTID": ["1234"],
            "GROSSAMOUNT" : [100],
            "CONVGROSSAMOUNT" : [94]
            
            };
		 var actualData = sqlExecutor.execQuery('select * from ' +  testEnvironment.getTestModelName() + " ('PLACEHOLDER' = ('$$IP_O_TARGET_CURRENCY$$', 'USD')) where \"PARTNERID\" = '0100000002'");

            expect(actualData).toMatchData(expectedData, ["PARTNERID"]);
		
	});
});
export default {SqlExecutor,mockstarEnvironment};

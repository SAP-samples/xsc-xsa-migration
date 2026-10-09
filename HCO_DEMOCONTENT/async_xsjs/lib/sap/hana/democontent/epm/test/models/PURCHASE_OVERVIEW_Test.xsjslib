/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test PURCHASE_OVERVIEW.analyticview
 * Mock the model, its dependent tables i)PO.Header ii)PO.Item and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model returns purchase overview
 */
describe('PURCHASE_OVERVIEW', function() {
	var sqlExecutor = null;
	var testEnvironment = null;

/*Creates a new purchase order for given purchaseOrderId,productId */
	function createPurchaseOrder(purchaseOrderId,productId)
	{
	    var _purchaseOrderId = purchaseOrderId + 1;
	    
	 	var headerData = [{
		    "PURCHASEORDERID" : purchaseOrderId,
		    "HISTORY.CREATEDAT" :"2014-03-03",
		    "LIFECYCLESTATUS" : "L"
		},
		{
		    "PURCHASEORDERID" : _purchaseOrderId,
		    "HISTORY.CREATEDAT" :"2014-03-03",
		    "LIFECYCLESTATUS" : "L"
		}];
		var itemData = [{
		    "PURCHASEORDERID" : purchaseOrderId,
		    "PURCHASEORDERITEM" : "1010",
		    "PRODUCT.PRODUCTID" : productId,
		    "CURRENCY" : "INR",
		    "NETAMOUNT" : "500",
		    "TAXAMOUNT" : "100",
		    "QUANTITY" : "3",
		    "QUANTITYUNIT" : "EA"
		},
		{
		    "PURCHASEORDERID" : _purchaseOrderId,
		    "PURCHASEORDERITEM" : "1010",
		    "PRODUCT.PRODUCTID" : productId,
		    "CURRENCY" : "INR",
		    "NETAMOUNT" : "500",
		    "TAXAMOUNT" : "100",
		    "QUANTITY" : "3",
		    "QUANTITYUNIT" : "EA"
		}];
		
		testEnvironment.fillTestTable("poHeader",headerData);
		testEnvironment.fillTestTable("poItem",itemData);
   
	}
	
	/* Creates new Address */
	function createAddressData()
	{
	   var addressessData = [{
		    "ADDRESSID" : "1111",
		    "CITY" : "Bangalore",
		    "POSTALCODE" : "626001",
		    "STREET" : "Ull",
		    "BUILDING" : "SAP",
		    "COUNTRY" : "Ind",
		    "REGION" : "Asia"
		},
		{
		    "ADDRESSID" : "1112",
		    "CITY" : "Bangalore",
		    "POSTALCODE" : "626001",
		    "STREET" : "Ull",
		    "BUILDING" : "SAP",
		    "COUNTRY" : "Ind",
		    "REGION" : "Asia"
		}]; 
	   testEnvironment.fillTestTable("addressData",addressessData); 
	}
/* Creates new Product with partner*/	
	function createProductData(productId)
	{
	    	var productsData = [{
		    "PRODUCTID" : productId,
		    "TYPECODE" : "10",
		    "CATEGORY" :"XYZ",
		    "NAMEID" : "9876",
		    "DESCID" : "6789",
		    "SUPPLIER.PARTNERID" : "222",
		    "WEIGHTMEASURE" : "20.23",
		    "WEIGHTUNIT" :"Kg",
		    "CURRENCY" : "INR",
		    "PRICE" : "2000"
		},
		{
		    "PRODUCTID" : productId + 1,
		    "TYPECODE" : "10",
		    "CATEGORY" :"XYZ",
		    "NAMEID" : "9876",
		    "DESCID" : "6789",
		    "SUPPLIER.PARTNERID" : "222",
		    "WEIGHTMEASURE" : "20.23",
		    "WEIGHTUNIT" :"Kg",
		    "CURRENCY" : "INR",
		    "PRICE" : "2000"
		}];
	    	testEnvironment.fillTestTable("prodData",productsData);   
	}
/*Creates Text ID with small text */	
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

 /*Creates Text ID with small description */
function createTextDescData()
{
   	var textsDescData = [{
		    "TEXTID" : "6789",
		    "TEXT" : "Description",
		    "LANGUAGE" : "E"
		},
		{
		    "TEXTID" : "6790",
		    "TEXT" : "Description",
		    "LANGUAGE" : "E"
		}]; 
   	testEnvironment.fillTestTable("utilText",textsDescData);  
}

/* Creates a new BP data*/

function createBusinessPartnerData()
{
    	var businessPartnerData = [{
		    "ADDRESSES.ADDRESSID" : "1111",
		    "PARTNERID" : "222",
		    "COMPANYNAME" : "SAP"
		},
		{
		    "ADDRESSES.ADDRESSID" : "1112",
		    "PARTNERID" : "223",
		    "COMPANYNAME" : "SAP"
		}];
    	testEnvironment.fillTestTable("bpData",businessPartnerData);  
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
					name : 'sap.hana.democontent.epm.models/PURCHASE_OVERVIEW'
				},
				substituteTables : {
					"poHeader" : 'sap.hana.democontent.epm.data::PO.Header',
					"poItem" : 'sap.hana.democontent.epm.data::PO.Item',
					"addressData" : 'sap.hana.democontent.epm.data::MD.Addresses',
				    "prodData" :  'sap.hana.democontent.epm.data::MD.Products',
				    "utilText" : 'sap.hana.democontent.epm.data::Util.Texts',
				    "bpData" : 'sap.hana.democontent.epm.data::MD.BusinessPartner'
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec*/
	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});
	
/* check if the test model is created and doesnt contain any data */
	it('should not return any result when there are no purchase order', function() {
		var actualData = sqlExecutor.execQuery('select PURCHASEORDERID from ' + testEnvironment.getTestModelName() + ' group by PURCHASEORDERID');
		expect(actualData).toMatchData({}, [ "PURCHASEORDERID" ]);
	});

/*create purchase orders and check if the test model returns purchase overview */
	it('should return the purchase overview', function() {
		var purchaseOrderId = 1000, productId = 1234;
		
		// Fill test table of calc view PROD 
		createAddressData();
	    createProductData(productId);
	    createTextData();
	    createTextDescData();
	    createBusinessPartnerData();
	    
	    createPurchaseOrder(purchaseOrderId,productId);
	  
		var expectedData = {
		    "LIFECYCLESTATUS" : ["L"],
		    "PURCHASEORDERITEM" : ["1010"],
		    "CURRENCY" : ["INR"],
		    "QUANTITYUNIT" : ["EA"],
		    "QUANTITY" : [6],
			"NETAMOUNT" : [1000],
			"TAXAMOUNT" : [200]
		};
		
		var actualData = sqlExecutor.execQuery('select LIFECYCLESTATUS,PURCHASEORDERITEM,CURRENCY,QUANTITYUNIT,SUM(QUANTITY) as QUANTITY,SUM(NETAMOUNT) as NETAMOUNT,SUM(TAXAMOUNT) as TAXAMOUNT  from ' + testEnvironment.getTestModelName()  + ' where "PRODUCTID" = \'1234\' group by PRODUCTID,LIFECYCLESTATUS,PURCHASEORDERITEM,CURRENCY,QUANTITYUNIT ');
		expect(actualData).toMatchData(expectedData, [ "NETAMOUNT" ]);
	});
}).addTags(["models"]);
export default {SqlExecutor,mockstarEnvironment};

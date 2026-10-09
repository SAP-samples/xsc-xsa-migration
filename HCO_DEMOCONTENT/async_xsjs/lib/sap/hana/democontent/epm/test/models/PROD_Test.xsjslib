/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test PROD.attributeview Mock the model, its dependent
 * tables
 * i)'sap.hana.democontent.epm.data::MD.Addresses',
 * ii)'sap.hana.democontent.epm.data::MD.Products'
 * iii)'sap.hana.democontent.epm.data::Util.Texts'
 * iv)'sap.hana.democontent.epm.data::MD.BusinessPartner'
 * and store it in a test Schema Insert test data to the dependent tables Check
 * if the model performs join of its dependent tables
 */

describe('PROD', function() {
	var sqlExecutor = null;
	var testEnvironment = null;

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
	function createProductData()
	{
	    var productsData = [{
		    "PRODUCTID" : "1234",
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
		    "PRODUCTID" : "1235",
		    "TYPECODE" : "10",
		    "CATEGORY" :"XYZ",
		    "NAMEID" : "9876",
		    "DESCID" : "6789",
		    "SUPPLIER.PARTNERID" : "223",
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
 *  Define the model definition create an instance of mockstarEnvironment object :
 * 'testEnvironment' The test model and defined test tables are created
 */	

beforeOnce(function() {
	var definition = {
			schema : 'SAP_HANA_DEMO',
			model : {
				schema : '_SYS_BIC',
				name : 'sap.hana.democontent.epm.models/PROD'
			},
			substituteTables : {
				"addressData" : 'sap.hana.democontent.epm.data::MD.Addresses',
				"prodData" :  'sap.hana.democontent.epm.data::MD.Products',
				"utilText" : 'sap.hana.democontent.epm.data::Util.Texts',
				"bpData" : 'sap.hana.democontent.epm.data::MD.BusinessPartner'
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
		expect(actualData).toMatchData({}, [ "PRODUCTID" ]);
	});

	it('should return one product detail ', function() {
	    createAddressData();
	    createProductData();
	    createTextData();
	    createTextDescData();
	    createBusinessPartnerData();

		var expectedData = {
			"PRODUCTID" : [ "1234" ],
			"PRODUCT_TYPECODE" : ["10"],
			"PRODUCT_CATEGORY" : ["XYZ"],
			"PRODUCT_NAME" : [ "Hello" ],
			"PRODUCT_DESCRIPTION" : ["Description"]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName() + ' where PRODUCTID = \'1234\'');
		expect(actualData).toMatchData(expectedData, [ "PRODUCTID" ]);
	});

});

export default {SqlExecutor,mockstarEnvironment};

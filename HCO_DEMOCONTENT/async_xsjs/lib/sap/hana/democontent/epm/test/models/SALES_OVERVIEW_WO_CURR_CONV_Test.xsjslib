/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALES_OVERVIEW_WO_CURR_CONV.analytical view
 * Mock the model, its dependent tables 
 * i) sap.hana.democontent.epm.data::SO.Header,
 * ii)sap.hana.democontent.epm.data::SO.Item, 
 *  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependant tables
 */

describe('SALES_OVERVIEW_WO_CURR_CONV', function() {
	var sqlExecutor = null;
	var testEnvironment = null;
/* Creates new sales orders */	
function createSalesOrder(salesOrderID){
	    var headerData = [{
		    "SALESORDERID" : salesOrderID,
		    "CURRENCY" : "INR",
		    "LIFECYCLESTATUS" : "A",
		    "DELIVERYSTATUS" : "A",
		    "HISTORY.CREATEDAT" : "20140101",
		    "BILLINGSTATUS" : "A",
		    "HISTORY.CREATEDBY.EMPLOYEEID" : "TestAD", 
		    "PARTNER.PARTNERID" : "222"
		},
		{
		    "SALESORDERID" : salesOrderID + 1,
		    "CURRENCY" : "INR",
		    "LIFECYCLESTATUS" : "A",
		    "DELIVERYSTATUS" : "A",
		    "HISTORY.CREATEDAT" : "20140101",
		    "BILLINGSTATUS" : "A",
		    "HISTORY.CREATEDBY.EMPLOYEEID" : "TestAD", 
		    "PARTNER.PARTNERID" : "223"
		}];
		var itemData = [{
		    "SALESORDERID" : salesOrderID,
		    "SALESORDERITEM" : "3333",
		    "QUANTITYUNIT" : "NO",
		    "PRODUCT.PRODUCTID" : "1234",
		    "QUANTITY" : "2",
		    "NETAMOUNT" : "200",
		    "TAXAMOUNT" : "50"
	},
	{
		    "SALESORDERID" : salesOrderID + 1,
		    "SALESORDERITEM" : "3333",
		    "QUANTITYUNIT" : "NO",
		    "PRODUCT.PRODUCTID" : "1234",
		    "QUANTITY" : "2",
		    "NETAMOUNT" : "200",
		    "TAXAMOUNT" : "50"
	}];
 		
		
		testEnvironment.fillTestTable("soHeader",headerData);
		testEnvironment.fillTestTable("soItem",itemData);
		
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
		    "NAMEID" : "9877",
		    "DESCID" : "6790",
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
 * Define the model definition
 * create an instance of mockstarEnvironment object : 'testEnvironment'
 * The test model and defined test tables are created
 */
 
	beforeOnce(function() {
		var definition = {
				schema : 'SAP_HANA_DEMO',
				model : {
					schema : '_SYS_BIC',
					name : 'sap.hana.democontent.epm.models/SALES_OVERVIEW_WO_CURR_CONV'
				},
				substituteTables : {
					"soHeader" : 'sap.hana.democontent.epm.data::SO.Header',
					"soItem" : 'sap.hana.democontent.epm.data::SO.Item',
					
					/* Replacing dependency calc views PROD/BUYER tables by test tables*/
					
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

/* check if the test model is created and doesn't contain any data */

	it('should not return any data when there are no salesorders', function() {
		var actualData = sqlExecutor.execQuery('select SALESORDERID from ' + testEnvironment.getTestModelName() + ' group by SALESORDERID');
		expect(actualData).toMatchData({}, [ "SALESORDERID" ]);
	});

/*create sales orders and check if the test model returns sales overview */
it('should return overview of salesorder', function() {
    
    /* Fill test table of calc views PROD/BUYER */
	    createAddressData();
	    createProductData();
	    createTextData();
	    createTextDescData();
	    createBusinessPartnerData();
	    
		createSalesOrder("1111");
		var expectedData = {
		    "SALESORDERID" : ["1111"],
		    "SALESORDERITEM" : ["3333"],
		    "CURRENCY" : ["INR"],
		    "LIFECYCLESTATUS" : ["A"],
		    "DELIVERYSTATUS" : ["A"],
		    "QUANTITYUNIT" : ["NO"],
		    "BILLINGSTATUS" : ["A"],
		    "NETAMOUNT" : [200],
		    "HISTORY_CREATEDBY" : ["TestAD"],
		    "TAXAMOUNT" : [50]
		};
 		var actualData = sqlExecutor.execQuery('select CURRENCY, LIFECYCLESTATUS, DELIVERYSTATUS, POSTING_DATE as HISTORY_CREATEDAT, SALESORDERID, SALESORDERITEM, QUANTITYUNIT, BILLINGSTATUS,' +
 		' SUM("NETAMOUNT") as "NETAMOUNT", HISTORY_CREATEDBY, SUM("TAXAMOUNT") as "TAXAMOUNT"  from ' +
 		 testEnvironment.getTestModelName() + ' where "SALESORDERID" = \'1111\' group by CURRENCY, LIFECYCLESTATUS, DELIVERYSTATUS, POSTING_DATE, SALESORDERID, SALESORDERITEM, QUANTITYUNIT, BILLINGSTATUS, HISTORY_CREATEDBY');
         expect(actualData).toMatchData(expectedData, [ "SALESORDERID" ]);
	});
	
}).addTags(["models"]);
export default {SqlExecutor,mockstarEnvironment};

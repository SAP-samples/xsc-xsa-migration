/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
/**
 * Test suite to test SALES_ORDER_DYNAMIC_TIME_PERIOD.analytical view
 * Mock the model, its dependent tables 
 * i) sap.hana.democontent.epm.data::SO.Header,
 * ii)sap.hana.democontent.epm.data::SO.Item, 
 * iii)sap.hana.democontent.epm.models/BUYER,
 * iv)sap.hana.democontent.epm.models/PROD
 *  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependent tables
 */
 
describe('SALES_ORDER_DYNAMIC_TIME_PERIOD', function() {
	var sqlExecutor = null;
	var testEnvironment = null;
/*Creates a new sales order for given salesOrderId*/
	
	function createSalesOrder(soId)
	   {
		var headerData = [{
				"SALESORDERID" : soId,
				"HISTORY.CREATEDBY.EMPLOYEEID" : "anita",
				"PARTNER.PARTNERID" : "222",
				"HISTORY.CREATEDAT" : "20140101",
				"NOTEID" : "0012341"				
			},
			{
				"SALESORDERID" : soId + 1,
				"HISTORY.CREATEDBY.EMPLOYEEID" : "anita",
				"PARTNER.PARTNERID" : "223",
				"HISTORY.CREATEDAT" : "20140101",
				"NOTEID" : "0012341"				
			}];
			var itemData = [{
			    	"SALESORDERID" : soId, 
					"SALESORDERITEM" : "00000090",
					"PRODUCT.PRODUCTID" : "1234",
					"NOTEID" : "0012341",
					"NETAMOUNT" : "899.23"
			},
			{
			    	"SALESORDERID" : soId + 1, 
					"SALESORDERITEM" : "00000090",
					"PRODUCT.PRODUCTID" : "1235",
					"NOTEID" : "0012341",
					"NETAMOUNT" : "899.23"
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
					name : 'sap.hana.democontent.epm.models/SALES_ORDER_DYNAMIC_TIME_PERIOD'
				},
				substituteTables : {
					"soHeader" : 'sap.hana.democontent.epm.data::SO.Header',
					"soItem" : 'sap.hana.democontent.epm.data::SO.Item',
					
					/* Replacing dependency calc view PROD/BUYER tables by test tables*/
					
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
	it('should not return any data when there are no salesorders', function() {
		var actualData = sqlExecutor.execQuery("SELECT SALESORDERID,SALESORDERITEM FROM " + testEnvironment.getTestModelName() +" ('PLACEHOLDER' = ('$$IP_StartDate$$', '20131201'), 'PLACEHOLDER' = ('$$IP_EndDate$$', '20140101'), 'PLACEHOLDER' = ('$$IP_PeriodType$$', 'Start Date-End Date')) LIMIT 1");
		expect(actualData).toMatchData({}, [ "SALESORDERID" ]);
	});
	
/*create sales orders and check if the test model returns sales overview */	
  it('should select sales order between the given time period', function() {
      
      /* Fill test table of calc views PROD/BUYER */
	    createAddressData();
	    createProductData();
	    createTextData();
	    createTextDescData();
	    createBusinessPartnerData();
      
	  createSalesOrder("8765");
        var expectedData = {
        		"SALESORDERID" : ["8765"],
         		"SALESORDERITEM" : ["00000090"]
             }; 
		var actualData = sqlExecutor.execQuery('select SALESORDERID,SALESORDERITEM  from ' + testEnvironment.getTestModelName() +" ('PLACEHOLDER' =  ('$$IP_StartDate$$', '20140101'), 'PLACEHOLDER' = ('$$IP_EndDate$$', '20150101'), 'PLACEHOLDER' = ('$$IP_PeriodType$$', 'Start Date-End Date')) where \"SALESORDERID\" = '8765' GROUP BY SALESORDERID,SALESORDERITEM ");
		expect(actualData).toMatchData(expectedData, [ "SALESORDERID" ]);
 
	});
  
}).addTags(["models"]);
export default {SqlExecutor,mockstarEnvironment};

/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var DateUtils = (await $.import("sap.hana.testtools.unit.util", "dateUtils")).DateUtils;

var fixTodaysDate = new Date(2014, 0, 1, 0, 0, 0, 0); // valid month values:'0-11'
var dateUtilsForFixedDate = new DateUtils(fixTodaysDate);

/**
 * Test suite to test SALES_ORDER_LITE.attributeview
 * Mock the model, its dependent tables i) SO.Header ii) SO.Item iii)PROD iv) BUYER  v)TIME_DIM and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependant tables
 */
describe('SALES_ORDER_LITE', function() {

	var sqlExecutor = null;
	var testEnvironment = null;

/* Creates new sales orders */

function createSalesOrder(salesOrderID){
	    var headerData = [{
		    "SALESORDERID" : salesOrderID,
		    "PARTNER.PARTNERID" : "222",
		    "HISTORY.CREATEDAT" : "20140101"
		},
		{
		    "SALESORDERID" : salesOrderID + 1,
		    "PARTNER.PARTNERID" : "223",
		    "HISTORY.CREATEDAT" : "20140101"
		}];
		var itemData = [{
		    "SALESORDERID" : salesOrderID,
		    "SALESORDERITEM" : "3333",
		    "PRODUCT.PRODUCTID" : "1234",
		    "NETAMOUNT" : "200"
		},
		{
		    "SALESORDERID" : salesOrderID + 1,
		    "SALESORDERITEM" : "3334",
		    "PRODUCT.PRODUCTID" : "1235",
		    "NETAMOUNT" : "200"
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
	   

/* Insert new Time dimensions */
	
	function insertTimeDim(){
	    var Time_Data = {
	    	"DATETIMESTAMP" : "2014-01-01" ,
     		"DATE_SQL" :   "2014-01-01",
		    "DATETIME_SAP" : "2014-01-01",
		    "DATE_SAP" : "20140101",
		    "YEAR" : "2014",
		    "QUARTER" : "01",
		    "MONTH" : "01",
		    "WEEK" : "01",
		    "WEEK_YEAR" : "2014",
		    "DAY_OF_WEEK" : "01",
		    "DAY" : "01",
		    "CALQUARTER" : "0001",
		    "CALMONTH" : "000101",
		    "CALWEEK" : "000101",
		    "YEAR_INT":2014,
		    "QUARTER_INT" : 1,
		    "MONTH_INT":1,
		    "WEEK_INT": 1,
		    "WEEK_YEAR_INT": 1,
		    "DAY_OF_WEEK_INT": 1,
		    "DAY_INT": 1,
		    "HOUR" : "00",
		    "MINUTE" : "00",
		    "SECOND" : "00"
		};
	    testEnvironment.fillTestTable("timeData", [Time_Data,Time_Data]);
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
					name : 'sap.hana.democontent.epm.models/SALES_ORDER_LITE'
				},
				substituteTables : {
					"soHeader" : 'sap.hana.democontent.epm.data::SO.Header',
					"soItem" : 'sap.hana.democontent.epm.data::SO.Item',
					
					/* Replacing dependency calc view PROD tables by test tables*/
					
					"addressData" : 'sap.hana.democontent.epm.data::MD.Addresses',
				    "prodData" :  'sap.hana.democontent.epm.data::MD.Products',
				    "utilText" : 'sap.hana.democontent.epm.data::Util.Texts',
				    "bpData" : 'sap.hana.democontent.epm.data::MD.BusinessPartner',
				    
				    /*Replacing dependency calc view TIME_DIM by test tables */
				    
				    "timeData" : {
						schema : '_SYS_BI',
						name : 'M_TIME_DIMENSION'
	   			    }
					
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
		var actualData = sqlExecutor.execQuery('select SALESORDERID from ' + testEnvironment.getTestModelName() + ' group by SALESORDERID');
		expect(actualData).toMatchData({}, [ "SALESORDERID" ]);
	});

/*create sales orders and check if the test model returns sales overview */
	it('should return sales order', function() {
	    
	    /* Fill test table of calc view PROD */
	    createAddressData();
	    createProductData();
	    createTextData();
	    createTextDescData();
	    createBusinessPartnerData();
	    
	    /* Fill test table of calc view TIME_DIM */
	    insertTimeDim();
	    
		createSalesOrder('1111');
		var expectedData = {
		    "SALESORDERID" : ["1111"],
		    "SALESORDERITEM" : ["3333"],
		    "NETAMOUNT" : [200]
		};
		var actualData = sqlExecutor.execQuery('select SALESORDERID, SALESORDERITEM, SUM("NETAMOUNT") as "NETAMOUNT"  from ' 
		    + testEnvironment.getTestModelName() + ' where "SALESORDERID" = \'1111\' group by SALESORDERID, SALESORDERITEM');
		expect(actualData).toMatchData(expectedData, [ "SALESORDERID" ]);
	});
	
	it('Should calculate sum of NetAmount grouped by salesOrderItem',function(){
		
		/* Fill test table of calc view PROD */
	    createAddressData();
	    createProductData();
	    createTextData();
	    createTextDescData();
	    createBusinessPartnerData();
	    
	    /* Fill test table of calc view TIME_DIM */
	    insertTimeDim();

		
		createSalesOrder('1111');
		createSalesOrder('1113');
		var expectedData = {
		    "SALESORDERITEM" : ["3333"],
		   "NETAMOUNT" : [400]
		};
		var actualData = sqlExecutor.execQuery('select SALESORDERITEM, SUM("NETAMOUNT") as "NETAMOUNT"  from ' + testEnvironment.getTestModelName() + ' where "SALESORDERITEM" = \'3333\' group by SALESORDERITEM');
		expect(actualData).toMatchData(expectedData, [ "NETAMOUNT" ]);
	});
}).addTags(["models"]);	
	

export default {SqlExecutor,mockstarEnvironment,DateUtils,fixTodaysDate,dateUtilsForFixedDate};

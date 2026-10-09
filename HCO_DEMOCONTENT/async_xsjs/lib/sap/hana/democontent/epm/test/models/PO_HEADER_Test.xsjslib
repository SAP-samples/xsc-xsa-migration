/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test PO_HEADER.attributeview
 * Mock the model, its dependent tables 
 * i)sap.hana.democontent.epm.data::PO.Header',
 * ii)'sap.hana.democontent.epm.data::Util.Constants' 
 * and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependent tables
 */

describe('PO_HEADER', function() {
	var sqlExecutor = null;
	var testEnvironment = null;
/* Creates new PO orders with appropriate status for each orders*/	

	function createHeaderData(poId)
	{
	   var headerData = [{
		    "PURCHASEORDERID" : poId,
		    "HISTORY.CREATEDBY.EMPLOYEEID" : "1234",
		    "HISTORY.CREATEDAT" : "20140303",
		    "HISTORY.CHANGEDBY.EMPLOYEEID" : "5678",
		    "HISTORY.CHANGEDAT" : "20140606",
		    "NOTEID" : "222",
		    "PARTNER.PARTNERID" : "1234",
		    "CURRENCY" : "INR",
		    "GROSSAMOUNT" :"100.23",
		    "NETAMOUNT" : "234",
		    "TAXAMOUNT" : "123.45",
		    "LIFECYCLESTATUS" : "L",
		    "APPROVALSTATUS" : "A",
		    "CONFIRMSTATUS" : "C",
		    "ORDERINGSTATUS" : "I",
		    "INVOICINGSTATUS" : "I"
		},
		{
		    "PURCHASEORDERID" : ++poId,
		    "HISTORY.CREATEDBY.EMPLOYEEID" : "1234",
		    "HISTORY.CREATEDAT" : "20140303",
		    "HISTORY.CHANGEDBY.EMPLOYEEID" : "5678",
		    "HISTORY.CHANGEDAT" : "20140606",
		    "NOTEID" : "222",
		    "PARTNER.PARTNERID" : "1234",
		    "CURRENCY" : "INR",
		    "GROSSAMOUNT" :"100.23",
		    "NETAMOUNT" : "234",
		    "TAXAMOUNT" : "123.45",
		    "LIFECYCLESTATUS" : "L",
		    "APPROVALSTATUS" : "A",
		    "CONFIRMSTATUS" : "C",
		    "ORDERINGSTATUS" : "I",
		    "INVOICINGSTATUS" : "I"
		}];
	   testEnvironment.fillTestTable("poHeader",headerData); 	
	}

/*Setting the newly created PO with the status = Approval Status Confirmed */	

	function createConstantData()
	{
	    var constantsData = [{
		    "DOMAIN" : "D_PO_AP",
		    "LANGUAGE" : "E",
		    "FIXEDVALUE" : "A",
		    "DESCRIPTION" : "Approval Status Confirmed"
		},
		{
		    "DOMAIN" : "D_PO_AP",
		    "LANGUAGE" : "D",
		    "FIXEDVALUE" : "A",
		    "DESCRIPTION" : "Approval Status Confirmed"
		}];
	    	testEnvironment.fillTestTable("utilCons",constantsData);	
	}

/*Setting the newly created PO with the status = Confirmation Status Confirmed*/

	function createConfirmationData()
	{
	   	var confirmationData = [{
		    "DOMAIN" : "D_PO_CF",
		    "LANGUAGE" : "E",
		    "FIXEDVALUE" : "C",
		    "DESCRIPTION" : "Confirmation Status Confirmed"
		},
		{
		    "DOMAIN" : "D_PO_CF",
		    "LANGUAGE" : "D",
		    "FIXEDVALUE" : "C",
		    "DESCRIPTION" : "Confirmation Status Confirmed"
		}]; 
	   	testEnvironment.fillTestTable("utilCons",confirmationData);   
	}
	
/*Setting the newly created PO with the status = Life cycle Status Confirmed*/

	function createLifecycleData()
	{
	    var lifecycleData = [{
		    "DOMAIN" : "D_PO_LC",
		    "LANGUAGE" : "E",
		    "FIXEDVALUE" : "L",
		    "DESCRIPTION" : "Lifecycle Status Confirmed"
		},
		{
		    "DOMAIN" : "D_PO_LC",
		    "LANGUAGE" : "D",
		    "FIXEDVALUE" : "L",
		    "DESCRIPTION" : "Lifecycle Status Confirmed"
		}];
	    testEnvironment.fillTestTable("utilCons",lifecycleData);
    }

/*Setting the newly created PO with the status = Ordering Status Confirmed*/    
    
	function createOrderingData()
    {	var orderingData = [{
		    "DOMAIN" : "D_PO_OR",
		    "LANGUAGE" : "E",
		    "FIXEDVALUE" : "I",
		    "DESCRIPTION" : "Ordering Status Confirmed"
		},
		{
		    "DOMAIN" : "D_PO_OR",
		    "LANGUAGE" : "D",
		    "FIXEDVALUE" : "I",
		    "DESCRIPTION" : "Ordering Status Confirmed"
		}];
      testEnvironment.fillTestTable("utilCons",orderingData); 
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
					name : 'sap.hana.democontent.epm.models/PO_HEADER'
				},
				substituteTables : {
					"poHeader" : 'sap.hana.democontent.epm.data::PO.Header',
					"utilCons" : 'sap.hana.democontent.epm.data::Util.Constants'
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
	
	it('should not return any result when there are no PO', function() {
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData({}, [ "PURCHASEORDERID" ]);
	});
	
/*create PO orders and check if the test model returns the status of the PO */
	
	it('should return one PO with the status', function() {
    var poId = "1111";
    createHeaderData(poId);
    createConstantData();
    createConfirmationData();
    createLifecycleData();
    createOrderingData();

		var expectedData = {
			"PURCHASEORDERID" : [ "1111" ],
		    "APPROVALSTATUSDESC" : ["Approval Status Confirmed"],
		    "CONFIRMSTATUSDESC" : ["Confirmation Status Confirmed"],
		    "ORDERINGSTATUSDESC" : ["Ordering Status Confirmed"],
		    "LIFECYCLESTATUSDESC" : ["Lifecycle Status Confirmed"],
			"GROSSAMOUNT" : [ 100.23 ],
			"NETAMOUNT" : [ 234 ]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName() + ' where PURCHASEORDERID = \'1111\'');
		expect(actualData).toMatchData(expectedData, [ "PURCHASEORDERID" ]);
	});
	
   
}).addTags(["models"]);

export default {SqlExecutor,mockstarEnvironment};

/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test BUYER.attributeview
 * Mock the model, its dependent tables 
 * i) MD.Addresses
 * ii) MD.BusinessPartner
 *  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependant tables
 */
describe('BUYER', function() {
	var sqlExecutor = null;
	var testEnvironment = null;

/* adds a new BP with given partnerId,addressId */
	function addBusinessPartner(partnerId,addressId){
	    var businessPartnerData = [{
		    "ADDRESSES.ADDRESSID" : addressId,
		    "PARTNERID" : partnerId,
		    "PARTNERROLE" : "CUS",
		    "EMAILADDRESS" : "bob.muller@sap.com",
		    "COMPANYNAME" : "SAP",
		    "LEGALFORM" : "AG"
		},
		{
		    "ADDRESSES.ADDRESSID" : ++addressId,
		    "PARTNERID" : ++partnerId,
		    "PARTNERROLE" : "CUS",
		    "EMAILADDRESS" : "bob.muller@sap.com",
		    "COMPANYNAME" : "SAP",
		    "LEGALFORM" : "AG"
		}];
		testEnvironment.fillTestTable("businessPartner",businessPartnerData);
	}

/* adds a new BP address with given addressId */	
	function addBusinessPartnerAddress(addressId){
	    var addressessData = [{
		    "ADDRESSID" : addressId,
		    "CITY" : "Bangalore",
		    "POSTALCODE" : "626001",
		    "STREET" : "whitefield",
		    "BUILDING" : "SAP",
		    "COUNTRY" : "Ind",
		    "REGION" : "Asia"
		},
		{
		    "ADDRESSID" : ++addressId,
		    "CITY" : "Bangalore",
		    "POSTALCODE" : "626001",
		    "STREET" : "whitefield",
		    "BUILDING" : "SAP",
		    "COUNTRY" : "Ind",
		    "REGION" : "Asia"
		}];
		testEnvironment.fillTestTable("address",addressessData);
		
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
					name : 'sap.hana.democontent.epm.models/BUYER'
				},
				substituteTables : {
					"address" : 'sap.hana.democontent.epm.data::MD.Addresses',
					"businessPartner" : 'sap.hana.democontent.epm.data::MD.BusinessPartner'
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
	it('should not return any data when there are no products', function() {
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData({}, [ "PARTNERID" ]);
	});

/* add BP & BP address and check if the test model performs join on BP & BP address */	
	it('should return BusinessPartner Data', function() {
		var partnerId = 1234, addressId = 1111;
		addBusinessPartner(partnerId,addressId);
		addBusinessPartnerAddress(addressId);
		addBusinessPartner(++partnerId,++addressId);
		
		var expectedData = {
		    "CITY" : ["Bangalore"],
		    "POSTALCODE" : ["626001"],
		    "STREET" : ["whitefield"],
		    "BUILDING" : ["SAP"],
		    "COUNTRY" : ["Ind"],
			"PARTNERID" : [ "1234" ],
			"EMAILADDRESS" : ["bob.muller@sap.com"],
			"COMPANYNAME" : ["SAP"],
			"REGION" : ["Asia"],
			"PARTNERROLE" : ["CUS"],
			"LEGALFORM" : ["AG"]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName() + ' where PARTNERID = \'1234\' ');
		expect(actualData).toMatchData(expectedData, [ "PARTNERID" ]);
	});
		
}).addTags(["models"]);
export default {SqlExecutor,mockstarEnvironment};

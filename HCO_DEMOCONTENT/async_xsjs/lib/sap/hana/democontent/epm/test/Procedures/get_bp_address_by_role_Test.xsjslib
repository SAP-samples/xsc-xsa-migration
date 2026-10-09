/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = await $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test get_bp_address_by_role.hdbprocedure
 * Mock the procedure, its dependant table i)MD.BusinessPartner,ii)MD.Addresses and store it in a test Schema
 * Insert test data to the dependant table
 * Check if the procedure returns Bpaddress for the given role
 */
describe('get_bp_address_by_role', function() {
	var testEnvironment = null;
	
/* returns the BPaddress for the given partnerRole*/
	async function getBpAddressByRole(partnerRole) {
	    var callStatement = 'CALL ' + testEnvironment.getTestModelName() + '(?,?) ';
        var callable = jasmine.dbConnection.prepareCall(callStatement);
        callable.setString(1,partnerRole);
        await callable.execute();
        var resultSet = tableDataSet.createFromResultSet(callable.getResultSet());
        await callable.close();
        return resultSet;
	}
	
	function createBusinessPartnerAddress(addressId){
	    var addressessData = [{
		    "ADDRESSID" : addressId,
		    "CITY" : "Bangalore",
		    "POSTALCODE" : "626001",
		    "STREET" : "Ull",
		    "BUILDING" : "SAP",
		    "COUNTRY" : "Ind",
		    "REGION" : "Asia"
		},
		{
		    "ADDRESSID" : ++addressId,
		    "CITY" : "Bangalore",
		    "POSTALCODE" : "626001",
		    "STREET" : "Ull",
		    "BUILDING" : "SAP",
		    "COUNTRY" : "Ind",
		    "REGION" : "Asia"
		}];
		testEnvironment.fillTestTable("address",addressessData);
	}
	
	function createBusinessPartner(partnerId,addressId){
	    var businessPartnerData = [{
		    "ADDRESSES.ADDRESSID" : addressId,
		    "PARTNERID" : partnerId,
		    "PARTNERROLE" : "CUS",
		    "EMAILADDRESS" : "jim.tim@sap.com",
		    "COMPANYNAME" : "SAP",
		    "LEGALFORM" : "Form16"
		},
		{
		    "ADDRESSES.ADDRESSID" : ++addressId,
		    "PARTNERID" : ++partnerId,
		    "PARTNERROLE" : "PTR",
		    "EMAILADDRESS" : "jim.tim@sap.com",
		    "COMPANYNAME" : "SAP",
		    "LEGALFORM" : "Form16"
		}];
		testEnvironment.fillTestTable("businessPartner",businessPartnerData);
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
					name : 'sap.hana.democontent.epm.Procedures/get_bp_addresses_by_role'
				},
				substituteTables : {
					"businessPartner" : 'sap.hana.democontent.epm.data::MD.BusinessPartner',
					"address" : 'sap.hana.democontent.epm.data::MD.Addresses'
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec */
	beforeEach(function() {
		testEnvironment.clearAllTestTables();
	});

/* check if it returns the Bpaddress for the given role */
	 it('Should return bp address for the given role', async function() {
		createBusinessPartner(1234,1111);
		createBusinessPartnerAddress(1111);
		var resultSet = await getBpAddressByRole('CUS');
		var expectedData = {
		    "CITY" : ["Bangalore"],
		    "POSTALCODE" : ["626001"],
		    "STREET" : ["Ull"],
			"PARTNERID" : [ "1234" ],
			"PARTNERROLE" : ["CUS"],
			"EMAILADDRESS" : ["jim.tim@sap.com"],
			"ADDRESSID" : ["1111"],
			"COMPANYNAME" : ["SAP"]
		};
		expect(resultSet).toMatchData(expectedData, [ "PARTNERID" ]);
	
	});
}).addTags(["procedures"]);
export default {SqlExecutor,mockstarEnvironment,tableDataSet};

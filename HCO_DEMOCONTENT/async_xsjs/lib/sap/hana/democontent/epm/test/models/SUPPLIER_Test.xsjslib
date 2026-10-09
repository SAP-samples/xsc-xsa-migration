/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SUPPLIER.attributeview
 * Mock the model, its dependent tables
 *  i) 'sap.hana.democontent.epm.data::MD.BusinessPartner',
	ii) 'sap.hana.democontent.epm.data::MD.Addresses',
*  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependent tables
 */

describe('SUPPLIER', function() {
        var sqlExecutor = null;
		var testEnvironment = null;

/* Creates new BP data */
		
		function createBusinessPartnerData(bpId,adId)
		{
		  	var businessPartnerData = [{
				    "ADDRESSES.ADDRESSID" : adId,
				    "PARTNERID" : bpId,
				    "COMPANYNAME" : "SAP"
				},
				{
				    "ADDRESSES.ADDRESSID" : ++adId,
				    "PARTNERID" : ++bpId,
				    "COMPANYNAME" : "SAP"
				}];
		  	testEnvironment.fillTestTable("bpData",businessPartnerData);		
		}
		
/*Create Address data */
		
		function createAddressData(adId)
		{
		    	var addressessData = [{
				    "ADDRESSID" : adId,
				    "CITY" : "Bangalore",
				    "POSTALCODE" : "626001",
				    "STREET" : "Ull",
				    "BUILDING" : "SAP",
				    "COUNTRY" : "Ind"
				},
				{
				    "ADDRESSID" : ++adId,
				    "CITY" : "Bangalore",
				    "POSTALCODE" : "626001",
				    "STREET" : "Ull",
				    "BUILDING" : "SAP",
				    "COUNTRY" : "Ind"
				}];
		    	testEnvironment.fillTestTable("addressData",addressessData);   
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
						name : 'sap.hana.democontent.epm.models/SUPPLIER'
					},
					substituteTables : {
						"bpData" : 'sap.hana.democontent.epm.data::MD.BusinessPartner',
						"addressData" :'sap.hana.democontent.epm.data::MD.Addresses'					
					}
		};
			testEnvironment = mockstarEnvironment.defineAndCreate(definition);
	});

	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});

	it('should not return any result when there are no Business Partner', function() {
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
		expect(actualData).toMatchData({}, [ "PARTNERID" ]);
	});

	it('should return one BP along with address', function() {
	  var bpId = "1234" , adId = "1111";
      createBusinessPartnerData(bpId, adId);
      createAddressData(adId);
		
		var expectedData = {
			"SUPPLIERID" : [ "1234" ],
			"COMPANYNAME" : [ "SAP" ],
			"STREET" : [ "Ull" ],
			"COUNTRY" : [ "Ind" ],
			"BUILDING" : [ "SAP" ],
			"POSTALCODE" : [ "626001" ],
			"CITY" : [ "Bangalore" ]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName() + ' where "SUPPLIERID" = \'1234\'');
		expect(actualData).toMatchData(expectedData, [ "SUPPLIERID" ]);
	});
});
export default {SqlExecutor,mockstarEnvironment};

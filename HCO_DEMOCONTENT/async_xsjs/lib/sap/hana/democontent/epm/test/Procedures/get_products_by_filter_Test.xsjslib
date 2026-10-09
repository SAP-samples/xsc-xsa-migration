/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = await $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test get_products_by_filter.hdbprocedure
 * Mock the procedure, its dependent table i)MD.Products and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns purchase sales price for the given productid
 */
describe('get_products_by_filter', function() {
	var testEnvironment = null;
	
	function addProduct(prodId){
	   var productData = [{
		    "PRODUCTID" : prodId,
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
		    "PRODUCTID" : ++prodId,
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
		testEnvironment.fillTestTable("products",productData);
	}
/* returns the sale price for the given productId */	
	async function getProductsByFilter(query) {
	    var callStatement = 'CALL' + testEnvironment.getTestModelName() + '(\''+ query +'\',?)';
        var callable = jasmine.dbConnection.prepareCall(callStatement);
        await callable.execute();
        var resultSet = tableDataSet.createFromResultSet(callable.getResultSet());
        await callable.close();
        return resultSet;
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
					name : 'sap.hana.democontent.epm.Procedures/get_products_by_filter'
				},
				substituteTables : {
					"products" : 'sap.hana.democontent.epm.data::MD.Products'
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec */
	beforeEach(function() {
		testEnvironment.clearAllTestTables();
	});

/* check if it returns the sale price for the given productId */
	 it('Should return products based on filter', async function() {
		addProduct(1234);
		var query = 'PRODUCTID like 1234';
		var resultSet = await getProductsByFilter(query);
	    var expectedData ={
		    "PRODUCTID" : ["1234"],
		    "TYPECODE" : ["10"],
		    "CATEGORY" :["XYZ"],
		    "NAMEID" : ["9876"],
		    "DESCID" : ["6789"],
		    "SUPPLIER.PARTNERID" :[ "222"],
		    "WEIGHTMEASURE" : [20.23],
		    "WEIGHTUNIT" :["Kg"],
		    "CURRENCY" : ["INR"],
		    "PRICE" : [2000]
		};
		expect(resultSet).toMatchData(expectedData, [ "PRODUCTID" ]);
	});
}).addTags(["procedures"]);
export default {SqlExecutor,mockstarEnvironment,tableDataSet};

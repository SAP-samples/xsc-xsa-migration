/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = (await $.import('sap.hana.testtools.unit.util', 'sqlExecutor')).SqlExecutor;
var mockstarEnvironment = await $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = await $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test get_product_sales_price.hdbprocedure
 * Mock the procedure, its dependent table 
 * i)MD.Products and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns purchase sales price for the product
 */
describe('get_product_sales_price', function() {
	var testEnvironment = null;
	
/* returns the sale price for the given productId */
	async function getSalePrice(productId) {
	    var callStatement = 'CALL ' + testEnvironment.getTestModelName() + '(?,?)';
        var callable = jasmine.dbConnection.prepareCall(callStatement);
        callable.setString(1,productId);
        await callable.execute();
        var resultSet = tableDataSet.createFromResultSet(callable.getResultSet());
        await callable.close();
        return resultSet;
	}

/* adds new product */
	function addProduct(productId,category,price){
        var productData = [{
          "PRODUCTID" : productId,
          "CATEGORY" : category,
          "PRICE" : price
        },
        {
          "PRODUCTID" : ++productId,
          "CATEGORY" : category,
          "PRICE" : price
        }];
	    testEnvironment.fillTestTable("products",productData);
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
					name : 'sap.hana.democontent.epm.Procedures/get_product_sales_price'
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
	 it('Should return the sale price', async function() {
		 var productId = '1000';
		 addProduct(productId,'Notebooks',100);			
		 var expectedData = {
				"PRODUCTID" : ["1000"],
				"CATEGORY" : ["Notebooks"],
				"PRICE" : [100],
				"SALEPRICE" : [80]
		};
		    
		expect(await getSalePrice(productId)).toMatchData(expectedData, [ "SALEPRICE" ]);
	});
}).addTags(["procedures"]);
export default {SqlExecutor,mockstarEnvironment,tableDataSet};

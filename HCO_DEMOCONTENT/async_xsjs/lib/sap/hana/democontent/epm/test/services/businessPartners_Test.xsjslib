/*global jasmine, describe, it, expect*/

/**
 * Test suite to test businessPartners.xsodata
 * Perform HTTP call against the service
 * Check if the service is available and returns response
 */
describe('businessPartners',function(){
	var userService = "/sap/hana/democontent/epm/services/businessPartners.xsodata/";

/* checks for the availability of service*/
	it("check if service is available", function() {
		var response = jasmine.callHTTPService(userService);
		expect(response.status).toBe($.net.http.OK);
	});

/* checks for the oData entity collection & its response */	
	it("check if entity collection is available & returns response", function() {
		var response = jasmine.callHTTPService(userService + 'BusinessPartners');
		expect(response.status).toBe($.net.http.OK);
		expect(response.body).not.toBe(null);
	});	
}).addTags(["services"]);
export default {};

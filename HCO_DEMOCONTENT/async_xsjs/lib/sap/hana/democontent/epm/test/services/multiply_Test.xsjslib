/*global jasmine,describe,it,expect */

/**
 * Test suite to test businessPartners.xsodata
 * Perform HTTP call against the service
 * Check if the service is available and performs multiplication
 */
describe("multiply", function() {

/* parse the response body and return the value*/
    function getResponseBody(response) {
		var body = response.body ? response.body.asString() : "";
		return JSON.parse(body);
	}

/* check if multiplication is done */
    it("should perform multiplication", function() {
        var response = jasmine.callHTTPService("/sap/hana/democontent/epm/services/multiply.xsjs?cmd=multiply&num1=3&num2=2");
        expect(response.status).toBe($.net.http.OK);
        var responseBody = getResponseBody(response);
        expect(responseBody).toBe(6);
    });

/* check if error is thrown when not passing any parameter*/    
    it("should throw error when parameter cmd isnt passed ", function() {
        var response = jasmine.callHTTPService("/sap/hana/democontent/epm/services/multiply.xsjs");
        expect(response.status).toBe($.net.http.BAD_REQUEST);
        var responseBody = response.body.asString();
        expect(responseBody).toBe('Invalid Command');
    });
}).addTags(["services"]);
export default {};

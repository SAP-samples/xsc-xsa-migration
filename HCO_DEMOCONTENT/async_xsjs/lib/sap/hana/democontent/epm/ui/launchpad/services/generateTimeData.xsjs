$.response.contentType = "application/json";
var output = {
    entry: {}
};

try{
var conn = await $.db.getConnection();
var currentTime = new Date();
var year = currentTime.getFullYear();
// get keys from MapKeys table
var pstmt = conn.prepareStatement('MDX UPDATE TIME DIMENSION Day 2012 '+year);
var rs = await pstmt.executeQuery();

await conn.commit();

$.response.status = $.net.http.OK;
await $.response.setBody("Data Generated from 2012 to "+year);
} catch (e){
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    await $.response.setBody(e.message);
}

await rs.close();
await pstmt.close();
await conn.close();

export default {output};

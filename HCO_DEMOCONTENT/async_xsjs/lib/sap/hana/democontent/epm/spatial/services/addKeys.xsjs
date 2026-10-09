var body = $.request.body.asString();

var entry = JSON.parse(body);

var responseBody = '';

var conn = await $.db.getConnection();
var pstmt = conn.prepareStatement(
    'insert into"sap.hana.democontent.epm.data::EPM.MapKeys" values(?,?,?,?,?)');
pstmt.setString(1, "1");
pstmt.setString(2, entry.APP_ID);
pstmt.setString(3, entry.APP_CODE);
pstmt.setString(4, "");
pstmt.setString(5, "");

var rs = await pstmt.execute();

await pstmt.close();

await conn.commit();
await conn.close();

$.response.status = $.net.http.CREATED;
await $.response.setBody(responseBody);
export default {body,entry,responseBody,conn,pstmt,rs};

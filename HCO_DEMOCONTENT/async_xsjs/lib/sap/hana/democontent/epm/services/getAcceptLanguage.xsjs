$.response.contentType = "text/plain";
$.response.headers.set("Content-Language", $.session.language);
await $.response.setBody("");

/* FIX - $.Session.language return nothing (LOW) */
export default {};

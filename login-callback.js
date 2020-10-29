$(function () {
    var accepted_origin = "http://127.0.0.1:1234/";
    var hash = JSON.parse('{"' + decodeURI(location.search.substring(1).replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
    window.opener.postMessage(JSON.stringify({
        type:'access_token_spotify',
        code: hash.code,
    }), accepted_origin);
    window.close();
});


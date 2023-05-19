var network = {
    AJAX: function (ops) {
        var httpRequest = null;
        if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+ ...
            httpRequest = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) { // IE 6 and older
            //@ts-ignore
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }
        httpRequest.onreadystatechange = function () {
            try {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
                        try {
                            ops.ok(JSON.parse(httpRequest.responseText));
                        }
                        catch (e) {
                            ops.ok(httpRequest.responseText);
                        }
                    }
                    else {
                        if (ops.err) {
                            ops.err({
                                Status: httpRequest.status,
                                Msg: httpRequest.responseText
                            });
                            console.error({
                                status: httpRequest.status,
                                msg: httpRequest.responseText
                            });
                            //ErrorHandling.Add({
                            //    status: httpRequest.status,
                            //    msg: httpRequest
                            //}, "Network");
                        }
                    }
                }
            }
            catch (e) {
                console.error(e);
                //ErrorHandling.Add({
                //    status: httpRequest.status,
                //    msg: JSON.stringify(e)
                //}, "Network Error");
                if (ops.err) {
                    ops.err({
                        Status: httpRequest.status,
                        Msg: JSON.stringify(e)
                    });
                }
            }
        };
        //var RootPath = "/kartografi/";
        //if (location.hostname === "localhost") {
        //    //ops.url = RootPath + ops.url;
        //} else {
        //    ops.url = RootPath + ops.url;
        //}
        httpRequest.open(ops.method, ops.url);
        if (ops.data) {
            httpRequest.setRequestHeader("Content-Type", "application/json");
            httpRequest.send(JSON.stringify(ops.data));
        }
        else {
            httpRequest.send();
        }
    },
    GET: function (url, ok, err) {
        network.AJAX({
            url: url,
            method: "GET",
            ok: ok,
            err: err
        });
    },
    POST: function (url, data, ok, err) {
        network.AJAX({
            url: url,
            method: "POST",
            data: data,
            ok: ok,
            err: err
        });
    }
};
//# sourceMappingURL=network.js.map
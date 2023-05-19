
interface ErrorReponce {
    Status: number;
    Msg: string;
}

interface AJAXops {
    method: "GET" | "POST" | "DELETE";
    url: string;
    data?: any;
    ok: Function;
    err?: (err: ErrorReponce) => void;

}



var network = {
    AJAX: function (ops: AJAXops) {
        var httpRequest: XMLHttpRequest = null as any;
        if ((<any>window).XMLHttpRequest) { // Mozilla, Safari, IE7+ ...
            httpRequest = new XMLHttpRequest();
        } else if ((<any>window).ActiveXObject) { // IE 6 and older
            //@ts-ignore
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }

        httpRequest.onreadystatechange = function () {
            try {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
                        try {
                            ops.ok(JSON.parse(httpRequest.responseText));
                        } catch (e) {
                            ops.ok(httpRequest.responseText);
                        }
                    } else {
                        if (ops.err) {
                            ops.err({
                                Status: httpRequest.status,
                                Msg: httpRequest.responseText
                            });

                            console.error({
                                status: httpRequest.status,
                                msg: httpRequest.responseText
                            });
                        }
                    }
                }
            } catch (e) {
                console.error(e);

                if (ops.err) {
                    ops.err({
                        Status: httpRequest.status,
                        Msg: JSON.stringify(e)
                    });
                }
            }
        }

        httpRequest.open(ops.method, ops.url);
        if (ops.data) {
            httpRequest.setRequestHeader("Content-Type", "application/json");
            httpRequest.send(JSON.stringify(ops.data));
        } else {
            httpRequest.send();
        }

    },
    GET: function (url: string, ok: Function, err: (err: ErrorReponce) => void) {
        network.AJAX({
            url: url,
            method: "GET",
            ok: ok,
            err: err
        });
    },
    POST: function (url: string, data: any, ok: Function, err: (err: ErrorReponce) => void) {
        network.AJAX({
            url: url,
            method: "POST",
            data: data,
            ok: ok,
            err: err
        });

    }
};

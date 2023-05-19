var RootPath = "/";
if (location.hostname !== "localhost") {
    RootPath = "/projektkarta_enkat/";
}
var karta = {
    data: {
        map: {},
        Select: {},
        SelectCollection: {},
        Stadsdelar: [],
        Bra: false,
        Dåligt: false,
        Filter: "",
        Styles: {},
        SelectedFeature: {},
        ZoomToStadsdel: [],
        FilterType: [],
        StartPos: {
            X: -1,
            Y: -1,
            Z: -1
        },
        ShowPoints: true
    },
    init: function () {
        moment.locale("sv");
        //var z = karta.getParameterByName("stadsdel");
        karta.data.FilterType = karta.GetParameters().Typ;
        if (!karta.data.FilterType) {
            karta.data.FilterType = [];
        }
        var ZoomToStadsdel = karta.GetParameters().stadsdel;
        if (ZoomToStadsdel) {
            karta.data.ZoomToStadsdel = ZoomToStadsdel;
        }
        var ShowPoints = karta.GetParameters().Points;
        if (ShowPoints && ShowPoints[0] === "off") {
            karta.data.ShowPoints = false;
        }
        try {
            var x = karta.GetParameters().x;
            if (x) {
                karta.data.StartPos.X = parseFloat(x[0]);
            }
            var y = karta.GetParameters().y;
            if (y) {
                karta.data.StartPos.Y = parseFloat(y[0]);
            }
            var z = karta.GetParameters().z;
            if (z) {
                karta.data.StartPos.Z = parseFloat(z[0]);
            }
        }
        catch (e) { }
        karta.CreateMap();
    },
    CreateMap: function () {
        network.GET(RootPath + "data/Stadsdelar.json", function (d) { }, function (err) { });
        var Map = document.getElementById("map");
        var layers = [];
        layers.push(map.WMS.getWMS({
            Layer: "Projektkarta_V2",
            Projection: ol.proj.get("EPSG:3006"),
            ZoomRange: 20,
            Resolutions: [3532.8773948498006, 1766.4386974249003, 883.2193487124501, 441.60967435622507, 220.80483717811254, 110.40241858905627, 55.201209294528134, 27.600604647264067, 13.800302323632033, 6.900151161816017, 3.4500755809080084, 1.7250377904540042, 0.8625188952270021, 0.431259447613501, 0.2156297238067505, 0.1078148619033753, 0.0539074309516876, 0.0269537154758438, 0.0134768577379219, 0.006738428868961, 0.0033692144344805]
        }));
        karta.data.Styles["icon-sad"] = new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/icon-sad.png" }) });
        karta.data.Styles["icon-happy"] = new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/icon-happy.png" }) });
        karta.data.Styles[""] = new ol.style.Style();
        layers.push(new ol.layer.Vector({ source: new ol.source.Vector(), style: karta.data.Styles["icon-sad"] }));
        layers.push(new ol.layer.Vector({ source: new ol.source.Vector(), style: karta.data.Styles["icon-happy"] }));
        layers.push(new ol.layer.Vector({
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: RootPath + "data/Stadsdelar.json"
            }),
            visible: true,
            style: []
        }));
        layers[3].getSource().on("change", function (e) {
            if (layers[3].getSource().getState() === "ready") {
                var s = layers[3].getSource();
                var ff = s.getFeatures();
                var ex = [];
                for (var i = 0; i < ff.length; i++) {
                    for (var x = 0; x < karta.data.ZoomToStadsdel.length; x++) {
                        if (ff[i].get("STADSDEL").toLowerCase() === karta.data.ZoomToStadsdel[x].toLowerCase()) {
                            if (ex.length === 0) {
                                ex = ff[i].getGeometry().getExtent();
                            }
                            else {
                                ex = ol.extent.extend(ex, ff[i].getGeometry().getExtent());
                            }
                        }
                    }
                }
                console.log(ex);
                if (ex.length > 0) {
                    karta.data.map.getView().fit(ex);
                }
            }
        });
        karta.data.map = new ol.Map({
            layers: layers,
            target: Map,
            pixelRatio: 1,
            view: new ol.View({
                projection: map.GetProjection("SWEREF 99 TM"),
                zoom: 8,
                minZoom: 4,
                maxZoom: 14
            })
        });
        if (karta.data.StartPos.X !== -1 && karta.data.StartPos.Y !== -1) {
            karta.data.map.getView().setCenter(ol.proj.transform([karta.data.StartPos.X, karta.data.StartPos.Y], karta.data.map.getView().getProjection(), map.GetProjection("SWEREF 99 TM")));
        }
        else {
            karta.data.map.getView().setCenter(ol.proj.transform([757935, 7089095], karta.data.map.getView().getProjection(), map.GetProjection("SWEREF 99 TM")));
        }
        if (karta.data.StartPos.Z !== -1) {
            karta.data.map.getView().setZoom(karta.data.StartPos.Z);
        }
        karta.data.Select = new ol.interaction.Select({
            condition: ol.events.condition.click,
            style: function (feature, resolution) {
                return new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/" + feature.get("typ") + "-selected.png" }) });
            }
        });
        karta.data.SelectCollection = karta.data.Select.getFeatures();
        karta.data.SelectCollection.on("add", function () {
            var Feature = karta.data.SelectCollection.getArray()[0];
            karta.data.SelectedFeature = Feature;
            document.getElementById("Info").classList.add("show");
            document.querySelector("#Info .question").innerHTML = Feature.get("Question");
            document.querySelector("#Info .text").innerHTML = Feature.get("Text");
            //document.querySelector("#Info .date").innerHTML = moment(Feature.get("Created"), "YYYY-MM-DD").add(13, "h").fromNow(true) + " sedan";
            if (Feature.get("Anmal") === "1") {
                document.getElementById("Anmal").classList.add("hide");
            }
            else {
                document.getElementById("Anmal").classList.remove("hide");
            }
            console.log(Feature.get("Created"));
        });
        karta.data.SelectCollection.on("remove", function () {
            document.getElementById("Info").classList.remove("show");
        });
        karta.data.map.addInteraction(karta.data.Select);
        document.getElementById("ZoomPlus").addEventListener("click", function () { karta.data.map.getView().setZoom(karta.data.map.getView().getZoom() + 1); });
        document.getElementById("ZoomMinus").addEventListener("click", function () { karta.data.map.getView().setZoom(karta.data.map.getView().getZoom() - 1); });
        document.getElementById("Anmal").addEventListener("click", function () {
            karta.data.SelectedFeature.set("Anmal", "1");
            network.POST(RootPath + "api/Anmal", {
                Question: karta.data.SelectedFeature.get("Question"),
                Value: karta.data.SelectedFeature.get("Text"),
                Created: karta.data.SelectedFeature.get("Created")
            }, function (data) { }, function (err) { });
            document.getElementById("Anmal").innerText = "Anmäld!";
            setTimeout(function () {
                document.getElementById("Anmal").innerText = "Anmäl";
                document.getElementById("Anmal").classList.add("hide");
            }, 2000);
        });
        //var typ = "Bra";
        //if (Map.getAttribute("data-icon") !== "icon-happy") {
        //    typ = "dåligt";
        //}
        network.GET(RootPath + "api/Points/Good", function (data) {
            if (karta.data.ShowPoints === false)
                return;
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            var length = data.length;
            //if (length > 200) {
            //    length = 200;
            //}
            for (var i = 0; i < length; i++) {
                try {
                    if (data[i].X !== "NaN" || data[i].Y !== "NaN") {
                        //for (var i = 0; i < data.length; i++) {
                        //for (var i = 0; i < 100; i++) {
                        var prop = {
                            Question: data[i].Question,
                            Text: data[i].value,
                            Created: data[i].Created,
                            //Org: "1",
                            typ: "icon-happy",
                            Anmal: data[i].Anmal,
                            Stadsdel: data[i].Stadsdel
                        };
                        var exist = false;
                        for (var x = 0; x < karta.data.Stadsdelar.length; x++) {
                            if (karta.data.Stadsdelar[x] === data[i].Stadsdel) {
                                exist = true;
                            }
                        }
                        if (exist === false) {
                            karta.data.Stadsdelar.push(data[i].Stadsdel);
                        }
                        //console.log(data[i], [data[i].X, data[i].Y]);
                        var marker_geom = new ol.geom.Point([parseFloat(data[i].X), parseFloat(data[i].Y)]);
                        prop.geometry = marker_geom;
                        var marker = new ol.Feature(prop);
                        if (karta.data.FilterType.length === 0) {
                            karta.data.map.getLayers().getArray()[2].getSource().addFeature(marker);
                        }
                        else {
                            if (data[i].Type === karta.data.FilterType[0]) {
                                karta.data.map.getLayers().getArray()[2].getSource().addFeature(marker);
                            }
                        }
                        //(karta.data.map.getLayers().getArray()[2] as ol.layer.Vector).getSource().addFeature(marker)
                    }
                }
                catch (e) { }
            }
            karta.data.Bra = true;
            karta.RenderStadsdelar();
        }, function (err) { });
        network.GET(RootPath + "api/Points/Bad", function (data) {
            if (karta.data.ShowPoints === false)
                return;
            console.log("Bad");
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            var length = data.length;
            //if (length > 200) {
            //    length = 200;
            //}
            for (var i = 0; i < length; i++) {
                try {
                    if (data[i].X !== "NaN" || data[i].Y !== "NaN") {
                        //for (var i = 0; i < data.length; i++) {
                        //for (var i = 0; i < 100; i++) {
                        var prop = {
                            Question: data[i].Question,
                            Text: data[i].value,
                            Created: data[i].Created,
                            //Org: "1",
                            typ: "icon-sad",
                            Anmal: data[i].Anmal,
                            Stadsdel: data[i].Stadsdel
                        };
                        var exist = false;
                        for (var x = 0; x < karta.data.Stadsdelar.length; x++) {
                            if (karta.data.Stadsdelar[x] === data[i].Stadsdel) {
                                exist = true;
                            }
                        }
                        if (exist === false) {
                            karta.data.Stadsdelar.push(data[i].Stadsdel);
                        }
                        //console.log(data[i], [data[i].X, data[i].Y]);
                        var marker_geom = new ol.geom.Point([parseFloat(data[i].X), parseFloat(data[i].Y)]);
                        prop.geometry = marker_geom;
                        var marker = new ol.Feature(prop);
                        if (karta.data.FilterType.length === 0) {
                            karta.data.map.getLayers().getArray()[1].getSource().addFeature(marker);
                        }
                        else {
                            if (data[i].Type === karta.data.FilterType[0]) {
                                karta.data.map.getLayers().getArray()[1].getSource().addFeature(marker);
                            }
                        }
                        //(karta.data.map.getLayers().getArray()[1] as ol.layer.Vector).getSource().addFeature(marker);
                    }
                }
                catch (e) { }
            }
            karta.data.Dåligt = true;
            karta.RenderStadsdelar();
        }, function (err) { });
    },
    getParameterByName: function (name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },
    GetParameters: function (url) {
        if (!url)
            url = location.href;
        url = url.replace(/&amp;/g, "&");
        var perms = {};
        var s = url.split(/[?&]+([^=&]+)=([^&]*)/gi);
        for (var i = 1; i < s.length; i++) {
            if (!perms[s[i]]) {
                perms[s[i]] = [];
            }
            if (decodeURIComponent(s[i + 1]).indexOf(",") > -1) {
                var y = decodeURIComponent(s[i + 1]).split(",");
                for (var x = 0; x < y.length; x++) {
                    perms[s[i]].push(y[x]);
                }
            }
            else {
                perms[s[i]].push(decodeURIComponent(s[i + 1]));
            }
            i++;
            i++;
        }
        return perms;
    },
    RenderStadsdelar: function () {
        if (karta.data.Bra && karta.data.Dåligt) {
            var root = document.createDocumentFragment();
            var ops1 = document.createElement("option");
            ops1.value = "";
            ops1.innerText = "Alla Stadsdelar";
            root.appendChild(ops1);
            for (var i = 0; i < karta.data.Stadsdelar.length; i++) {
                if (karta.data.Stadsdelar[i] !== "") {
                    var ops = document.createElement("option");
                    ops.value = karta.data.Stadsdelar[i];
                    ops.innerText = karta.data.Stadsdelar[i];
                    root.appendChild(ops);
                }
            }
            document.getElementById("Stadsdelar").appendChild(root);
            document.getElementById("Stadsdelar").addEventListener("change", function () {
                var val = document.getElementById("Stadsdelar").options[document.getElementById("Stadsdelar").selectedIndex].value;
                karta.data.Filter = val;
                var layers = karta.data.map.getLayers().getArray();
                for (var i = 1; i < 3; i++) {
                    var items = layers[i].getSource().getFeatures();
                    for (var x = 0; x < items.length; x++) {
                        if (karta.data.Filter !== "") {
                            if (items[x].get("Stadsdel") === karta.data.Filter) {
                                //console.log(items[x].get("Stadsdel"));
                                items[x].setStyle(karta.data.Styles[items[x].get("typ")]);
                            }
                            else {
                                items[x].setStyle(karta.data.Styles[""]);
                            }
                        }
                        else {
                            items[x].setStyle(karta.data.Styles[items[x].get("typ")]);
                        }
                    }
                }
            });
        }
    }
};
karta.init();
//# sourceMappingURL=Karta.js.map
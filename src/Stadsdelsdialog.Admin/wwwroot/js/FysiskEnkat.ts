var RootPath = "/";
if (location.hostname !== "localhost") {
    RootPath = "/Projektkarta_Enkat_Admin/";
}

type ResultData = {
    Question: string;
    value: string;
    X: string;
    Y: string
    Stadsdel: string;
    Anmal: string;
    Created: string;
}

var FysiskEnkat = {
    data: {
        Styles: {} as { [key: string]: ol.style.Style },
        map: {} as ol.Map,
        Bra_draw: {} as ol.interaction.Draw,
        Daligt_draw: {} as ol.interaction.Draw,
        DrawFeature: {} as ol.Feature,
        Stadsdelar: [] as string[]
    },
    init: function () {
        FysiskEnkat.CreateMap();

        document.getElementById("GoodPoint")!.addEventListener("click", function () {
            FysiskEnkat.data.Bra_draw.setActive(true);
        });

        document.getElementById("BadPoint")!.addEventListener("click", function () {
            FysiskEnkat.data.Daligt_draw.setActive(true);
        });

        document.getElementById("PointDialogBraSave")!.addEventListener("click", function () {
            var Text = (document.getElementById("PointDialogBraText") as HTMLTextAreaElement).value;
            var coords = (FysiskEnkat.data.DrawFeature.getGeometry() as ol.geom.Point).getCoordinates()

            network.POST(RootPath + "api/SavePoint", {
                Question: "Var i din stadsdel trivs du bäst?",
                value: Text,
                X: coords[0],
                Y: coords[1],
                Stadsdel: FysiskEnkat.data.DrawFeature.get("Stadsdel")
            }, function (data: any) { }, function (err) { });


            document.getElementById("PointDialogBra")!.classList.remove("show");
            (document.getElementById("PointDialogBraText") as HTMLTextAreaElement).value = (document.getElementById("PointDialogBraText") as HTMLTextAreaElement).getAttribute("data-value")!;
        });
        document.getElementById("PointDialogBraClose")!.addEventListener("click", function () {
            document.getElementById("PointDialogBra")!.classList.remove("show");
            (document.getElementById("PointDialogBraText") as HTMLTextAreaElement).value = (document.getElementById("PointDialogBraText") as HTMLTextAreaElement).getAttribute("data-value")!;
            (FysiskEnkat.data.map.getLayers().getArray()[2] as ol.layer.Vector).getSource().removeFeature(FysiskEnkat.data.DrawFeature);
        });

        document.getElementById("PointDialogDaligtSave")!.addEventListener("click", function () {
            var Text = (document.getElementById("PointDialogDaligtText") as HTMLTextAreaElement).value;
            var coords = (FysiskEnkat.data.DrawFeature.getGeometry() as ol.geom.Point).getCoordinates()

            network.POST(RootPath + "api/SavePoint", {
                Question: "Vilka platser trivs du inte på?",
                value: Text,
                X: coords[0],
                Y: coords[1],
                Stadsdel: FysiskEnkat.data.DrawFeature.get("Stadsdel")
            }, function (data: any) { }, function (err) { });


            document.getElementById("PointDialogDaligt")!.classList.remove("show");
            (document.getElementById("PointDialogDaligtText") as HTMLTextAreaElement).value = (document.getElementById("PointDialogDaligtText") as HTMLTextAreaElement).getAttribute("data-value")!;
        });
        document.getElementById("PointDialogDaligtClose")!.addEventListener("click", function () {
            document.getElementById("PointDialogDaligt")!.classList.remove("show");
            (document.getElementById("PointDialogDaligtText") as HTMLTextAreaElement).value = (document.getElementById("PointDialogDaligtText") as HTMLTextAreaElement).getAttribute("data-value")!;
            (FysiskEnkat.data.map.getLayers().getArray()[1] as ol.layer.Vector).getSource().removeFeature(FysiskEnkat.data.DrawFeature);
        });
    },
    CreateMap: function () {
        network.GET(RootPath + "data/Stadsdelar.json", function (d: any) { }, function (err) { });

        var Map = document.getElementById("map")!;

        var layers: any[] = [];
        layers.push(map.WMS.getWMS({
            Layer: "Projektkarta_V2",
            Projection: ol.proj.get("EPSG:3006"),
            ZoomRange: 20,
            Resolutions: [3532.8773948498006, 1766.4386974249003, 883.2193487124501, 441.60967435622507, 220.80483717811254, 110.40241858905627, 55.201209294528134, 27.600604647264067, 13.800302323632033, 6.900151161816017, 3.4500755809080084, 1.7250377904540042, 0.8625188952270021, 0.431259447613501, 0.2156297238067505, 0.1078148619033753, 0.0539074309516876, 0.0269537154758438, 0.0134768577379219, 0.006738428868961, 0.0033692144344805]
        }));

        FysiskEnkat.data.Styles["icon-sad"] = new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/icon-sad.png" }) });
        FysiskEnkat.data.Styles["icon-happy"] = new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/icon-happy.png" }) });
        FysiskEnkat.data.Styles[""] = new ol.style.Style();

        layers.push(new ol.layer.Vector({ source: new ol.source.Vector(), style: FysiskEnkat.data.Styles["icon-sad"] }));
        layers.push(new ol.layer.Vector({ source: new ol.source.Vector(), style: FysiskEnkat.data.Styles["icon-happy"] }));

        layers.push(new ol.layer.Vector({
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: RootPath + "data/Stadsdelar.json"
            }),
            visible: true,
            style: []
        }));

        layers[3].getSource().on("change", function (e: any) {

            var s = layers[3].getSource() as ol.source.Vector;
            var ff = s.getFeatures();

            for (var i = 0; i < ff.length; i++) {
                FysiskEnkat.data.Stadsdelar.push(ff[i].get("STADSDEL"));

                var op = document.createElement("option");
                op.value = ff[i].get("STADSDEL")
                op.innerText = ff[i].get("STADSDEL");
                document.getElementById("Stadsdel20Stadsdel")!.appendChild(op);

                var op = document.createElement("option");
                op.value = ff[i].get("STADSDEL")
                op.innerText = ff[i].get("STADSDEL");
                document.getElementById("saknaStadsdel")!.appendChild(op);
            }

        });

        FysiskEnkat.data.map = new ol.Map({
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

        FysiskEnkat.data.map.getView().setCenter(ol.proj.transform([757935, 7089095], FysiskEnkat.data.map.getView().getProjection(), map.GetProjection("SWEREF 99 TM")));

        network.GET(RootPath + "api/Points/Good", function (data: ResultData[]) {


            if (typeof data === "string") {
                (data as any) = JSON.parse(data);
            }


            var length = data.length;

            for (var i = 0; i < length; i++) {
                try {
                    if (data[i].X !== "NaN" || data[i].Y !== "NaN") {
                        var prop = {
                            Question: data[i].Question,
                            Text: data[i].value,
                            Created: data[i].Created,
                            typ: "icon-happy",
                            Anmal: data[i].Anmal,
                            Stadsdel: data[i].Stadsdel
                        };


                        var marker_geom = new ol.geom.Point([parseFloat(data[i].X), parseFloat(data[i].Y)]);
                        (<any>prop).geometry = marker_geom;
                        var marker = new ol.Feature(prop);

                        (FysiskEnkat.data.map.getLayers().getArray()[2] as ol.layer.Vector).getSource().addFeature(marker)
                    }
                } catch (e) { }
            }

        }, function (err) { });
        network.GET(RootPath + "api/Points/Bad", function (data: ResultData[]) {
            console.log("Bad");

            if (typeof data === "string") {
                (data as any) = JSON.parse(data);
            }

            var length = data.length;

            for (var i = 0; i < length; i++) {
                try {
                    if (data[i].X !== "NaN" || data[i].Y !== "NaN") {
                        var prop = {
                            Question: data[i].Question,
                            Text: data[i].value,
                            Created: data[i].Created,
                            //Org: "1",
                            typ: "icon-sad",
                            Anmal: data[i].Anmal,
                            Stadsdel: data[i].Stadsdel
                        };

                        var marker_geom = new ol.geom.Point([parseFloat(data[i].X), parseFloat(data[i].Y)]);
                        (<any>prop).geometry = marker_geom;
                        var marker = new ol.Feature(prop);

                        (FysiskEnkat.data.map.getLayers().getArray()[1] as ol.layer.Vector).getSource().addFeature(marker);
                    }
                } catch (e) { }
            }

        }, function (err) { });

        FysiskEnkat.data.Bra_draw = new ol.interaction.Draw({
            source: (<ol.layer.Vector>layers[2]).getSource(),
            type: "Point",
            //style: new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/" + maps[i].getAttribute("data-icon") + ".png" }) })

        })
        FysiskEnkat.data.Bra_draw.setActive(false);

        FysiskEnkat.data.map.addInteraction(FysiskEnkat.data.Bra_draw);

        FysiskEnkat.data.Bra_draw.on("drawend", function (e: { type: string, target: any, feature: ol.Feature }) {
            FysiskEnkat.data.DrawFeature = e.feature;

            FysiskEnkat.data.Bra_draw.setActive(false);

            document.getElementById("PointDialogBra")!.classList.add("show")


            var Stadsdelar = (FysiskEnkat.data.map.getLayers().getArray()[2] as ol.layer.Vector).getSource().getFeatures();

            for (var i = 0; i < Stadsdelar.length; i++) {
                if (Stadsdelar[i].getGeometry().intersectsCoordinate((FysiskEnkat.data.DrawFeature.getGeometry() as ol.geom.Point).getCoordinates()) === true) {

                    FysiskEnkat.data.DrawFeature.set("Stadsdel", Stadsdelar[i].get("STADSDEL"));
                }
            }
        });

        FysiskEnkat.data.Daligt_draw = new ol.interaction.Draw({
            source: (<ol.layer.Vector>layers[1]).getSource(),
            type: "Point"
        });

        FysiskEnkat.data.Daligt_draw.setActive(false);

        FysiskEnkat.data.map.addInteraction(FysiskEnkat.data.Daligt_draw);

        FysiskEnkat.data.Daligt_draw.on("drawend", function (e: { type: string, target: any, feature: ol.Feature }) {
            FysiskEnkat.data.DrawFeature = e.feature;

            FysiskEnkat.data.Daligt_draw.setActive(false);

            document.getElementById("PointDialogDaligt")!.classList.add("show")
        });
    }
}

FysiskEnkat.init();
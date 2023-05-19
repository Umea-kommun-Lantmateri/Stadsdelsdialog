
var RootPath = "/";
if (location.hostname !== "localhost") {
    RootPath = "/projektkarta_enkat/";
}

class dialog {
    private id: string = "";
    private _reset: () => void = () => { };
    private _controles: { name: string, elm: HTMLElement }[] = [];

    constructor(id: string,) {
        this.id = id;
        this._controles = [];
    }

    setReset(callback: () => void) {
        this._reset = callback;
    }

    show() {
        document.getElementById(this.id)!.classList.add("show");

        var text = document.getElementById(this.id)!.querySelectorAll("textarea");

        if (text.length > 0) {
            text[0].focus();
        }

    }

    close() {
        document.getElementById(this.id)!.classList.remove("show");
    }

    reset() {
        this._reset();
    }

    addControle(name: string, elm: HTMLElement) {
        this._controles.push({ name: name, elm: elm });
    }

    Controle<T>(name: string): T {
        for (var i = 0; i < this._controles.length; i++) {
            if (this._controles[i].name === name) {
                return <any>this._controles[i].elm;
            }
        }
        throw "No controle by that name";
    }

    on(type: string, callback: () => void) {

    }
}

type ResultData = {
    Question: string | null;
    value: string;
    X: string;
    Y: string
    Stadsdel: string;
    Anmal: string;
    Created: string;
    Type: string;
}

var app = {
    data: {
        PageEvents: [] as { page: string, evt: () => void }[],
        Maps: [] as { map: ol.Map, select?: ol.interaction.Select, SelectCollection?: ol.Collection<ol.Feature>, Draw: ol.interaction.Draw }[],
        CurrentMarker: {} as ol.Feature,
        OKPages: [] as boolean[]
    },
    init: function () {
        app.CreateMap();
        app.Events();
        app.init_PageMove();
    },
    CreateMap: function () {

        network.GET(RootPath + "data/Stadsdelar.json", function (_d: any) { }, function (err) { });


        var maps = document.querySelectorAll(".map");

        for (var i = 0; i < maps.length; i++) {
            var layers = [];
            layers.push(map.WMS.getWMS({
                Layer: "Projektkarta_V2",
                Projection: ol.proj.get("EPSG:3006"),
                ZoomRange: 20,
                Resolutions: [3532.8773948498006, 1766.4386974249003, 883.2193487124501, 441.60967435622507, 220.80483717811254, 110.40241858905627, 55.201209294528134, 27.600604647264067, 13.800302323632033, 6.900151161816017, 3.4500755809080084, 1.7250377904540042, 0.8625188952270021, 0.431259447613501, 0.2156297238067505, 0.1078148619033753, 0.0539074309516876, 0.0269537154758438, 0.0134768577379219, 0.006738428868961, 0.0033692144344805]
            }));

            layers.push(new ol.layer.Vector({ source: new ol.source.Vector(), style: new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/" + maps[i].getAttribute("data-icon") + ".png" }) }) }));
            layers.push(new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: RootPath + "data/Stadsdelar.json"
                }),
                visible: true,
                style: []
            }));



            var map1 = new ol.Map({
                layers: layers,
                target: maps[i],
                pixelRatio: 1,
                view: new ol.View({
                    projection: map.GetProjection("SWEREF 99 TM"),
                    zoom: 8,
                    minZoom: 4,
                    maxZoom: 14
                })
            });

            map1.getView().setCenter(ol.proj.transform([757935, 7089095], map1.getView().getProjection(), map.GetProjection("SWEREF 99 TM")));




            var draw = new ol.interaction.Draw({
                source: (<ol.layer.Vector>layers[1]).getSource(),
                type: "Point",
                style: new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/" + maps[i].getAttribute("data-icon") + ".png" }) })

            })
            draw.setActive(false);

            app.data.Maps.push({ map: map1, Draw: draw });

            map1.addInteraction(draw);



        }
    },
    Events: function () {

        var CloseButtons = document.querySelectorAll(".CloseButton");

        for (var i = 0; i < CloseButtons.length; i++) {
            CloseButtons[i].addEventListener("click", function (this: HTMLButtonElement) {
                if (this.getAttribute("data-closeimmediately") === "true") {
                    app.ClosePage();
                } else {
                    document.getElementById("CloseEnkat")!.classList.add("show");
                }
            });
        }

        //document.getElementById("CloseEnkatOK").addEventListener("click", function () {
        //    app.ClosePage();
        //});

        document.getElementById("CloseEnkatClose")!.addEventListener("click", function () {
            document.getElementById("CloseEnkat")!.classList.remove("show");
        });

        //Page 1
        app.Events_Page1();


        //page 2
        app.Events_Page2();

        //page 3
        app.Events_Page3();

        //Page 4

        //document.getElementById("Page4Text").addEventListener("keyup", function (this: HTMLTextAreaElement) {
        //    if (this.value !== "") {
        //        (<HTMLButtonElement>document.getElementById("Page4Next")).disabled = false;
        //    } else {
        //        (<HTMLButtonElement>document.getElementById("Page4Next")).disabled = true;
        //    }
        //});

        //Page 5
        app.Events_Page5();

    },
    init_PageMove: function () {
        var PageMove = document.querySelectorAll(".PageMove");

        for (var i = 0; i < PageMove.length; i++) {
            PageMove[i].addEventListener("click", function (this: HTMLButtonElement) {

                var pageid = this.getAttribute("data-page");

                var pages = document.querySelectorAll(".page");

                for (var x = 0; x < pages.length; x++) {
                    pages[x].classList.remove("show");

                    if (pages[x].getAttribute("data-page") === pageid) {
                        pages[x].classList.add("show");

                        for (var z = 0; z < app.data.PageEvents.length; z++) {
                            if (app.data.PageEvents[z].page === pageid) {
                                app.data.PageEvents[z].evt();
                            }
                        }
                    }
                }

            });
        }
    },
    Events_Page1: function () {


        app.OnPage("1", function () {

            network.GET(RootPath + "api/Points/Goodsdsdf", function (data: ResultData[]) {
                for (var i = 0; i < data.length; i++) {
                    var prop = {
                        Text: data[i].value,
                        Org: "1"
                    };
                    var marker_geom = new ol.geom.Point([parseFloat(data[i].X), parseFloat(data[i].Y)]);
                    (<any>prop).geometry = marker_geom;
                    var marker = new ol.Feature(prop);



                    (app.data.Maps[0].map.getLayers().getArray()[1] as ol.layer.Vector).getSource().addFeature(marker)

                }
            }, function (err) { });


            app.data.Maps[0].map.updateSize();
        });

        app.data.Maps[0].Draw.on("drawend", function (e: { type: string, target: any, feature: ol.Feature }) {
            app.data.Maps[0].Draw.setActive(false);
            console.log(e);

            app.data.CurrentMarker = e.feature;

            var Stadsdelar = (app.data.Maps[0].map.getLayers().getArray()[2] as ol.layer.Vector).getSource().getFeatures();

            for (var i = 0; i < Stadsdelar.length; i++) {
                if (Stadsdelar[i].getGeometry().intersectsCoordinate((app.data.CurrentMarker.getGeometry() as ol.geom.Point).getCoordinates()) === true) {

                    app.data.CurrentMarker.set("Stadsdel", Stadsdelar[i].get("STADSDEL"));
                }
            }

            app.data.CurrentMarker.set("Text", "");

            setTimeout(function () {
                if (app.data.CurrentMarker.get("SelectedOnes") !== true) {
                    page1Addmarker.show();
                    document.getElementById("map1Banner")!.classList.remove("show");
                }
            }, 300);

        });

        document.getElementById("MarkerButton1")!.addEventListener("click", function () {
            document.getElementById("map1Banner")!.classList.add("show");
            document.getElementById("MarkerButton1wrepper")!.classList.remove("show");

            app.data.Maps[0].Draw.setActive(true);

        });

        var page1Addmarker = new dialog("Page1Addmarker");
        page1Addmarker.addControle("Text", document.getElementById("Page1AddmarkerText")!);
        page1Addmarker.addControle("Save", document.getElementById("Page1AddmarkerSave")!);
        page1Addmarker.addControle("Close", document.getElementById("Page1AddmarkerClose")!);
        page1Addmarker.addControle("Delete", document.getElementById("Page1AddmarkerDelete")!);
        page1Addmarker.addControle("OrgClose", document.getElementById("OrgClose")!);

        page1Addmarker.setReset(function () {
            page1Addmarker.Controle<HTMLTextAreaElement>("Text").value = "";
            page1Addmarker.Controle<HTMLTextAreaElement>("Text").disabled = false;
            page1Addmarker.Controle<HTMLButtonElement>("Delete").classList.add("hide");
            page1Addmarker.Controle<HTMLButtonElement>("Close").setAttribute("data-dontshowdialog", "false");

            page1Addmarker.Controle<HTMLButtonElement>("Close").classList.remove("hide");
            page1Addmarker.Controle<HTMLButtonElement>("Save").classList.remove("hide");
            page1Addmarker.Controle<HTMLButtonElement>("OrgClose").classList.add("hide");
        });

        var page1Close = new dialog("Page1Close");
        page1Close.addControle("OK", document.getElementById("Page1CloseOK")!);
        page1Close.addControle("Close", document.getElementById("Page1CloseClose")!);


        page1Addmarker.Controle<HTMLTextAreaElement>("Text").addEventListener("keyup", function () {
            if (this.value !== "") {
                page1Addmarker.Controle<HTMLButtonElement>("Save").disabled = false;
            } else {
                page1Addmarker.Controle<HTMLButtonElement>("Save").disabled = true;
            }
        });

        page1Addmarker.Controle<HTMLButtonElement>("Close").addEventListener("click", function () {
            if (this.getAttribute("data-dontshowdialog") === "true") {

                page1Addmarker.reset();
                page1Addmarker.close();

                page1Close.close();
                document.getElementById("MarkerButton1wrepper")!.classList.add("show");

                app.data.Maps[0].SelectCollection!.clear();

            } else {
                page1Close.show();
            }

        });

        page1Addmarker.Controle<HTMLButtonElement>("OrgClose").addEventListener("click", function () {
            page1Addmarker.close();
            page1Addmarker.reset();
        });

        page1Addmarker.Controle<HTMLButtonElement>("Save").addEventListener("click", function () {

            app.data.CurrentMarker.set("Text", page1Addmarker.Controle<HTMLTextAreaElement>("Text").value);

            page1Addmarker.reset();
            page1Addmarker.close();

            document.getElementById("MarkerButton1wrepper")!.classList.add("show");

            app.data.OKPages[1] = true;
            //(<HTMLButtonElement>document.getElementById("Page1Next")).disabled = false;

            app.data.Maps[0].SelectCollection!.clear();

        });

        page1Addmarker.Controle<HTMLButtonElement>("Delete").addEventListener("click", function () {
            page1Addmarker.reset();
            page1Addmarker.close();
            page1Close.close();

            document.getElementById("MarkerButton1wrepper")!.classList.add("show");

            (<ol.layer.Vector>app.data.Maps[0].map.getLayers().getArray()[1]).getSource().removeFeature(app.data.CurrentMarker);

            app.data.Maps[0].SelectCollection!.clear();

            //if ((<ol.layer.Vector>app.data.Maps[0].map.getLayers().getArray()[1]).getSource().getFeatures().length === 0) {
            //    app.data.OKPages[1] = false;
            //    (<HTMLButtonElement>document.getElementById("Page1Next")).disabled = true;
            //}
        });

        page1Close.Controle<HTMLButtonElement>("OK").addEventListener("click", function () {
            page1Addmarker.reset();
            page1Addmarker.close();
            page1Close.close();

            document.getElementById("MarkerButton1wrepper")!.classList.add("show");

            (<ol.layer.Vector>app.data.Maps[0].map.getLayers().getArray()[1]).getSource().removeFeature(app.data.CurrentMarker);

            app.data.Maps[0].SelectCollection!.clear();

            //if ((<ol.layer.Vector>app.data.Maps[0].map.getLayers().getArray()[1]).getSource().getFeatures().length === 0) {
            //    app.data.OKPages[1] = false;
            //    (<HTMLButtonElement>document.getElementById("Page1Next")).disabled = true;
            //}

        });

        page1Close.Controle<HTMLButtonElement>("Close").addEventListener("click", function () {
            page1Close.close();
        });

        app.data.Maps[0].select = new ol.interaction.Select({
            condition: ol.events.condition.click,
            style: function (feature, resolution) {
                return new ol.style.Style({ image: new ol.style.Icon({ src: RootPath + "img/icon-happy-selected.png" }) })
            }
        })

        app.data.Maps[0].SelectCollection = app.data.Maps[0].select.getFeatures();
        app.data.Maps[0].SelectCollection.on("add", function () {
            var Feature = app.data.Maps[0].SelectCollection!.getArray()[0];

            var text = Feature.get("Text");

            Feature.set("SelectedOnes", true);

            page1Addmarker.show();
            document.getElementById("map1Banner")!.classList.remove("show");

            if (text) {
                page1Addmarker.Controle<HTMLTextAreaElement>("Text").value = text;
                page1Addmarker.Controle<HTMLButtonElement>("Delete").classList.remove("hide");
                page1Addmarker.Controle<HTMLButtonElement>("Close").setAttribute("data-dontshowdialog", "true");
            }

            if (Feature.get("Org") === "1") {
                page1Addmarker.Controle<HTMLButtonElement>("Delete").classList.add("hide");
                page1Addmarker.Controle<HTMLButtonElement>("Close").classList.add("hide");
                page1Addmarker.Controle<HTMLButtonElement>("Save").classList.add("hide");
                page1Addmarker.Controle<HTMLButtonElement>("OrgClose").classList.remove("hide");
                page1Addmarker.Controle<HTMLTextAreaElement>("Text").disabled = true;
            }

        });

        app.data.Maps[0].map.addInteraction(app.data.Maps[0].select);

    },
    Events_Page2: function () {
        app.OnPage("2", function () {
            network.GET(RootPath + "api/Points/Badsdfsdf", function (data: ResultData[]) {
                for (var i = 0; i < data.length; i++) {
                    var prop = {
                        Text: data[i].value,
                        Org: "1"
                    };
                    var marker_geom = new ol.geom.Point([parseFloat(data[i].X), parseFloat(data[i].Y)]);
                    (<any>prop).geometry = marker_geom;
                    var marker = new ol.Feature(prop);

                    (app.data.Maps[1].map.getLayers().getArray()[1] as ol.layer.Vector).getSource().addFeature(marker)

                }
            }, function (err) { });

            app.data.Maps[1].map.updateSize();
        });

        app.data.Maps[1].Draw.on("drawend", function (e: { type: string, target: any, feature: ol.Feature }) {
            app.data.Maps[1].Draw.setActive(false);
            console.log(e);

            app.data.CurrentMarker = e.feature;

            var Stadsdelar = (app.data.Maps[1].map.getLayers().getArray()[2] as ol.layer.Vector).getSource().getFeatures();

            for (var i = 0; i < Stadsdelar.length; i++) {
                if (Stadsdelar[i].getGeometry().intersectsCoordinate((app.data.CurrentMarker.getGeometry() as ol.geom.Point).getCoordinates()) === true) {
                    app.data.CurrentMarker.set("Stadsdel", Stadsdelar[i].get("STADSDEL"));
                }
            }

            app.data.CurrentMarker.set("Text", "");

            setTimeout(function () {
                if (app.data.CurrentMarker.get("SelectedOnes") !== true) {
                    page2Addmarker.show();
                    document.getElementById("map2Banner")!.classList.remove("show");
                }
            }, 300);

        });

        document.getElementById("MarkerButton2")!.addEventListener("click", function () {
            document.getElementById("map2Banner")!.classList.add("show");
            document.getElementById("MarkerButton2wrepper")!.classList.remove("show");

            app.data.Maps[1].Draw.setActive(true);
        });

        var page2Addmarker = new dialog("Page2Addmarker");
        page2Addmarker.addControle("Text", document.getElementById("Page2Addmarker")!.querySelector("textarea")!);
        page2Addmarker.addControle("Save", document.getElementById("Page2Addmarker")!.querySelector(".save")!);
        page2Addmarker.addControle("Close", document.getElementById("Page2Addmarker")!.querySelector(".close")!);
        page2Addmarker.addControle("Delete", document.getElementById("Page2Addmarker")!.querySelector(".delete")!);
        page2Addmarker.addControle("OrgClose", document.getElementById("Page2OrgClose")!);

        page2Addmarker.setReset(function () {
            page2Addmarker.Controle<HTMLTextAreaElement>("Text").value = "";
            page2Addmarker.Controle<HTMLTextAreaElement>("Text").disabled = false;
            page2Addmarker.Controle<HTMLButtonElement>("Delete").classList.add("hide");
            page2Addmarker.Controle<HTMLButtonElement>("Close").setAttribute("data-dontshowdialog", "false");

            page2Addmarker.Controle<HTMLButtonElement>("Close").classList.remove("hide");
            page2Addmarker.Controle<HTMLButtonElement>("Save").classList.remove("hide");
            page2Addmarker.Controle<HTMLButtonElement>("OrgClose").classList.add("hide");
        });

        var page2Close = new dialog("Page2Close");
        page2Close.addControle("OK", document.getElementById("Page2Close")!.querySelector(".ok")!);
        page2Close.addControle("Close", document.getElementById("Page2Close")!.querySelector(".close")!);


        page2Addmarker.Controle<HTMLTextAreaElement>("Text").addEventListener("keyup", function () {
            if (this.value !== "") {
                page2Addmarker.Controle<HTMLButtonElement>("Save").disabled = false;
            } else {
                page2Addmarker.Controle<HTMLButtonElement>("Save").disabled = true;
            }
        });

        page2Addmarker.Controle<HTMLButtonElement>("Close").addEventListener("click", function () {
            if (this.getAttribute("data-dontshowdialog") === "true") {

                page2Addmarker.reset();
                page2Addmarker.close();

                page2Close.close();
                document.getElementById("MarkerButton2wrepper")!.classList.add("show");

            } else {
                page2Close.show();
            }

        });

        page2Addmarker.Controle<HTMLButtonElement>("OrgClose").addEventListener("click", function () {
            page2Addmarker.close();
            page2Addmarker.reset();
        });

        page2Addmarker.Controle<HTMLButtonElement>("Save").addEventListener("click", function () {

            app.data.CurrentMarker.set("Text", page2Addmarker.Controle<HTMLTextAreaElement>("Text").value);

            page2Addmarker.reset();
            page2Addmarker.close();

            document.getElementById("MarkerButton2wrepper")!.classList.add("show");

            app.data.OKPages[2] = true;
            //(<HTMLButtonElement>document.getElementById("Page2Next")).disabled = false;

            app.data.Maps[1].SelectCollection!.clear();

        });

        page2Addmarker.Controle<HTMLButtonElement>("Delete").addEventListener("click", function () {
            page2Addmarker.reset();
            page2Addmarker.close();
            page2Close.close();

            document.getElementById("MarkerButton2wrepper")!.classList.add("show");

            (<ol.layer.Vector>app.data.Maps[1].map.getLayers().getArray()[1]).getSource().removeFeature(app.data.CurrentMarker);

            app.data.Maps[1].SelectCollection!.clear();

            //if ((<ol.layer.Vector>app.data.Maps[1].map.getLayers().getArray()[1]).getSource().getFeatures().length === 0) {
            //    app.data.OKPages[2] = false;
            //    (<HTMLButtonElement>document.getElementById("Page2Next")).disabled = true;
            //}
        });

        page2Close.Controle<HTMLButtonElement>("OK").addEventListener("click", function () {
            page2Addmarker.reset();
            page2Addmarker.close();
            page2Close.close();

            document.getElementById("MarkerButton2wrepper")!.classList.add("show");

            (<ol.layer.Vector>app.data.Maps[1].map.getLayers().getArray()[1]).getSource().removeFeature(app.data.CurrentMarker);

            app.data.Maps[1].SelectCollection!.clear();

            //if ((<ol.layer.Vector>app.data.Maps[1].map.getLayers().getArray()[1]).getSource().getFeatures().length === 0) {
            //    app.data.OKPages[2] = false;
            //    (<HTMLButtonElement>document.getElementById("Page2Next")).disabled = true;
            //}

        });

        page2Close.Controle<HTMLButtonElement>("Close").addEventListener("click", function () {
            page2Close.close();
        });

        app.data.Maps[1].select = new ol.interaction.Select({
            condition: ol.events.condition.click,
            style: function (feature, resolution) {
                return new ol.style.Style({ image: new ol.style.Icon({ src: "img/icon-sad-selected.png" }) })
            }
        })

        app.data.Maps[1].SelectCollection = app.data.Maps[1].select.getFeatures();
        app.data.Maps[1].SelectCollection.on("add", function () {
            var Feature = app.data.Maps[1].SelectCollection!.getArray()[0];

            var text = Feature.get("Text");

            page2Addmarker.show();
            document.getElementById("map2Banner")!.classList.remove("show");

            if (text) {
                page2Addmarker.Controle<HTMLTextAreaElement>("Text").value = text;
                page2Addmarker.Controle<HTMLButtonElement>("Delete").classList.remove("hide");
                page2Addmarker.Controle<HTMLButtonElement>("Close").setAttribute("data-dontshowdialog", "true");
            }

            if (Feature.get("Org") === "1") {
                page2Addmarker.Controle<HTMLButtonElement>("Delete").classList.add("hide");
                page2Addmarker.Controle<HTMLButtonElement>("Close").classList.add("hide");
                page2Addmarker.Controle<HTMLButtonElement>("Save").classList.add("hide");
                page2Addmarker.Controle<HTMLButtonElement>("OrgClose").classList.remove("hide");
                page2Addmarker.Controle<HTMLTextAreaElement>("Text").disabled = true;
            }

        });

        app.data.Maps[1].map.addInteraction(app.data.Maps[1].select);
    },
    Events_Page3: function () {

        var checks = <HTMLInputElement[]><any>document.querySelectorAll(".page3 input");



        //for (var i = 0; i < checks.length; i++) {
        //    checks[i].addEventListener("change", function () {
        //        var cs = <HTMLInputElement[]><any>document.querySelectorAll(".page3 input");

        //        var Min1Check = false;

        //        for (var x = 0; x < cs.length; x++) {
        //            if (cs[x].checked) {
        //                Min1Check = true;
        //            }
        //        }

        //        if (Min1Check) {
        //            (<HTMLButtonElement>document.getElementById("Page3Next")).disabled = false;
        //        } else {
        //            (<HTMLButtonElement>document.getElementById("Page3Next")).disabled = true;
        //        }
        //    });
        //}

        document.getElementById("Page3Annat")!.addEventListener("change", function (this: HTMLInputElement) {
            if (this.checked) {
                document.getElementById("Page3AnnatText")!.classList.remove("hide");
            } else {
                document.getElementById("Page3AnnatText")!.classList.add("hide");
            }
        });


        //document.getElementById("Page3AnnatText").addEventListener("keyup", function (this: HTMLTextAreaElement) {
        //    (document.getElementById("Page3Annat") as HTMLInputElement).value = this.value;
        //});
    },
    Events_Page5: function () {

        //document.getElementById("GDPR").addEventListener("change", function () {
        //    if ((<HTMLInputElement>document.getElementById("GDPR")).checked) {
        //        (<HTMLButtonElement>document.getElementById("Page5Next")).disabled = false;
        //    } else {
        //        (<HTMLButtonElement>document.getElementById("Page5Next")).disabled = true;
        //    }
        //});


        document.getElementById("Page5Next")!.addEventListener("click", function () {
            network.POST(RootPath + "api/Save", { Questions: app.GetData() }, function (_data: any) {

            }, function (err) { });

            return true;
        });


    },
    ClosePage: function () {
        //window.open('javascript:window.open("", "_self", "");window.close(); ', '_self');
        var win = window.open('', '_parent', '')!;
        win.close();
    },
    OnPage: function (page: string, evt: () => void) {
        app.data.PageEvents.push({ page: page, evt: evt });
    },
    GetData() {
        var result = [] as ResultData[]


        for (var i = 0; i < app.data.Maps.length; i++) {
            var layer = app.data.Maps[i].map.getLayers().getArray()[1] as ol.layer.Vector;

            var Features = layer.getSource().getFeatures();

            for (var x = 0; x < Features.length; x++) {
                var itm = {} as ResultData;

                if (Features[x].get("Org") !== 1) {

                    itm.Question = app.data.Maps[i].map.getTargetElement().parentElement!.querySelector("h1")!.innerText
                    itm.value = Features[x].get("Text");
                    itm.Stadsdel = Features[x].get("Stadsdel") ? Features[x].get("Stadsdel") : "";
                    itm.X = (Features[x].getGeometry() as ol.geom.Point).getCoordinates()[0].toString();
                    itm.Y = (Features[x].getGeometry() as ol.geom.Point).getCoordinates()[1].toString();

                    result.push(itm);
                }
            }
        }

        var Stadsdelar = [] as { name: string, count: number }[];
        var Stadsdel = "";

        for (var i = 0; i < result.length; i++) {
            if (result[i].Stadsdel !== "") {
                //Stadsdelar.push(result[i].Stadsdel);
                var exist = false;
                for (var x = 0; x < Stadsdelar.length; x++) {
                    if (result[i].Stadsdel === Stadsdelar[x].name) {
                        exist = true;
                        Stadsdelar[x].count += 1;
                    }
                }

                if (exist === false) {
                    Stadsdelar.push({
                        name: result[i].Stadsdel,
                        count: 1
                    });
                }


            }
        }

        var stadsdel = { name: "", count: 0 } as { name: string, count: number };

        for (var i = 0; i < Stadsdelar.length; i++) {
            if (Stadsdelar[i].count > stadsdel.count) {
                stadsdel = Stadsdelar[i];
            }
        }




        var pages = document.querySelectorAll(".page");

        for (var i = 0; i < pages.length; i++) {
            if (pages[i].getAttribute("data-normalquestion") !== "false") {

                var headers = pages[i].querySelectorAll("h1, h3");

                function getq(id: string) {
                    if (id) {
                        for (var z = 0; z < headers.length; z++) {
                            if (headers[z].getAttribute("data-q") === id) {
                                return headers[z].innerHTML;
                            }
                        }
                    }
                    return null;
                }

                var inputs = (<HTMLInputElement[]><any>pages[i].querySelectorAll("input"));

                for (var x = 0; x < inputs.length; x++) {
                    if ((inputs[x].type === "checkbox" || inputs[x].type === "radio")) {
                        if (inputs[x].checked) {
                            var itm = {} as ResultData;
                            if (inputs[x].getAttribute("data-qtext")) {
                                itm.Question = inputs[x].getAttribute("data-qtext")!;
                            } else {
                                itm.Question = getq(inputs[x].getAttribute("data-q")!) ? getq(inputs[x].getAttribute("data-q")!) : pages[i].querySelector("h1")!.innerText;
                            }
                            itm.value = inputs[x].value;
                            itm.Stadsdel = stadsdel.name;

                            result.push(itm);
                        }
                    } else {
                        var itm = {} as ResultData;
                        if (inputs[x].getAttribute("data-qtext")) {
                            itm.Question = inputs[x].getAttribute("data-qtext")!;
                        } else {
                            itm.Question = getq(inputs[x].getAttribute("data-q")!) ? getq(inputs[x].getAttribute("data-q")!) : pages[i].querySelector("h1")!.innerText;
                        }
                        itm.value = inputs[x].value;
                        itm.Stadsdel = stadsdel.name;

                        result.push(itm);
                    }
                }

                var textareas = (<HTMLInputElement[]><any>pages[i].querySelectorAll("textarea"));

                for (var x = 0; x < textareas.length; x++) {
                    if (textareas[x].value !== "") {
                        var itm = {} as ResultData;
                        if (textareas[x].getAttribute("data-qtext")) {
                            itm.Question = textareas[x].getAttribute("data-qtext");
                        } else {
                            itm.Question = getq(textareas[x].getAttribute("data-q")!) ? getq(textareas[x].getAttribute("data-q")!) : pages[i].querySelector("h1")!.innerText;
                        }
                        itm.value = textareas[x].value;
                        itm.Stadsdel = stadsdel.name;

                        result.push(itm);
                    }
                }


            }
        }



        return result;
    }
}

app.init();



var RootPath = "/";
if (location.hostname !== "localhost") {
    RootPath = "/projektkarta_enkat/";
}

type Stat = {
    Stadsdel: string;
    Stats: { Typ: string, Value: number }[]
}

var stats = {
    data: [] as Stat[],
    Stadsdelar: [],
    UpdateData: function (Stats: { Typ: string, Value: number }[]) {
        var types = document.querySelectorAll(".pros");

        for (var x = 0; x < types.length; x++) {
            types[x].innerHTML = "0%";
        }

        for (var z = 0; z < Stats.length; z++) {
            for (var x = 0; x < types.length; x++) {
                if (types[x].getAttribute("data-type") === Stats[z].Typ) {
                    types[x].innerHTML = <any>Stats[z].Value + "%";
                }
            }
        }

    },
    init: function () {

        network.GET(RootPath + "api/AllStats", function (data: Stat[]) {
            stats.data = data;

            for (var i = 0; i < data.length; i++) {
                if (data[i].Stadsdel === "Umeå kommun") {
                    stats.UpdateData(data[i].Stats);
                }
            }



            //var root = document.createDocumentFragment();

            var ops1 = document.createElement("option");
            ops1.value = "Umeå kommun";
            ops1.innerText = "Alla Stadsdelar";
            document.getElementById("Stadsdelar")!.appendChild(ops1);

            for (var i = 0; i < data.length; i++) {
                if (data[i].Stadsdel !== "" && data[i].Stadsdel !== "Umeå kommun") {
                    var ops = document.createElement("option");
                    ops.value = data[i].Stadsdel;
                    ops.innerText = data[i].Stadsdel;
                    document.getElementById("Stadsdelar")!.appendChild(ops);
                }
            }

            //document.getElementById("Stadsdelar").appendChild(root);

            document.getElementById("Stadsdelar")!.addEventListener("change", function () {

                var val = (document.getElementById("Stadsdelar") as HTMLSelectElement).options[(document.getElementById("Stadsdelar") as HTMLSelectElement).selectedIndex].value;

                for (var i = 0; i < stats.data.length; i++) {
                    if (stats.data[i].Stadsdel === val) {
                        stats.UpdateData(stats.data[i].Stats);
                    }
                }

            });

        }, function (err) { });

    }
}

stats.init();
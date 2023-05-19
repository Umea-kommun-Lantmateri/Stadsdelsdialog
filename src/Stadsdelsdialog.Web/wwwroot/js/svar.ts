var RootPath = "/";
if (location.hostname !== "localhost") {
    RootPath = "/projektkarta_enkat/";
}

type Answer = {
    value: string;
    Stadsdel: string;
    Created: string;
}

var svar = {
    init: function () {


        network.GET(RootPath + "api/GetAnswers", function (data: Answer[]) {


            var ops1 = document.createElement("option");
            ops1.value = "";
            ops1.innerText = "Alla Stadsdelar";
            document.getElementById("Stadsdelar")!.appendChild(ops1);

            var stadsdelar = [];

            for (var i = 0; i < data.length; i++) {
                if (data[i].Stadsdel !== "") {
                    var exist = false;
                    for (var x = 0; x < stadsdelar.length; x++) {
                        if (stadsdelar[x] === data[i].Stadsdel) {
                            exist = true;
                            break;
                        }
                    }
                    if (exist === false) {
                        stadsdelar.push(data[i].Stadsdel);
                    }
                }
            }


            for (var i = 0; i < stadsdelar.length; i++) {
                var ops = document.createElement("option");
                ops.value = stadsdelar[i];
                ops.innerText = stadsdelar[i];
                document.getElementById("Stadsdelar")!.appendChild(ops);
            }

            //document.getElementById("Stadsdelar").appendChild(root);

            document.getElementById("Stadsdelar")!.addEventListener("change", function () {

                var val = (document.getElementById("Stadsdelar") as HTMLSelectElement).options[(document.getElementById("Stadsdelar") as HTMLSelectElement).selectedIndex].value;

                var bubblor = document.querySelectorAll(".pratbubbla");

                for (var i = 0; i < bubblor.length; i++) {
                    if (val === "") {
                        bubblor[i].classList.remove("hide");
                    } else {
                        if (bubblor[i].getAttribute("data-stadsdel") !== val) {
                            bubblor[i].classList.add("hide");
                        }
                    }
                }
           

            });
        }, function (err) { });



        setTimeout(function () {
            location.reload();
        }, 1000 * 60 * 10);
    }
}

svar.init();
var RootPath = "/";
if (location.hostname !== "localhost") {
    RootPath = "/Projektkarta_Enkat_Admin/";
}

declare var Highcharts: any;

var app = {

    init: function () {

        app.CreateCharts();

        var buttons = document.querySelectorAll(".HideButton");

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", function (this: HTMLButtonElement) {
                network.GET(RootPath + "api/HidePost/" + this.getAttribute("data-id"), function (data: string) {
                    document.getElementById("HideButton" + data)!.remove();
                }, function (err) { });
            });
        }


        document.getElementById("AutoHideBtn")!.addEventListener("click", function () {
            document.getElementById("AutoHideWrepper")!.classList.add("show");
        });


        var Stats_kategori = <HTMLSelectElement[]><any>document.querySelectorAll(".Stats_kategori");

        for (var i = 0; i < Stats_kategori.length; i++) {
            Stats_kategori[i].addEventListener("change", function () {
                var id = this.getAttribute("data-id");
                var value = this.value;

                network.POST(RootPath + "api/Setkategori", {
                    ID: id,
                    value: value
                }, function (d: any) { }, function (err) { });

            });
        }

    },
    CreateCharts: function () {
        var charts = document.querySelectorAll(".Chart");

        for (var i = 0; i < charts.length; i++) {
            Highcharts.chart(charts[i], {
                chart: {
                    type: 'column'
                },
                title: {
                    text: charts[i].getAttribute("data-title")
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: 'Antal'
                    }

                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}'
                },

                series: JSON.parse(document.getElementById(charts[i]!.getAttribute("data-json")!)!.innerHTML)
            });
        }



    }
}

app.init();
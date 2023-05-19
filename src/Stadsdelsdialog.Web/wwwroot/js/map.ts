declare var proj4: any;

//ol.proj.setProj4(proj4);
proj4.defs("EPSG:3016", "+proj=tmerc +lat_0=0 +lon_0=20.25 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:3006", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ");



const map = {
    settings: {
        layers: [] as { name: string, layer: ol.layer.Vector | ol.layer.Tile }[],
        Projections: [] as { name: string, Projection: ol.proj.Projection }[],
        map: null as any as ol.Map,
        MapProjection: null
    },
    WMS: {
        getWMS: function (options: { Projection: any; ZoomRange: number; Resolutions: number[]; Origin?: ol.Coordinate; Layer: string; Format?: string; }) {
            var projectionExtent = options.Projection.getExtent();
            var size = ol.extent.getWidth(projectionExtent) / 256;
            var resolutions = new Array(options.ZoomRange); //9 kan behövas att ändras om man byter karta
            var matrixIds = new Array(options.ZoomRange);   //9 kan behövas att ändras om man byter karta
            for (var z = 0; z < options.ZoomRange; ++z) {
                // generate resolutions and matrixIds arrays for this WMTS
                resolutions[z] = size / Math.pow(2, z);
                matrixIds[z] = z;
            }

            var TileWMS = {
                origin: ol.extent.getTopLeft(projectionExtent),
                resolutions: options.Resolutions ? options.Resolutions : resolutions,
                matrixIds: matrixIds
            };

            if (options.Origin) {
                TileWMS.origin = options.Origin;
            }

            return new ol.layer.Tile({
                extent: options.Projection.getExtent(),
                preload: 0,
                visible: true,
                source: new ol.source.TileWMS({
                    url: 'https://wms.umea.se/geoserver/gwc/service/wms',
                    tileGrid: new ol.tilegrid.WMTS(TileWMS),
                    params: {
                        'LAYERS': options.Layer,
                        'FORMAT': options.Format ? options.Format : 'image/jpeg',
                        'TILED': true,
                        'VERSION': '1.1.0',
                        'WIDTH': 256,
                        'HEIGHT': 256,
                        'SRS': options.Projection.getCode()
                    },
                    serverType: 'geoserver'
                })
            });
        }
    },
    AddLayer: function (name: string, layer: any) {
        map.settings.layers.push({
            name: name,
            layer: layer
        });
    },
    AddVectorLayer: function (name: string, style: ol.style.Style) {
        map.AddLayer(name, new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: function (feature, resolution) {
                return [style];
            }
        }))
    },
    GetLayer: function (name: string): ol.layer.Vector | ol.layer.Tile {
        for (var i = 0; i < map.settings.layers.length; i++) {
            if (map.settings.layers[i].name === name) {
                return map.settings.layers[i].layer;
            }
        }

        throw "No Layer by thar name";
    },
    AddProjection: function (name: string, Projection: ol.proj.Projection) {
        map.settings.Projections.push({
            name: name,
            Projection: Projection
        });
        ol.proj.addProjection(Projection);
    },
    GetProjection: function (name: string): ol.proj.Projection {
        for (var i = 0; i < map.settings.Projections.length; i++) {
            if (map.settings.Projections[i].name === name) {
                return map.settings.Projections[i].Projection;
            }
        }
        throw new Error("No Projection with that name");
    },
    CreateMap: function (id: Element | string, zoom: number, minZoom: number, projection: ol.proj.Projection) {
        var layers = [];

        for (var i = 0; i < map.settings.layers.length; i++) {
            layers.push(map.settings.layers[i].layer);
        }

        map.settings.map = new ol.Map({
            layers: layers,
            target: id,
            pixelRatio: 1,
            view: new ol.View({
                projection: projection,
                zoom: zoom,
                minZoom: minZoom
            })
        });
    },
    GetMap: function (): ol.Map {
        return map.settings.map;
    },
    setCenter: function (pos: ol.Coordinate, Projection: ol.proj.Projection, ToProjection?: ol.proj.Projection) {
        if (ToProjection) {
            map.GetMap().getView().setCenter(ol.proj.transform(pos, Projection, ToProjection));
        } else {
            map.GetMap().getView().setCenter(ol.proj.transform(pos, Projection, map.GetMap().getView().getProjection()));
        }
    },
    setZoom: function (zoom: number) {
        map.settings.map.getView().setZoom(zoom);
    },
    ZoomIn: function () {
        map.GetMap().getView().setZoom(map.GetMap().getView().getZoom() + 1);
    },
    ZoonOut: function () {
        map.GetMap().getView().setZoom(map.GetMap().getView().getZoom() - 1);
    },
    on: function (event: string, callback: Function) {
        map.GetMap().on(event, callback);
    },
    addInteraction: function (interaction: ol.interaction.Interaction) {
        map.GetMap().addInteraction(interaction);
    },
    AddFeature: function (Type: string, Coords: any[], Propertys: any, LayerName: string) {
        if (Type === "Point") {
            var marker_coord = ol.proj.transform(<[number, number]>Coords, map.GetProjection("SWEREF 99 20 15"), map.GetMap().getView().getProjection());
            var marker_geom = new ol.geom.Point(marker_coord);
            Propertys.geometry = marker_geom;
            var marker = new ol.Feature(Propertys);

            map.GetLayer(LayerName).getSource().addFeatures([marker]);
        } else if (Type === "Line") {

            var LineString = new ol.geom.LineString(Coords);

            Propertys.geometry = LineString.transform(map.GetProjection("SWEREF 99 20 15"), map.GetMap().getView().getProjection());
            var line = new ol.Feature(Propertys);

            map.GetLayer(LayerName).getSource().addFeatures([line]);
        } else if (Type === "Polygon") {
            Coords.push([Coords[0][0], Coords[0][1]]);


            var Polygon = new ol.geom.Polygon([Coords]);

            Propertys.geometry = Polygon.transform(map.GetProjection("SWEREF 99 20 15"), map.GetMap().getView().getProjection());
            var PolygonFeature = new ol.Feature(Propertys);
            map.GetLayer(LayerName).getSource().addFeatures([PolygonFeature]);
        }
    }
};

map.AddProjection("SWEREF 99 20 15", new ol.proj.Projection({
    code: "EPSG:3016",
    extent: [-93218.3385, 7034909.8738, 261434.62459999998, 7744215.8],
    units: 'm'
}));

map.AddProjection("SWEREF 99 TM", new ol.proj.Projection({
    code: "EPSG:3006",
    extent: [181896.32913603852, 6091282.433471196, 1086312.9422175875, 7900115.659634294],
    units: 'm'
}));



/// <reference types="@workadventure/iframe-api-typings" />

console.log("Script started");

WA.onInit()
    .then(() => {
        console.log("Scripting API ready");

        const areaName = "ZoneHouse1";       // имя объекта-зоны в Tiled
        const wallsLayerName = "InvisibleWalls"; // имя Tile Layer с крышей / стенами

        // На всякий случай убедимся, что слой включён при старте
        WA.room.showLayer(wallsLayerName);

        // Зашли в зону — прячем слой с крышей
        WA.room.area.onEnter(areaName).subscribe(() => {
            console.log("Enter area:", areaName);
            WA.room.hideLayer(wallsLayerName);
        });

        // Вышли из зоны — возвращаем слой
        WA.room.area.onLeave(areaName).subscribe(() => {
            console.log("Leave area:", areaName);
            WA.room.showLayer(wallsLayerName);
        });
    })
    .catch((e) => console.error(e));

export {};

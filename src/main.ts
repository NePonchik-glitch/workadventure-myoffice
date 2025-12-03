/// <reference types="@workadventure/iframe-api-typings" />

console.log("Script started");

WA.onInit()
    .then(() => {
        console.log("Scripting API ready");

        const ZoneHouse1 = "ZoneHouse1";       // имя объекта-зоны в Tiled
        const InvisibleWalls = "InvisibleWalls"; // имя Tile Layer с крышей / стенами

        // На всякий случай убедимся, что слой включён при старте
        WA.room.showLayer(InvisibleWalls);

        // Зашли в зону — прячем слой с крышей
        WA.room.area.onEnter(ZoneHouse1).subscribe(() => {
            console.log("Enter area:", ZoneHouse1);
            WA.room.hideLayer(InvisibleWalls);
        });

        // Вышли из зоны — возвращаем слой
        WA.room.area.onLeave(ZoneHouse1).subscribe(() => {
            console.log("Leave area:", ZoneHouse1);
            WA.room.showLayer(InvisibleWalls);
        });
    })
    .catch((e) => console.error(e));

export {};

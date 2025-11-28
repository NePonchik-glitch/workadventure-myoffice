/// <reference types="@workadventure/iframe-api-typings" />

<<<<<<< HEAD
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

let currentPopup: any | undefined;

WA.onInit()
    .then(() => {
        // ---------- ЧАСЫ ----------
        WA.room.area.onEnter("clock").subscribe(() => {
            const today = new Date();
            const time =
                today.getHours().toString().padStart(2, "0") +
                ":" +
                today.getMinutes().toString().padStart(2, "0");

            currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
        });

        WA.room.area.onLeave("clock").subscribe(() => {
            if (currentPopup) {
                currentPopup.close();
                currentPopup = undefined;
            }
        });

        // ---------- КРЫША ДОМА ----------

        const ROOF_LAYER = "InvisibleWalls";   // tile-layer с крышей
        const INSIDE_LAYER = "ZoneHouse1Layer"; // tile-layer-зона внутри дома

        // Заходим в зону — прячем крышу
        WA.room.onEnterLayer(INSIDE_LAYER).subscribe(() => {
            WA.room.hideLayer(ROOF_LAYER);
        });

        // Выходим из зоны — показываем крышу
        WA.room.onLeaveLayer(INSIDE_LAYER).subscribe(() => {
            WA.room.showLayer(ROOF_LAYER);
        });

        // ---------- Extra API ----------
        bootstrapExtra().catch(() => {});
    })
    .catch(() => {});
=======
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
>>>>>>> b25b2e0 (Initial commit: my WorkAdventure map)

export {};

/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

let currentPopup: any = undefined;

WA.onInit()
    .then(() => {
        // ---------- ЧАСЫ ----------
        WA.room.area.onEnter("clock").subscribe(() => {
            const today = new Date();
            const time =
                today.getHours().toString().padStart(2, "0") +
                ":" +
                today.getMinutes().toString().padStart(2, "0");

            currentPopup = WA.ui.openPopup(
                "clockPopup",
                "It's " + time,
                []
            );
        });

        WA.room.area.onLeave("clock").subscribe(() => {
            if (currentPopup) {
                currentPopup.close();
                currentPopup = undefined;
            }
        });

        // ---------- КРЫША ДОМА ----------
        const ROOF_LAYER = "InvisibleWalls"; // имя tile-слоя с крышей
        const INSIDE_AREA = "ZoneHouse1";    // имя area-объекта

        // Заходим в зону — прячем крышу
        WA.room.area.onEnter(INSIDE_AREA).subscribe(() => {
            WA.room.hideLayer(ROOF_LAYER);
        });

        // Выходим из зоны — показываем крышу
        WA.room.area.onLeave(INSIDE_AREA).subscribe(() => {
            WA.room.showLayer(ROOF_LAYER);
        });

        // ---------- Extra API ----------
        bootstrapExtra().catch(() => {});
    })
    .catch(() => {});

export {};

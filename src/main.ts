/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

let currentPopup: any = undefined;

WA.onInit()
    .then(() => {
        console.log("Scripting API ready");
        console.log("Player tags: ", WA.player.tags);

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
        console.log("✅ Roof script started");

        const ROOF_LAYER = "above/InvisibleWalls"; // группа/слой c крышей
        const INSIDE_AREA = "ZoneHouse1";          // ИМЯ ОБЪЕКТА зоны

        // Заходим в зону — прячем крышу
        WA.room.area.onEnter(INSIDE_AREA).subscribe(() => {
            console.log("🏠 Enter ZoneHouse1 — hide roof");
            WA.room.hideLayer(ROOF_LAYER);
        });

        // Выходим из зоны — показываем крышу
        WA.room.area.onLeave(INSIDE_AREA).subscribe(() => {
            console.log("🚪 Leave ZoneHouse1 — show roof");
            WA.room.showLayer(ROOF_LAYER);
        });

        // ---------- Extra API ----------
        bootstrapExtra()
            .then(() => {
                console.log("Scripting API Extra ready");
            })
            .catch((e) => console.error(e));
    })
    .catch((e) => console.error(e));

export {};

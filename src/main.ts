/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    })

    WA.room.area.onLeave('clock').subscribe(closePopup)

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

function closePopup(){
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

export {};

/// <reference types="@workadventure/iframe-api-typings" />

console.log('✅ Roof script started');

WA.onInit().then(() => {
    console.log('✅ WA API ready');

    const ROOF_LAYER = 'InvisibleWalls'; // слой с крышей
    const INSIDE_LAYER = 'ZoneHouse1';   // слой-зона внутри здания

    // Когда заходим в здание — прячем крышу
    WA.room.onEnterLayer(INSIDE_LAYER).subscribe(() => {
        console.log('🏠 Enter ZoneHouse1 — hide roof');
        WA.room.hideLayer(ROOF_LAYER);
    });

    // Когда выходим — возвращаем крышу
    WA.room.onLeaveLayer(INSIDE_LAYER).subscribe(() => {
        console.log('🚪 Leave ZoneHouse1 — show roof');
        WA.room.showLayer(ROOF_LAYER);
    });
}).catch(e => console.error('WA init error', e));

/// <reference types="@workadventure/iframe-api-typings" />

WA.onInit().then(() => {
    console.log('Scripting API ready');

    // When player enters ZoneHouse1, hide the roof (InvisibleWalls layer)
    WA.room.area.onEnter('ZoneHouse1').subscribe(() => {
        WA.room.hideLayer('InvisibleWalls');
    });

    // When player leaves ZoneHouse1, show the roof again
    WA.room.area.onLeave('ZoneHouse1').subscribe(() => {
        WA.room.showLayer('InvisibleWalls');
    });
});

export {};

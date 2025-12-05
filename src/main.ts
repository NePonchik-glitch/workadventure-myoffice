/// <reference types="@workadventure/iframe-api-typings" />

// Никаких import'ов, чтобы не было проблем с бандлингом

WA.onInit().then(() => {
    const ROOF_LAYER = "InvisibleWalls";   // слой с крышей
    const AREA_NAME = "ZoneHouse1";        // объект-зона (Class=area, Name=ZoneHouse1)
    const TILE_ZONE_LAYER = "ZoneHouseLayer"; // необязательный tile-layer зона

    const hideRoof = () => {
        WA.room.hideLayer(ROOF_LAYER);
    };

    const showRoof = () => {
        WA.room.showLayer(ROOF_LAYER);
    };

    // --- Вариант 1: Object area (то, что у тебя сейчас) ---
    WA.room.area.onEnter(AREA_NAME).subscribe(hideRoof);
    WA.room.area.onLeave(AREA_NAME).subscribe(showRoof);

    // --- Вариант 2: Tile-layer зона (как в wa-village) ---
    // Если слоя нет — просто не сработает, ошибок не будет.
    WA.room.onEnterLayer(TILE_ZONE_LAYER).subscribe(hideRoof);
    WA.room.onLeaveLayer(TILE_ZONE_LAYER).subscribe(showRoof);
});

export {};

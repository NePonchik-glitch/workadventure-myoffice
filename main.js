import { WA } from '@workadventure/scripting-api-extra';

WA.onInit().then(() => {
  const zoneName = 'house1_zone';                          // имя объекта-зоны
  const roofLayer = WA.room.getObject(zoneName)?.properties?.roofLayer || 'InvisibleWalls';

  // Плавное появление/исчезновение ради красоты
  const fadeTo = async (layer, target, step = 0.1, delay = 20) => {
    let cur = await WA.room.getLayerOpacity(layer);
    const dir = target > cur ? 1 : -1;
    while ((dir > 0 && cur < target) || (dir < 0 && cur > target)) {
      cur = +(cur + dir * step).toFixed(3);
      if ((dir > 0 && cur > target) || (dir < 0 && cur < target)) cur = target;
      await WA.room.setLayerOpacity(layer, cur);
      await new Promise(r => setTimeout(r, delay));
    }
  };

  // Когда заходим в зону — скрываем/делаем прозрачным слой Roof
  WA.room.onEnterZone(zoneName).subscribe(() => {
    // полностью спрятать:
    // WA.room.hideLayer(roofLayer);

    // или сделать прозрачным:
    fadeTo(roofLayer, 0.15); // 15% непрозрачности
  });

  // Когда выходим — возвращаем обратно
  WA.room.onLeaveZone(zoneName).subscribe(() => {
    // WA.room.showLayer(roofLayer);
    fadeTo(roofLayer, 1);
  });
});

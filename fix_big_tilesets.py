import json, sys
from pathlib import Path
from xml.etree import ElementTree as ET
from PIL import Image

MAX_SIZE = 4096
FLIP_H = 0x80000000
FLIP_V = 0x40000000
FLIP_D = 0x20000000
FLIP_MASK = FLIP_H | FLIP_V | FLIP_D

def load_tsx(tsx_path: Path):
    root = ET.parse(tsx_path).getroot()
    tw = int(root.attrib.get("tilewidth"))
    th = int(root.attrib.get("tileheight"))
    spacing = int(root.attrib.get("spacing", "0"))
    margin = int(root.attrib.get("margin", "0"))
    columns = int(root.attrib.get("columns", "0"))
    tilecount = int(root.attrib.get("tilecount", "0"))
    img = root.find("image")
    img_src = img.attrib["source"]
    iw = int(img.attrib.get("width", "0"))
    ih = int(img.attrib.get("height", "0"))
    name = root.attrib.get("name", tsx_path.stem)
    return {
        "name": name, "tw": tw, "th": th,
        "spacing": spacing, "margin": margin,
        "columns": columns, "tilecount": tilecount,
        "iw": iw, "ih": ih, "img_src": img_src, "tsx_path": tsx_path
    }

def save_tsx(path: Path, name: str, tw: int, th: int, columns: int, tilecount: int, img_src: str, iw: int, ih: int):
    root = ET.Element("tileset", {
        "version": "1.10", "tiledversion": "1.11.0",
        "name": name, "tilewidth": str(tw), "tileheight": str(th),
        "tilecount": str(tilecount), "columns": str(columns)
    })
    img = ET.SubElement(root, "image", {"source": img_src, "width": str(iw), "height": str(ih)})
    tree = ET.ElementTree(root)
    path.parent.mkdir(parents=True, exist_ok=True)
    tree.write(path, encoding="UTF-8", xml_declaration=True)

def iter_layers(layers):
    for L in layers:
        yield L
        if L.get("type") == "group" and "layers" in L:
            yield from iter_layers(L["layers"])

def main():
    if len(sys.argv) < 2:
        print("Usage: python fix_big_tilesets.py office.tmj")
        sys.exit(1)
    tmj_path = Path(sys.argv[1]).resolve()
    base = tmj_path.parent

    m = json.loads(tmj_path.read_text(encoding="utf-8"))
    if "tilesets" not in m:
        print("No tilesets in map.")
        return

    # собрать сведения о tilesets
    ts_infos = []
    for ts in m["tilesets"]:
        src = ts.get("source")
        if not src:
            continue
        tsx_path = (base / src).resolve()
        info = load_tsx(tsx_path)
        info["firstgid"] = ts["firstgid"]
        info["source_in_map"] = src
        ts_infos.append(info)

    # создадим новое описание tilesets и таблицу ремапа GID
    new_tilesets = []
    gid_remap = {}  # old_gid -> new_gid

    next_firstgid = 1
    # чтобы сохранить порядок, отсортируем по firstgid
    ts_infos.sort(key=lambda x: x["firstgid"])

    for info in ts_infos:
        old_first = info["firstgid"]
        tw, th = info["tw"], info["th"]
        spacing = info["spacing"]; margin = info["margin"]
        columns = info["columns"]; tilecount = info["tilecount"]
        iw, ih = info["iw"], info["ih"]
        img_src = info["img_src"]
        tsx_path = info["tsx_path"]
        ts_name = info["name"]

        # если tsx не указывает размеры изображения, вычислим из файла
        img_path = (tsx_path.parent / img_src).resolve()
        if iw == 0 or ih == 0:
            with Image.open(img_path) as I:
                iw, ih = I.size

        # columns/tilecount резервно вычислим
        if columns == 0:
            columns = iw // tw
        if tilecount == 0:
            tilecount = (ih // th) * columns

        rows = (tilecount + columns - 1) // columns

        # если и ширина и высота <= 4096 — оставляем как есть
        if iw <= MAX_SIZE and ih <= MAX_SIZE and spacing == 0 and margin == 0:
            # перенумеруем firstgid последовательно
            # и запомним прямой ремап (old_gid -> new_gid)
            for local in range(tilecount):
                gid_remap[old_first + local] = next_firstgid + local
            new_tilesets.append({"firstgid": next_firstgid, "source": info["source_in_map"]})
            next_firstgid += tilecount
            continue

        if spacing != 0 or margin != 0:
            raise SystemExit(f"Tileset '{ts_name}' has non-zero spacing/margin; this quick script doesn't handle it.")

        max_cols = min(columns, MAX_SIZE // tw)
        max_rows = min(rows,    MAX_SIZE // th)

        # нарезаем и создаём дочерние tsx
        with Image.open(img_path) as I:
            for r0 in range(0, rows, max_rows):
                pr = min(max_rows, rows - r0)
                for c0 in range(0, columns, max_cols):
                    pc = min(max_cols, columns - c0)
                    # пиксельные границы куска
                    x = c0 * tw
                    y = r0 * th
                    w = pc * tw
                    h = pr * th
                    tile_img = I.crop((x, y, x + w, y + h))

                    part_name = f"{ts_name}_r{r0}_c{c0}"
                    png_rel = Path(img_src).with_name(part_name + ".png")
                    tsx_rel = Path(info["source_in_map"]).with_name(part_name + ".tsx")

                    out_png = (tsx_path.parent / png_rel)
                    out_tsx = (base / tsx_rel)

                    out_png.parent.mkdir(parents=True, exist_ok=True)
                    tile_img.save(out_png)

                    # сохранить tsx
                    save_tsx(out_tsx, part_name, tw, th, pc, pr * pc, str(png_rel).replace("\\","/"), w, h)

                    # добавить в список tilesets
                    new_tilesets.append({"firstgid": next_firstgid, "source": str(tsx_rel).replace("\\","/")})

                    # заполнить ремап: для всех тайлов этого блока
                    for rr in range(pr):
                        for cc in range(pc):
                            old_local = (r0 + rr) * columns + (c0 + cc)
                            if old_local >= tilecount:
                                continue
                            new_local = rr * pc + cc
                            gid_remap[old_first + old_local] = next_firstgid + new_local

                    next_firstgid += pr * pc

    # обновить firstgid в карте
    m["tilesets"] = new_tilesets

    # пройти по всем слоям и ремапнуть GID’ы (с учётом флип-флагов)
    for L in iter_layers(m.get("layers", [])):
        if L.get("type") != "tilelayer":
            continue
        data = L.get("data")
        if not isinstance(data, list):
            # если base64 — лучше пересохранить в Tiled как CSV
            raise SystemExit("Layer data is not CSV-array. Save your map layers as CSV in Tiled and retry.")
        new_data = []
        for val in data:
            if val == 0:
                new_data.append(0); continue
            flags = val & FLIP_MASK
            gid = val & ~FLIP_MASK
            new_gid = gid_remap.get(gid, 0)
            new_data.append(new_gid | flags if new_gid else 0)
        L["data"] = new_data

    # сохранить карту
    tmj_path.write_text(json.dumps(m, ensure_ascii=False, separators=(",",":")), encoding="utf-8")
    print("Done. Map updated.")

if __name__ == "__main__":
    main()

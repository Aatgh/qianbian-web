import json
from pathlib import Path

import numpy as np
from PIL import Image
from skimage import measure


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "logo-3d" / "reference-logo.png"
OUTPUT = ROOT / "logo-3d" / "logo-shapes.json"


def polygon_area(points):
    x = points[:, 0]
    y = points[:, 1]
    return abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1))) / 2


def bounds(points):
    return (
        float(points[:, 0].min()),
        float(points[:, 1].min()),
        float(points[:, 0].max()),
        float(points[:, 1].max()),
    )


image = np.array(Image.open(SOURCE).convert("RGBA"))
mask = image[:, :, 3] > 127
contours = [
    measure.approximate_polygon(contour, tolerance=1.2)
    for contour in measure.find_contours(mask.astype(float), 0.5)
]

# skimage returns (row, column); convert to centered Three.js XY coordinates.
center = np.array([image.shape[1] / 2, image.shape[0] / 2])
normalized = []
for contour in contours:
    points = np.column_stack((contour[:, 1], contour[:, 0]))
    normalized.append(
        {
            "points": (points - center) / 128.0,
            "area": polygon_area(points),
            "bounds": bounds(points),
        }
    )

normalized.sort(key=lambda item: item["area"], reverse=True)
outer = normalized[:2]
holes = normalized[2:]

for shape in outer:
    x0, y0, x1, y1 = shape["bounds"]
    shape["holes"] = []
    for hole in holes:
        hx0, hy0, hx1, hy1 = hole["bounds"]
        if x0 < hx0 and y0 < hy0 and x1 > hx1 and y1 > hy1:
            shape["holes"].append(hole)

payload = {
    "source": SOURCE.name,
    "width": image.shape[1],
    "height": image.shape[0],
    "unitsPerPixel": 1 / 128,
    "shapes": [
        {
            "outer": np.round(shape["points"], 4).tolist(),
            "holes": [
                np.round(hole["points"], 4).tolist() for hole in shape["holes"]
            ],
        }
        for shape in outer
    ],
}

OUTPUT.write_text(
    json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
    encoding="utf-8",
)
print(
    f"Wrote {OUTPUT} with {len(payload['shapes'])} shapes and "
    f"{sum(len(shape['holes']) for shape in payload['shapes'])} holes"
)

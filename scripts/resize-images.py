"""Generate responsive derivatives without changing the original photographs. Requires Pillow."""
import json
from pathlib import Path
from PIL import Image, ImageOps

project = Path(__file__).resolve().parents[1]
root = project / "public/images"
target = root / "responsive"
target.mkdir(exist_ok=True)
manifest = {}
for path in sorted(root.iterdir()):
    if path.suffix.lower() not in [".jpg", ".webp", ".png"]:
        continue
    image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    widths = [720, 1200] if path.stem == "hero" else [720]
    variants = []
    for width in sorted({min(w, image.width) for w in widths}):
        name = f"{path.stem}-{width}.webp"
        image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS).save(target / name, "WEBP", quality=84, method=6)
        variants.append({"src": "/images/responsive/" + name, "width": width})
    manifest["/images/" + path.name] = {"width": image.width, "variants": variants}
(project / "src/content/image-sizes.json").write_text(json.dumps(manifest, indent=2) + "\n")

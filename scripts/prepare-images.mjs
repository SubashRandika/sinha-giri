// Converts the source photographs and Higgsfield reconstructions in /assets-src
// into web-ready WebP plates (two widths each) plus the Open Graph image.
// Run with: npm run images
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = (p) => path.join(root, "assets-src", p);
const out = (p) => path.join(root, "public", p);

const plates = [
  ["aerial", "modern/aerial.jpg", "ancient/aerial.png"],
  ["gardens", "modern/water-gardens.jpg", "ancient/water-gardens.png"],
  ["lion", "modern/lion-gate.webp", "ancient/lion-gate.png"],
  ["summit", "modern/summit.jpg", "ancient/summit.png"],
];

const widths = [1280, 2400];

await mkdir(out("plates"), { recursive: true });
await mkdir(out("frescoes"), { recursive: true });

for (const [name, modern, ancient] of plates) {
  for (const [era, file] of [["modern", modern], ["ancient", ancient]]) {
    for (const w of widths) {
      const target = out(`plates/${name}-${era}-${w}.webp`);
      const info = await sharp(src(file))
        .resize({ width: w, withoutEnlargement: false })
        .webp({ quality: w > 2000 ? 80 : 76 })
        .toFile(target);
      console.log(target.replace(root, ""), `${info.width}x${info.height}`, `${(info.size / 1024) | 0}KB`);
    }
  }
}

for (const [name, file] of [["fresco-a", "modern/fresco-a.jpg"], ["fresco-b", "modern/fresco-b.webp"]]) {
  const info = await sharp(src(file)).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out(`frescoes/${name}.webp`));
  console.log(name, `${info.width}x${info.height}`, `${(info.size / 1024) | 0}KB`);
}

// Open Graph: the reconstructed aerial, 1200x630.
await sharp(src("ancient/aerial.png"))
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(root, "src/app/opengraph-image.jpg"));
console.log("og image written");

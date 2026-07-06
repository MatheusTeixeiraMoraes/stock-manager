const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const DROPLET =
  "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.5-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z";

const BG = "#1F5C56";
const FG = "#F3EFE2";

function svg({ rounded, scale }) {
  const rect = rounded
    ? `<rect width="24" height="24" rx="5" fill="${BG}"/>`
    : `<rect width="24" height="24" fill="${BG}"/>`;
  return `<svg width="512" height="512" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  ${rect}
  <path d="${DROPLET}" fill="${FG}" transform="translate(12,12) scale(${scale}) translate(-12,-12)"/>
</svg>`;
}

const standardSvg = svg({ rounded: true, scale: 0.78 });
const maskableSvg = svg({ rounded: false, scale: 0.6 });
const appleSvg = svg({ rounded: false, scale: 0.7 });

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  await sharp(Buffer.from(standardSvg)).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(Buffer.from(standardSvg)).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));
  await sharp(Buffer.from(maskableSvg)).resize(192, 192).png().toFile(path.join(outDir, "icon-maskable-192.png"));
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(path.join(outDir, "icon-maskable-512.png"));

  await sharp(Buffer.from(standardSvg)).resize(512, 512).png().toFile(
    path.join(__dirname, "..", "app", "icon.png")
  );
  await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toFile(
    path.join(__dirname, "..", "app", "apple-icon.png")
  );

  console.log("Icons generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

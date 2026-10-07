const fs = require("fs");
const path = require("path");

const root = __dirname;
const images = path.join(root, "images");
const years = ["2023", "2024", "2025", "2026"];
const imageExt = /\.(jpe?g|png|webp|gif|avif)$/i;

function filesForYear(year) {
  const dir = path.join(images, year);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isFile() && imageExt.test(e.name))
    .map(e => e.name)
    .sort((a,b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map(name => `images/${year}/${encodeURIComponent(name).replace(/%2F/g,"/")}`);
}

const archive = {};
for (const year of years) archive[year] = filesForYear(year);

const generalFiles = [];
if (fs.existsSync(images)) {
  fs.readdirSync(images, { withFileTypes: true })
    .filter(e => e.isFile() && imageExt.test(e.name))
    .forEach(e => generalFiles.push({ key: path.parse(e.name).name.toLowerCase(), src: `images/${encodeURIComponent(e.name)}` }));
}

const output = `// AUTO-GENERATED DURING CLOUDFLARE PAGES BUILD. DO NOT EDIT.
window.ARCHIVE_PHOTOS = ${JSON.stringify(archive, null, 2)};
window.PHOTOS = ${JSON.stringify(generalFiles, null, 2)};
`;

fs.writeFileSync(path.join(root, "photos.generated.js"), output);
console.log("Generated photo manifest:", archive);

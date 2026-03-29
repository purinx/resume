import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jsonFile = process.argv[2] ?? path.join(__dirname, 'src/202603.json');
const baseName = path.basename(jsonFile, '.json');

const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
const outDir = path.join(__dirname, 'docs');
fs.mkdirSync(outDir, { recursive: true });
const outputPath = path.join(outDir, `${baseName}.html`);

nunjucks.configure(path.join(__dirname, 'src'), { autoescape: true });
const html = nunjucks.render('template.njk', data);

fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`Built → docs/${baseName}.html`);

import { chromium, type Page } from "playwright";
import ExcelJS from "exceljs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const DETAIL_URLS = [
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/484/ficha/casas-en-venta-en-tirasso-4961?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/326/ficha/locales-comerciales-en-venta-en-lopez-de-gomara-esquina-yatay?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/317/ficha/departamentos-en-alquiler-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/267/ficha/departamentos-en-alquiler-en-9-de-julio-y-los-cardos?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/312/ficha/lotes-y-terrenos-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/330/ficha/lotes-y-terrenos-en-venta-en-ruta-provincial-13-mendoza-norte-country-club-las-heras?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/332/ficha/casas-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/339/ficha/departamentos-en-venta-en-necochea-350?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/363/ficha/lotes-y-terrenos-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/365/ficha/casas-en-venta-en-cipolletti-592?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/374/ficha/departamentos-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/412/ficha/departamentos-en-alquiler-en-las-violetas?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/430/ficha/casas-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/438/ficha/lotes-y-terrenos-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/443/ficha/departamentos-en-venta-en-av-espana-2880?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/445/ficha/casas-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/450/ficha/departamentos-en-venta-en-yanelli-y-rivero?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/457/ficha/casas-en-venta-en-longones?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/458/ficha/casas-en-venta-en-nicolas-serpa-b0jardines-de-pedregal?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/466/ficha/bodegas-y-fincas-en-venta-en-ruta-40-kilometro-3333?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/467/ficha/departamentos-en-alquiler-en-aristobulo-del-valle-350?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/470/ficha/departamentos-en-venta-en-adolfo-calle-4177?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/472/ficha/casas-en-venta-en-vieytes-s-n-entre-25-de-mayo-oeste-y-palma?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/475/ficha/casas-en-alquiler-en-teniente-ibanez-2957?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/489/ficha/bodegas-y-fincas-en-venta-en-rama-5-s-n?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/491/ficha/casas-en-alquiler-en-mathus-hoyos-4220?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/493/ficha/casas-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/494/ficha/departamentos-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/495/ficha/casas-en-venta-en-lateral-sur-calle-juan-jose-paso-y-terrada-mendoza?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/496/ficha/casas-en-venta-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/499/ficha/casas-en-venta-en-gobernador-francisco-gabrielli?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/500/ficha/departamentos-en-alquiler-en-barcala-354?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/501/ficha/departamentos-en-alquiler-en-alvarez-con-darco-1945?btid=8411528",
  "https://inmoup.com.ar/119376-cl-inmobiliaria/inmuebles/502/ficha/casas-en-alquiler-en-av-champagnat-2006-m5500-mendoza-argentina?btid=8411528",
];

const OUTPUT_DIR = path.join(process.cwd(), "imports", "inmoup");
const DEBUG_DIR = path.join(OUTPUT_DIR, "debug");

const TIMESTAMP = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .slice(0, 19);

const EXCEL_PATH = path.join(
  OUTPUT_DIR,
  `inmoup-propiedades-preview-${TIMESTAMP}.xlsx`
);

type NormalizedProperty = {
  inmoup_id: string;
  titulo: string;
  url: string;
  operacion: string;
  tipo: string;
  ciudad: string;
  provincia: string;
  moneda: string;
  precio: string | number;
  dormitorios: string | number;
  banios: string | number;
  superficie: string | number;
  antiguedad: string | number;
  dalvian: "SI" | "NO";
  imagen_principal: string;
  descripcion: string;
  estado_extraccion: string;
};

type ImageRow = {
  inmoup_id: string;
  titulo: string;
  image_url: string;
  is_cover: "SI" | "NO";
  position: number;
};

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(url: string) {
  return cleanText(url).replace(/\?btid=.*$/, "");
}

function extractIdFromUrl(url: string) {
  const match = url.match(/\/inmuebles\/(\d+)\//);
  return match?.[1] || "";
}

function normalizeGalleryImageUrl(imageUrl: string) {
  return cleanText(imageUrl)
    .replace(/\/thumbnail\//g, "/")
    .replace(/\/small\//g, "/")
    .replace(/\/medium\//g, "/")
    .replace(/\/large\//g, "/");
}

function isCurrentPropertyImage(imageUrl: string, inmoupId: string) {
  if (!imageUrl || !inmoupId) return false;

  const lower = imageUrl.toLowerCase();

  if (!lower.includes("d16v4wpqyuresn.cloudfront.net")) return false;

  if (!lower.includes(`/119376/${inmoupId}/`)) return false;

  const blockedWords = [
    "logo",
    "avatar",
    "profile",
    "user",
    "agency",
    "favicon",
    "icon",
    "marker",
    "placeholder",
    "iso",
    "brand",
  ];

  if (blockedWords.some((word) => lower.includes(word))) return false;

  return true;
}

function uniqueImages(urls: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of urls) {
    const clean = normalizeGalleryImageUrl(url);

    if (!clean || seen.has(clean)) continue;

    seen.add(clean);
    result.push(clean);
  }

  return result;
}

function filterGalleryImages(urls: string[], inmoupId: string) {
  return uniqueImages(
    urls
      .map(normalizeGalleryImageUrl)
      .filter((imageUrl) => isCurrentPropertyImage(imageUrl, inmoupId))
  );
}

function detectOperation(title: string, url: string) {
  const text = `${title} ${url}`.toLowerCase();

  if (text.includes("alquiler")) return "alquiler";
  if (text.includes("venta")) return "venta";

  return "";
}

function detectType(title: string, url: string) {
  const text = `${title} ${url}`.toLowerCase();

  if (text.includes("casas")) return "casa";
  if (text.includes("departamentos")) return "departamento";
  if (text.includes("duplex")) return "duplex";
  if (text.includes("lotes") || text.includes("terrenos")) return "lote";
  if (text.includes("locales")) return "local";
  if (text.includes("bodegas") || text.includes("fincas")) return "finca";
  if (text.includes("cocheras")) return "cochera";

  return "";
}

function getCityFromTitle(title: string) {
  const match = title.match(/en\s+([^,]+)/i);
  return cleanText(match?.[1] || "");
}

function getAdditional(item: any, fieldName: string) {
  const props = Array.isArray(item?.additionalProperty)
    ? item.additionalProperty
    : [];

  const found = props.find(
    (prop: any) =>
      cleanText(prop?.name).toLowerCase() === fieldName.toLowerCase()
  );

  return found?.value ?? "";
}

function collectRealEstateListings(node: any, output: any[] = []) {
  if (!node) return output;

  if (Array.isArray(node)) {
    for (const item of node) collectRealEstateListings(item, output);
    return output;
  }

  if (typeof node !== "object") return output;

  const type = node["@type"];

  if (
    type === "RealEstateListing" &&
    (node.name || node.description || node.offers || node.url)
  ) {
    output.push(node);
  }

  for (const value of Object.values(node)) {
    collectRealEstateListings(value, output);
  }

  return output;
}

function normalizeImageList(imageValue: unknown): string[] {
  if (!imageValue) return [];

  if (Array.isArray(imageValue)) {
    return imageValue.map(cleanText).filter(Boolean);
  }

  const value = cleanText(imageValue);
  return value ? [value] : [];
}

function normalizePropertyFromJsonLd(
  item: any,
  fallbackUrl: string
): {
  property: NormalizedProperty;
  images: ImageRow[];
} {
  const url = normalizeUrl(cleanText(item.url || fallbackUrl));
  const inmoupId = extractIdFromUrl(url || fallbackUrl);

  const title = cleanText(item.name);
  const description = cleanText(item.description);

  const imageUrls = filterGalleryImages(
    normalizeImageList(item.image),
    inmoupId
  );

  const price = item?.offers?.price ?? "";
  const currency = item?.offers?.priceCurrency ?? "";

  const dormitorios = getAdditional(item, "Dormitorios");
  const banios = getAdditional(item, "Baños");
  const superficie = getAdditional(item, "Superficie");
  const antiguedad = getAdditional(item, "Año de construcción");

  const property: NormalizedProperty = {
    inmoup_id: inmoupId,
    titulo: title,
    url: url || normalizeUrl(fallbackUrl),
    operacion: detectOperation(title, url || fallbackUrl),
    tipo: detectType(title, url || fallbackUrl),
    ciudad: getCityFromTitle(title),
    provincia: "Mendoza",
    moneda: currency,
    precio: price,
    dormitorios,
    banios,
    superficie,
    antiguedad,
    dalvian: `${title} ${description} ${url}`.toLowerCase().includes("dalvian")
      ? "SI"
      : "NO",
    imagen_principal: imageUrls[0] || "",
    descripcion: description,
    estado_extraccion: "OK_JSON_LD",
  };

  const images: ImageRow[] = imageUrls.map(
    (imageUrl: string, index: number): ImageRow => ({
      inmoup_id: inmoupId,
      titulo: title,
      image_url: imageUrl,
      is_cover: index === 0 ? "SI" : "NO",
      position: index + 1,
    })
  );

  return { property, images };
}

async function extractGalleryImagesFromDom(page: Page, inmoupId: string) {
  const safeId = inmoupId.replace(/[^0-9]/g, "");

  const rawImages = await page.evaluate(`
    (() => {
      const currentId = "${safeId}";
      const urls = new Set();

      const addUrl = (value) => {
        if (!value) return;

        try {
          const absoluteUrl = new URL(value, window.location.href).toString();
          const lower = absoluteUrl.toLowerCase();

          if (
            lower.includes("d16v4wpqyuresn.cloudfront.net") &&
            lower.includes("/119376/" + currentId + "/")
          ) {
            urls.add(absoluteUrl);
          }
        } catch (error) {}
      };

      document.querySelectorAll("img").forEach((img) => {
        addUrl(img.getAttribute("src"));
        addUrl(img.getAttribute("data-src"));
        addUrl(img.getAttribute("data-lazy-src"));
        addUrl(img.getAttribute("data-original"));
        addUrl(img.getAttribute("data-full"));
        addUrl(img.getAttribute("data-large_image"));

        const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset");

        if (srcset) {
          srcset.split(",").forEach((part) => {
            const src = part.trim().split(" ")[0];
            addUrl(src);
          });
        }
      });

      document.querySelectorAll("[style]").forEach((element) => {
        const style = element.getAttribute("style") || "";
        const matches = style.match(/url\\((['"]?)(.*?)\\1\\)/gi) || [];

        matches.forEach((match) => {
          const raw = match
            .replace(/^url\\((['"]?)/i, "")
            .replace(/(['"]?)\\)$/i, "");

          addUrl(raw);
        });
      });

      document.querySelectorAll("a").forEach((link) => {
        addUrl(link.getAttribute("href"));
      });

      return Array.from(urls);
    })()
  `);

  const imageUrls = Array.isArray(rawImages) ? (rawImages as string[]) : [];

  return filterGalleryImages(imageUrls, inmoupId);
}

async function extractFromRenderedPage(page: Page, url: string) {
  const cleanUrl = url.trim();
  const inmoupId = extractIdFromUrl(cleanUrl);

  await page.goto(cleanUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(5000);

  const html = await page.content();

  await writeFile(
    path.join(DEBUG_DIR, `${inmoupId || "sin-id"}.html`),
    html,
    "utf8"
  );

  const jsonTexts = await page
    .locator("script[type='application/ld+json']")
    .evaluateAll((nodes: HTMLScriptElement[]) =>
      nodes.map((node) => node.textContent || "")
    );

  const listings: any[] = [];

  for (const text of jsonTexts) {
    try {
      const json = JSON.parse(text);
      collectRealEstateListings(json, listings);
    } catch {
      // Ignorar JSON inválido
    }
  }

  const unique = new Map<string, any>();

  for (const item of listings) {
    const itemUrl = normalizeUrl(cleanText(item.url || cleanUrl));
    const key = itemUrl || cleanText(item.name) || cleanUrl;
    unique.set(key, item);
  }

  const items = Array.from(unique.values());

  if (items.length > 0) {
    const bestItem =
      items.find((item) => cleanText(item.url).includes("/inmuebles/")) ||
      items[0];

    const result = normalizePropertyFromJsonLd(bestItem, cleanUrl);
    const domImages = await extractGalleryImagesFromDom(page, inmoupId);

    const mergedImages = filterGalleryImages(
      [...result.images.map((image) => image.image_url), ...domImages],
      inmoupId
    );

    const finalImages: ImageRow[] = mergedImages.map(
      (imageUrl: string, index: number): ImageRow => ({
        inmoup_id: inmoupId,
        titulo: result.property.titulo,
        image_url: imageUrl,
        is_cover: index === 0 ? "SI" : "NO",
        position: index + 1,
      })
    );

    return {
      property: {
        ...result.property,
        imagen_principal: mergedImages[0] || result.property.imagen_principal,
      },
      images: finalImages,
    };
  }

  const title = cleanText(await page.title());
  const images = await extractGalleryImagesFromDom(page, inmoupId);

  const property: NormalizedProperty = {
    inmoup_id: inmoupId,
    titulo: title,
    url: normalizeUrl(cleanUrl),
    operacion: detectOperation(title, cleanUrl),
    tipo: detectType(title, cleanUrl),
    ciudad: getCityFromTitle(title),
    provincia: "Mendoza",
    moneda: "",
    precio: "",
    dormitorios: "",
    banios: "",
    superficie: "",
    antiguedad: "",
    dalvian: `${title} ${cleanUrl}`.toLowerCase().includes("dalvian")
      ? "SI"
      : "NO",
    imagen_principal: images[0] || "",
    descripcion: "NO SE ENCONTRÓ JSON-LD. Revisar HTML debug.",
    estado_extraccion: "PARCIAL_DOM",
  };

  const imageRows: ImageRow[] = images.map(
    (imageUrl: string, index: number): ImageRow => ({
      inmoup_id: inmoupId,
      titulo: title,
      image_url: imageUrl,
      is_cover: index === 0 ? "SI" : "NO",
      position: index + 1,
    })
  );

  return {
    property,
    images: imageRows,
  };
}

async function writeExcel(properties: NormalizedProperty[], images: ImageRow[]) {
  const workbook = new ExcelJS.Workbook();

  const propertiesSheet = workbook.addWorksheet("Propiedades");
  propertiesSheet.columns = [
    { header: "inmoup_id", key: "inmoup_id", width: 12 },
    { header: "titulo", key: "titulo", width: 54 },
    { header: "url", key: "url", width: 90 },
    { header: "operacion", key: "operacion", width: 14 },
    { header: "tipo", key: "tipo", width: 18 },
    { header: "ciudad", key: "ciudad", width: 22 },
    { header: "provincia", key: "provincia", width: 18 },
    { header: "moneda", key: "moneda", width: 12 },
    { header: "precio", key: "precio", width: 14 },
    { header: "dormitorios", key: "dormitorios", width: 14 },
    { header: "banios", key: "banios", width: 12 },
    { header: "superficie", key: "superficie", width: 14 },
    { header: "antiguedad", key: "antiguedad", width: 16 },
    { header: "dalvian", key: "dalvian", width: 12 },
    { header: "imagen_principal", key: "imagen_principal", width: 90 },
    { header: "descripcion", key: "descripcion", width: 120 },
    { header: "estado_extraccion", key: "estado_extraccion", width: 22 },
  ];

  propertiesSheet.addRows(properties);
  propertiesSheet.getRow(1).font = { bold: true };
  propertiesSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFEFEF" },
  };

  const imagesSheet = workbook.addWorksheet("Imagenes");
  imagesSheet.columns = [
    { header: "inmoup_id", key: "inmoup_id", width: 12 },
    { header: "titulo", key: "titulo", width: 54 },
    { header: "image_url", key: "image_url", width: 100 },
    { header: "is_cover", key: "is_cover", width: 12 },
    { header: "position", key: "position", width: 12 },
  ];

  imagesSheet.addRows(images);
  imagesSheet.getRow(1).font = { bold: true };
  imagesSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFEFEF" },
  };

  const summarySheet = workbook.addWorksheet("Resumen");
  summarySheet.columns = [
    { header: "campo", key: "campo", width: 32 },
    { header: "valor", key: "valor", width: 100 },
  ];

  summarySheet.addRows([
    { campo: "propiedades_procesadas", valor: properties.length },
    { campo: "imagenes_detectadas", valor: images.length },
    { campo: "archivo_generado", valor: EXCEL_PATH },
    { campo: "debug_html_folder", valor: DEBUG_DIR },
  ]);

  summarySheet.getRow(1).font = { bold: true };

  await workbook.xlsx.writeFile(EXCEL_PATH);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(DEBUG_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });

  const properties: NormalizedProperty[] = [];
  const images: ImageRow[] = [];

  for (const rawUrl of DETAIL_URLS) {
    const url = rawUrl.trim();
    const id = extractIdFromUrl(url);

    console.log(`Procesando ${id}: ${url}`);

    try {
      const result = await extractFromRenderedPage(page, url);

      properties.push(result.property);
      images.push(...result.images);

      console.log(
        `OK ${id} | ${result.property.titulo || "Sin título"} | imágenes: ${
          result.images.length
        }`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";

      properties.push({
        inmoup_id: id,
        titulo: "",
        url: normalizeUrl(url),
        operacion: detectOperation("", url),
        tipo: detectType("", url),
        ciudad: "",
        provincia: "Mendoza",
        moneda: "",
        precio: "",
        dormitorios: "",
        banios: "",
        superficie: "",
        antiguedad: "",
        dalvian: url.toLowerCase().includes("dalvian") ? "SI" : "NO",
        imagen_principal: "",
        descripcion: `ERROR: ${message}`,
        estado_extraccion: "ERROR",
      });

      console.log(`ERROR ${id}: ${message}`);
    }
  }

  await browser.close();

  await writeExcel(properties, images);

  console.log("");
  console.log(`Excel generado: ${EXCEL_PATH}`);
  console.log(`HTML debug: ${DEBUG_DIR}`);
  console.log(`Propiedades: ${properties.length}`);
  console.log(`Imágenes: ${images.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
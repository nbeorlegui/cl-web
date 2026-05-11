import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const PROPERTY_URLS = [
  "http://inmobiliariacl.com.ar/wdk-listing/vieytes-s-n-entre-25-de-mayo-oeste-y-palma/",
  "http://inmobiliariacl.com.ar/wdk-listing/casachacrasdecoria/",
  "http://inmobiliariacl.com.ar/wdk-listing/barrio-prima-terra/",
  "http://inmobiliariacl.com.ar/wdk-listing/lote-marianomoreno-olegarioandrade/",
  "http://inmobiliariacl.com.ar/wdk-listing/alquiler-casa-kilometro-11/",
  "http://inmobiliariacl.com.ar/wdk-listing/casa-dorrego-guaymallen/",
  "http://inmobiliariacl.com.ar/wdk-listing/casa-dalvian-apto-hipotecario/",
  "http://inmobiliariacl.com.ar/wdk-listing/lote-dalvian-challao/",
  "http://inmobiliariacl.com.ar/wdk-listing/departamento-complejo-cepas-dalvian/",
  "http://inmobiliariacl.com.ar/wdk-listing/lote-mendoza-norte/",
  "http://inmobiliariacl.com.ar/wdk-listing/casa-dalvian-mendoza/",
  "http://inmobiliariacl.com.ar/wdk-listing/casa-dalvian/",
  "http://inmobiliariacl.com.ar/wdk-listing/casa-dalvian-venta/",
];

const OUTPUT_DIR = path.join(process.cwd(), "imports", "cl-inmobiliaria-images");

type ReportRow = {
  propertyUrl: string;
  folder: string;
  imageUrl: string;
  fileName: string;
  status: "OK" | "ERROR" | "SKIPPED";
  error?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getSlugFromUrl(url: string) {
  const clean = url.replace(/\/$/, "");
  const parts = clean.split("/");
  return slugify(parts[parts.length - 1] || "propiedad");
}

function normalizeUrl(rawUrl: string, baseUrl: string) {
  if (!rawUrl) return null;

  let value = rawUrl.trim();

  if (!value) return null;

  if (value.startsWith("//")) {
    value = `https:${value}`;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractFromSrcset(srcset: string, baseUrl: string) {
  return srcset
    .split(",")
    .map((part) => part.trim().split(" ")[0])
    .map((url) => normalizeUrl(url, baseUrl))
    .filter(Boolean) as string[];
}

function isLikelyPropertyImage(url: string) {
  const lower = url.toLowerCase();

  const isImage =
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".png") ||
    lower.includes(".webp");

  if (!isImage) return false;

  const blockedWords = [
    "logo",
    "favicon",
    "icon",
    "whatsapp",
    "facebook",
    "instagram",
    "loader",
    "placeholder",
    "avatar",
  ];

  if (blockedWords.some((word) => lower.includes(word))) {
    return false;
  }

  return (
    lower.includes("/wp-content/uploads/") ||
    lower.includes("inmobiliariacl.com.ar")
  );
}

function getFileExtension(url: string, contentType?: string | null) {
  const lower = url.toLowerCase();

  if (lower.includes(".webp")) return "webp";
  if (lower.includes(".png")) return "png";
  if (lower.includes(".jpeg")) return "jpeg";
  if (lower.includes(".jpg")) return "jpg";

  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("jpeg")) return "jpg";

  return "jpg";
}

function csvEscape(value: string) {
  return `"${String(value || "").replaceAll('"', '""')}"`;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function extractImages(html: string, pageUrl: string) {
  const $ = cheerio.load(html);
  const found = new Set<string>();

  $("img").each((_, element) => {
    const attrs = [
      $(element).attr("src"),
      $(element).attr("data-src"),
      $(element).attr("data-lazy-src"),
      $(element).attr("data-original"),
      $(element).attr("data-full"),
      $(element).attr("data-large_image"),
    ];

    for (const attr of attrs) {
      const url = normalizeUrl(attr || "", pageUrl);
      if (url && isLikelyPropertyImage(url)) found.add(url);
    }

    const srcset = $(element).attr("srcset") || $(element).attr("data-srcset");
    if (srcset) {
      for (const url of extractFromSrcset(srcset, pageUrl)) {
        if (isLikelyPropertyImage(url)) found.add(url);
      }
    }
  });

  $("meta[property='og:image'], meta[name='twitter:image']").each(
    (_, element) => {
      const url = normalizeUrl($(element).attr("content") || "", pageUrl);
      if (url && isLikelyPropertyImage(url)) found.add(url);
    }
  );

  $("[style]").each((_, element) => {
    const style = $(element).attr("style") || "";
    const matches = style.match(/url\((['"]?)(.*?)\1\)/gi) || [];

    for (const match of matches) {
      const raw = match
        .replace(/^url\((['"]?)/i, "")
        .replace(/(['"]?)\)$/i, "");

      const url = normalizeUrl(raw, pageUrl);
      if (url && isLikelyPropertyImage(url)) found.add(url);
    }
  });

  const htmlMatches =
    html.match(/https?:\/\/[^"'()\s]+?\.(jpg|jpeg|png|webp)(\?[^"'()\s]+)?/gi) ||
    [];

  for (const rawUrl of htmlMatches) {
    const url = normalizeUrl(rawUrl, pageUrl);
    if (url && isLikelyPropertyImage(url)) found.add(url);
  }

  return Array.from(found);
}

async function downloadImage(
  imageUrl: string,
  folderPath: string,
  index: number
) {
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: "https://inmobiliariacl.com.ar/",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  const extension = getFileExtension(imageUrl, contentType);

  const fileName =
    index === 0
      ? `01-portada.${extension}`
      : `${String(index + 1).padStart(2, "0")}-imagen.${extension}`;

  const buffer = Buffer.from(await response.arrayBuffer());
  const filePath = path.join(folderPath, fileName);

  await writeFile(filePath, buffer);

  return fileName;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const report: ReportRow[] = [];

  console.log("Descargando imágenes de CL Inmobiliaria...");
  console.log(`Carpeta destino: ${OUTPUT_DIR}`);
  console.log("");

  for (const propertyUrl of PROPERTY_URLS) {
    const folderName = getSlugFromUrl(propertyUrl);
    const folderPath = path.join(OUTPUT_DIR, folderName);

    await mkdir(folderPath, { recursive: true });

    console.log(`Procesando: ${folderName}`);
    console.log(propertyUrl);

    try {
      const html = await fetchHtml(propertyUrl);
      const images = extractImages(html, propertyUrl);

      if (images.length === 0) {
        console.log("  Sin imágenes detectadas.");

        report.push({
          propertyUrl,
          folder: folderName,
          imageUrl: "",
          fileName: "",
          status: "SKIPPED",
          error: "Sin imágenes detectadas",
        });

        continue;
      }

      console.log(`  Imágenes detectadas: ${images.length}`);

      for (let index = 0; index < images.length; index++) {
        const imageUrl = images[index];

        try {
          const fileName = await downloadImage(imageUrl, folderPath, index);

          report.push({
            propertyUrl,
            folder: folderName,
            imageUrl,
            fileName,
            status: "OK",
          });

          console.log(`  OK ${fileName}`);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Error desconocido";

          report.push({
            propertyUrl,
            folder: folderName,
            imageUrl,
            fileName: "",
            status: "ERROR",
            error: message,
          });

          console.log(`  ERROR imagen: ${message}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";

      report.push({
        propertyUrl,
        folder: folderName,
        imageUrl: "",
        fileName: "",
        status: "ERROR",
        error: message,
      });

      console.log(`  ERROR página: ${message}`);
    }

    console.log("");
  }

  const csvHeader = [
    "property_url",
    "folder",
    "image_url",
    "file_name",
    "status",
    "error",
  ];

  const csvRows = report.map((row) =>
    [
      row.propertyUrl,
      row.folder,
      row.imageUrl,
      row.fileName,
      row.status,
      row.error || "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [csvHeader.join(","), ...csvRows].join("\n");

  await writeFile(path.join(OUTPUT_DIR, "reporte-imagenes.csv"), csv, "utf8");

  console.log("Finalizado.");
  console.log(`Reporte: ${path.join(OUTPUT_DIR, "reporte-imagenes.csv")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
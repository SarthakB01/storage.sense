import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const TEMP_DIR = path.join(process.cwd(), "temp");

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function getBearerToken() {
  try {
    const authResponse = await axios.post("https://api.ilovepdf.com/v1/auth", {
      public_key: process.env.ILOVEPDF_PUBLIC_KEY,
      secret_key: process.env.ILOVEPDF_SECRET_KEY,
    });

    if (!authResponse.data || !authResponse.data.token) {
      throw new Error("Failed to authenticate with iLovePDF API");
    }

    return authResponse.data.token;
  } catch (error) {
    console.error("Error getting Bearer token:", error);
    throw new Error("Authentication failed");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
    }

    const tempFilePath = path.join(TEMP_DIR, `input-${Date.now()}-${file.name}`);
    const bearerToken = await getBearerToken();
    console.log("Bearer token:", bearerToken);

    try {
      fs.writeFileSync(tempFilePath, buffer);

      // Prepare the form data for iLovePDF API
      const iLovePdfFormData = new FormData();
      iLovePdfFormData.append("file", fs.createReadStream(tempFilePath), {
        filename: file.name,
        contentType: file.type,
      });

      // Upload the file to iLovePDF
      const iLovePdfResponse = await axios.post(
        "https://api.ilovepdf.com/v1/upload",
        iLovePdfFormData,
        {
          headers: {
            ...iLovePdfFormData.getHeaders(),
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (!iLovePdfResponse.data || !iLovePdfResponse.data.server || !iLovePdfResponse.data.task) {
        throw new Error("Failed to upload file to iLovePDF");
      }

      const { server, task } = iLovePdfResponse.data;

      // Start the conversion task
      const startTaskResponse = await axios.post(
        `https://${server}/v1/process`,
        {
          tool: "officepdf",
          task: task,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (!startTaskResponse.data || !startTaskResponse.data.task) {
        throw new Error("Failed to start conversion task");
      }

      const { task: conversionTask } = startTaskResponse.data;

      // Download the converted file
      const downloadResponse = await axios.get(
        `https://${server}/v1/download/${conversionTask}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      if (!downloadResponse.data) {
        throw new Error("Failed to download converted file");
      }

      const convertedFilePath = path.join(TEMP_DIR, `output-${Date.now()}.pdf`);
      fs.writeFileSync(convertedFilePath, downloadResponse.data);

      const convertedFileBuffer = fs.readFileSync(convertedFilePath);
      const convertedFileBase64 = convertedFileBuffer.toString("base64");

      // Cleanup
      try {
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(convertedFilePath);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      return NextResponse.json({
        success: true,
        convertedFileUrl: `data:application/pdf;base64,${convertedFileBase64}`,
      });

    } finally {
      // Ensure cleanup even if conversion fails
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error) {
    console.error("Conversion error:", error);

    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Conversion failed: ${message}` },
      { status: 500 }
    );
  }
}
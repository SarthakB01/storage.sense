export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
        return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.CONVERT_API_KEY;
    if (!apiKey) {
        return Response.json({ error: "API Key is missing" }, { status: 500 });
    }

    // Convert file to Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = buffer.toString("base64");

    const apiUrl = "https://v2.convertapi.com/convert/pdf/to/docx";
    const requestBody = {
        Parameters: [
            {
                Name: "File",
                FileValue: {
                    Name: "uploaded.pdf",
                    Data: base64File
                }
            },
            {
                Name: "StoreFile",
                Value: true
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.Message || "Conversion failed");
        }

        return Response.json({ convertedFileUrl: data.Files[0].Url });
    } catch (error) {
        console.error("Conversion failed:", error);
        return Response.json({ error: "Conversion failed" }, { status: 500 });
    }
}

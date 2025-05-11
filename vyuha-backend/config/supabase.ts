import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
        auth: {
            persistSession: true
        },
        global: {
            fetch: fetch.bind(globalThis)
        }
    }
);
async function uploadFile(bucket: string, path: string, file: File) {
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        console.error("File size exceeds the maximum limit of 100MB");
        return;
    }
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
        });
    if (error) {
        console.error("Error uploading file:", error);
    } else {
        console.log("File uploaded successfully:", data);
    }
}
export default supabase;
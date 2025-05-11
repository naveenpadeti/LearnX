"use client"
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppContext } from "@/context/AppContext";
import axios from "axios";

export default function UpdateInstructorProfile() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const context = useContext(AppContext);
    const data = context?.data;
    const backendUrl = context?.backendUrl;
    const currentToken = context?.token;
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError("Please select a file to upload.");
            return;
        }
        setIsLoading(true);
        setError("");
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("id", data?.id || "");
        try {
            const response = await axios.post(backendUrl + "/api/update", formData, {
                headers: {
                    token: currentToken
                }
            });
            if (response.status !== 200) {
                throw new Error("Failed to update photo");
            }
            router.push("/instructor/dashboard/profile");
        } catch (error) {
            setError("Failed to update photo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-blue-100 p-8 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold text-blue-800 mb-4 text-center">Update Profile Photo</h2>
                    {error && (
                        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center">
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="Profile Preview"
                                    width={96}
                                    height={96}
                                    className="rounded-full object-cover mb-4"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
                                    <span className="text-gray-500">No Image</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Updating..." : "Update Photo"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
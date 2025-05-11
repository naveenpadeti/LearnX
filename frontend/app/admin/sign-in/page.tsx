"use client"
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminContext } from "@/context/AdminContext";
import axios from "axios";

export default function AdminSignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const context = useContext(AdminContext);
    const backendUrl = context?.backendUrl;
    const setAdminToken = context?.setAdminToken;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/auth/admin/login`, { id: email, password });
            if (response.data.token) {
                setAdminToken?.(response.data.token);
                router.push("/admin/dashboard");
            } else {
                setError("Authentication failed. Please check your credentials.");
            }
        } catch {
            setError("Authentication failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
            <div className="w-full max-w-md bg-white border border-green-200 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-green-800 mb-4">Admin Sign In</h2>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
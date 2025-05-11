"use client"
import { useState, useContext } from "react";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft, AlertCircle, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/AppContext";

export default function SignUp() {
    const [name, setName] = useState("");
    const [uniId, setUniId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const context = useContext(AppContext);
    const backendUrl = context?.backendUrl;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await fetch(`${backendUrl}/auth/createStudent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, uniId, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.message?.toLowerCase().includes("already exists") ||
                    data.message?.toLowerCase().includes("already registered")) {
                    setError("This University ID is already registered. Please sign in instead.");
                    return;
                }
                throw new Error(data.message || "Failed to sign up");
            }

            setSuccess("Account created successfully! You can now sign in.");
            setTimeout(() => {
                router.push("/sign-in");
            }, 2000);
        } catch (error: any) {
            setError(error.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="border-b border-green-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-green-800 hover:text-green-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Home</span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8">
                    <div className="w-full max-w-md lg:w-1/2">
                        <div className="bg-white border border-green-200 p-8 rounded-2xl shadow-lg">
                            <div className="flex flex-col items-center mb-8 space-y-4">
                                <Image
                                    src="/logo.png"
                                    alt="VLearn Logo"
                                    width={80}
                                    height={80}
                                    className="mb-4 hover:scale-105 transition-transform"
                                />
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-green-800 mb-2">
                                        Create Account
                                        <span className="ml-2 text-green-500">.</span>
                                    </h2>
                                    <p className="text-gray-600">Sign up to join Vyuha</p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col gap-3 text-red-600">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span className="text-sm">{error}</span>
                                    </div>

                                    {error.toLowerCase().includes("already registered") ||
                                    error.toLowerCase().includes("already exists") ? (
                                        <button
                                            onClick={() => router.push("/sign-in")}
                                            className="mt-2 w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all text-sm"
                                        >
                                            Go to Sign In
                                        </button>
                                    ) : null}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-600">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <span className="text-sm">{success}</span>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                placeholder="Enter your full name"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            University ID
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={uniId}
                                                onChange={(e) => setUniId(e.target.value)}
                                                required
                                                placeholder="Enter your KL University ID"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Creating account...</span>
                                        </>
                                    ) : (
                                        <span>Sign Up</span>
                                    )}
                                </button>

                                <div className="text-center text-gray-500 text-sm">
                                    Already have an account?{" "}
                                    <Link href="/sign-in" className="text-green-600 hover:text-green-800">
                                        Sign In
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
"use client"
import { useState, useContext } from "react";
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { AppContext } from "@/context/AppContext";

export default function Page() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const context = useContext(AppContext);
    const backendUrl = context?.backendUrl;
    const userId = context?.data?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!userId) {
            setError("User not authenticated");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${backendUrl}/auth/updatePassword`,
                {
                    userId,
                    oldPassword: currentPassword,
                    newPassword
                },{
                    headers: {
                        token: context?.token
                    }
                }
            );

            setMessage("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.message || "Failed to update password");
            } else {
                setError("Failed to update password");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/dashboard/profile" className="flex items-center gap-2 text-blue-800 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Profile</span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-blue-100 p-8 rounded-2xl shadow-lg">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-blue-800 mb-2">
                                Update Password
                            </h2>
                            <p className="text-gray-600">Enter your current password and new password</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-600">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-600">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm">{message}</span>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        placeholder="Enter your current password"
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Enter your new password"
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirm your new password"
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Updating Password...</span>
                                    </>
                                ) : (
                                    <span>Update Password</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
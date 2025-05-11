"use client"
import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '@/context/AdminContext';
import axios from 'axios';
import { Trash2, Search, User, UserPlus, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import Link from 'next/link';

const Page = () => {
    const context = useContext(AdminContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [context?.backendUrl, context?.adminToken, currentPage, itemsPerPage]);

    const fetchUsers = async () => {
        if (!context?.backendUrl || !context?.adminToken) return;

        setLoading(true);
        try {
            const response = await axios.get(`${context.backendUrl}/admin/getUsers`, {
                headers: { token: context.adminToken },
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                }
            });

            setUsers(response.data.users);
            setTotalUsers(response.data.pagination.total);
            setTotalPages(response.data.pagination.pages);
        } catch (e) {
            setError("Failed to fetch users");
            console.error("Error fetching users:", e);
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async (userId: string) => {
        if (confirm(`Are you sure you want to delete user with ID: ${userId}?`)) {
            setLoading(true);
            setError(null);
            try {
                await axios.delete(`${context?.backendUrl}/admin/deleteUser`, {
                    headers: {
                        token: context?.adminToken
                    },
                    data: { studentId: userId }
                });
                fetchUsers();
            } catch (e) {
                setError("Failed to delete user");
                console.error("Error deleting user:", e);
            } finally {
                setLoading(false);
            }
        }
    };

    const goToPage = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const copyToClipboard = (id: string) => {
        navigator.clipboard.writeText(id)
            .then(() => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            })
            .catch(err => console.error('Failed to copy ID:', err));
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-green-800">User Management</h1>
                <div className="flex gap-3 items-center">
                    <Link href="/admin/dashboard/users/add">
                        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </button>
                    </Link>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                        {totalUsers} Users
                    </span>
                </div>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 h-4 w-4" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, email or ID..."
                    className="pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg mb-6">
                    Loading users...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {users.length > 0 ? (
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
                    <div className="grid grid-cols-6 gap-4 bg-gray-50 p-4 font-medium text-gray-700 border-b">
                        <div>Profile</div>
                        <div>ID</div>
                        <div>Name</div>
                        <div>Email</div>
                        <div>Role</div>
                        <div className="text-right pr-4">Actions</div>
                    </div>

                    <div className="divide-y">
                        {users.map((user: any) => (
                            <div
                                key={user.id}
                                className={`grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50 transition-colors ${
                                    selectedUser === user.id ? 'bg-green-50' : ''
                                }`}
                                onClick={() => setSelectedUser(user.id === selectedUser ? null : user.id)}
                            >
                                <div>
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="truncate flex items-center">
                                    <span className="text-xs font-mono text-gray-600 max-w-[100px] truncate" title={user.id}>
                                        {user.id}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(user.id);
                                        }}
                                        className="ml-1 p-1 text-gray-400 hover:text-gray-600 rounded-md"
                                        title="Copy ID"
                                    >
                                        {copiedId === user.id ? (
                                            <span className="text-xs text-green-600">Copied!</span>
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </button>
                                </div>
                                <div className="truncate font-medium">{user.name || "N/A"}</div>
                                <div className="truncate text-gray-600">{user.email || "N/A"}</div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        user.role === "ADMIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-green-100 text-green-800"
                                    }`}>
                                        {user.role || "USER"}
                                    </span>
                                </div>
                                <div className="flex justify-end items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(user.id);
                                        }}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                        disabled={loading}
                                        aria-label="Delete user"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalUsers > 0 && (
                        <div className="p-4 flex items-center justify-between border-t">
                            <div className="text-sm text-gray-500">
                                Showing {users.length} of {totalUsers} users
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const startPage = Math.max(1, currentPage - 2);
                                    const page = startPage + i;

                                    if (page <= totalPages) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`w-8 h-8 rounded-md ${
                                                    currentPage === page
                                                        ? 'bg-green-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>

                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="ml-4 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-12 text-center bg-green-50 rounded-lg border">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No users found.</p>
                </div>
            )}
        </div>
    );
};

export default Page;
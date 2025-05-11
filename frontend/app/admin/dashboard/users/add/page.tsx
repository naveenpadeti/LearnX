"use client"
import React, { useState, useContext } from 'react'
import { AdminContext } from '@/context/AdminContext'
import axios from 'axios'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Page = () => {
    const router = useRouter()
    const context = useContext(AdminContext)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [userType, setUserType] = useState('student')

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        collegeId: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target.name === 'userType') {
            setUserType(e.target.value)
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Determine endpoint based on user type
        const endpoint = userType === 'student'
            ? '/admin/addUser'
            : userType === 'instructor'
                ? '/admin/addInstructor'
                : '/admin/addMentor'

        try {
            await axios.post(`${context?.backendUrl}${endpoint}`, {
                name: formData.name,
                password: formData.password,
                uniId: formData.collegeId
            }, {
                headers: {
                    token: context?.adminToken
                }
            })

            setSuccess(true)
            setFormData({
                name: '',
                password: '',
                collegeId: ''
            })
            setTimeout(() => {
                router.push('/admin/dashboard/users')
            }, 2000)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add user')
            console.error('Error adding user:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center mb-6">
                <Link href="/admin/dashboard/users" className="mr-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </Link>
                <h1 className="text-2xl font-bold">Add New User</h1>
            </div>

            {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg mb-6">
                    User added successfully! Redirecting...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-lg rounded-xl overflow-hidden border p-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="userType">
                                User Type
                            </label>
                            <select
                                id="userType"
                                name="userType"
                                value={userType}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="mentor">Mentor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                                placeholder="Enter user's full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="collegeId">
                                College ID
                            </label>
                            <input
                                id="collegeId"
                                name="collegeId"
                                type="text"
                                required
                                value={formData.collegeId}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                                placeholder="Enter user's college ID"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                                placeholder="Create a password for the user"
                                minLength={6}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                        Creating {userType.charAt(0).toUpperCase() + userType.slice(1)}...
                                    </>
                                ) : `Add ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default Page
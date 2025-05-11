// "use client";
//
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Search, Filter, Users, Clock, Calendar, ArrowRight, Star } from "lucide-react";
//
// // Mock data - replace with your actual data fetching
// const clubsData = {
//     categories: ["All", "Technology", "Arts", "Sports", "Academic", "Social"],
//     joinedClubs: [
//         {
//             id: "1",
//             name: "Data Science Club",
//             description: "A community of data enthusiasts exploring machine learning, statistics, and data visualization.",
//             image: "/images/clubs/data-science.jpg",
//             category: "Technology",
//             memberCount: 128,
//             nextMeeting: "Thursday, 6:00 PM",
//             leader: "Alex Johnson"
//         },
//         {
//             id: "2",
//             name: "Photography Society",
//             description: "Share your photography skills, learn techniques and participate in photo walks and exhibitions.",
//             image: "/images/clubs/photography.jpg",
//             category: "Arts",
//             memberCount: 87,
//             nextMeeting: "Saturday, 10:00 AM",
//             leader: "Maria Garcia"
//         },
//         {
//             id: "3",
//             name: "Chess Club",
//             description: "From beginners to masters, join us to improve your chess skills through regular practice and tournaments.",
//             image: "/images/clubs/chess.jpg",
//             category: "Academic",
//             memberCount: 56,
//             nextMeeting: "Wednesday, 5:00 PM",
//             leader: "David Chen"
//         }
//     ],
//     availableClubs: [
//         {
//             id: "4",
//             name: "Debate Club",
//             description: "Enhance your public speaking and critical thinking through structured debates on current topics.",
//             image: "/images/clubs/debate.jpg",
//             category: "Academic",
//             memberCount: 42,
//             rating: 4.8,
//             leader: "Sarah Wilson"
//         },
//         {
//             id: "5",
//             name: "Basketball Club",
//             description: "Regular practice sessions, friendly matches and competitive tournaments for basketball enthusiasts.",
//             image: "/images/clubs/basketball.jpg",
//             category: "Sports",
//             memberCount: 65,
//             rating: 4.6,
//             leader: "James Rodriguez"
//         },
//         {
//             id: "6",
//             name: "Coding Bootcamp",
//             description: "Weekly coding challenges, hackathons, and collaborative projects for programming enthusiasts.",
//             image: "/images/clubs/coding.jpg",
//             category: "Technology",
//             memberCount: 110,
//             rating: 4.9,
//             leader: "Emily Wong"
//         },
//         {
//             id: "7",
//             name: "Environmental Club",
//             description: "Working together to promote sustainability and environmental awareness through campus initiatives.",
//             image: "/images/clubs/environment.jpg",
//             category: "Social",
//             memberCount: 73,
//             rating: 4.7,
//             leader: "Michael Brown"
//         }
//     ]
// };
//
// const ClubsPage = () => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("All");
//
//     // Simulate loading state
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setIsLoading(false);
//         }, 800);
//         return () => clearTimeout(timer);
//     }, []);
//
//     // Filter available clubs based on search and category
//     const filteredAvailableClubs = clubsData.availableClubs.filter(club => {
//         const matchesSearch =
//             club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             club.leader.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
//         return matchesSearch && matchesCategory;
//     });
//
//     // Loading state
//     if (isLoading) {
//         return (
//             <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50/40 to-indigo-50/40 min-h-screen flex items-center justify-center">
//                 <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/30 w-full max-w-md">
//                     <div className="flex flex-col items-center">
//                         <div className="flex space-x-2 mb-4">
//                             <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                             <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                             <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                         </div>
//                         <p className="text-blue-800 font-medium">Loading clubs...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div className="p-6 bg-gray-50">
//             <div className="max-w-7xl mx-auto">
//                 <h1 className="text-3xl font-bold text-blue-800 mb-6">Clubs</h1>
//
//                 {/* Search and Filter Bar */}
//                 <div className="bg-white rounded-xl p-4 mb-6 shadow-md border border-blue-100 flex flex-wrap gap-4">
//                     <div className="relative flex-1 min-w-[300px]">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                         <input
//                             type="text"
//                             placeholder="Search clubs..."
//                             className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <Filter className="text-gray-500 h-5 w-5" />
//                         <select
//                             className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={selectedCategory}
//                             onChange={(e) => setSelectedCategory(e.target.value)}
//                         >
//                             {clubsData.categories.map(category => (
//                                 <option key={category} value={category}>{category}</option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//
//                 {/* Joined Clubs */}
//                 <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 mb-6">
//                     <div className="flex justify-between items-center mb-6">
//                         <div className="flex items-center">
//                             <Users className="w-6 h-6 mr-2 text-blue-500" />
//                             <h2 className="text-xl font-bold text-blue-800">My Clubs</h2>
//                         </div>
//                         <Link href="/dashboard/clubs/joined" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
//                             View All <ArrowRight className="h-4 w-4" />
//                         </Link>
//                     </div>
//
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {clubsData.joinedClubs.map(club => (
//                             <div key={club.id} className="border bg-white border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//                                 <div className="relative">
//                                     <Image
//                                         src={club.image || "/images/club-placeholder.jpg"}
//                                         alt={club.name}
//                                         width={500}
//                                         height={300}
//                                         className="w-full h-48 object-cover"
//                                     />
//                                     <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg">
//                                         {club.category}
//                                     </div>
//                                 </div>
//
//                                 <div className="p-4">
//                                     <h3 className="text-lg font-semibold text-blue-800 mb-1">{club.name}</h3>
//                                     <p className="text-sm text-gray-600 mb-2">led by {club.leader}</p>
//                                     <p className="text-sm text-gray-700 mb-3 line-clamp-2">{club.description}</p>
//
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center text-sm text-blue-500">
//                                             <Calendar className="h-4 w-4 mr-1" />
//                                             Next: {club.nextMeeting}
//                                         </div>
//                                         <div className="flex items-center text-sm text-gray-600">
//                                             <Users className="h-4 w-4 mr-1" />
//                                             {club.memberCount} members
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 <div className="px-4 py-3 border-t border-blue-50">
//                                     <Link
//                                         href={`/dashboard/clubs/${club.id}`}
//                                         className="text-sm text-blue-600 font-medium hover:text-blue-800"
//                                     >
//                                         View Club Activities →
//                                     </Link>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//
//                 {/* Available Clubs */}
//                 <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
//                     <div className="flex items-center mb-6">
//                         <Users className="w-6 h-6 mr-2 text-blue-500" />
//                         <h2 className="text-xl font-bold text-blue-800">Available Clubs</h2>
//                     </div>
//
//                     {filteredAvailableClubs.length === 0 ? (
//                         <div className="text-center py-10">
//                             <p className="text-gray-500">No clubs found matching your search</p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {filteredAvailableClubs.map(club => (
//                                 <div key={club.id} className="border bg-white border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//                                     <div className="relative">
//                                         <Image
//                                             src={club.image || "/images/club-placeholder.jpg"}
//                                             alt={club.name}
//                                             width={500}
//                                             height={300}
//                                             className="w-full h-48 object-cover"
//                                         />
//                                         <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg">
//                                             {club.category}
//                                         </div>
//                                     </div>
//
//                                     <div className="p-4">
//                                         <h3 className="text-lg font-semibold text-blue-800 mb-1">{club.name}</h3>
//                                         <p className="text-sm text-gray-600 mb-2">led by {club.leader}</p>
//                                         <p className="text-sm text-gray-700 mb-4 line-clamp-2">{club.description}</p>
//
//                                         <div className="flex justify-between items-center">
//                                             <div className="flex items-center">
//                                                 <div className="flex text-yellow-400">
//                                                     {[...Array(5)].map((_, i) => (
//                                                         <Star
//                                                             key={i}
//                                                             size={14}
//                                                             fill={i < Math.floor(club.rating) ? "currentColor" : "none"}
//                                                             className="mr-0.5"
//                                                         />
//                                                     ))}
//                                                 </div>
//                                                 <span className="ml-1 text-xs text-gray-600">{club.rating}</span>
//                                                 <span className="ml-2 text-xs text-gray-500">({club.memberCount} members)</span>
//                                             </div>
//                                             <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md">
//                                                 Join
//                                             </button>
//                                         </div>
//                                     </div>
//
//                                     <div className="px-4 py-3 border-t border-blue-50">
//                                         <Link
//                                             href={`/dashboard/clubs/${club.id}`}
//                                             className="text-sm text-blue-600 font-medium hover:text-blue-800"
//                                         >
//                                             View details →
//                                         </Link>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default ClubsPage;
"use client";

import React from 'react';
import { Users, CalendarClock } from 'lucide-react';
import Link from 'next/link';

const ClubsPage = () => {
    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Student Clubs</h1>
                        <p className="text-blue-100">Join communities and participate in activities</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600/30 rounded-full">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Coming Soon</p>
                                <p className="text-xl font-semibold">Clubs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon Content */}
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-md border border-gray-200 text-center">
                <div className="mb-6 mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <CalendarClock className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Clubs Feature Coming Soon</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    We're working hard to bring you an amazing clubs experience. Soon you'll be able to join interest groups,
                    participate in club activities, and connect with like-minded peers.
                </p>
                <div className="max-w-md mx-auto bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
                    <h3 className="text-blue-800 font-medium mb-2">What to expect:</h3>
                    <ul className="text-left text-gray-700 space-y-2">
                        <li className="flex items-center">
                            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                            Join clubs based on your interests and hobbies
                        </li>
                        <li className="flex items-center">
                            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                            Participate in club meetings and activities
                        </li>
                        <li className="flex items-center">
                            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                            Connect with other members who share your interests
                        </li>
                    </ul>
                </div>
                <Link
                    href="/dashboard"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default ClubsPage;
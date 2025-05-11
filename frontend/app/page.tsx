import React from 'react'
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CourseList from "@/components/landing/CourseList";
import Services from "@/components/landing/Services";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Hero />

                <Services />
            </main>
            <Footer />
        </div>
    )
}

export default LandingPage
"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), {
    ssr: false,
});

const LottieAnimation = ({ animationData, className = "" }:{ animationData: any, className?: string}) => {
    return <Lottie animationData={animationData} loop className={className} />;
};

export default LottieAnimation;
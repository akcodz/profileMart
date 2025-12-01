import React from 'react'
import Title from "./Title.jsx";
import {PricingTable} from "@clerk/clerk-react"

const Plans = () => {
    return (
        <div className='max-w-2xl mx-auto z-20 my-30 max-md:px-4'>
            < Title title="Choose Your Plan" description="Start for free and scale up as you grow. Find the perfect plan for your content creation needs."/>
<div className='mt-14'>
    <PricingTable/></div>
        </div>
    )
}
export default Plans

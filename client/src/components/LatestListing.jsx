import React from 'react'
import Title from "./Title.jsx";
import ListingCard from "./ListingCard.jsx";
import {useSelector} from "react-redux";

const LatestListing = () => {
    const {listings} = useSelector((state) => state.listing);
    return (
        <div className='mt-20 mb-8'>
            < Title title="Latest Listings" description="Discover the hottest
social profiles available right now. "/>

            <div className="flex flex-col gap-6 px-6">
                {listings?.slice(0,4).map((listing, index) => (
                    <div key={index} className="mx-auto w-full max-w-3xl rounded-xl">
                        <ListingCard listing={listing} />
                    </div>
                ))}
            </div>

        </div>
    )
}
export default LatestListing

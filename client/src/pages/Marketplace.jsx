import React, {useState} from 'react'
import {ArrowLeftIcon, FilterIcon} from "lucide-react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {useSelector} from "react-redux";
import ListingCard from "../components/ListingCard.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";

const Marketplace = () => {
    const navigate = useNavigate();
    const [searchParams]=useSearchParams();
    const search = searchParams.get("search");
    const [ showFilter, setShowFilter ] = useState(false);
    const[filters, setFilters ] = useState({
        platform:null,
        maxPrice:100000,
        minFollowers:0,
        niche:null,
        verified:false,
        montized:false
    });
    const {listings} = useSelector(state => state.listing);

    const filteredListings = listings.filter(listing => {

        if (filters.platform && filters.platform.length > 0) {
            if (!filters.platform.includes(listing.platform)) return false;
        }

        // Max price filter
        if (filters.maxPrice ) {
            if (listing.price > filters.maxPrice) return false;
        }

        // Min followers filter
        if (filters.minFollowers) {
            if (listing.followers_count < filters.minFollowers) return false;
        }

        // Niche filter (multi-select)
        if (filters.niche && filters.niche.length > 0) {
            if (!filters.niche.includes(listing.niche)) return false;
        }

        // Verified filter
        if (filters.verified && filters.verified !== listing.verified)return false;

        // Monetized filter
        if (filters.monetized && filters.monetized !== listing.monetized)return false;

        if (search) {
            const trimmed = search.trim().toLowerCase();

            if (
                !listing.title.toLowerCase().includes(trimmed) &&
                !listing.username.toLowerCase().includes(trimmed) &&
                !listing.description.toLowerCase().includes(trimmed) &&
                !listing.platform.toLowerCase().includes(trimmed) &&
                !listing.niche.toLowerCase().includes(trimmed)
            ) {
                return false;
            }
        }

        return true
    })
    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-32">
            {/* Header Section */}
            <div className="flex items-center justify-between text-slate-500">
                <button
                    onClick={() => {
                        navigate('/');
                        scroll();
                    }}
                    className="flex items-center gap-2 py-5"
                >
                    <ArrowLeftIcon className="size-4" />
                    Back to Home
                </button>

                <button
                    onClick={() => setShowFilter(true)}
                    className="flex sm:hidden items-center gap-2 py-5"
                >
                    <FilterIcon className="size-4" />
                    Filters
                </button>
            </div>


    {/* Main Layout */}
            <div className="relative  flex items-start justify-between gap-8 pb-8">

                {/* Left Filter Panel */}

                    <FilterSidebar
                        showFilter={showFilter}
                        setShowFilter={setShowFilter}
                        filters={filters}
                        setFilters={setFilters}
                    />


                {/* Listings Grid */}
                <div className="flex-1 grid xl:grid-cols-2 gap-8 pb-8">
                    {filteredListings
                        .sort((a, b) => (a.featured ? -1 : b.featured ? 1 : 0))
                        .map((listing, index) => (
                            <ListingCard listing={listing} key={index} />
                        ))}
                </div>

            </div>


        </div>

)
}
export default Marketplace

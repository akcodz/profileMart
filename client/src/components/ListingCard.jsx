import React from "react";
import { platformIcons } from "../assets/assets.jsx";
import { BadgeCheck, LineChart, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ListingCard = ({ listing }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();

    return (
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">

            {/* Featured Banner */}
            {listing.featured && (
                <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center text-xs font-semibold py-1 tracking-wide uppercase">
                    Featured
                </div>
            )}

            {/* Card Content */}
            <div className="p-5 pt-8">

                {/* Header Section */}
                <div className="flex items-center gap-3 mb-3">
                    {platformIcons[listing.platform]}

                    <div className="flex flex-col">
                        <h2 className="font-semibold text-gray-800">
                            {listing.title}
                        </h2>

                        <p className="text-sm text-gray-500">
                            @{listing.username}
                            <span className="capitalize ml-1">{listing.platform}</span>
                        </p>
                    </div>

                    {listing.verified && (
                        <BadgeCheck className="text-green-500 ml-auto w-5 h-5" />
                    )}
                </div>

                {/* Stats Section */}
                <div className="my-5 flex flex-wrap justify-between max-w-xl items-center gap-3">

                    {/* Followers */}
                    <div className="flex items-center text-sm text-gray-600">
                        <User className="size-6 mr-1 text-gray-400" />
                        <span className="text-lg font-medium text-slate-800 mr-1.5">
              {listing.followers_count}
            </span>
                        followers
                    </div>

                    {/* Engagement */}
                    {listing.engagement_rate && (
                        <div className="flex items-center text-sm text-gray-600">
                            <LineChart className="size-6 mr-1 text-gray-400" />
                            <span className="text-lg font-medium text-slate-800 mr-1.5">
                {listing.engagement_rate}
              </span>
                            % engagement
                        </div>
                    )}
                </div>

                {/* Category + Country */}
                <div className="flex items-center gap-3 mb-3">

          <span className="text-xs font-medium bg-pink-100 text-pink-600 px-3 py-1 rounded-full capitalize">
            {listing.category}
          </span>

                    {listing.country && (
                        <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="size-6 mr-1 text-gray-400" />
                            {listing.country}
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                </p>

                <hr className="my-5 border-gray-200" />

                {/* Footer Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline">
            <span className="text-xl sm:text-2xl font-medium text-slate-800">
              {currency}
                {listing.price.toLocaleString()}
            </span>
                    </div>

                    <button
                        onClick={() => {
                            window.scrollTo(0, 0);
                            navigate(`/listing/${listing.id}`);
                        }}
                        className="px-4 sm:px-7 py-3 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                        More Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;

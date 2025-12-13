import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams,Link} from "react-router-dom";
import {getProfileLink, platformIcons} from "../assets/assets.jsx";
import {useDispatch, useSelector} from "react-redux";
import {
    ArrowLeftIcon,
    ArrowUpRightFromSquareIcon,
    CheckCircle2,
    DollarSign,
    LoaderIcon,
    ChevronRight,
    ChevronLeft,
    LineChart, Calendar, Users, Eye, MapPin, ShoppingBagIcon, MessageSquareMoreIcon
} from "lucide-react";
import {setChat} from "../app/features/chatSlice.js";
import {useAuth, useClerk, useUser} from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/axios.js";

const ListingDetails = () => {
    const navigate = useNavigate();
    const {user,isLoaded} = useUser();
    const {getToken}=useAuth();
    const{openSignIn}=useClerk()
    const currency = import.meta.env.VITE_CURRENCY ||'$'
    const dispatch = useDispatch();
    const [listing, setListing] = useState(null)
    const profileLink = listing && getProfileLink(listing.profile,listing.username)
    const {listingId} = useParams();
    const {listings} = useSelector(state => state.listing);

    const images = listing?.images ||[]


    const purchaseAccount = async () => {
        try {
            if (!user) return openSignIn();

            toast.loading('Creating payment link...');

            const token = await getToken();

            const { data } = await api.get(
                `/api/listing/purchase-account/${listing.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.dismissAll();
            window.location.href = data.paymentLink;
        } catch (error) {
            toast.dismissAll();
            toast.error(
                error?.response?.data?.message || error?.message || 'An unexpected error occurred'
            );
            console.error(error);
        }
    };

    const loadChatbox=()=>{
        if(!user || !isLoaded)return toast('Please login to chat ')
        if(listing.ownerId===user.id) return toast('you cannot chat within your own listing')
        dispatch(setChat({listing:listing}))
    }
    useEffect(() => {
        const listing = listings.find((item) => item.id === listingId);

        if (listing) {
            setListing(listing);
        }
    }, [listingId, listings]);


    const sliderRef = useRef(null);
    const firstSlideRef = useRef(null);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideWidth, setSlideWidth] = useState(0);

    useEffect(() => {
        if (firstSlideRef.current) {
            setSlideWidth(firstSlideRef.current.clientWidth);
        }
        const handleResize = () => {
            if (firstSlideRef.current) {
                setSlideWidth(firstSlideRef.current.clientWidth);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [images]);

    const totalSlides = images.length;

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        goToSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        goToSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

// Auto-slide every 3s
    useEffect(() => {
        const interval = setInterval(nextSlide, 3000);
        return () => clearInterval(interval);
    }, [slideWidth]);



    return listing ? (
        <div className="mx-auto min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-600 py-5"
            >
                <ArrowLeftIcon className="size-4" />
                Go to Previous Page
            </button>

            <div className="flex items-start max-md:flex-col gap-10">

                <div className="flex-1 max-md:w-full">

                    {/* Top Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                        <div className="flex items-start gap-3">

                                <div className="p-2 rounded-xl">{platformIcons[listing.platform]}
                                </div>
                                <div>
                                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                                        {/* External Profile Link */}
                                        {listing.title}
                       l̥                 <Link target="_blank" to={profileLink}>
                                            <ArrowUpRightFromSquareIcon className="size-4 hover:text-indigo-500" />
                                        </Link>
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        @{listing.username} •{" "}
                                        {listing.platform
                                            ? listing.platform.charAt(0).toUpperCase() + listing.platform.slice(1)
                                            : ""}
                                    </p>

                                    <div className="flex gap-2 mt-2">
                                        {listing.verified && (
                                            <span className="flex items-center text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
  l̥    <CheckCircle2 className="w-3 h-3 mr-1" />
      Verified
    </span>
                                        )}  {listing.monetized && (
                                            <span className="flex items-center text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md">
      <DollarSign className="w-3 h-3 mr-1" />
      Monetized
    </span>
                                        )}
                  l̥                  </div>

                                </div>
                        </div>


                        <div className="text-right">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {currency}
                                {listing.price?.toLocaleString()}
                            </h3>

                            <p className="text-sm text-gray-500">USD</p>
                        </div>
                        </div>
                    </div>
                    {/*{image}*/}
                    {images.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden">
                            <div className="p-4">
                                <h4 className="font-semibold text-gray-800">Screenshots & Proof</h4>
                            </div>

                            <div className="relative w-full  mx-auto overflow-hidden">

                                {/* Overlay Controls */}
                                <div className="absolute top-1/2 left-0 right-0 flex items-center justify-between px-4 z-20 -translate-y-1/2">
                                    <button
                                        onClick={prevSlide}
                                        className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-white" />
                                    </button>

                                    <button
                                        onClick={nextSlide}
                                        className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition"
                                    >
                                        <ChevronRight className="h-6 w-6 text-white" />
                                    </button>
                                </div>

                                {/* Slider */}
                                <div
                                    ref={sliderRef}
                                    className="flex transition-transform duration-500 ease-in-out aspect-video w-full"
                                    style={{ transform: `translateX(-${currentSlide * slideWidth}px)` }}
                                >
                                    {images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`slide-${idx}`}
                                            className="w-full flex-shrink-0  object-cover"
                                            ref={idx === 0 ? firstSlideRef : null}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/*{account analysis}*/}
                    <div className="bg-white rounded-xl border border-gray-200 mb-5">
                        <div className="p-4 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-800">Account Metrics</h4>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-center">

                            <div>
                                <Users className="mx-auto text-gray-400 w-5 h-5 mb-1" />
                                <p className="font-semibold text-gray-800">
                                    {listing.followers_count?.toLocaleString() ?? "—"}
                                </p>
                                <p className="text-xs text-gray-500">Followers</p>
                            </div>

                            <div>
                                <LineChart className="mx-auto text-gray-400 w-5 h-5 mb-1" />
                                <p className="font-semibold text-gray-800">
                                    {listing.engagement_rate?.toLocaleString() ?? "—"}
                                </p>
                                <p className="text-xs text-gray-500">Engagement</p>
                            </div>

                            <div>
                                <Eye className="mx-auto text-gray-400 w-5 h-5 mb-1" />
                                <p className="font-semibold text-gray-800">
                                    {listing.monthly_views?.toLocaleString() ?? "—"}
                                </p>
                                <p className="text-xs text-gray-500">Monthly Views</p>
                            </div>

                            <div>
                                <Calendar className="mx-auto text-gray-400 w-5 h-5 mb-1" />
                                <p className="font-semibold text-gray-800">
                                    {new Date(listing.createdAt).toLocaleDateString() ?? "<UNK>"}
                                </p>
                                <p className="text-xs text-gray-500">Listed</p>
                            </div>

                        </div>
                    </div>
                    {/*description*/}
                    <div className="bg-white rounded-xl border border-gray-200 mb-5">
                        <div className="p-4 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-800">Description</h4>
                        </div>

                        <div className="p-4 text-sm text-gray-600">
                            {listing.description || "No description provided."}
                        </div>
                    </div>
                    {/*{additional detail}*/}
                    <div className="bg-white rounded-xl border border-gray-200 mb-5">
                        <div className="p-4 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-800">Additional Details</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 text-sm">

                            {/* Niche */}
                            <div>
                                <p className="text-gray-500">Niche</p>
                                <p className="font-medium capitalize text-gray-800">
                                    {listing.niche || "—"}
                                </p>
                            </div>

                            {/* Primary Country */}
                            <div>
                                <p className="text-gray-500">Primary Country</p>
                                <p className="font-medium flex items-center text-gray-800">
                                    <MapPin className="size-4 mr-1 text-gray-400" />
                                    {listing.country || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Audience Age</p>
                                <p className="font-medium capitalize text-gray-800">
                                    {listing.age_range || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Platform Verified</p>
                                <p className="font-medium capitalize text-gray-800">
                                    {listing.platformAssured ?"Yes":"No"|| "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Monetization</p>
                                <p className="font-medium capitalize text-gray-800">
                                    {listing.monetized ?"Enabled":"Disabled"|| "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Status</p>
                                <p className="font-medium capitalize text-gray-800">
                                    {listing.status || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
                {/*seller detail*/}

                <div className="bg-white min-w-full md:min-w-[370px] rounded-xl border border-gray-200 p-5 max-md:mb-10">
                    <h4 className="font-semibold text-gray-800 mb-4">Seller Information</h4>

                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src={listing.owner?.image}
                            alt="Seller image"
                            className="size-10 rounded-full object-cover"
                        />

                        <div>
                            <p className="font-medium text-gray-800">
                                {listing.owner?.name || "Unknown Seller"}
                            </p>
                            <p className="text-sm text-gray-600">
                                @{listing.owner?.username || "unknown"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <p>
                            Member Since{" "}
                            <span className="font-medium">
      {listing.owner?.createdAt
          ? new Date(listing.owner.createdAt).toLocaleDateString()
          : "—"}
    </span>
                        </p>
                    </div>
                    <button onClick={loadChatbox} className="w-full bg-indigo-600 text-white py-2 rounded-lg
hover:bg-indigo-700 transition text-sm font-medium flex items-center
justify-center gap-2">
                        <MessageSquareMoreIcon className="size-4" /> Chat
                    </button>

                    {listing.isCredentialChanged && (
                        <button onClick={purchaseAccount} className="w-full mt-2 bg-purple-600 text-white py-2 rounded-lg
  hover:bg-purple-700 transition text-sm font-medium flex items-center
  justify-center gap-2">
                            <ShoppingBagIcon className="size-4" /> Purchase
                        </button>
                    )}

                </div>
            </div>


            <div className="bg-white border-t border-gray-200 p-4 text-center mt-28">
                <p className="text-sm text-gray-500">
                    © 2025 <span className='text-indigo-600'>ProfileMart</span>. All rights reserved.
                </p>
            </div>

        </div>

    ):<div>
        <div className="h-screen flex justify-center items-center">
            <LoaderIcon className="size-7 animate-spin text-indigo-600" />
        </div>

    </div>
}
export default ListingDetails

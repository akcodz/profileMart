import React, { useState } from 'react';
import { assets } from "../assets/assets.jsx";
import { Link, useNavigate } from "react-router-dom";
import {BoxIcon, GripIcon, MenuIcon, XIcon, MessageCircleMoreIcon, ListIcon} from "lucide-react";
import {useClerk, UserButton, useUser} from "@clerk/clerk-react";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const { user } = useUser();
    const { openSignIn } = useClerk();
    const navigate = useNavigate();

    // Auth guard for protected routes
    const requireAuth = (e) => {
        if (!user) {
            e.preventDefault();
            openSignIn();
        }
    };

    return (
        <nav className="h-20">
            <div className="fixed left-0 top-0 right-0 z-100 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white">

                <Link to="/" onClick={() => window.scrollTo(0,0)}>
                    <img
                        src={assets.logo}
                        alt="logo"
                        className="h-8 cursor-pointer"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-4 md:gap-8 max-md:text-sm text-gray-800">

                    <Link to="/" onClick={() => window.scrollTo(0,0)}>
                        Home
                    </Link>

                    <Link to="/marketplace" onClick={() => window.scrollTo(0,0)}>
                        Marketplace
                    </Link>

                    {/* Protected: Messages */}
                    <Link
                        to="/messages"
                        onClick={(e) => {
                            requireAuth(e);
                            window.scrollTo(0,0);
                        }}
                    >
                        Messages
                    </Link>

                    {/* Protected: My Listings */}
                    <Link
                        to="/my-listings"
                        onClick={(e) => {
                            requireAuth(e);
                            window.scrollTo(0,0);
                        }}
                    >
                        My Listings
                    </Link>
                </div>

                <div >
                    {!user ? (
                        <button
                            className="max-sm:hidden cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
                            onClick={() => openSignIn()}
                        >
                            Login
                        </button>
                    ) : (
                        <div className='hidden md:flex'>
                            <UserButton>
                                <UserButton.MenuItems>

                                    {/* Marketplace */}
                                    <UserButton.Action
                                        label="Marketplace"
                                        labelIcon={<GripIcon size={16} />}
                                        onClick={() => navigate("/marketplace")}
                                    />

                                </UserButton.MenuItems>
                                {/* Messages */}

                                <UserButton.MenuItems>
                                    <UserButton.Action
                                        label="Messages"
                                        labelIcon={<MessageCircleMoreIcon size={16} />}
                                        onClick={() => navigate("/messages")}
                                    />

                                </UserButton.MenuItems>
                                {/* My Listings */}

                                <UserButton.MenuItems>
                                    <UserButton.Action
                                        label="My Listings"
                                        labelIcon={<ListIcon size={16} />}
                                        onClick={() => navigate("/my-listings")}
                                    />

                                </UserButton.MenuItems>

                                <UserButton.MenuItems>
                                    <UserButton.Action
                                        label="My Orders"
                                        labelIcon={<BoxIcon size={16} />}
                                        onClick={() => navigate("/my-orders")}
                                    />
                                </UserButton.MenuItems>
                            </UserButton></div>

                    )}

                    <MenuIcon
                        className="sm:hidden cursor-pointer"
                        onClick={() => setMenuOpen(true)}
                    />
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`sm:hidden fixed inset-0 ${menuOpen ? 'w-full' : 'w-0'} overflow-hidden bg-white shadow-xl z-[200] transition-all`}>
                <div className="flex flex-col items-center justify-center h-full text-xl font-semibold gap-6 p-4">

                    <Link to="/" onClick={() => { window.scrollTo(0,0); setMenuOpen(false); }}>
                        Home
                    </Link>

                    <Link to="/marketplace" onClick={() => { window.scrollTo(0,0); setMenuOpen(false); }}>
                        Marketplace
                    </Link>

                    <Link
                        to="/messages"
                        onClick={(e) => {
                            requireAuth(e);
                            setMenuOpen(false);
                        }}
                    >
                        Messages
                    </Link>

                    <Link
                        to="/my-listings"
                        onClick={(e) => {
                            requireAuth(e);
                            setMenuOpen(false);
                        }}
                    >
                        My Listings
                    </Link>

                    {!user ? (
                        <button
                            className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
                            onClick={() => openSignIn()}
                        >
                            Login
                        </button>
                    ) : (

                        <UserButton>
                            <UserButton.MenuItems>

                                {/* Marketplace */}
                                <UserButton.Action
                                    label="Marketplace"
                                    labelIcon={<GripIcon size={16} />}
                                    onClick={() => navigate("/marketplace")}
                                />

                            </UserButton.MenuItems>
                            {/* Messages */}

                            <UserButton.MenuItems>
                                <UserButton.Action
                                    label="Messages"
                                    labelIcon={<MessageCircleMoreIcon size={16} />}
                                    onClick={() => navigate("/messages")}
                                />

                            </UserButton.MenuItems>
                            {/* My Listings */}

                            <UserButton.MenuItems>
                                <UserButton.Action
                                    label="My Listings"
                                    labelIcon={<ListIcon size={16} />}
                                    onClick={() => navigate("/my-listings")}
                                />

                            </UserButton.MenuItems>

                            <UserButton.MenuItems>
                                <UserButton.Action
                                    label="My Orders"
                                    labelIcon={<BoxIcon size={16} />}
                                    onClick={() => navigate("/orders")}
                                />
                            </UserButton.MenuItems>
                        </UserButton>
                    )}

                    <XIcon
                        className="absolute size-8 right-6 top-6 text-gray-500 hover:text-gray-700 cursor-pointer"
                        onClick={() => setMenuOpen(false)}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

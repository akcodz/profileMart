import React, {useEffect} from "react";
import { Toaster } from "react-hot-toast";
import {Routes, Route, useLocation} from "react-router-dom";

import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import MyListings from "./pages/MyListings.jsx";
import ListingDetails from "./pages/ListingDetails.jsx";
import ManageListing from "./pages/ManageListing.jsx";
import Messages from "./pages/Messages.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Loading from "./pages/Loading.jsx";
import Navbar from "./components/Navbar.jsx";
import ChatBox from "./components/ChatBox.jsx";
import Layout from "./pages/admin/Layout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import CredentialVerify from "./pages/admin/CredentialVerify.jsx";
import CredentialChange from "./pages/admin/CredentialChange.jsx";
import Transactions from "./pages/admin/Transactions.jsx";
import Withdrawal from "./pages/admin/Withdrawal.jsx";
import AllListings from "./pages/admin/AllListings.jsx";
import {getAllPublicListing, getAllUserListing} from "./app/features/listingSlice.js";
import {useDispatch} from "react-redux";
import {useAuth, useUser} from "@clerk/clerk-react";

const App = () => {
    const {pathname} = useLocation();
    const dispatch = useDispatch();

    const { getToken } = useAuth();
    const { user, isLoaded } = useUser();

    useEffect(() => {
        dispatch(getAllPublicListing());
    }, []);

    useEffect(() => {
        if (isLoaded && user) {
            dispatch(getAllUserListing({getToken}));
        }
    }, [isLoaded, user]);
    return (
        <>
            <Toaster  />
            {!pathname.includes("/admin") && (<Navbar/>)}
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/marketplace" element={<Marketplace />} />

                <Route path="/my-listings" element={<MyListings />} />

                <Route path="/listing/:listingId" element={<ListingDetails />} />

                <Route path="/create-listing" element={<ManageListing />} />

                <Route path="/edit-listing/:id" element={<ManageListing />} />

                <Route path="/messages" element={<Messages />} />

                <Route path="/my-orders" element={<MyOrders />} />

                <Route path="/loading/:nextUrl" element={<Loading />} />

                <Route path="/admin" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="verify-credentials" element={<CredentialVerify />} />
                    <Route path="change-credentials" element={<CredentialChange />} />
                    <Route path="list-listings" element={<AllListings />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="withdrawal" element={<Withdrawal />} />
                </Route>

            </Routes>
            <ChatBox/>
        </>
    );
};

export default App;

import React, {useState} from 'react'
import toast from "react-hot-toast";
import {CirclePlus, X} from "lucide-react";
import {useAuth} from "@clerk/clerk-react";
import {useDispatch} from "react-redux";
import api from "../configs/axios.js";
import {getAllUserListing} from "../app/features/listingSlice.js";

const CredentialSubmission = ({onClose,listing}) => {
    const {getToken} = useAuth();
    const dispatch = useDispatch();
    const [newField,setNewField]=useState("")
    const[credentials,setCredentials]=useState([
        {type:"email",name:"Email",value:""},
        {type:"password",name:"Password",value:""},
    ])

    const handleNewField=()=>{
       const name = newField.trim()
        if(!name) return toast("please enter a field name!");
        setCredentials(prev=>[...prev, {type:"text",name:name,value:""}])
        setNewField("")
    }
    const handleSubmission=async (e)=>{
        e.preventDefault()
        try{
            if(credentials.length===0){
                return toast.error("Please add at least one field!");
            }
            for(const cred of credentials){
                if(!cred.value){
                    toast.error(`please fill ${cred.name} field`);
                }
            }
            const confirm=window.confirm("Credential will be verified & changed post submission. Are you sure you want to submit?");
            if(!confirm)return;
            const token=await getToken();
            const{data}=await api.post("/api/listing/add-credential",{credential:credentials,listingId:listing.id},{headers:{Authorization:`Bearer ${token}`}});
            toast.success(data.message);
            dispatch(getAllUserListing({getToken}));
            onClose();

        }catch (error){
            toast.dismissAll()
            toast.error(error.message);
        }

    }
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center sm:p-4">
            <div className="bg-white sm:rounded-lg shadow-2xl w-full max-w-lg h-screen sm:h-[320px] flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white p-4 sm:rounded-t-lg flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{listing?.title}</h3>
                        <p className="text-sm opacity-90 truncate">
                            Adding Credentials for {listing?.username} on {listing?.platform}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

              {/*form*/}
                <form
                    onSubmit={handleSubmission}
                    className="flex flex-col items-start gap-4 p-4 overflow-y-scroll"
                >
                    {credentials.map((cred, index) => (
                        <div
                            key={cred.type}
                            className="grid grid-cols-[2fr_3fr_1fr] items-center gap-2 w-full"
                        >
                            <label className="text-sm font-medium text-gray-800">
                                {cred.name}
                            </label>

                            <input
                                type="text"
                                value={cred.value}
                                onChange={(e) =>
                                    setCredentials((prev) =>
                                        prev.map((c, i) =>
                                            i === index ? { ...c, value: e.target.value } : c
                                        )
                                    )
                                }
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-indigo-400"
                            />

                            <X
                                className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                                onClick={() =>
                                    setCredentials((prev) => prev.filter((_, i) => i !== index))
                                }
                            />
                        </div>
                    ))}
                    {/*add more fields*/}
                    <div className="flex items-center gap-2 ">
                        <input
                            type="text"
                            value={newField}
                            onChange={(e) => setNewField(e.target.value)}
                            placeholder="Field name"
                            className=" px-2 py-1 text-sm outline-none border-b border-gray-200"
                        />

                        <button
                            type="button"
                            onClick={handleNewField}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 cursor-pointer"
                        >
                            <CirclePlus className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 mt-4 rounded-md"
                    >
                        Submit
                    </button>

                </form>

            </div>
        </div>
    )
}
export default CredentialSubmission

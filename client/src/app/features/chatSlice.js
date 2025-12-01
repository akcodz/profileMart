import {createSlice} from "@reduxjs/toolkit";


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        listing:null,
        isOpen:false,
        chatId:null,
    },
    reducers:{
setChat:(state,action)=>{
    state.listing = action.payload.listing;
    state.isOpen = true;
    if(action.payload.chatId){
      state.chatId = action.payload.chatId;
    }
},
        clearChat:(state)=>{
    state.chatId = null;
    state.isOpen = false;
    state.listing = null;
        }
    }
})


export const { setChat,clearChat } = chatSlice.actions;
export default chatSlice.reducer;
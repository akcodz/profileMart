import prisma from "../configs/prisma.js";

export const getChat=async (req, res) => {
    try {
        const {userId} = await req.auth();
        const {listingId , chatId} = req.body;

        const listing= await prisma.listing.findUnique({
            where: {id: listingId}
        })

        if(!listing) {
            return res.status(400).json({message:'listing not found'})
        }

        let existingChat=null
        if(!chatId) {
            existingChat=await prisma.chat.findFirst({
                where: {listingId,chatUserId:userId,ownerUserId:userId},
                include:{listing:true,ownerUser:true,chatUser:true,members:true}
            })
        }else{
            existingChat=await prisma.chat.findFirst({
                where: {chatId: chatId,OR:[{chatUserId:userId},{ownerUserId:userId}]},
                include:{listing:true,ownerUser:true,chatUser:true,members:true}
            })
        }

        if(existingChat) {
            res.json({chat:existingChat})
            if(existingChat.isLastMessageRead === false) {
                const lastMessage = existingChat.messages[existingChat.messages.length - 1]
                const isLastMessageSendByMe=lastMessage.sender_id===userId
                if(!isLastMessageSendByMe) {
                    await prisma.chat.update({
                        where:{id:existingChat.id},
                        data:{isLastMessageRead:true}
                    })

                }
            }
            return null
        }
        const newChat = await prisma.chat.create({
            data:{listingId,chatUserId:userId,ownerUserId:listing.ownerId},
        })

        const chatWithData=await prisma.chat.findUnique({
            where: {id: newChat.id},
            include:{listing:true,ownerUser:true,chatUser:true}
        })
        return  res.json({chat:chatWithData})
    }catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message ,
        });
    }
}


export const getAllUserChats=async (req, res) => {
    try {
        const {userId} = await req.auth()
        const chats = prisma.chat.findMany({
            where: {OR:[{chatUserId:userId},{ownerUserId:userId}]},
            include:{listing:true,ownerUser:true,chatUser:true},
            order: {updatedAt: 'desc'}
        })
        if(!chats || chats.length===0) {
            return res.json({chats:[]})
        }
        return res.json({chats})

    }catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message ,
        });
    }
}

export const sendChatMessage = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const {chatId, message} = req.body;

        const chat=await prisma.chat.findFirst({
            where: {AND:[{chatId: chatId}, {OR: [{chatUserId: userId}, {ownerUserId: userId}]}]},
            include:{listing:true,ownerUser:true,chatUser:true,members:true}
        })

        if(!chat) {
            return res.status(404).json({message:'Chat not found'})
        }else if(chat.listing.status !=='active'){
            return res.status(400).json({message:`Listing is ${chat.listing.status}`})}

        const newMessage ={
            chatId,sender_id:userId,message,createdAt:new Date()}
        await prisma.message.create({
            data:newMessage})

        await prisma.chat.update({
            where: {id:chatId},
            data:{lastMessage:newMessage.message,isLastMessageRead:false,lastMessageSenderId:userId}
        })
        res.json({message:'Message sent' ,newMessage})
    }catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message ,
        });
    }
}
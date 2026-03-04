import prisma from "../configs/prisma.js";

export const getChat = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { listingId, chatId } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    let existingChat = null;

    if (!chatId) {
      existingChat = await prisma.chat.findFirst({
        where: {
          listingId,
          OR: [
            { chatUserId: userId },
            { ownerUserId: userId },
          ],
        },
        include: {
          listing: true,
          ownerUser: true,
          chatUser: true,
          messages: true,
        },
      });
    } else {
      existingChat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          OR: [
            { chatUserId: userId },
            { ownerUserId: userId },
          ],
        },
        include: {
          listing: true,
          ownerUser: true,
          chatUser: true,
          messages: true,
        },
      });
    }

    if (existingChat) {
      // Mark as read if needed
      if (
        existingChat.messages.length > 0 &&
        !existingChat.isLastMessageRead &&
        existingChat.lastMessageSenderId !== userId
      ) {
        await prisma.chat.update({
          where: { id: existingChat.id },
          data: { isLastMessageRead: true },
        });
      }

      return res.json({ chat: existingChat });
    }

    if (listing.ownerId === userId) {
      return res.status(400).json({ message: "Owner cannot start chat with themselves" });
    }

    const newChat = await prisma.chat.create({
      data: {
        listingId,
        chatUserId: userId,
        ownerUserId: listing.ownerId,
      },
    });

    const chatWithData = await prisma.chat.findUnique({
      where: { id: newChat.id },
      include: {
        listing: true,
        ownerUser: true,
        chatUser: true,
        messages: true,
      },
    });

    return res.json({ chat: chatWithData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getAllUserChats = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { chatUserId: userId },
          { ownerUserId: userId },
        ],
      },
      include: {
        listing: true,
        ownerUser: true,
        chatUser: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.json({ chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const sendChatMessage = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { chatId, message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { chatUserId: userId },
          { ownerUserId: userId },
        ],
      },
      include: {
        listing: true,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.listing.status !== "active") {
      return res.status(400).json({
        message: `Listing is ${chat.listing.status}`,
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        chatId,
        sender_id: userId,
        message,
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: message,
        isLastMessageRead: false,
        lastMessageSenderId: userId,
      },
    });

    return res.json({
      message: "Message sent",
      newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

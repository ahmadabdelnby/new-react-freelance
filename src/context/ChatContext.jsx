import React, { createContext, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children, openChatDrawer }) => {
    return (
        <ChatContext.Provider value={{ openChatDrawer }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        return { openChatDrawer: null };
    }
    return context;
};

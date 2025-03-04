import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: "MyBot",
  initialMessages: [createChatBotMessage("Bonjour, comment puis-je vous aider ?")],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#f0f0f0",
    },
    chatButton: {
      backgroundColor: "#007bff",
    },
  },
};

export default config;

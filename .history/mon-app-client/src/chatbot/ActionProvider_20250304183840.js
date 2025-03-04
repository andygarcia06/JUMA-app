import axios from 'axios';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleProjectManagerRequest(message) {
    // Appel à votre API back-end pour traiter la demande sur le projet
    axios.post('/api/message', { message })
      .then(response => {
        const botMessage = this.createChatBotMessage(response.data.reply);
        this.updateChatbotState(botMessage);
      })
      .catch(error => {
        console.error("Erreur API :", error);
        const botMessage = this.createChatBotMessage("Erreur lors de la récupération des informations.");
        this.updateChatbotState(botMessage);
      });
  }

  handleDefault(message) {
    const botMessage = this.createChatBotMessage("Je n'ai pas compris votre demande. Pouvez-vous reformuler ?");
    this.updateChatbotState(botMessage);
  }

  updateChatbotState(message) {
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;

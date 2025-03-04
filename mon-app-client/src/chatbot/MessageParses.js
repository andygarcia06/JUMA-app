class MessageParser {
    constructor(actionProvider) {
      this.actionProvider = actionProvider;
    }
  
    parse(message) {
      const lowerCaseMessage = message.toLowerCase();
  
      if(lowerCaseMessage.includes("responsable du projet")) {
        // On délègue au gestionnaire d'action pour traiter la demande
        this.actionProvider.handleProjectManagerRequest(message);
      } else {
        this.actionProvider.handleDefault(message);
      }
    }
  }
  
  export default MessageParser;
  
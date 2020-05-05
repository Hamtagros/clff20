export class ChatMessagePF extends ChatMessage {
  async render() {

    // Determine some metadata
    const isWhisper = this.data.whisper.length;

    // Construct message data
    const messageData = {
      user: game.user,
      author: this.user,
      alias: this.alias,
      message: duplicate(this.data),
      cssClass: [
        this.data.type === CONST.CHAT_MESSAGE_TYPES.IC ? "ic" : null,
        this.data.type === CONST.CHAT_MESSAGE_TYPES.EMOTE ? "emote" : null,
        isWhisper ? "whisper" : null,
        this.data.blind ? "blind": null
      ].filter(c => c !== null).join(" "),
      isWhisper: this.data.whisper.some(id => id !== game.user._id),
      whisperTo: this.data.whisper.map(u => {
        let user = game.users.get(u);
        return user ? user.name : null;
      }).filter(n => n !== null).join(", ")
    };

    // Enrich some data for dice rolls
    if (this.isRoll && !this.getFlag("pf1", "noRollRender")) {
      const isVisible = this.isRollVisible;
      messageData.message.content = await this.roll.render({isPrivate: !isVisible});
      if ( isWhisper ) {
        const subject = this.data.user === game.user._id ? "You" : this.user.name;
        messageData.message.flavor = messageData.message.flavor || `${subject} privately rolled some dice`;
      }
      if ( !isVisible ) {
        messageData.isWhisper = false;
        messageData.alias = this.user.name;
      }
    }

    // Define a border color
    if ( this.data.type === CONST.CHAT_MESSAGE_TYPES.OOC ) {
      messageData.borderColor = this.user.color;
    }

    // Render the chat message
    let html = await renderTemplate(CONFIG.ChatMessage.template, messageData);
    html = $(html);

    // Call a hook for the rendered ChatMessage data
    Hooks.call("renderChatMessage", this, html, messageData);
    return html;
  }
}
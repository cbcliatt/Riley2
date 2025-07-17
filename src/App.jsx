import React, { useMemo, useEffect, useRef } from 'react';
import {
  Container,
  MessageList,
  Composer,
  Header,
  useWebchat,
} from '@botpress/webchat';
import './App.css';

function App() {
  const {
    client,
    clientState,
    messages,
    isTyping,
    user,
    newConversation, // Make sure you are destructuring this from the hook
  } = useWebchat({
    // IMPORTANT: Replace with your actual clientId from Botpress Studio
    clientId: "58fc6a41-9d2f-45b8-a671-e39a93603d5e",
  });

  // Use a ref to ensure the conversation is only started once per component load
  const hasStartedConversation = useRef(false);

  // This improved useEffect hook waits for the client to be fully connected
  // before starting a new conversation. This prevents race conditions.
  useEffect(() => {
    if (clientState === 'connected' && newConversation && !hasStartedConversation.current) {
      newConversation();
      // Set the flag to true so this doesn't run again
      hasStartedConversation.current = true;
    }
  }, [clientState, newConversation]); // Rerun this effect if the connection state changes

  // Static configuration for your bot's appearance
  const botConfig = {
    botName: 'Riley | Your Financial Concierge',
    botAvatar: 'https://files.bpcontent.cloud/2025/05/11/13/20250511134230-W43EOBJX.jpeg',
    botDescription: 'Find your perfect financial match today!',
  };

  // Memoized logic to enrich messages with sender info (for display)
  const enrichedMessages = useMemo(() => {
    return messages.map((message) => {
      const authorId = message.authorId;
      const direction = authorId === user?.userId ? 'outgoing' : 'incoming';
      return {
        ...message,
        direction,
        sender:
          direction === 'outgoing'
            ? { name: user?.name ?? 'You', avatar: user?.pictureUrl }
            : { name: botConfig.botName ?? 'Bot', avatar: botConfig.botAvatar },
      };
    });
  }, [botConfig.botAvatar, botConfig.botName, messages, user?.userId, user?.name, user?.pictureUrl]);

  // JSX to render the full-page chat interface
  return (
    <div className="full-page-chat-app-wrapper">
      <Container
        connected={clientState !== 'disconnected'}
        className="botpress-chat-container-fullpage"
      >
        <Header
          restartConversation={newConversation}
          configuration={{
            botName: botConfig.botName,
            botDescription: botConfig.botDescription,
            botAvatar: botConfig.botAvatar,
          }}
        />

        <MessageList
          botAvatar={botConfig.botAvatar}
          botName={botConfig.botName}
          isTyping={isTyping}
          messages={enrichedMessages}
          sendMessage={client?.sendMessage}
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '10px 20px',
          }}
        />
        <Composer
          disableComposer={clientState === 'disconnected' || isTyping}
          isReadOnly={false}
          allowFileUpload={true}
          connected={clientState !== 'disconnected'}
          sendMessage={client?.sendMessage}
          uploadFile={client?.uploadFile}
          composerPlaceholder="Type your message..."
          showPoweredBy={true}
          style={{
            flexShrink: 0,
            borderTop: '1px solid #e0e0e0',
            padding: '10px',
            backgroundColor: '#f8f9fa'
          }}
        />
      </Container>
    </div>
  );
}

export default App;

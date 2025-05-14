import React, { useMemo, useEffect } from 'react'; // useEffect was for debugging, can be removed if not needed now
import {
  Container,
  MessageList,
  Composer,
  useWebchat,
  // Configuration // Not strictly needed if not using TypeScript features
} from '@botpress/webchat';
import './App.css';

function App() {
  const {
    client,
    clientState,
    messages,
    isTyping,
    user // Contains user.userId
  } = useWebchat({
    clientId: "58fc6a41-9d2f-45b8-a671-e39a93603d5e",
  });

  // useEffect(() => { // This was for debugging, can be commented out or removed
  //   console.log("CurrentUser object from useWebchat:", JSON.stringify(user, null, 2));
  //   if (messages.length > 0) {
  //     console.log("Last message from useWebchat:", JSON.stringify(messages[messages.length - 1], null, 2));
  //   }
  // }, [messages, user]);

  const botConfig = {
    botName: 'Riley | Your Financial Concierge',
    botAvatar: 'https://files.bpcontent.cloud/2025/05/11/13/20250511134230-W43EOBJX.jpeg',
    botDescription: 'Find your perfect financial match today!',
  };

  const enrichedMessages = useMemo(() => {
    return messages.map((message) => {
      const authorId = message.authorId;
      // CORRECTED LINE: Use user?.userId instead of user?.id
      const direction = authorId === user?.userId ? 'outgoing' : 'incoming'; // <<<< Key fix
      return {
        ...message,
        direction,
        sender:
          direction === 'outgoing'
            ? { name: user?.name ?? 'You', avatar: user?.pictureUrl }
            : { name: botConfig.botName ?? 'Bot', avatar: botConfig.botAvatar },
      };
    });
    // Update dependency array to use user?.userId
  }, [botConfig.botAvatar, botConfig.botName, messages, user?.userId, user?.name, user?.pictureUrl]); // <<<< Dependency array updated

  return (
    <div className="full-page-chat-app-wrapper">
      <Container
        connected={clientState !== 'disconnected'}
        className="botpress-chat-container-fullpage"
      >
        <MessageList
          botAvatar={botConfig.botAvatar}
          botName={botConfig.botName}
          isTyping={isTyping}
          messages={enrichedMessages}
          sendMessage={client?.sendMessage}
          botDescription={botConfig.botDescription}
          headerMessage="Welcome! How can I assist you today?"
          showMarquee={true}
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
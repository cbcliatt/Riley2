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
    newConversation,
  } = useWebchat({
    clientId: "58fc6a41-9d2f-45b8-a671-e39a93603d5e",
  });

  const initialEventSent = useRef(false);

  useEffect(() => {
    if (client && clientState === 'connected' && !initialEventSent.current) {
      const customPayloadForBot = {
        action: 'startConversationOnLoad',
        source: 'reactAppLoad',
      };
      if (typeof client.sendEvent === 'function') {
        client.sendEvent(customPayloadForBot)
          .then(() => {
            initialEventSent.current = true;
          })
          .catch(error => {
            console.error("React App: Error sending initial event:", error);
          });
      }
    }
  }, [client, clientState]);

  // NEW: useEffect for handling custom events from the bot
  useEffect(() => {
    // 1. Define the handler function that will process the event
    const handleCustomEvent = (event) => {
      console.log("React App: Received custom event from Botpress:", event);

      // 2. Check if the event is the one we're looking for
      if (event.type === 'redirect' && event.payload?.url) {
        console.log(`Redirecting to: ${event.payload.url}`);
        // 3. Perform the redirection
        window.location.href = event.payload.url;
      }
    };

    // 4. Add the event listener to the `window.botpress` object
    // We check if `window.botpress` is available first, as it might load asynchronously
    if (window.botpress) {
      window.botpress.on('customEvent', handleCustomEvent);
    }

    // 5. Return a cleanup function to remove the listener when the component unmounts
    // This is crucial to prevent memory leaks in a React application
    return () => {
      if (window.botpress) {
        window.botpress.off('customEvent', handleCustomEvent);
      }
    };
  }, []); // The empty dependency array [] ensures this effect runs only once on mount

  const botConfig = {
    botName: 'Riley | Your Financial Concierge',
    botAvatar: 'https://files.bpcontent.cloud/2025/05/11/13/20250511134230-W43EOBJX.jpeg',
    botDescription: 'Find your perfect financial match today!',
  };

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
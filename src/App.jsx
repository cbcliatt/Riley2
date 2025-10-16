
import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  Container,
  MessageList,
  Composer,
  Header,
  useWebchat,
} from '@botpress/webchat';
import './App.css';

// Advisor profiles for infinite scroll
const advisorProfiles = [
  { id: 1, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-18-683x1024.jpeg' },
  { id: 2, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-16-300x300.jpeg' },
  { id: 3, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-7-300x300.png' },
  { id: 4, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-5-300x300.png' },
  { id: 5, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-7-300x297.jpeg' },
  { id: 6, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-5-300x300.jpeg' },
  { id: 7, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Cassie-Beacon-Wealth-Consultants-500px-300x300.jpg' },
  { id: 8, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Hazel-Secco-CFP%C2%AE-CDFA%C2%AE-600x600-1-300x300.jpg' },
  { id: 9, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/01/LI-Profile-400x400-2-2-300x300.jpg' },
  { id: 10, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-19-300x300.jpeg' },
  { id: 11, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-37-259x300.jpeg' },
  { id: 12, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot.png' }
];

const advisorProfiles2 = [
  { id: 13, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Yohance-Harrison-300x300.jpg' },
  { id: 14, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-8-300x300.png' },
  { id: 15, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/DSC_8733_edited-1mb-600x533-1-300x267.jpg' },
  { id: 16, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/03/advisor-profile-headshot-23-300x290.jpeg' },
  { id: 17, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Steven-Schoenberger-CFP%C2%AE-300x300.jpg' },
  { id: 18, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Trevor-Scotto-CPA-CFP%C2%AE-CEPA-600x600-1-300x300.jpg' },
  { id: 19, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Sean-Gerlin-CFP%C2%AE-ChFC%C2%AE-CLU%C2%AE-300x300.jpg' },
  { id: 20, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Rebecca-Conner-CPA-CFP.jpg' },
  { id: 21, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Russell-E.-Glickstern-Certified-Financial-Planner%E2%84%A2-CFP%C2%AE-1-600x600-1-300x300.jpg' },
  { id: 22, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Roberto-Rivera-CFP%C2%AE-CIMA%C2%AE-246x300.jpg' },
  { id: 23, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/01/peter.garelick-300x300.jpg' },
  { id: 24, imageUrl: 'https://network.advisornearme.com/wp-content/uploads/2025/02/Ray-Prospero-JD-ChFC%C2%AE-600x600-1-300x300.jpg' }
];

// Duplicate arrays for seamless infinite scroll
const extendedProfiles = [...advisorProfiles, ...advisorProfiles];
const extendedProfiles2 = [...advisorProfiles2, ...advisorProfiles2];

function App() {
  const {
    client,
    clientState,
    messages,
    isTyping,
    user,
    newConversation,
    on,
  } = useWebchat({
    clientId: "58fc6a41-9d2f-45b8-a671-e39a93603d5e",
  });

  // State for custom event
  const [customEvent, setCustomEvent] = useState(null);
  
  // State to track faded advisors
  const [fadedAdvisors, setFadedAdvisors] = useState([]);
  
  // State to track match score
  const [matchScore, setMatchScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for mobile process popup
  const [showMobileProcessPopup, setShowMobileProcessPopup] = useState(false);
  const hasShownPopupRef = useRef(false);
  
  // Show popup on mobile on page load (only once)
  useEffect(() => {
    if (!hasShownPopupRef.current && window.innerWidth <= 900) {
      setShowMobileProcessPopup(true);
      hasShownPopupRef.current = true;
    }
  }, []);

  // Track message count and log every message
  const messageCountRef = useRef(0);
  useEffect(() => {
    if (!on) return;
    const unsubscribe = on('message', (message) => {
      messageCountRef.current++;
      console.log('Message received:', message);
      console.log('Message count:', messageCountRef.current);
      if (messageCountRef.current % 3 === 0) {
        // Increment match score by random amount between 7-10, but never above 97%
        setMatchScore(prev => {
          const increment = Math.floor(Math.random() * 4) + 7; // Random between 7-10
          const newScore = Math.min(prev + increment, 97); // Cap at 97%
          return newScore;
        });
        
        // Fade 4 more advisors randomly
        setFadedAdvisors(prev => {
          const newFaded = [...prev];
          const totalAdvisors = 24; // 12 original + 12 duplicates per row
          const maxFaded = 16; // Maximum number that can be faded (always keep 8 unfaded)
          
          // Check if we've already reached the maximum
          if (newFaded.length >= maxFaded) {
            console.log('Already at max faded:', newFaded.length);
            return newFaded;
          }
          
          // Get array of unfaded advisor indices
          const unfadedIndices = [];
          for (let i = 0; i < totalAdvisors; i++) {
            if (!newFaded.includes(i)) {
              unfadedIndices.push(i);
            }
          }
          
          // Randomly select up to 4 advisors to fade (but not more than maxFaded total)
          const remainingSlots = maxFaded - newFaded.length;
          const toFadeCount = Math.min(4, remainingSlots, unfadedIndices.length);
          
          for (let i = 0; i < toFadeCount; i++) {
            const randomIndex = Math.floor(Math.random() * unfadedIndices.length);
            newFaded.push(unfadedIndices[randomIndex]);
            unfadedIndices.splice(randomIndex, 1); // Remove selected index
          }
          
          console.log('Faded advisors:', newFaded);
          console.log('Total faded:', newFaded.length);
          return newFaded;
        });
      }
    });
    return () => {
      unsubscribe?.();
    };
  }, [on]);

  // Animate the score counter
  useEffect(() => {
    if (displayScore < matchScore) {
      const timer = setTimeout(() => {
        setDisplayScore(prev => prev + 1);
      }, 30); // Increment every 30ms for smooth animation
      return () => clearTimeout(timer);
    }
  }, [displayScore, matchScore]);

  // Listen for custom events
  useEffect(() => {
    if (!on) return;
    const unsubscribe = on('customEvent', (event) => {
      console.log('Custom event received:', event);
      setCustomEvent(event);
      
      // Check if this is the resultsincoming event
      if (event?.action === 'resultsincoming') {
        console.log('Results incoming - setting match score to 98%');
        setMatchScore(98);
      }
    });
    return () => {
      unsubscribe?.();
    };
  }, [on]);
      const hasStartedConversation = useRef(false);
      useEffect(() => {
        if (clientState === 'connected' && newConversation && !hasStartedConversation.current) {
          newConversation();
          hasStartedConversation.current = true;
        }
      }, [clientState, newConversation]);
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
        <div className="app-container">
          {/* Header */}
          <header className="header">
            <div className="logo-section">
              <a href="https://network.advisornearme.com/" target="_blank" rel="noopener noreferrer">
                <img src="/Logo2.png" alt="Advisor Near Me Logo" className="logo" />
              </a>
            </div>
            <nav className="nav-links">
              <a href="https://www.advisornearme.com/" target="_blank" rel="noopener noreferrer">Financial Courses</a>
              <a href="#" className="active">Find a Match</a>
              <a href="https://network.advisornearme.com/filter/" target="_blank" rel="noopener noreferrer">Browse Advisors</a>
            </nav>
            <div className="menu-icon" onClick={() => setIsMobileMenuOpen(true)}>&#9776;</div>
          </header>

          {/* Mobile Slideout Menu */}
          {isMobileMenuOpen && (
            <>
              <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="mobile-menu">
                <div className="mobile-menu-header">
                  <img src="/Logo2.png" alt="Advisor Near Me Logo" className="logo" />
                  <button className="close-menu" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="mobile-menu-links">
                  <a href="https://www.advisornearme.com/" target="_blank" rel="noopener noreferrer">Financial Courses</a>
                  <a href="#" className="active">Find a Match</a>
                  <a href="https://network.advisornearme.com/filter/" target="_blank" rel="noopener noreferrer">Browse Advisors</a>
                  <a href="https://network.advisornearme.com/v2/join-our-network/" target="_blank" rel="noopener noreferrer">Join Our Network</a>
                  <a href="https://network.advisornearme.com/v2/member-dashboard/" target="_blank" rel="noopener noreferrer">Account</a>
                  <a href="https://network.advisornearme.com/contact/" target="_blank" rel="noopener noreferrer">Contact</a>
                </nav>
              </div>
            </>
          )}

          {/* Mobile Process Popup */}
          {showMobileProcessPopup && (
            <>
              <div className="popup-overlay" onClick={() => setShowMobileProcessPopup(false)}></div>
              <div className="mobile-process-popup">
                <div className="popup-content">
                  <div className="process-header">
                    <img className='puzzleimg' src='/Group 1.png' alt='Perfect Match Process'></img>
                    <h3>Perfect Match Process</h3>
                  </div>
                  <div className="process-steps">
                    <div className="process-step">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <h4>Share Your Goals</h4>
                        <p>Tell us about your financial situation and objectives</p>
                      </div>
                    </div>
                    <div className="process-step">
                      <div className="step-number step-number-blue">2</div>
                      <div className="step-content">
                        <h4>AI Analysis</h4>
                        <p>Our AI analyzes your needs and preferences</p>
                      </div>
                    </div>
                    <div className="process-step">
                      <div className="step-number step-number-teal">3</div>
                      <div className="step-content">
                        <h4>Get Matched</h4>
                        <p>Receive your perfect advisor matches</p>
                      </div>
                    </div>
                  </div>
                  <button className="get-started-btn" onClick={() => setShowMobileProcessPopup(false)}>
                    Get Started
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Main Content Grid */}
          <main className="main-grid">
            {/* Chat Section */}
            <section className="chat-section">
              <div className="chat-card">
                <Container
                  connected={clientState !== 'disconnected'}
                  className="botpress-chat-container"
                >
                  <Header
                    restartConversation={newConversation}
                    configuration={botConfig}
                  />
                  <MessageList
                    botAvatar={botConfig.botAvatar}
                    botName={botConfig.botName}
                    isTyping={isTyping}
                    messages={enrichedMessages}
                    sendMessage={client?.sendMessage}
                    style={{ flexGrow: 1, overflowY: 'auto', padding: '10px 20px' }}
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
                    style={{ flexShrink: 0, borderTop: '1px solid #e0e0e0', padding: '10px', backgroundColor: '#f8f9fa' }}
                  />
                </Container>
              </div>
            </section>

            {/* Sidebar */}
            <aside className="sidebar">
              <div className="match-process card">
                <div className="process-header">
                  <img className='puzzleimg' src='/Group 1.png' alt='Perfect Match Process'></img>
          
                  <h3>Perfect Match Process</h3>
                </div>
                <div className="process-steps">
                  <div className="process-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Share Your Goals</h4>
                      <p>Tell us about your financial situation and objectives</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number step-number-blue">2</div>
                    <div className="step-content">
                      <h4>AI Analysis</h4>
                      <p>Our AI analyzes your needs and preferences</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number step-number-teal">3</div>
                    <div className="step-content">
                      <h4>Get Matched</h4>
                      <p>Receive your perfect advisor matches</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="potential-advisors card">
                <div className="advisors-header">
                  <h3>Potential Advisors</h3>
                  <div className="match-score-display">
                    <div className="circular-progress">
                      <svg className="progress-ring" width="80" height="80">
                        <circle
                          className="progress-ring-circle-bg"
                          stroke="#e0e0e0"
                          strokeWidth="6"
                          fill="transparent"
                          r="34"
                          cx="40"
                          cy="40"
                        />
                        <circle
                          className="progress-ring-circle"
                          stroke="#3DD8C8"
                          strokeWidth="6"
                          fill="transparent"
                          r="34"
                          cx="40"
                          cy="40"
                          style={{
                            strokeDasharray: `${2 * Math.PI * 34}`,
                            strokeDashoffset: `${2 * Math.PI * 34 * (1 - displayScore / 100)}`,
                            transition: 'stroke-dashoffset 0.5s ease'
                          }}
                        />
                      </svg>
                      <div className="progress-content">
                        <div className="match-percentage">{displayScore}%</div>
                        <div className="match-label">Match</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="advisor-scroll-rows">
                  <div className="advisor-scroll-container-wrapper">
                    {/* Top row - scrolls left */}
                    <div className="advisor-scroll-container">
                      <div className="advisor-scroll-track advisor-scroll-left">
                        {extendedProfiles.map((profile, index) => (
                          <div key={`top-${index}`} className="advisor-avatar-wrapper">
                            <img
                              src={profile.imageUrl}
                              alt={`Advisor ${profile.id}`}
                              className={`advisor-avatar-img ${fadedAdvisors.includes(index) ? 'advisor-faded' : ''}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Bottom row - scrolls right */}
                    <div className="advisor-scroll-container">
                      <div className="advisor-scroll-track advisor-scroll-right">
                        {extendedProfiles2.map((profile, index) => (
                          <div key={`bottom-${index}`} className="advisor-avatar-wrapper">
                            <img
                              src={profile.imageUrl}
                              alt={`Advisor ${profile.id}`}
                              className={`advisor-avatar-img ${fadedAdvisors.includes(index) ? 'advisor-faded' : ''}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Match circle - shows next to slider on mobile */}
                  <div className="match-score-display-mobile">
                    <div className="circular-progress">
                      <svg className="progress-ring" width="60" height="60">
                        <circle
                          className="progress-ring-circle-bg"
                          stroke="#e0e0e0"
                          strokeWidth="6"
                          fill="transparent"
                          r="25"
                          cx="30"
                          cy="30"
                        />
                        <circle
                          className="progress-ring-circle"
                          stroke="#3DD8C8"
                          strokeWidth="6"
                          fill="transparent"
                          r="25"
                          cx="30"
                          cy="30"
                          style={{
                            strokeDasharray: `${2 * Math.PI * 25}`,
                            strokeDashoffset: `${2 * Math.PI * 25 * (1 - displayScore / 100)}`,
                            transition: 'stroke-dashoffset 0.5s ease'
                          }}
                        />
                      </svg>
                      <div className="progress-content">
                        <div className="match-percentage">{displayScore}%</div>
                        <div className="match-label">Match</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </main>

          {/* Bottom Feature Section */}
          <section className="feature-section">
            <h2>Like Dating, But For Your Money</h2>
            <p className="feature-subtitle">Our AI-powered matching system connects you with financial advisors<br />who truly understand your needs and goals.</p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-bubble">
                  <img src="/ChatBubble.png" alt="Chat" />
                </div>
                <h4>Smart Conversations</h4>
                <p>Our AI asks the right questions to understand your financial personality and goals.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-bubble">
                  <img src="/PuzzleBubble.png" alt="Puzzle" />
                </div>
                <h4>Perfect Fit Matching</h4>
                <p>We play matchmaker, connecting you with an advisor who is your ideal financial partner.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-bubble">
                  <img src="/HeartBubble.png" alt="Heart" />
                </div>
                <h4>Lasting Relationships</h4>
                <p>Build long-term financial partnerships with advisors who truly care about your success.</p>
              </div>
            </div>
          </section>
        </div>
      );
    }

    export default App;

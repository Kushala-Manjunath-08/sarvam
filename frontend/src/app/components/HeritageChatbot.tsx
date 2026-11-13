
"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
  sources?: ChatSource[];
  error?: boolean;
};

type ChatSource = {
  citation: number;
  id: string;
  title: string;
  organization: string;
  url: string;
  region: string;
  district: string;
  publication_year: string | number | null;
  reporting_year: string | number | null;
};

type ChatResponse = {
  answer: string;
  sources: ChatSource[];
  retrieval_mode: string;
  grounded: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const suggestions = [
  "What crops are grown in Old Mysuru?",
  "Tell me about Bidar's heritage",
  "What is Yakshagana in Karavali?",
];

function isChatResponse(value: unknown): value is ChatResponse {
  if (typeof value !== "object" || value === null || !("answer" in value) || !("sources" in value)) {
    return false;
  }

  return (
    typeof value.answer === "string" &&
    Array.isArray(value.sources) &&
    value.sources.every(
      (source) =>
        typeof source === "object" &&
        source !== null &&
        "url" in source &&
        "title" in source &&
        typeof source.url === "string" &&
        typeof source.title === "string",
    )
  );
}

export default function HeritageChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Namaskara! Welcome to Namma Heritage. I'm here to help you discover Karnataka's stories, traditions and timeless places. What would you like to explore?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    function openChat() {
      setIsOpen(true);
      window.setTimeout(() => messageInputRef.current?.focus(), 0);
    }

    window.addEventListener("sarvam:open-chat", openChat);
    return () => window.removeEventListener("sarvam:open-chat", openChat);
  }, []);

  async function sendMessage(text = message) {
    const trimmed = text.trim();

    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setIsTyping(true);

    const conversation = [...messages, userMessage]
      .filter((item, index) => !(index === 0 && item.sender === "bot"))
      .slice(-8)
      .map((item) => ({
        role: item.sender === "bot" ? "assistant" : "user",
        content: item.text,
      }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });
      let payload: unknown;

      try {
        payload = await response.json();
      } catch {
        throw new Error(`The knowledge service returned an invalid response (${response.status}).`);
      }

      if (!response.ok) {
        const detail =
          typeof payload === "object" &&
          payload !== null &&
          "detail" in payload &&
          typeof payload.detail === "string"
            ? payload.detail
            : `The knowledge service returned an error (${response.status}).`;
        throw new Error(detail);
      }

      if (!isChatResponse(payload)) {
        throw new Error("The knowledge service returned an invalid response.");
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: payload.answer,
        sources: payload.sources,
      };
      setMessages((previous) => [...previous, botMessage]);
    } catch (error) {
      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text:
          error instanceof Error
            ? error.message
            : "The knowledge service could not answer this question.",
        error: true,
      };
      setMessages((previous) => [...previous, botMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      <div className="heritage-chatbot">
        {isOpen && (
          <section
            className="chat-window"
            aria-label="Namma Heritage chat"
          >
            <header className="chat-header">
              <div className="header-brand">
                <div className="header-emblem">
                  <svg viewBox="0 0 48 48" aria-hidden="true">
                    <path
                      d="M24 5 29 15 39 10 35 22 43 28 31 31 29 42 24 35 19 42 17 31 5 28 13 22 9 10 19 15Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 25h18M18 30h12M21 35h6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <circle cx="24" cy="20" r="3" fill="currentColor" />
                  </svg>
                </div>

                <div>
                  <h2>Namma Heritage</h2>
                  <p>
                    <span className="online-dot" />
                    Discover Karnataka
                  </p>
                </div>
              </div>

              <button
                className="close-chat"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </header>

            <div className="chat-welcome">
              <span className="welcome-kicker">A LIVING ATLAS OF INDIA</span>
              <h3>Every place has a story.</h3>
              <p>Let's discover the stories of Karnataka together.</p>
            </div>

            <div className="chat-messages">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`message-row ${item.sender}`}
                >
                  {item.sender === "bot" && (
                    <div className="bot-avatar">ನ</div>
                  )}

                  {item.sender === "bot" ? (
                    <div className="bot-message-content">
                      <div className={`message-bubble ${item.error ? "error" : ""}`}>
                        {item.text}
                      </div>
                      {item.sources && item.sources.length > 0 && (
                        <div className="message-sources">
                          <p>Sources</p>
                          {item.sources.map((source) => (
                            <a
                              key={`${item.id}-${source.id}`}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              [{source.citation}] {source.title} · {source.district}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="message-bubble">{item.text}</div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="message-row bot">
                  <div className="bot-avatar">ನ</div>
                  <div className="message-bubble typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="suggestion-area">
                <p>START EXPLORING</p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="suggestion-chip"
                  >
                    {suggestion}
                    <span>↗</span>
                  </button>
                ))}
              </div>
            )}

            <form
              className="chat-input-area"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <input
                ref={messageInputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about Karnataka..."
                aria-label="Type your message"
              />

              <button
                type="submit"
                disabled={!message.trim() || isTyping}
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="m21 3-7.5 18-3.8-7.7L2 9.5 21 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.7 13.3 21 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </button>
            </form>

            <div className="chat-footer">
              <span>Crafted with a love for Karnataka</span>
              <span>ನಮ್ಮ ನಾಡು</span>
            </div>
          </section>
        )}

        <button
          className={`chat-launcher ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close Namma Heritage chat" : "Open Namma Heritage chat"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <span className="launcher-close">×</span>
          ) : (
            <>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path
                  d="M24 5 29 15 39 10 35 22 43 28 31 31 29 42 24 35 19 42 17 31 5 28 13 22 9 10 19 15Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 25h18M18 30h12M21 35h6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="20" r="3" fill="currentColor" />
              </svg>
              <span className="launcher-sparkle">✦</span>
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .heritage-chatbot {
          --gold: #b58a45;
          --gold-light: #d8b878;
          --ink: #292117;
          --muted: #8a7b66;
          font-family: Arial, Helvetica, sans-serif;
          position: fixed;
          right: 28px;
          bottom: 26px;
          z-index: 9999;
        }

        .chat-launcher {
          width: 68px;
          height: 68px;
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 50%;
          background: linear-gradient(145deg, #d8b878, #9e7135);
          color: #fffaf0;
          box-shadow: 0 8px 28px rgba(72, 48, 18, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .chat-launcher:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 12px 34px rgba(72, 48, 18, 0.38);
        }

        .chat-launcher svg {
          width: 37px;
          height: 37px;
        }

        .launcher-sparkle {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 13px;
          color: #fff4d6;
        }

        .launcher-close {
          font-size: 35px;
          line-height: 1;
          font-weight: 300;
        }

        .chat-window {
          position: absolute;
          right: 0;
          bottom: 84px;
          width: 370px;
          height: min(590px, calc(100dvh - 135px));
          min-height: 420px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(181, 138, 69, 0.3);
          border-radius: 19px;
          background: #fffdf8;
          color: var(--ink);
          box-shadow: 0 18px 65px rgba(37, 26, 13, 0.22);
          animation: chat-appear 0.22s ease-out;
        }

        @keyframes chat-appear {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .chat-header {
          min-height: 76px;
          padding: 14px 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff8e9;
          background: #332719;
          border-bottom: 2px solid var(--gold);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .header-emblem {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(216, 184, 120, 0.7);
          border-radius: 50%;
          color: var(--gold-light);
        }

        .header-emblem svg {
          width: 33px;
          height: 33px;
        }

        .header-brand h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 17px;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .header-brand p {
          margin: 5px 0 0;
          color: #d4c5a9;
          font-size: 11px;
          letter-spacing: 0.3px;
        }

        .online-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-right: 6px;
          border-radius: 50%;
          background: #9dbb78;
        }

        .close-chat {
          width: 31px;
          height: 31px;
          border: 0;
          border-radius: 50%;
          color: #f4e7cf;
          background: rgba(255, 255, 255, 0.1);
          font-size: 24px;
          cursor: pointer;
        }

        .chat-welcome {
          padding: 18px 19px 15px;
          background: #f5efe3;
          border-bottom: 1px solid #e9deca;
        }

        .welcome-kicker {
          color: #98713a;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .chat-welcome h3 {
          margin: 7px 0 4px;
          color: #3a2d1e;
          font-family: Georgia, serif;
          font-size: 21px;
          font-weight: 500;
        }

        .chat-welcome p {
          margin: 0;
          color: #80715c;
          font-size: 12px;
          line-height: 1.5;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 13px;
          background: #fffdf8;
        }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 13px;
        }

        .message-row.bot {
          align-items: flex-start;
        }

        .message-row.user {
          justify-content: flex-end;
        }

        .bot-avatar {
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eee3ce;
          color: #8c642d;
          font-family: Georgia, serif;
          font-size: 15px;
        }

        .message-bubble {
          max-width: 83%;
          padding: 11px 13px;
          border: 1px solid #eee5d7;
          border-radius: 13px 13px 13px 3px;
          background: #f7f2e9;
          color: #4b4032;
          font-size: 12px;
          line-height: 1.65;
          overflow-wrap: anywhere;
          white-space: pre-line;
        }

        .bot-message-content {
          display: flex;
          flex-direction: column;
          gap: 7px;
          max-width: 83%;
          min-width: 0;
        }

        .bot-message-content .message-bubble {
          max-width: 100%;
        }

        .message-bubble.error {
          border-color: #d7a29a;
          background: #fff3f0;
          color: #7d332a;
        }

        .message-sources {
          display: grid;
          gap: 4px;
          padding: 2px 3px 4px;
        }

        .message-sources p {
          margin: 0 0 2px;
          color: #8d7655;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .message-sources a {
          color: #755426;
          font-size: 10px;
          line-height: 1.45;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .message-sources a:hover {
          color: #3e2d17;
        }

        .user .message-bubble {
          border-color: #a17b43;
          border-radius: 13px 13px 3px 13px;
          background: #a17b43;
          color: white;
        }

        .typing {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 14px;
        }

        .typing span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #a17b43;
          animation: typing 1s infinite ease-in-out;
        }

        .typing span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        .suggestion-area {
          padding: 0 15px 12px;
          background: #fffdf8;
        }

        .suggestion-area > p {
          margin: 0 0 8px;
          color: #a18a69;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
        }

        .suggestion-chip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 6px;
          padding: 9px 11px;
          border: 1px solid #e8dcc7;
          border-radius: 8px;
          background: #fffdf8;
          color: #68543a;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .suggestion-chip:hover {
          background: #f5efe3;
        }

        .suggestion-chip span {
          color: #a17b43;
        }

        .chat-input-area {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 12px;
          border-top: 1px solid #eae1d3;
          background: #fffdf8;
        }

        .chat-input-area input {
          flex: 1;
          min-width: 0;
          height: 41px;
          padding: 0 12px;
          border: 1px solid #e5dac8;
          border-radius: 9px;
          outline: none;
          background: #faf7f0;
          color: #392e20;
          font-size: 12px;
        }

        .chat-input-area input:focus {
          border-color: #b58a45;
          box-shadow: 0 0 0 2px rgba(181, 138, 69, 0.12);
        }

        .chat-input-area button {
          width: 41px;
          height: 41px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: #a17b43;
          color: white;
          cursor: pointer;
        }

        .chat-input-area button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .chat-input-area button svg {
          width: 20px;
          height: 20px;
        }

        .chat-footer {
          display: flex;
          justify-content: space-between;
          padding: 0 14px 11px;
          background: #fffdf8;
          color: #a08d71;
          font-size: 9px;
        }

        @media (max-width: 480px) {
          .heritage-chatbot {
            right: 15px;
            bottom: 16px;
          }

          .chat-launcher {
            width: 60px;
            height: 60px;
          }

          .chat-window {
            position: fixed;
            right: 10px;
            bottom: 86px;
            width: calc(100vw - 20px);
            height: min(590px, calc(100dvh - 115px));
            min-height: 390px;
          }
        }
      `}</style>
    </>
  );
}

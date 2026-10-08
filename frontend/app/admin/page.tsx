"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id?: number;
  role: "user" | "assistant";
  content: string;
  grounded?: number | boolean;
  response_time_ms?: number | null;
  sources?: {
    title: string;
    category: string;
    version: string;
    source: string;
    relevanceScore?: number;
  }[];
};

export default function Home() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conversationCreated = useRef(false);

  useEffect(() => {
    if (conversationCreated.current) return;

    conversationCreated.current = true;
    createConversation();
  }, []);

  async function createConversation() {
    try {
      setError("");

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "demo-user",
          title: "New Zynora Conversation",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create conversation."
        );
      }

      setConversationId(data.conversation.id);
      setMessages([]);
    } catch (err) {
      console.error(err);
      setError("Unable to create conversation.");
    }
  }

  async function loadConversationMessages(id: number) {
    try {
      const response = await fetch(
        `/api/conversations/${id}/messages`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load messages."
        );
      }

      const loadedMessages: Message[] = data.messages.map(
        (item: any) => ({
          id: item.id,
          role: item.role,
          content: item.content,
          grounded: item.grounded,
          response_time_ms: item.response_time_ms,
        })
      );

      setMessages(loadedMessages);
    } catch (err) {
      console.error(err);
      setError("Unable to load conversation.");
    }
  }

  async function sendMessage() {
    const question = input.trim();

    if (!question || loading) return;

    if (!conversationId) {
      setError("Conversation is not ready. Please wait.");
      return;
    }

    setError("");
    setInput("");

    const userMessage: Message = {
      role: "user",
      content: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/zynora/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: question,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to get Zynora response."
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        grounded: data.grounded,
        sources: data.sources || [],
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to contact Zynora."
      );
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    if (!conversationId) return;

    try {
      setError("");

      const response = await fetch(
        `/api/conversations/${conversationId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to clear conversation."
        );
      }

      setConversationId(null);
      setMessages([]);

      conversationCreated.current = false;
      await createConversation();
    } catch (err) {
      console.error(err);
      setError("Unable to clear conversation.");
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        padding: "40px 20px",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "8px",
          }}
        >
          Zynora
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#374151",
            marginBottom: "25px",
          }}
        >
          Zyngram Internal Knowledge Chatbot
        </p>

        {conversationId && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px 14px",
              background: "#e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            Conversation ID: {conversationId}
          </div>
        )}

        <div
          style={{
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            padding: "24px",
            minHeight: "450px",
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          {messages.length === 0 && !loading && (
            <div
              style={{
                color: "#6b7280",
                textAlign: "center",
                padding: "100px 20px",
              }}
            >
              Ask Zynora a question about approved Zyngram
              knowledge.
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id || index}
              style={{
                display: "flex",
                justifyContent:
                  message.role === "user"
                    ? "flex-end"
                    : "flex-start",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "16px 18px",
                  borderRadius: "12px",
                  background:
                    message.role === "user"
                      ? "#dbeafe"
                      : "#f3f4f6",
                  color: "#111827",
                }}
              >
                <strong>
                  {message.role === "user"
                    ? "You"
                    : "Zynora"}
                </strong>

                <p
                  style={{
                    marginTop: "10px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.content}
                </p>

                {message.role === "assistant" &&
                  message.grounded !== undefined && (
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Grounded:{" "}
                      {message.grounded === true ||
                      message.grounded === 1
                        ? "Yes"
                        : "No"}
                    </div>
                  )}

                {message.sources &&
                  message.sources.length > 0 && (
                    <div
                      style={{
                        marginTop: "14px",
                        paddingTop: "10px",
                        borderTop:
                          "1px solid #d1d5db",
                        fontSize: "13px",
                      }}
                    >
                      <strong>Sources</strong>

                      {message.sources.map(
                        (source, sourceIndex) => (
                          <div
                            key={sourceIndex}
                            style={{
                              marginTop: "8px",
                            }}
                          >
                            <div>
                              <strong>
                                {source.title}
                              </strong>
                            </div>
                            <div>
                              Category:{" "}
                              {source.category}
                            </div>
                            <div>
                              Version:{" "}
                              {source.version}
                            </div>
                            <div>
                              Source:{" "}
                              {source.source}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {loading && (
            <div
              style={{
                color: "#374151",
                padding: "10px",
              }}
            >
              Zynora is retrieving approved knowledge...
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask Zynora a question..."
            disabled={loading || !conversationId}
            rows={2}
            style={{
              flex: 1,
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #9ca3af",
              fontSize: "16px",
              resize: "vertical",
              color: "#111827",
              background: "white",
            }}
          />

          <button
            onClick={sendMessage}
            disabled={
              loading ||
              !input.trim() ||
              !conversationId
            }
            style={{
              padding: "0 25px",
              borderRadius: "8px",
              border: "none",
              background: "#111827",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {loading ? "Sending..." : "Send"}
          </button>

          <button
            onClick={clearChat}
            disabled={loading || !conversationId}
            style={{
              padding: "0 22px",
              borderRadius: "8px",
              border: "1px solid #9ca3af",
              background: "white",
              color: "#111827",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </main>
  );
}
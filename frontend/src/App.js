import { useState, useRef, useEffect } from "react";

const styles = {
  body: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(16px)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    padding: "20px 28px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 },
  badge: {
    marginLeft: "auto",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 20,
    fontWeight: 600,
  },
  chatArea: {
    height: 380,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  emptyState: {
    textAlign: "center",
    color: "rgba(255,255,255,0.3)",
    marginTop: 80,
    fontSize: 14,
  },
  msgRow: (isUser) => ({
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start",
  }),
  bubble: (isUser) => ({
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    background: isUser
      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
      : "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
  }),
  avatar: (isUser) => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: isUser ? "#6366f1" : "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
    alignSelf: "flex-end",
    margin: isUser ? "0 0 0 8px" : "0 8px 0 0",
  }),
  typingDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#8b5cf6", display: "inline-block", margin: "0 2px",
  },
  inputArea: {
    padding: "16px 24px 20px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 14,
    resize: "none",
    outline: "none",
    lineHeight: 1.5,
    fontFamily: "inherit",
  },
  sendBtn: (loading) => ({
    width: 46,
    height: 46,
    borderRadius: 14,
    background: loading
      ? "rgba(99,102,241,0.4)"
      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  }),
};

function TypingIndicator() {
  return (
    <div style={styles.msgRow(false)}>
      <div style={styles.avatar(false)}>🤖</div>
      <div style={{ ...styles.bubble(false), padding: "14px 18px" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            ...styles.typingDot,
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = prompt.trim();
    if (!text || loading) return;
    setMessages(m => [...m, { role: "user", text }]);
    setPrompt("");
    setLoading(true);
    try {
      const res = await fetch("http://13.206.83.74:31000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.jgson();
      setMessages(m => [...m, {
        role: "agent",
        text: data.reply || data.error || "No response"
      }]);
    } catch {
      setMessages(m => [...m, { role: "agent", text: "⚠️ Error connecting to backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        textarea::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
      <div style={styles.body}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <span style={{ fontSize: 28 }}>🤖</span>
            <div>
              <p style={styles.headerTitle}>MCP AI Agent</p>
              <p style={styles.headerSub}>Powered by Llama 3 · Running on Kubernetes</p>
            </div>
            <span style={styles.badge}>● Live</span>
          </div>

          {/* Chat area */}
          <div style={styles.chatArea}>
            {messages.length === 0 && (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                Ask the agent anything...
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={styles.msgRow(m.role === "user")}>
                {m.role === "agent" && <div style={styles.avatar(false)}>🤖</div>}
                <div style={styles.bubble(m.role === "user")}>{m.text}</div>
                {m.role === "user" && <div style={styles.avatar(true)}>👤</div>}
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={styles.inputArea}>
            <textarea
              rows={2}
              style={styles.textarea}
              placeholder="Ask the agent something... (Enter to send)"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={onKey}
            />
            <button style={styles.sendBtn(loading)} onClick={send} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
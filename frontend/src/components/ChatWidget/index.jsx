import { useState, useEffect, useRef } from "react";
import { clientServer } from "@/config";
import styles from "./styles.module.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef(null);

  // Load history when widget opens for first time
  useEffect(() => {
    if (!open || historyLoaded) return;
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await clientServer.get("/api/chat/history", {
          headers: { authorization: token },
        });
        setMessages(res.data.messages || []);
        setHistoryLoaded(true);
      } catch (err) {
        setHistoryLoaded(true);
      }
    };
    fetchHistory();
  }, [open]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await clientServer.post(
        "/api/chat/message",
        { message: trimmed },
        { headers: { authorization: token } }
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kuch problem ho gayi 😅 dobara try karo" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      const token = localStorage.getItem("token");
      await clientServer.delete("/api/chat/history", {
        headers: { authorization: token },
      });
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.wrapper}>

      {/* Chat Window */}
      {open && (
        <div className={styles.chatBox}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.botAvatar}>
                <img src="/images/bot-avatar.png" alt="bot"
                  onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                />
                <span className={styles.botAvatarFallback}>🤖</span>
              </div>
              <div>
                <p className={styles.botName}>Fynk AI</p>
                <p className={styles.botOnline}>● Online</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button onClick={handleClear} className={styles.clearBtn} title="Clear chat">
                🗑
              </button>
              <button onClick={() => setOpen(false)} className={styles.closeBtn}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <p className={styles.emptyEmoji}>👋</p>
                <p className={styles.emptyText}>
                  Kuch bhi pucho — Hindi, English, ya Hinglish!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={msg.role === "user" ? styles.rowRight : styles.rowLeft}
              >
                {msg.role === "assistant" && (
                  <div className={styles.botBubbleAvatar}>🤖</div>
                )}
                <div className={msg.role === "user" ? styles.userBubble : styles.botBubble}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className={styles.rowLeft}>
                <div className={styles.botBubbleAvatar}>🤖</div>
                <div className={styles.botBubble}>
                  <span className={styles.typing}>● ● ●</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className={styles.inputRow}>
            <textarea
              className={styles.textarea}
              placeholder="Type karo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={styles.sendBtn}
            >
              ➤
            </button>
          </div>

        </div>
      )}

      {/* Floating Button */}
      <button
        className={styles.fab}
        onClick={() => setOpen((prev) => !prev)}
        title="Fynk AI"
      >
        {open ? "✕" : "🤖"}
      </button>

    </div>
  );
}
import { ChatRoom } from "@/components/messages/chat-room";

export default function MessagesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--lms-bg)]">
      <ChatRoom />
    </div>
  );
}

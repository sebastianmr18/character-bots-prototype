import Image from "next/image";
import ChatInterface from "@/components/ui/features/chat-interface/module";

export default function Home() {
  return (
    <div className="font-sans min-h-screen w-full">
      <ChatInterface />
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { dataService } from "@/lib/store";
import { Event, ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Shield, User as UserIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventGroupChatProps {
  event: Event;
  onClose: () => void;
}

export function EventGroupChat({ event, onClose }: EventGroupChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentEvent, setCurrentEvent] = useState<Event>(event);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to Event changes (for live role updates)
  useEffect(() => {
    const unsubscribe = dataService.subscribeToEvent(event.id, (updatedEvent) => {
      setCurrentEvent(updatedEvent);
    });
    return () => unsubscribe();
  }, [event.id]);

  // Subscribe to Messages
  useEffect(() => {
    const unsubscribe = dataService.subscribeToMessages(event.id, (updatedMessages) => {
      setMessages(updatedMessages);
    });
    return () => unsubscribe();
  }, [event.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const canChat =
    user?.role === 'admin' ||
    user?.role === 'coordinator' ||
    (user && currentEvent.chatRoleMap?.[user.id] !== undefined);

  const customRole = user ? currentEvent.chatRoleMap?.[user.id] : undefined;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !canChat) return;

    try {
      await dataService.sendChatMessage(currentEvent.id, {
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        text: newMessage,
        customRole: customRole
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">{event.title} - Group Chat</h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Official Event Channel
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 text-slate-400">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-400 text-sm italic">No messages yet. Be the first to start the conversation!</p>
              </div>
            )}
            {messages.map((msg, index) => {
              const isMe = msg.senderId === user?.id;
              const isStaff = msg.senderRole === 'admin' || msg.senderRole === 'coordinator';

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{msg.senderName}</span>
                    {msg.customRole && (
                      <Badge variant="outline" className="h-4 px-1 text-[9px] border-accent text-accent font-black uppercase">
                        {msg.customRole}
                      </Badge>
                    )}
                    {isStaff && !msg.customRole && (
                      <Shield className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isMe
                      ? 'bg-accent text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[9px] mt-1 block opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50">
          {!canChat ? (
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3 text-amber-700">
              <Shield className="h-5 w-5 shrink-0" />
              <p className="text-xs font-medium leading-tight">
                This channel is read-only for participants. A coordinator can grant you chat access if needed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="relative">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="pr-12 h-12 rounded-2xl border-slate-200 focus:border-accent focus:ring-accent shadow-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim()}
                className="absolute right-1 top-1 h-10 w-10 rounded-xl bg-accent hover:bg-accent/90 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

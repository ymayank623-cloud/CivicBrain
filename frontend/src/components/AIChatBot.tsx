import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, Image as ImageIcon, MapPin } from "lucide-react";

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "ai", text: string, time: string}[]>([
    {
      role: "ai",
      text: "Namaste! 🙏 I am CivicBrain AI, your virtual assistant for Nagar Nigam. You can ask me how to file a complaint, check ticket status, or report an issue directly here. How can I help you today?",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    setMessages(prev => [...prev, { role: "user", text: userMsg, time }]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      let aiResponse = "";
      const lowerInput = userMsg.toLowerCase();

      if (lowerInput.includes("pothole") || lowerInput.includes("road") || lowerInput.includes("gaddha")) {
        aiResponse = "To report a pothole, please login as a Citizen and click on 'New Complaint'. Our AI will automatically verify the photo you upload and assign it to the nearest field officer.";
      } else if (lowerInput.includes("garbage") || lowerInput.includes("kachra")) {
        aiResponse = "Garbage collection issues are resolved within 24 hours (SLA). Please file a complaint from the dashboard, and earn +10 Civic Karma points when it's resolved!";
      } else if (lowerInput.includes("track") || lowerInput.includes("status")) {
        aiResponse = "You can track your existing complaint by clicking on 'Track Grievance' in the top menu. You just need your Ticket ID (e.g., CB-8842).";
      } else if (lowerInput.includes("hindi") || lowerInput.includes("namaste")) {
        aiResponse = "नमस्ते! मैं नगर निगम का AI असिस्टेंट हूँ। आप यहाँ शिकायत दर्ज करने या स्टेटस चेक करने की जानकारी ले सकते हैं।";
      } else {
        aiResponse = "Thank you for reaching out. For complex issues, I recommend logging into your Citizen Portal and raising an official ticket so our department heads can track it via the Escalation Matrix.";
      }

      setMessages(prev => [...prev, { 
        role: "ai", 
        text: aiResponse, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-[#EA580C] hover:bg-[#C2410C] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm transition-transform hover:-translate-y-1 z-50 animate-bounce-slow"
        >
          <Sparkles size={18} /> Ask AI / Report
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{ height: '500px', maxHeight: '80vh' }}>
          
          {/* Header */}
          <div className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-1.5 flex items-center justify-center">
                <Bot size={20} className="text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">CivicBrain AI</h3>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            <div className="text-center text-[10px] text-gray-400 font-semibold mb-2">
              Powered by Nagar Nigam AI
            </div>

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm relative ${
                  msg.role === 'user' 
                    ? 'bg-blue-900 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[9px] mt-1 block text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (Chips) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100">
              <button onClick={() => setInput("Report pothole")} className="flex-shrink-0 bg-white border border-gray-200 text-xs text-blue-800 px-3 py-1.5 rounded-full hover:bg-blue-50 whitespace-nowrap">🛣️ Report pothole</button>
              <button onClick={() => setInput("Track my ticket")} className="flex-shrink-0 bg-white border border-gray-200 text-xs text-blue-800 px-3 py-1.5 rounded-full hover:bg-blue-50 whitespace-nowrap">🔍 Track my ticket</button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-blue-900 transition-colors" title="Attach Photo">
                <ImageIcon size={20} />
              </button>
              <button className="text-gray-400 hover:text-orange-600 transition-colors" title="Share Location">
                <MapPin size={20} />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-900 focus:ring-0 rounded-full px-4 py-2 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-blue-900 disabled:bg-gray-300 text-white p-2 rounded-full hover:bg-blue-800 transition-colors flex-shrink-0"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

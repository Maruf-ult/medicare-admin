"use client";

import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notificationType, setNotificationType] = useState<"email" | "sms">(
    "email",
  );
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      toast.success(`Notification sent via ${notificationType.toUpperCase()}`);
      setMessage("");
    } else {
      toast.error("Please enter a message");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Send Notifications</h1>
        <p className="text-gray-600 mt-1">
          Communicate with customers via email or SMS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Compose Message
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Channel
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setNotificationType("email")}
                className={`flex-1 p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                  notificationType === "email"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </button>
              <button
                onClick={() => setNotificationType("sms")}
                className={`flex-1 p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                  notificationType === "sms"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>SMS</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 flex items-center justify-center space-x-2 h-11"
          >
            <Send className="w-4 h-4" />
            <span>Send Notification</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

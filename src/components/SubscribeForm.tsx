"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call for newsletter subscription
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    
    toast.success("Successfully subscribed to our newsletter!");
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter your email" 
        className="w-full px-4 py-3 rounded-lg border-none mb-3 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[13px] text-gray-900 placeholder:text-gray-400" 
      />
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 bg-[#F97316] text-white text-[13px] font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-sm mb-5 disabled:opacity-70"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}

"use client";

import { useState, useEffect } from 'react';

export default function ProfessionalLandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  const threatStats = [
    { number: "700M+", label: "LinkedIn accounts compromised", icon: "🚨" },
    { number: "24hrs", label: "Average discovery time", icon: "⏰" },
    { number: "3 years", label: "Career recovery time", icon: "📉" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % threatStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                  <span className="text-white font-bold text-lg">🛡️</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LinkStream</h1>
                <p className="text-xs text-blue-200 hidden sm:block">Professional Network Security</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
              <a href="/login" className="text-white/80 hover:text-white transition-colors">Sign In</a>
              <a href="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          {/* Animated Threat Alert */}
          <div className={`inline-flex items-center space-x-3 bg-red-500/20 border border-red-500/30 rounded-full px-6 py-3 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-200 text-sm font-medium">
              {threatStats[currentStatIndex].icon} {threatStats[currentStatIndex].number} {threatStats[currentStatIndex].label}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="block">Don't lose years of</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              networking to hackers
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Secure your professional network with automated LinkedIn backup and AI-powered career insights
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a href="/register" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1">
              <span className="mr-3 text-xl group-hover:animate-bounce">🚀</span>
              Start Free Backup
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            </a>
            <div className="flex items-center space-x-2 text-blue-200">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-sm">Free • No credit card • 2-minute setup</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className={`text-center transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-blue-200 text-sm mb-4">Trusted by professionals worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-white/60 font-semibold">2,500+ networks secured</div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="text-white/60 font-semibold">99.9% uptime</div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="text-white/60 font-semibold">Bank-level security</div>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Section */}
      <div className="relative z-40 bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your professional network is under <span className="text-red-400">constant threat</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚨",
                title: "700M+ Accounts Breached",
                description: "LinkedIn has suffered multiple massive data breaches, exposing millions of professional profiles.",
                color: "from-red-500 to-red-600"
              },
              {
                icon: "⏰",
                title: "24-Hour Discovery",
                description: "Most users discover their LinkedIn account is compromised within 24 hours - often too late.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: "📉",
                title: "3-Year Recovery",
                description: "Average career impact from losing your professional network and connections.",
                color: "from-yellow-500 to-yellow-600"
              }
            ].map((threat, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`w-16 h-16 bg-gradient-to-r ${threat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{threat.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{threat.title}</h3>
                  <p className="text-blue-200 leading-relaxed">{threat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="relative z-40 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              LinkStream automatically backs up and analyzes your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                entire LinkedIn presence
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🛡️",
                title: "Secure Backup",
                description: "Securely backup all your connections, messages, posts, and profile data before disaster strikes.",
                features: ["End-to-end encryption", "Automated daily backups", "Cloud storage included"],
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: "🤖",
                title: "AI-Powered Analysis",
                description: "Get intelligent analysis of your network, growth opportunities, and professional strategy.",
                features: ["Network insights", "Growth recommendations", "Industry analysis"],
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: "⚡",
                title: "Instant Recovery",
                description: "When disaster strikes, instantly access all your professional connections and data.",
                features: ["One-click restore", "Export to any format", "Priority support"],
                color: "from-emerald-500 to-emerald-600"
              }
            ].map((solution, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
                  <div className={`w-20 h-20 bg-gradient-to-r ${solution.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="text-3xl">{solution.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{solution.title}</h3>
                  <p className="text-blue-200 mb-6 leading-relaxed">{solution.description}</p>
                  <ul className="space-y-2">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-blue-200">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-40 bg-gradient-to-r from-slate-900 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Every day you wait is another day your professional network is{" "}
            <span className="text-red-400">at risk</span>
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Start protecting your career today.
          </p>
          
          <a href="/register" className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1">
            <span className="mr-3 text-2xl group-hover:animate-bounce">🚀</span>
            Get Protected Now
          </a>
          
          <p className="text-blue-300 text-sm mt-4">
            No credit card required • Free backup included
          </p>
        </div>
      </div>
    </div>
  );
}

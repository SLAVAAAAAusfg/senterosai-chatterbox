
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Intro = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Store that the user has seen the intro
    localStorage.setItem('hasSeenIntro', 'true');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="glass max-w-3xl w-full p-6 sm:p-10 rounded-2xl text-center animation-float">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <img 
            src="https://i.ibb.co/QFHLqXGM/logo-removebg-preview-1.png" 
            alt="SenterosAI Logo" 
            className="w-16 h-16" 
          />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to SenterosAI</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Your intelligent AI companion for conversations, answers, and creative ideas.
        </p>
        
        <div className="max-w-xl mx-auto space-y-6 mb-10">
          <div className="glass-dim p-4 rounded-lg">
            <h3 className="font-medium mb-2">Natural Conversations</h3>
            <p className="text-muted-foreground">Chat naturally with AI that understands context and follows complex discussions.</p>
          </div>
          
          <div className="glass-dim p-4 rounded-lg">
            <h3 className="font-medium mb-2">Thinking Mode</h3>
            <p className="text-muted-foreground">See the AI's reasoning process in detail to understand how it arrives at answers.</p>
          </div>
          
          <div className="glass-dim p-4 rounded-lg">
            <h3 className="font-medium mb-2">Multi-language Support</h3>
            <p className="text-muted-foreground">Communicate in your preferred language with our multilingual AI assistant.</p>
          </div>
        </div>
        
        <Button 
          onClick={handleGetStarted} 
          size="lg" 
          className="text-lg px-8 py-6 h-auto"
        >
          Get Started
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Intro;

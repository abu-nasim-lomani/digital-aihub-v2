import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Mic, MicOff, X, Activity, MessageSquare } from 'lucide-react';

const VoiceAgent = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef(null);
    const shouldListenRef = useRef(false);
    const hasGreetedRef = useRef(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Voice Feedback
    const speak = useCallback((text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    // Scroll to Section Helper
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    // Helper to handle navigation: Go Home first if needed, then Scroll
    const navigateToSection = useCallback((sectionId, spokenText) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => scrollToSection(sectionId), 500);
        } else {
            scrollToSection(sectionId);
        }
        speak(spokenText);
    }, [location.pathname, navigate, speak]);

    // OpenAI API Integration
    const callOpenAI = async (text) => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("No OpenAI API Key found. Falling back to basic logic.");
            return null;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are a helper for 'Digital & AI Hub' website. 
              Classify user intent into one of these SECTIONS: 'home', 'mission', 'projects', 'learning', 'initiatives', 'events', 'standards', 'team', 'dashboard', 'login'. 
              If intent is unclear, use 'unknown'.
              Reply in 'Banglish' (Bengali mixed with English) strictly. 
              Keep reply very short (max 1 sentence).
              Return JSON format: { "section": "string", "reply": "string" }`
                        },
                        { role: "user", content: text }
                    ],
                    temperature: 0.3,
                    max_tokens: 60
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                let content = data.choices[0].message.content;
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(content);
            }
        } catch (error) {
            console.error("OpenAI Error:", error);
        }
        return null;
    };

    const processCommand = useCallback(async (cmd) => {
        let actionTaken = false;
        const commandStart = cmd.toLowerCase();
        console.log('Voice Command:', commandStart);
        setFeedback('Processing...');

        // Try OpenAI First
        const aiResponse = await callOpenAI(commandStart);

        if (aiResponse && aiResponse.section && aiResponse.section !== 'unknown') {
            console.log("AI Intent:", aiResponse);
            const { section, reply } = aiResponse;

            if (section === 'login') {
                const event = new CustomEvent('open-auth-modal');
                window.dispatchEvent(event);
            } else if (section === 'dashboard') {
                navigate('/admin/dashboard');
            } else {
                if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => scrollToSection(section), 500);
                } else {
                    scrollToSection(section);
                }
            }

            speak(reply);
            setFeedback('AI: ' + reply);
            return;
        }

        // Fallback to Regex
        if (commandStart.includes('home') || commandStart.includes('top') || commandStart.includes('bari') || commandStart.includes('shuru')) {
            navigateToSection('home', "Home page e jacchi.");
            actionTaken = true;
        }
        else if (commandStart.includes('mission') || commandStart.includes('purpose') || commandStart.includes('about') || commandStart.includes('lokkho')) {
            navigateToSection('mission', "Mission details dekhacche.");
            actionTaken = true;
        }
        else if (commandStart.includes('project') || commandStart.includes('support') || commandStart.includes('prokolpo') || commandStart.includes('kaj')) {
            navigateToSection('projects', "Projects section open kora hocche.");
            actionTaken = true;
        }
        else if (commandStart.includes('learning') || commandStart.includes('academy') || commandStart.includes('course') || commandStart.includes('shikha')) {
            navigateToSection('learning', "Learning Hub e niye jacchi.");
            actionTaken = true;
        }
        else if (commandStart.includes('initiative') || commandStart.includes('uddeg')) {
            navigateToSection('initiatives', "Initiatives gulo dekhun.");
            actionTaken = true;
        }
        else if (commandStart.includes('event') || commandStart.includes('anusthan')) {
            navigateToSection('events', "Upcoming Events dekhacche.");
            actionTaken = true;
        }
        else if (commandStart.includes('standard') || commandStart.includes('policy')) {
            navigateToSection('standards', "Standards and Policies.");
            actionTaken = true;
        }
        else if (commandStart.includes('team') || commandStart.includes('dol')) {
            navigateToSection('team', "Team members der sathe porichoy hon.");
            actionTaken = true;
        }
        else if (commandStart.includes('dashboard') || commandStart.includes('admin')) {
            navigate('/admin/dashboard');
            speak("Dashboard open kora hocche.");
            actionTaken = true;
        }
        else if (commandStart.includes('login') || commandStart.includes('sign in') || commandStart.includes('dhukbo')) {
            const event = new CustomEvent('open-auth-modal');
            window.dispatchEvent(event);
            speak("Login window open kora hocche.");
            actionTaken = true;
        }

        if (!actionTaken) {
            setFeedback('Bujhte pari nai: ' + commandStart);
        } else {
            // setFeedback('Executed: ' + commandStart);
        }
    }, [navigate, navigateToSection, speak, location.pathname]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setFeedback('Ami shunchi...');
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript;
            setTranscript(command);
            processCommand(command);
        };

        recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                setIsListening(false);
                shouldListenRef.current = false;
                speak("Microphone permission den nai.");
            }
        };

        recognition.onend = () => {
            if (shouldListenRef.current) {
                recognition.start();
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;
    }, [processCommand, speak]);

    const toggleListening = () => {
        if (shouldListenRef.current) {
            shouldListenRef.current = false;
            recognitionRef.current.stop();
            setIsListening(false);
            hasGreetedRef.current = false;
        } else {
            shouldListenRef.current = true;
            recognitionRef.current.start();
            if (!hasGreetedRef.current) {
                speak("Ami online achi. Kivabe sahajjo korte pari?");
                hasGreetedRef.current = true;
            }
        }
    };

    if (!isSupported) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
            {(isListening || transcript || feedback) && (
                <div className="mb-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-blue-100 min-w-[200px] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            {isListening ? <Activity size={12} className="animate-pulse text-green-500" /> : <MessageSquare size={12} />}
                            {isListening ? 'AI Agent (Intelligent Mode)' : 'Agent Paused'}
                        </span>
                        <button onClick={() => {
                            shouldListenRef.current = false;
                            recognitionRef.current.stop();
                            setTranscript('');
                            setFeedback('')
                        }} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>

                    {transcript ? (
                        <p className="text-lg font-bold text-gray-800">"{transcript}"</p>
                    ) : (
                        <p className="text-sm text-gray-500 italic">{feedback || "Ami shunchi..."}</p>
                    )}
                </div>
            )}

            <button
                onClick={toggleListening}
                className={`p-4 rounded-full shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center 
          ${isListening
                        ? 'bg-blue-600 text-white animate-pulse ring-4 ring-blue-200'
                        : 'bg-[#003359] text-white hover:bg-blue-600'}`}
            >
                {isListening ? <Bot size={28} className="animate-bounce" /> : <Bot size={28} />}
            </button>
        </div>
    );
};

export default VoiceAgent;

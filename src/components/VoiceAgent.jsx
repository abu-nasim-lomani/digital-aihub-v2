import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Bot, Mic, MicOff, X, MessageSquare, Loader2, Send, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';

const tourSteps = [
    { page: '/', action: 'slide', slideIndex: 0, text: "Welcome to Digital AI Hub. We are Enablers for designing people-centered digital transformation, Empowering communities through innovative digital solutions." },
    { page: '/', action: 'slide', slideIndex: 1, text: "We are Building Digital Capacity. Transforming organizations for the digital age." },
    { page: '/', action: 'slide', slideIndex: 2, text: "Innovation for Development. Leveraging AI and technology for sustainable development." },
    { page: '/', action: 'scroll', sectionId: 'mission', text: "Our Mission is to enable and accelerate people-centered digital transformation across UNDP and partner organizations." },
    { page: '/', action: 'scroll', sectionId: 'initiatives', text: "Digital Initiatives. Here we showcase our strategic efforts to shape the digital landscape." },
    { page: '/', action: 'scroll', sectionId: 'leaders', text: "Empowering Digital Leaders. Meet the brilliant minds behind our success." },
    { page: '/', action: 'scroll', sectionId: 'learning', text: "Learning & Capacity Building. Empower yourself with our curated learning materials and resources." },
    { page: '/', action: 'scroll', sectionId: 'projects', text: "Projects & Support. Explore our featured projects executing impactful change worldwide." },
    { page: '/', action: 'scroll', sectionId: 'events', text: "Events & Archive. Stay updated with our upcoming workshops and seminars." },
    { page: '/', action: 'scroll', sectionId: 'standards', text: "Standards & Best Practices. We follow rigorous guidelines to ensure quality and ethics." },
    { page: '/', action: 'scroll', sectionId: 'leaders', text: "Join Our Team. We are always looking for passionate individuals to join our journey." }
];

const VoiceAgent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [agentState, setAgentState] = useState('idle'); // idle, listening, processing, speaking
    const [showWelcome, setShowWelcome] = useState(false);
    const [tourActive, setTourActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const silenceTimerRef = useRef(null);
    const lastTranscriptRef = useRef('');

    // Hybrid State
    const [inputText, setInputText] = useState('');
    const [isMuted, setIsMuted] = useState(false); // If true, Agent won't speak, only text

    // We'll use a simplified history for the backend to save tokens/complexity
    // Format: [{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]
    const [history, setHistory] = useState([]);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.warn("Browser does not support speech recognition.");
        }
    }, [browserSupportsSpeechRecognition]);

    // Cleanup speech synthesis on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
        };
    }, []);

    // Initial Welcome Check
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited_v3');
        if (!hasVisited) {
            setTimeout(() => {
                setShowWelcome(true);
                const greeting = "Hello! I am your Digital AI Hub assistant. Shall I give you a quick tour?";
                speak(greeting);
            }, 2000); // Delay for page load
        }
    }, [speak]);

    // Tour Logic
    useEffect(() => {
        if (tourActive) {
            console.log('🏁 Tour Active, Step:', currentStep);
            const step = tourSteps[currentStep];
            if (!step) {
                console.log('✅ Tour Complete');
                setTourActive(false);
                setShowWelcome(false);
                localStorage.setItem('hasVisited_v3', 'true');
                speak("That concludes our tour. Feel free to ask me anything!");
                setIsOpen(true);
                return;
            }

            const executeStep = async () => {
                // Navigate if needed
                if (location.pathname !== step.page) {
                    console.log('🔄 Navigating to:', step.page);
                    navigate(step.page);
                    // Wait for navigation
                    await new Promise(r => setTimeout(r, 1000));
                }

                // Handle Actions
                // Handle Actions
                if (step.action === 'slide') {
                    if (window.homeHeroSwiper) {
                        console.log('🖼️ Sliding to:', step.slideIndex);
                        // Stop autoplay to preventing interference
                        if (window.homeHeroSwiper.autoplay && window.homeHeroSwiper.autoplay.running) {
                            window.homeHeroSwiper.autoplay.stop();
                        }
                        window.homeHeroSwiper.slideTo(step.slideIndex);
                        // Wait for transition animation
                        await new Promise(r => setTimeout(r, 1000));
                    } else {
                        console.warn('⚠️ Swiper not found');
                    }
                } else if (step.action === 'scroll' && step.sectionId) {
                    const element = document.getElementById(step.sectionId);
                    if (element) {
                        console.log('📜 Scrolling to:', step.sectionId);
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Wait for scroll
                        await new Promise(r => setTimeout(r, 800));
                    }
                }

                // Speak
                speak(step.text, () => {
                    // On End Callback
                    console.log('⏳ Step finished, waiting...');
                    setTimeout(() => {
                        setCurrentStep(prev => prev + 1);
                    }, 1000);
                });
            };

            executeStep();
        }
    }, [tourActive, currentStep, location.pathname, navigate, speak]);

    // Initial greeting (Only if NOT touring/welcoming)
    useEffect(() => {
        if (isOpen && messages.length === 0 && !tourActive && !showWelcome) {
            const greeting = "Hello! I am the Digital AI Hub Voice Assistant. How can I help you today?";
            addMessage('assistant', greeting);
            speak(greeting);
        }
    }, [isOpen, messages.length, tourActive, showWelcome, speak]);



    const startListening = React.useCallback(() => {
        window.speechSynthesis.cancel(); // Stop talking if listening
        resetTranscript();
        lastTranscriptRef.current = '';
        setAgentState('listening');
        console.log('▶️ Starting speech recognition...');
        try {
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
            console.log('✅ Speech recognition started');
        } catch (error) {
            console.error('❌ Failed to start speech recognition:', error);
        }
    }, [resetTranscript]);

    const stopListening = React.useCallback(() => {
        console.log('⏹️ stopListening called. Current transcript:', transcript);
        SpeechRecognition.stopListening();
        console.log('✅ Speech recognition stopped');
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        setAgentState('idle');
    }, [transcript]);



    const handleSend = React.useCallback(async (text) => {
        const userMessage = text || transcript;
        if (!userMessage.trim() || isProcessing) return; // Prevent duplicate sends

        stopListening();
        setAgentState('processing');
        setIsProcessing(true);
        addMessage('user', userMessage);
        setInputText(''); // Clear input if it was text

        // Immediate reset to prevent double-triggering from useEffect
        resetTranscript();
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        try {
            // Update history
            const newHistory = [...history, { role: 'user', content: userMessage }];
            setHistory(newHistory);

            // Send to backend
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/agent/chat`;
            console.log('📡 Sending to API:', apiUrl);
            console.log('📤 Message:', userMessage);

            const response = await axios.post(apiUrl, {
                message: userMessage,
                history: history.slice(-10) // Keep last 10 messages for context
            });

            const reply = response.data.reply;
            addMessage('assistant', reply);
            setHistory([...newHistory, { role: 'assistant', content: reply }]);

            // Check if response contains navigation action
            let textToSpeak = reply;
            try {
                // Look for navigation JSON in the reply
                const navigationMatch = reply.match(/\{[^}]*"action"\s*:\s*"navigate"[^}]*\}/); if (navigationMatch) {
                    const navData = JSON.parse(navigationMatch[0]);

                    // Extract only the natural text part (before JSON)
                    textToSpeak = reply.substring(0, navigationMatch.index).trim();

                    if (navData.page) {
                        console.log('Navigating to:', navData.page, 'Section:', navData.section);

                        // Navigate to page
                        setTimeout(() => {
                            navigate(navData.page);

                            // If there's a section, scroll to it after navigation
                            if (navData.section) {
                                setTimeout(() => {
                                    const element = document.getElementById(navData.section);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }, 500); // Wait for page to load
                            }
                        }, 1000); // Navigate after speaking
                    }
                }
            } catch {
                // Not a navigation response, ignore
                console.log('No navigation action detected');
            }

            speak(textToSpeak);

        } catch (error) {
            console.error('Error sending message:', error);
            console.error('API Error Details:', error.response?.status, error.response?.data);
            const errorMessage = "Sorry, I encountered an error. Please check your connection or API key.";
            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
            speak(errorMessage);
        } finally {
            setIsProcessing(false);
            // resetTranscript(); // Moved to top
        }
    }, [history, resetTranscript, isProcessing, navigate, transcript, stopListening, speak]);

    // Auto-send when silence is detected or listening stops
    useEffect(() => {
        console.log('🔍 Auto-send check:', { listening, transcript, isProcessing });
        if (!listening && transcript && !isProcessing) {
            console.log('✅ Triggering handleSend with:', transcript);
            handleSend(transcript);
        }
    }, [listening, transcript, handleSend, isProcessing, navigate]);

    // Debug: Log transcript changes
    useEffect(() => {
        if (transcript) {
            console.log('📝 Transcript updated:', transcript, '| Listening:', listening);
        }
    }, [transcript, listening]);

    // Voice Activity Detection - Auto-send after 1.5s silence
    useEffect(() => {
        if (listening && transcript) {
            // Clear existing timer
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }

            // Check if transcript changed
            if (transcript !== lastTranscriptRef.current) {
                lastTranscriptRef.current = transcript;

                // Set new timer for 1.5s silence
                silenceTimerRef.current = setTimeout(() => {
                    if (transcript.trim()) {
                        handleSend();
                    }
                }, 1500);
            }
        }
    }, [transcript, listening, handleSend]);

    const speak = React.useCallback((text, onEnd) => {
        if (!text) return;

        // If muted, just log and skip audio, but ensure onEnd is called to proceed with tours etc if needed
        if (isMuted) {
            console.log('🔇 Agent is muted. Skipping audio:', text);
            if (onEnd) setTimeout(onEnd, 1000); // Fake delay for pacing
            return;
        }

        console.log('🗣️ Speaking:', text);

        setAgentState('speaking');

        // Remove markdown or heavy formatting if needed for TTS
        const cleanText = text.replace(/[*#_]/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        // Store reference to prevent GC
        window.currentUtterance = utterance;

        // Try to find the best natural-sounding English voice
        let voices = window.speechSynthesis.getVoices();

        // Retry getting voices if empty
        if (voices.length === 0) {
            setTimeout(() => {
                voices = window.speechSynthesis.getVoices();
                // ... logic could be retried but default voice works
            }, 100);
        }

        // Priority list for most natural voices:
        const bestVoice =
            voices.find(v => v.name === 'Google UK English Female') ||
            voices.find(v => v.name === 'Microsoft David Desktop - English (United States)') ||
            voices.find(v => v.name === 'Microsoft Zira Desktop - English (United States)') ||
            voices.find(v => v.name === 'Google US English') ||
            voices.find(v => v.name.includes('Google') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Microsoft') && v.lang.includes('en')) ||
            voices.find(v => v.lang === 'en-GB') ||
            voices.find(v => v.lang === 'en-US') ||
            voices.find(v => v.lang.includes('en'));

        if (bestVoice) {
            utterance.voice = bestVoice;
            console.log('Using voice:', bestVoice.name);
        }

        // Adjust for more natural speech
        utterance.rate = 0.95;  // Slightly slower for clarity
        utterance.pitch = 1.0;  // Natural pitch
        utterance.volume = 1.0; // Full volume

        // Set state back to idle when done speaking
        utterance.onend = () => {
            console.log('✅ Speech ended');
            setAgentState('idle');
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.error('❌ Speech error:', e);
            setAgentState('idle');
            if (onEnd) onEnd(); // Proceed anyway
        };

        window.speechSynthesis.cancel(); // Cancel previous
        window.speechSynthesis.speak(utterance);
    }, [isMuted]);

    const addMessage = (role, content) => {
        setMessages(prev => [...prev, { role, content }]);
    };

    if (!browserSupportsSpeechRecognition) {
        return null; // Or render a fallback UI
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Welcome Tour Modal */}
            {showWelcome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-blue-100 dark:border-blue-900 mx-auto">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center animate-bounce">
                                <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                            Welcome to Digital AI Hub!
                        </h3>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 font-medium">
                            I'm your AI assistant. Would you like a quick guided voice tour of our platform?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowWelcome(false);
                                    localStorage.setItem('hasVisited_v3', 'true');
                                    window.speechSynthesis.cancel();
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                No, Thanks
                            </button>
                            <button
                                onClick={() => {
                                    setShowWelcome(false);
                                    setTourActive(true);
                                    setIsOpen(false); // Hide agent UI to focus on tour
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all shadow-blue-500/20"
                            >
                                Start Tour
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 md:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[500px] transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6" />
                            <span className="font-semibold">AI Assistant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                                title={isMuted ? "Unmute Voice" : "Mute Voice"}
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 min-h-[300px]">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {listening && (
                            <div className="flex flex-col items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-blue-600 rounded-full animate-pulse"
                                            style={{
                                                height: `${Math.random() * 20 + 10}px`,
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: '0.6s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-blue-600 font-medium">Listening... {transcript}</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                        {/* Status Indicator (Compact) */}
                        {(agentState !== 'idle' || listening) && (
                            <div className="flex justify-center">
                                <span className="text-xs font-bold text-blue-600 animate-pulse">
                                    {listening ? 'Listening...' : agentState === 'processing' ? 'Thinking...' : 'Speaking...'}
                                </span>
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            {/* Mic Button */}
                            <button
                                onClick={listening ? stopListening : startListening}
                                disabled={isProcessing}
                                className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${listening
                                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-200'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                title={listening ? "Stop Listening" : "Start Voice Input"}
                            >
                                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            {/* Text Input */}
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(inputText);
                                        }
                                    }}
                                    placeholder={listening ? "Listening..." : "Type a message..."}
                                    className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 resize-none max-h-24 min-h-[46px]"
                                    rows={1}
                                    disabled={listening}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={() => handleSend(inputText)}
                                disabled={!inputText.trim() || isProcessing || listening}
                                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-lg flex-shrink-0"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ring-4 ring-blue-100 dark:ring-blue-900/30"
                >
                    <Bot className="w-8 h-8" />
                    <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Ask AI Assistant
                    </span>
                </button>
            )}
        </div>
    );
};

export default VoiceAgent;

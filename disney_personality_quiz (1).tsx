import React, { useState } from 'react';
import { Sparkles, RefreshCw, ArrowRight, CheckCircle2, Volume2, Trophy, Heart } from 'lucide-react';

// Speech Synthesis Helper using Web Audio API & Gemini TTS Endpoint
async function playCharacterVoice(text, voiceName = "Puck") {
  try {
    const apiKey = "";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      })
    });

    const data = await response.json();
    const base64Pcm = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    if (!base64Pcm) return;

    const binaryStr = atob(base64Pcm);
    const len = binaryStr.length;
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      bytes[i / 2] = binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8);
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    const buffer = audioCtx.createBuffer(1, bytes.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < bytes.length; i++) {
      channelData[i] = bytes[i] / 32768;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  } catch (err) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
}

const questions = [
  {
    id: 1,
    question: "You're planning a trip to a famous theme park with your best friends. What's your official role?",
    options: [
      { text: "The Group Leader: I made the color-coded itinerary, booked the tickets, and packed snacks for everyone!", character: "mickey" },
      { text: "The Reluctant Traveler: I got stuck holding all the bags, and the line for ice cream is WAY too long!", character: "donald" },
      { text: "The Adventure Enthusiast: I brought a giant map upside down, dropped my hat twice, and bought extra popcorn!", character: "goofy" }
    ]
  },
  {
    id: 2,
    question: "You accidentally spill juice on your shirt right before a big event. What happens next?",
    options: [
      { text: "Stay calm, laugh it off, and quickly find a creative way to make it look intentional!", character: "mickey" },
      { text: "Jump up and down, squawk in disbelief, and wonder why bad luck always finds me!", character: "donald" },
      { text: "Try to wipe it, trip over a footstool, and somehow spill the rest of the juice on the rug!", character: "goofy" }
    ]
  },
  {
    id: 3,
    question: "What's your ultimate secret weapon when facing a tricky challenge?",
    options: [
      { text: "Unstoppable optimism and teamwork—we can accomplish anything together!", character: "mickey" },
      { text: "Sheer determination and fiery grit (even if I get super loud along the way!).", character: "donald" },
      { text: "Creative out-of-the-box thinking that makes zero logical sense, but somehow works!", character: "goofy" }
    ]
  },
  {
    id: 4,
    question: "How do you prefer to spend a rainy Saturday afternoon?",
    options: [
      { text: "Hosting a cozy game night or movie marathon for the whole crew.", character: "mickey" },
      { text: "Napping peacefully... until the rain starts tapping too loudly on the window!", character: "donald" },
      { text: "Building a fort out of sofa cushions that immediately collapses into a pile of giggles.", character: "goofy" }
    ]
  },
  {
    id: 5,
    question: "Pick your favorite classic signature look:",
    options: [
      { text: "A bright pair of iconic yellow shoes and clean white gloves.", character: "mickey" },
      { text: "A trusty blue sailor cap that shows off my bold personality.", character: "donald" },
      { text: "A tall, slightly rumpled green hat full of charm.", character: "goofy" }
    ]
  },
  {
    id: 6,
    question: "You're entering a talent show! What's your performance?",
    options: [
      { text: "A cheerful tap dance and song routine that gets the whole audience clapping!", character: "mickey" },
      { text: "A dramatic speech or opera song—until my voice cracks and I stomp off stage!", character: "donald" },
      { text: "A unicycle juggler act where I lose control and end up landing in the tubas!", character: "goofy" }
    ]
  },
  {
    id: 7,
    question: "When a friend asks you for advice, what do you usually say?",
    options: [
      { text: "'Keep your chin up! Every cloud has a silver lining, pal!'", character: "mickey" },
      { text: "'Don't let anyone push you around! Speak your mind!'", character: "donald" },
      { text: "'Gawrsh, if at first you don't succeed, try doing it backwards!'", character: "goofy" }
    ]
  },
  {
    id: 8,
    question: "How do you handle a disagreement with a friend?",
    options: [
      { text: "Talk it out calmly, listen to their side, and find a fair compromise.", character: "mickey" },
      { text: "Vent out loud for two minutes, get it out of my system, then immediately forget about it.", character: "donald" },
      { text: "Scratch my head in confusion, make a silly face, and instantly dissolve the tension with laughter.", character: "goofy" }
    ]
  },
  {
    id: 9,
    question: "What's your dream vacation spot?",
    options: [
      { text: "A classic castle town full of magic, parades, and old friends.", character: "mickey" },
      { text: "A private beach resort where nobody disturbs my quiet hammock time!", character: "donald" },
      { text: "Camping out under the stars with a shaky tent and roasting marshmallows over a campfire.", character: "goofy" }
    ]
  },
  {
    id: 10,
    question: "At the end of the day, what matters most to you?",
    options: [
      { text: "Making sure everyone feels included, happy, and hopeful for tomorrow.", character: "mickey" },
      { text: "Being recognized for my hard work and standing up for myself.", character: "donald" },
      { text: "Having fun, enjoying the little mishaps, and making people smile.", character: "goofy" }
    ]
  }
];

const results = {
  mickey: {
    name: "Mickey Mouse",
    catchphrase: "Say, that's swell! Oh boy!",
    voicePrompt: "Say enthusiastically: Oh boy! That's swell!",
    voiceName: "Puck",
    emoji: "🐭",
    description: "You are an optimistic, warm-hearted leader! You naturally inspire the people around you with your positive energy and can-do attitude. No matter how tough a problem gets, you always believe that friendship and determination will save the day.",
    traits: ["Optimistic", "Natural Leader", "Loyal", "Energetic"],
    color: "bg-red-500",
    lightColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-500"
  },
  donald: {
    name: "Donald Duck",
    catchphrase: "Aw, phooey! Nobody understands me!",
    voicePrompt: "Say angrily then triumphantly: Aw phooey! I'm number one!",
    voiceName: "Fenrir",
    emoji: "🦆",
    description: "You are fiery, passionate, and fiercely independent! While you might lose your temper when things don't go according to plan, you have one of the biggest hearts around. You never give up, no matter how many obstacles stand in your way.",
    traits: ["Passionate", "Determined", "Expressive", "Protective"],
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-500"
  },
  goofy: {
    name: "Goofy",
    catchphrase: "Gawrsh! A-hyuck!",
    voicePrompt: "Say playfully: Gawrsh! A hyuck! That sure was fun!",
    voiceName: "Charon",
    emoji: "🐶",
    description: "You are wonderfully carefree, imaginative, and endlessly funny! You don't let small mistakes get you down—in fact, you turn life's stumbles into memorable adventures. You bring pure, unvarnished joy and laughter everywhere you go.",
    traits: ["Easygoing", "Hilarious", "Creative", "Good-natured"],
    color: "bg-green-500",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-500"
  }
};

export default function App() {
  const [currentStep, setCurrentStep] = useState('intro'); // 'intro', 'quiz', 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({ mickey: 0, donald: 0, goofy: 0 });
  const [winningCharacter, setWinningCharacter] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const startQuiz = () => {
    setCurrentStep('quiz');
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScores({ mickey: 0, donald: 0, goofy: 0 });
  };

  const handleAnswer = (character, optionIdx) => {
    setSelectedOptionIndex(optionIdx);

    setTimeout(() => {
      const newScores = { ...scores, [character]: scores[character] + 1 };
      setScores(newScores);
      setSelectedOptionIndex(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        calculateResult(newScores);
      }
    }, 300);
  };

  const calculateResult = (finalScores) => {
    let highestScore = -1;
    let winner = 'mickey';

    for (const [character, score] of Object.entries(finalScores)) {
      if (score > highestScore) {
        highestScore = score;
        winner = character;
      }
    }

    setWinningCharacter(winner);
    setCurrentStep('result');

    if (results[winner]) {
      setIsPlayingAudio(true);
      playCharacterVoice(results[winner].voicePrompt, results[winner].voiceName)
        .finally(() => setIsPlayingAudio(false));
    }
  };

  const speakResult = () => {
    if (winningCharacter && results[winningCharacter]) {
      setIsPlayingAudio(true);
      playCharacterVoice(results[winningCharacter].voicePrompt, results[winningCharacter].voiceName)
        .finally(() => setIsPlayingAudio(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 border border-white/50">
        
        {/* Intro Screen */}
        {currentStep === 'intro' && (
          <div className="p-8 md:p-12 text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 p-1 rounded-full shadow-xl">
                <div className="bg-white p-4 rounded-full">
                  <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
              Mickey, Donald, or Goofy?
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
              Find out which classic Disney icon matches your personality! Are you the cheerful leader Mickey, the fiery Donald, or the hilarious Goofy?
            </p>

            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {Object.values(results).map((char) => (
                <span key={char.name} className="bg-gray-100 px-4 py-2 rounded-full text-base font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                  {char.emoji} {char.name}
                </span>
              ))}
            </div>

            <button
              onClick={startQuiz}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-extrabold text-xl py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center mx-auto gap-3"
            >
              Start Personality Quiz <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Quiz Screen */}
        {currentStep === 'quiz' && (
          <div className="p-6 md:p-10 animate-fade-in">
            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-red-500 font-extrabold">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 p-0.5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 leading-snug">
              {questions[currentQuestionIndex].question}
            </h2>

            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.character, index)}
                    className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 shadow-sm text-base md:text-lg font-medium ${
                      isSelected 
                        ? 'border-red-500 bg-red-50 text-red-900 scale-[1.01]' 
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50 bg-white text-gray-700'
                    }`}
                  >
                    <div className={`rounded-full p-1 mt-0.5 transition-colors ${
                      isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="flex-1 leading-relaxed">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result Screen */}
        {currentStep === 'result' && winningCharacter && (
          <div className="animate-fade-in">
            <div className={`${results[winningCharacter].color} h-36 md:h-48 relative flex items-center justify-center`}>
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="bg-white p-3 rounded-full shadow-2xl text-7xl w-36 h-36 flex items-center justify-center border-4 border-white transform hover:scale-105 transition-transform">
                  {results[winningCharacter].emoji}
                </div>
              </div>
            </div>
            
            <div className="pt-20 pb-10 px-6 md:px-12 text-center">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-3">
                <Trophy className="w-4 h-4" /> Personality Match Found
              </div>
              
              <h1 className={`text-4xl md:text-5xl font-black mb-1 ${results[winningCharacter].textColor}`}>
                {results[winningCharacter].name}
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                <p className="text-lg font-semibold italic">"{results[winningCharacter].catchphrase}"</p>
                <button 
                  onClick={speakResult}
                  disabled={isPlayingAudio}
                  title="Hear catchphrase"
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                >
                  <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce text-red-500' : ''}`} />
                </button>
              </div>

              {/* Key Traits Badges */}
              <div className="flex justify-center gap-2 flex-wrap mb-6">
                {results[winningCharacter].traits.map((trait, i) => (
                  <span key={i} className={`${results[winningCharacter].lightColor} ${results[winningCharacter].textColor} font-bold px-3 py-1 rounded-lg text-sm border ${results[winningCharacter].borderColor}`}>
                    ✨ {trait}
                  </span>
                ))}
              </div>

              {/* Description Box */}
              <div className={`${results[winningCharacter].lightColor} p-6 rounded-2xl mb-8 text-left border ${results[winningCharacter].borderColor}`}>
                <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                  {results[winningCharacter].description}
                </p>
              </div>

              {/* Score Breakdown Section */}
              <div className="mb-8 bg-gray-50 p-5 rounded-2xl text-left border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" /> Full Character Match Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([charKey, score]) => {
                      const percentage = Math.round((score / questions.length) * 100);
                      const charData = results[charKey];
                      return (
                        <div key={charKey} className="space-y-1">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="flex items-center gap-2">
                              <span>{charData.emoji}</span>
                              <span className="text-gray-800">{charData.name}</span>
                            </span>
                            <span className="text-gray-500">{percentage}% ({score} pts)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${charData.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <button
                onClick={startQuiz}
                className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all flex items-center mx-auto gap-2"
              >
                <RefreshCw className="w-5 h-5" /> Retake Personality Quiz
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
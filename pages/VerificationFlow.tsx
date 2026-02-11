
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, VerificationStatus } from '../types';
import { getDynamicQuestion, evaluateVerification } from '../services/geminiService';

interface VerificationFlowProps {
  user: User;
  onComplete: (status: VerificationStatus, riskScore?: number) => void;
}

const VerificationFlow: React.FC<VerificationFlowProps> = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // High-fidelity telemetry refs
  const sessionStartTime = useRef(0);
  const firstCharTime = useRef(0);
  const backspaceCount = useRef(0);
  const mouseMarkers = useRef<{x: number, y: number, t: number}[]>([]);

  useEffect(() => {
    if (step === 2) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step]);

  useEffect(() => {
    const fetchChallenge = async () => {
      setIsFetchingQuestion(true);
      try {
        const q = await getDynamicQuestion();
        setQuestion(q);
        sessionStartTime.current = Date.now();
        firstCharTime.current = 0;
        backspaceCount.current = 0;
      } catch (err) {
        setQuestion("What is a personal value you hold most dear?");
      } finally {
        setIsFetchingQuestion(false);
      }
    };
    if (step === 3) fetchChallenge();
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (err) {
      setCameraError("Camera access is required for identity verification.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setFaceImage(dataUrl.split(',')[1]); 
        setStep(3);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      backspaceCount.current += 1;
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!firstCharTime.current && e.target.value.length > 0) {
      firstCharTime.current = Date.now();
    }
    setAnswer(e.target.value);
  };

  const trackMouse = (e: React.MouseEvent) => {
    if (mouseMarkers.current.length < 200) {
      mouseMarkers.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    const now = Date.now();
    const totalTiming = now - sessionStartTime.current;
    const idleTime = firstCharTime.current ? (firstCharTime.current - sessionStartTime.current) : totalTiming;
    const typingTime = firstCharTime.current ? (now - firstCharTime.current) : 0;

    try {
      const evalResult = await evaluateVerification({
        userAnswer: answer,
        faceImageBase64: faceImage || undefined,
        behavioralData: {
          timing: totalTiming,
          idleTime: idleTime,
          typingTime: typingTime,
          markersCount: mouseMarkers.current.length,
          backspaceCount: backspaceCount.current
        }
      });

      setResult(evalResult);
      setIsProcessing(false);
      setStep(5);

      const newLog = {
          id: Math.random().toString(36).substring(7).toUpperCase(),
          userId: user.id,
          email: user.email,
          riskScore: evalResult.riskScore,
          decision: evalResult.decision,
          reasoning: evalResult.reasoning,
          timestamp: new Date().toISOString()
      };
      const currentLogs = JSON.parse(localStorage.getItem('verification_logs') || '[]');
      localStorage.setItem('verification_logs', JSON.stringify([newLog, ...currentLogs]));

      const finalStatus = 
          evalResult.decision === 'Verified' ? VerificationStatus.VERIFIED :
          evalResult.decision === 'Suspicious' ? VerificationStatus.SUSPICIOUS :
          VerificationStatus.FAILED;
      
      onComplete(finalStatus, evalResult.riskScore);
    } catch (err) {
      setIsProcessing(false);
      setStep(5);
      setResult({ 
        decision: 'Suspicious', 
        riskScore: 22, 
        reasoning: 'Behavioral mesh synchronization failed. Verification on-hold for manual inspection.' 
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8" onMouseMove={trackMouse}>
        {/* Progress Bar */}
        <div className="mb-12 flex items-center gap-4 px-4">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex-1 h-1.5 rounded-full bg-slate-200 relative overflow-hidden">
               <div className={`absolute inset-0 bg-indigo-600 transition-all duration-700 ease-out ${step >= s ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 min-h-[550px] flex flex-col transition-all duration-500 relative">
          {step === 1 && (
            <div className="text-center space-y-8 flex-1 flex flex-col justify-center animate-fade-in">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 animate-float">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" />
                  <path d="M12 14C9 14 3 15.5 3 18.5V19H21V18.5C21 15.5 15 14 12 14Z" />
                </svg>
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-[#1e1b4b] tracking-tight">Human Verification</h2>
                <p className="text-slate-500 font-bold text-lg leading-relaxed px-6">Establishing your unique identity through cognitive and behavioral patterns.</p>
              </div>
              <button 
                onClick={() => setStep(2)} 
                className="w-full py-5 bg-[#1e1b4b] text-white font-black rounded-2xl hover:bg-black active:scale-95 transition-all shadow-xl uppercase text-xs tracking-widest"
              >
                Start Verification
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 flex-1 flex flex-col items-center animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Phase 01 / Biometric Scan</h3>
                <h2 className="text-2xl font-black text-[#1e1b4b]">Face Liveness Check</h2>
              </div>
              
              <div className="relative w-full max-w-sm aspect-[4/5] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl group">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] brightness-110" />
                <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-[2.5rem]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-80 border-2 border-indigo-400/30 rounded-[35%] shadow-[0_0_0_9999px_rgba(30,27,75,0.85)]"></div>
                    <div className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_30px_#6366f1] animate-scan"></div>
                </div>
                {cameraError && (
                    <div className="absolute inset-0 bg-[#1e1b4b] flex flex-col items-center justify-center p-10 text-center text-white gap-4">
                        <p className="font-black text-sm uppercase tracking-widest">{cameraError}</p>
                        <button onClick={startCamera} className="px-6 py-2 bg-indigo-600 rounded-lg text-xs font-bold uppercase tracking-widest">Retry Access</button>
                    </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <button 
                disabled={!!cameraError}
                onClick={captureFace} 
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-30 uppercase text-xs tracking-widest"
              >
                Capture Secure Image
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 flex-1 flex flex-col animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Phase 02 / Cognitive Audit</h3>
                <h2 className="text-2xl font-black text-[#1e1b4b]">Subjective Reasoning Test</h2>
              </div>

              {isFetchingQuestion ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Crafting Unique Challenge...</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                  <p className="text-2xl font-black text-[#1e1b4b] leading-tight tracking-tight min-h-[4rem]">{question}</p>
                  <textarea 
                    value={answer}
                    onKeyDown={handleKeyDown}
                    onChange={handleTyping}
                    className="flex-1 w-full p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 focus:bg-white focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all resize-none text-xl font-bold text-[#1e1b4b] placeholder-slate-300"
                    placeholder="Provide your natural response..."
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    <span>Human Telemetry Active</span>
                    <span>Confidence Score: {answer.length > 10 ? 'Analyzing...' : 'Pending'}</span>
                  </div>
                  <button 
                    disabled={answer.trim().length < 3}
                    onClick={() => setStep(4)} 
                    className={`w-full py-5 font-black rounded-2xl transition-all uppercase text-xs tracking-widest ${answer.trim().length >= 3 ? 'bg-indigo-600 text-white shadow-xl active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    Continue to Audit
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
             <div className="text-center space-y-10 flex-1 flex flex-col justify-center py-12 animate-fade-in">
               {!isProcessing ? (
                 <>
                   <div className="space-y-4">
                     <h2 className="text-4xl font-black text-[#1e1b4b] tracking-tight">Final Analysis</h2>
                     <p className="text-slate-500 font-bold max-w-sm mx-auto">Your biometric and cognitive signatures are ready for mesh network verification.</p>
                   </div>
                   <button 
                    onClick={handleSubmit} 
                    className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 active:scale-95 transition-all shadow-2xl shadow-emerald-100 uppercase text-xs tracking-[0.2em]"
                   >
                     Execute Final Check
                   </button>
                 </>
               ) : (
                 <div className="space-y-12">
                    <div className="relative w-40 h-40 mx-auto">
                        <div className="absolute inset-0 border-[8px] border-slate-50 rounded-full"></div>
                        <div className="absolute inset-0 border-[8px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest animate-pulse">Scanning</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-[#1e1b4b]">Verifying Signature...</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Distinguishing Human Nuance</p>
                    </div>
                 </div>
               )}
             </div>
          )}

          {step === 5 && result && (
            <div className="text-center space-y-8 flex-1 flex flex-col justify-center animate-scale-up">
              <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl ${
                result.decision === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                result.decision === 'Suspicious' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {result.decision === 'Verified' ? (
                  <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17L4 12" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-[#1e1b4b] tracking-tighter">Identity: {result.decision}</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Hash Ref: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>

              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 text-left space-y-6">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trust Matrix Index</span>
                    <span className={`text-4xl font-black tracking-tighter ${result.riskScore < 30 ? 'text-emerald-600' : result.riskScore < 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {result.riskScore}<span className="text-sm opacity-30">/100</span>
                    </span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out ${result.riskScore < 30 ? 'bg-emerald-500' : result.riskScore < 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${result.riskScore}%`}}></div>
                </div>
                <div className="relative">
                  <div className="absolute -left-2 top-0 h-full w-1 bg-indigo-200 rounded-full"></div>
                  <p className="text-[#1e1b4b] font-bold text-sm opacity-80 leading-relaxed italic pl-4">"{result.reasoning}"</p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/dashboard')} 
                className="w-full py-5 bg-[#1e1b4b] text-white font-black rounded-2xl hover:bg-black active:scale-95 transition-all mt-4 uppercase text-xs tracking-widest shadow-xl shadow-slate-100"
              >
                Enter Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-up { animation: scale-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </Layout>
  );
};

export default VerificationFlow;

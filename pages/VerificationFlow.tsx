
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
  const [question, setQuestion] = useState('Loading verification challenge...');
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTime = useRef(Date.now());
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
      try {
        const q = await getDynamicQuestion();
        setQuestion(q);
        startTime.current = Date.now();
      } catch (err) {
        setQuestion("What is a personal value you hold most dear?");
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
      setCameraError("Camera access is required for identity verification. Please enable permissions in browser settings.");
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

  const trackMouse = (e: React.MouseEvent) => {
    if (mouseMarkers.current.length < 100) {
      mouseMarkers.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    }
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    const duration = Date.now() - startTime.current;

    try {
      const evalResult = await evaluateVerification({
        userAnswer: answer,
        faceImageBase64: faceImage || undefined,
        behavioralData: {
          timing: duration,
          markersCount: mouseMarkers.current.length
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
      setResult({ decision: 'Suspicious', riskScore: 50, reasoning: 'Kernel logic mismatch.' });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8" onMouseMove={trackMouse}>
        <div className="mb-12 flex items-center gap-4">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex-1 h-2 rounded-full bg-slate-200 relative overflow-hidden">
               <div className={`absolute inset-0 bg-indigo-600 transition-all duration-700 ease-out ${step >= s ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 min-h-[500px] flex flex-col transition-all duration-300 overflow-hidden">
          {step === 1 && (
            <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h2 className="text-3xl font-black text-[#1e1b4b] tracking-tight">Identity Mesh Protocol</h2>
              <p className="text-[#1e1b4b] opacity-70 text-lg font-bold">To verify your status, we will process your biometric signature and logical reasoning patterns.</p>
              <button 
                type="button"
                onClick={handleNextStep} 
                className="w-full py-4 bg-[#1e1b4b] text-white font-black rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg uppercase text-xs tracking-[0.2em]"
              >
                Initiate Secure Scan
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 flex-1 flex flex-col items-center">
              <h3 className="text-xs font-black text-[#1e1b4b] opacity-40 uppercase tracking-[0.3em]">Biometric Signature Capture</h3>
              
              <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-slate-50">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-80 border-2 border-indigo-400/40 rounded-[40%] shadow-[0_0_0_9999px_rgba(30,27,75,0.7)]"></div>
                    <div className="absolute inset-x-0 h-0.5 bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,1)] animate-scan"></div>
                </div>
                {cameraError && (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-10 text-center text-white font-black text-sm uppercase tracking-widest leading-relaxed">
                        {cameraError}
                    </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="w-full space-y-3">
                <button 
                  type="button"
                  disabled={!!cameraError}
                  onClick={captureFace} 
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
                >
                  Confirm Identity Scan
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 flex-1">
              <h3 className="text-xs font-black text-[#1e1b4b] opacity-40 uppercase tracking-[0.3em]">Semantic Consistency Test</h3>
              <p className="text-2xl font-black text-[#1e1b4b] leading-tight min-h-[4rem] tracking-tight">{question}</p>
              <textarea 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-6 h-40 bg-slate-50 rounded-3xl border border-slate-200 focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all resize-none text-lg font-bold text-[#1e1b4b] placeholder-slate-400"
                placeholder="Compose your response naturally..."
                autoFocus
              />
              <button 
                type="button"
                disabled={answer.length < 5}
                onClick={handleNextStep} 
                className={`w-full py-4 font-black rounded-2xl transition-all uppercase text-xs tracking-widest ${answer.length >= 5 ? 'bg-indigo-600 text-white shadow-xl active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                Process Reasoning
              </button>
            </div>
          )}

          {step === 4 && (
             <div className="text-center space-y-8 flex-1 flex flex-col justify-center py-12">
               {!isProcessing ? (
                 <>
                   <h2 className="text-3xl font-black text-[#1e1b4b] tracking-tight">Consolidate Signature</h2>
                   <p className="text-[#1e1b4b] font-bold opacity-70">The AI kernel is ready to perform a cross-mesh analysis of your face scan and behavioral signals.</p>
                   <button 
                    type="button"
                    onClick={handleSubmit} 
                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-xl uppercase text-xs tracking-[0.2em]"
                   >
                     Finalize Kernel Analysis
                   </button>
                 </>
               ) : (
                 <div className="space-y-10 animate-pulse">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#1e1b4b]">Analyzing Vectors...</h2>
                        <p className="text-[#1e1b4b] font-bold opacity-50 mt-2 uppercase text-[10px] tracking-[0.2em]">Checking biometric liveness & interaction logic</p>
                    </div>
                 </div>
               )}
             </div>
          )}

          {step === 5 && result && (
            <div className="text-center space-y-8 flex-1 flex flex-col justify-center animate-fade-in">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl ${
                result.decision === 'Verified' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' :
                result.decision === 'Suspicious' ? 'bg-amber-50 text-amber-600 shadow-amber-100' : 'bg-rose-50 text-rose-600 shadow-rose-100'
              }`}>
                {result.decision === 'Verified' ? (
                  <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17L4 12"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
              </div>
              
              <h2 className="text-4xl font-black text-[#1e1b4b] tracking-tighter">Status: {result.decision}</h2>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#1e1b4b] opacity-40 uppercase tracking-[0.2em]">Risk Potential</span>
                    <span className={`text-2xl font-black ${result.riskScore < 30 ? 'text-emerald-600' : result.riskScore < 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {result.riskScore}/100
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${result.riskScore < 30 ? 'bg-emerald-500' : result.riskScore < 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${result.riskScore}%`}}></div>
                </div>
                <p className="text-[#1e1b4b] font-bold italic text-sm opacity-80 leading-relaxed">"{result.reasoning}"</p>
              </div>

              <button 
                type="button"
                onClick={() => navigate('/dashboard')} 
                className="w-full py-5 bg-[#1e1b4b] text-white font-black rounded-2xl hover:bg-black active:scale-95 transition-all mt-4 uppercase text-xs tracking-widest"
              >
                Access Trusted Shell
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VerificationFlow;

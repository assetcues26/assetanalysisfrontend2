import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import {
  ProcessingAnimation,
  ShimmerProgressBar,
} from '../components/processing/ProcessingAnimation';
import { StatusCycler } from '../components/processing/StatusCycler';
import { Button } from '@/components/ui/button';
import { HeroSection } from '../components/layout/HeroSection';
import { useMergedBatch } from '../hooks/useMergedBatch';
import { useHistory } from '../hooks/useHistory';
import { useSession } from '../hooks/useSession';
import { useApp } from '../context/AppContext';
import { analyzeImages } from '../services/analysisService';
import { fetchCaptureSession } from '../services/sessionApi';

const ANALYSIS_TIMEOUT_MS = 120_000;

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Analysis is taking longer than expected. Please try again.')),
      ms,
    );
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function ProcessingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get('session');

  const { batchImages, batchCount, clearBatch } = useMergedBatch();
  const { addEntry } = useHistory();
  const { attachToken, clearSession } = useSession();
  const { setLastResult, setAnalysisError, analysisError, uploadProcessingMode } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionImageCount, setSessionImageCount] = useState(0);
  const runIdRef = useRef(0);
  const completedRef = useRef(false);
  const startedBatchKeyRef = useRef(null);
  const sawAnalyzingRef = useRef(false);
  const analyzingSinceRef = useRef(null);

  const batchKey = useMemo(
    () => batchImages.map((img) => img.id).sort().join('|'),
    [batchImages],
  );

  const readyImages = useMemo(
    () => batchImages.filter((img) => img.file instanceof File),
    [batchImages],
  );

  const analyzableCount = readyImages.length;

  useEffect(() => {
    if (sessionToken) {
      attachToken(sessionToken);
    }
  }, [sessionToken, attachToken]);

  useEffect(() => {
    if (!sessionToken) return undefined;

    let cancelled = false;
    setIsAnalyzing(true);
    setAnalysisError(null);
    completedRef.current = false;
    sawAnalyzingRef.current = false;

    const poll = async () => {
      try {
        const data = await fetchCaptureSession(sessionToken);
        if (cancelled) return;
        setSessionImageCount(data.image_count || 0);

        if (data.status === 'analyzing') {
          sawAnalyzingRef.current = true;
          if (!analyzingSinceRef.current) {
            analyzingSinceRef.current = Date.now();
          }
          if (Date.now() - analyzingSinceRef.current > ANALYSIS_TIMEOUT_MS) {
            setAnalysisError('Analysis timed out. Return to batch and try again.');
            setIsAnalyzing(false);
          }
        }

        if (data.status === 'completed' && data.entry_id) {
          completedRef.current = true;
          clearBatch();
          clearSession();
          navigate(`/result/${data.entry_id}`, { replace: true });
          return;
        }

        if (data.status === 'expired') {
          setAnalysisError('This scan session has expired. Start a new session on your computer.');
          setIsAnalyzing(false);
          return;
        }

        if (data.status === 'active' && sawAnalyzingRef.current) {
          setAnalysisError('Analysis was interrupted. Return to batch and try again.');
          setIsAnalyzing(false);
        }
      } catch (err) {
        if (!cancelled) {
          setAnalysisError(err.message || 'Could not track session analysis');
          setIsAnalyzing(false);
        }
      }
    };

    poll();
    const id = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sessionToken, navigate, clearBatch, clearSession, setAnalysisError]);

  useEffect(() => {
    if (sessionToken) return undefined;

    if (batchCount === 0) {
      if (!isAnalyzing && !completedRef.current) {
        navigate('/', { replace: true });
      }
      return undefined;
    }

    if (analyzableCount === 0) {
      setAnalysisError('Missing image files — remove items and re-upload from capture or upload.');
      setIsAnalyzing(false);
      return undefined;
    }

    if (startedBatchKeyRef.current === batchKey) return undefined;
    startedBatchKeyRef.current = batchKey;

    const runId = ++runIdRef.current;
    setAnalysisError(null);
    setIsAnalyzing(true);
    completedRef.current = false;

    withTimeout(
      analyzeImages(readyImages, { processingMode: uploadProcessingMode }),
      ANALYSIS_TIMEOUT_MS,
    )
      .then(async (result) => {
        if (runId !== runIdRef.current) return;
        const entry = await addEntry({
          ...result,
          mergedImageUrl: result.mergedImageUrl ?? null,
          previewUrls: result.previewUrls ?? [],
        });
        setLastResult(entry);
        setAnalysisError(null);
        clearBatch();
        completedRef.current = true;
        navigate(`/result/${entry.id}`, { replace: true });
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        setAnalysisError(err.message || 'Analysis failed');
      })
      .finally(() => {
        if (runId === runIdRef.current) {
          setIsAnalyzing(false);
        }
      });

    return () => {
      runIdRef.current += 1;
      startedBatchKeyRef.current = null;
    };
  }, [
    sessionToken,
    batchKey,
    analyzableCount,
    readyImages,
    uploadProcessingMode,
    addEntry,
    setLastResult,
    setAnalysisError,
    clearBatch,
    navigate,
  ]);

  const displayCount = sessionToken ? sessionImageCount : analyzableCount;

  if (!sessionToken && batchCount === 0 && !isAnalyzing && !analysisError) return null;

  if (analysisError && !isAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8">
        <AlertCircle size={56} className="text-red-400" />
        <h1 className="text-xl font-bold text-gray-900">Analysis failed</h1>
        <p className="max-w-md text-center text-gray-600">{analysisError}</p>
        <p className="max-w-md text-center text-sm text-gray-500">
          You can analyze 1–10 images per batch (collage or multi-image mode). Check processing
          settings on the home page if one mode fails.
        </p>
        <Button onClick={() => navigate(sessionToken ? '/upload' : '/batch')}>Try Again</Button>
      </div>
    );
  }

  return (
    <HeroSection className="min-h-screen">
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <ProcessingAnimation />
          <p className="mt-6 text-center text-sm text-gray-600">
            Analyzing {displayCount} image{displayCount === 1 ? '' : 's'}… This may take up to a
            minute.
          </p>
          <div className="mt-10 w-full max-w-md">
            <StatusCycler />
          </div>
        </motion.div>

        <div className="absolute bottom-16 left-6 right-6 z-10 mx-auto max-w-2xl">
          <ShimmerProgressBar />
        </div>
      </div>
    </HeroSection>
  );
}

import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { CompactHeader } from '../../components/layout/AppHeader';

import { BackButton } from '../../components/ui/BackButton';

import { DropZone } from '../../components/upload/DropZone';

import { PageWrapper } from '../../components/layout/PageWrapper';

import { useApp } from '../../context/AppContext';

import { useMobileSession } from '../../hooks/useMobileSession';

import { fetchCaptureSession, uploadSessionImagesPrepared } from '../../services/sessionApi';

import { UPLOAD_MAX_TOTAL_MB } from '../../utils/imageCompression';



export function MobileUploadPage() {

  const { token } = useParams();

  const navigate = useNavigate();

  const { showToast } = useApp();

  const { maxImages, imageCount, canAdd, refresh } = useMobileSession(token);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState(null);



  const handleFiles = async (files) => {

    if (!files.length || !token || !canAdd) return;

    setUploading(true);

    setError(null);

    try {

      const slots = Math.max(0, maxImages - imageCount);

      const accepted = files.slice(0, slots);

      if (accepted.length < files.length) {

        showToast(

          `${files.length - accepted.length} file(s) skipped — max ${maxImages} images`,

          'warning',

        );

      }

      if (accepted.length > 0) {

        const session = await fetchCaptureSession(token);

        await uploadSessionImagesPrepared(token, accepted, 'mobile', {

          sessionImages: session.images,

        });

        await refresh();

      }

      navigate(`/scan/${token}/done`);

    } catch (err) {

      const message = err?.message || 'Upload failed';

      setError(message);

      showToast(message, 'error');

    } finally {

      setUploading(false);

    }

  };



  return (

    <div className="flex min-h-[100dvh] flex-col bg-zinc-50">

      <CompactHeader

        title="Upload photos"

        left={<BackButton label="Back" onClick={() => navigate(`/scan/${token}`)} />}

      />

      <PageWrapper className="py-6">

        <DropZone

          inputId="mobile-file-upload-input"

          title="Click to upload or drag and drop"

          subtitle={`JPEG, PNG, or WebP (max ${maxImages} images, ${UPLOAD_MAX_TOTAL_MB} MB total)`}

          browseLabel="Browse Files"

          onFilesSelected={handleFiles}

          disabled={uploading || !canAdd || imageCount >= maxImages}

        />

        {uploading && (

          <p className="mt-4 text-center text-sm text-gray-600">Compressing and uploading…</p>

        )}

        {error && (

          <p className="mt-4 text-center text-sm text-red-600" role="alert">

            {error}

          </p>

        )}

      </PageWrapper>

    </div>

  );

}


import { useLocation, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { MobileAssetPageLayout } from '../../../components/saas/mobile/MobileAssetPageLayout';

export function MobileAssetCreateDonePage() {
  const { token } = useParams();
  const location = useLocation();
  const aiStatus = location.state?.aiStatus;
  const analyzing = aiStatus === 'analyzing';

  return (
    <MobileAssetPageLayout title="Asset created" wrapperClassName="flex flex-col items-center py-16 text-center">
      <CheckCircle className="h-16 w-16 text-green-600" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Asset created</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-600">
        {analyzing
          ? 'Your asset was saved and AI validation has started. Check the dashboard on your computer for pass/fail status.'
          : 'Your asset was saved without photos. Add photos later from the asset page on your computer to run AI validation.'}
      </p>
      <p className="mt-6 text-xs text-gray-400">Session {token?.slice(0, 8)}… completed</p>
    </MobileAssetPageLayout>
  );
}

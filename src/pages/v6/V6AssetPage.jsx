import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Upload } from 'lucide-react';
import { CompactHeader } from '../../components/layout/AppHeader';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '@/components/ui/button';
import { Card } from '../../components/ui/Card';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { HeroSection } from '../../components/layout/HeroSection';
import { getCatalogAsset, formatInr } from '../../v6/erpCatalog';
import { useV6 } from '../../hooks/useV6';

const FIELDS = [
  { key: 'asset_name', label: 'Asset name', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory' },
  { key: 'acquisition_date', label: 'Acquisition date', type: 'date', required: true },
  { key: 'original_cost_inr', label: 'Original cost (INR)', type: 'number', required: true },
  { key: 'book_nbv_inr', label: 'Book NBV today (INR)', type: 'number', required: true },
  { key: 'location', label: 'Location', required: true },
  { key: 'asset_tag_number', label: 'Asset tag number' },
];

export function V6AssetPage() {
  const { catalogId } = useParams();
  const navigate = useNavigate();
  const { editedContext, selectCatalogAsset, updateEditedContext } = useV6();
  const [error, setError] = useState(null);

  useEffect(() => {
    const asset = getCatalogAsset(catalogId);
    if (!asset) {
      navigate('/v6', { replace: true });
      return;
    }
    selectCatalogAsset(asset);
  }, [catalogId, navigate, selectCatalogAsset]);

  if (!editedContext) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-gray-600">
        Loading asset…
      </div>
    );
  }

  const validate = () => {
    if (!editedContext.asset_name?.trim()) return 'Asset name is required';
    if (!editedContext.location?.trim()) return 'Location is required';
    if (!editedContext.acquisition_date) return 'Acquisition date is required';
    if (Number(editedContext.original_cost_inr) <= 0) return 'Original cost must be positive';
    if (Number(editedContext.book_nbv_inr) < 0) return 'Book NBV cannot be negative';
    return null;
  };

  const proceed = (path) => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    navigate(path);
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-zinc-50">
      <div className="shrink-0">
        <CompactHeader
          title="ERP Asset"
          left={<BackButton label="Catalog" onClick={() => navigate('/v6')} />}
        />
      </div>

      <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <HeroSection className="h-auto overflow-visible">
          <PageWrapper className="py-6 pb-8">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{editedContext.asset_name}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Edit ERP payload sent with your photos. Book NBV {formatInr(editedContext.book_nbv_inr)} ·{' '}
                {editedContext.location}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Asset name and description on the report are generated from your images after analysis.
                Tag match compares the detected tag to the tag number you enter here.
              </p>
            </header>

            <Card className="p-5">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {FIELDS.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required ? ' *' : ''}
                    </span>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                        rows={3}
                        value={editedContext[field.key] ?? ''}
                        onChange={(e) => updateEditedContext({ [field.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={editedContext[field.key] ?? ''}
                        onChange={(e) =>
                          updateEditedContext({
                            [field.key]:
                              field.type === 'number' ? Number(e.target.value) : e.target.value,
                          })
                        }
                      />
                    )}
                  </label>
                ))}
              </form>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </Card>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card hover onClick={() => proceed('/v6/capture')} className="p-5">
                <div className="flex items-center gap-3">
                  <Camera className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Capture photos</h3>
                    <p className="text-sm text-gray-600">Use camera for this asset</p>
                  </div>
                </div>
              </Card>
              <Card hover onClick={() => proceed('/v6/upload')} className="p-5">
                <div className="flex items-center gap-3">
                  <Upload className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload photos</h3>
                    <p className="text-sm text-gray-600">Select files from device</p>
                  </div>
                </div>
              </Card>
            </div>
          </PageWrapper>
        </HeroSection>
      </main>

      <footer className="shrink-0 border-t border-gray-200 bg-white/95 p-4 pb-safe backdrop-blur-md">
        <Button className="w-full" onClick={() => proceed('/v6/upload')}>
          Continue to upload
        </Button>
      </footer>
    </div>
  );
}

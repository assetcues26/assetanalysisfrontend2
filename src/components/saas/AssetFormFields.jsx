import {
  ASSET_FORM_FIELDS,
  LOOKUP_FIELD_MAP,
} from './assetFormConfig';
import { LookupSelect } from './LookupSelect';
import { AssetDatePicker } from './AssetDatePicker';

/**
 * @param {{
 *   values: Record<string, string>,
 *   onChange: (key: string, value: string) => void,
 *   compact?: boolean,
 *   fieldKeys?: string[],
 *   hideAssetId?: boolean,
 * }} props
 */
export function AssetFormFields({
  values,
  onChange,
  compact = false,
  fieldKeys,
  hideAssetId = false,
}) {
  const labelClass = compact ? 'text-xs font-medium text-gray-700' : 'text-sm font-medium text-gray-700';
  const inputClass =
    'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  const handleLookup = (idKey, nameKey, id, label) => {
    onChange(idKey, id);
    onChange(nameKey, label);
    if (idKey === 'assetclassid') {
      onChange('categoryid', '');
      onChange('categoryname', '');
      onChange('subcategoryid', '');
      onChange('subcategoryname', '');
      onChange('makemodelid', '');
      onChange('makemodelname', '');
    } else if (idKey === 'categoryid') {
      onChange('subcategoryid', '');
      onChange('subcategoryname', '');
      onChange('makemodelid', '');
      onChange('makemodelname', '');
    } else if (idKey === 'subcategoryid') {
      onChange('makemodelid', '');
      onChange('makemodelname', '');
    }
  };

  const keys = fieldKeys || ASSET_FORM_FIELDS.map((f) => f.key);

  const renderField = (key) => {
    if (hideAssetId && key === 'assetid') return null;
    const field = ASSET_FORM_FIELDS.find((f) => f.key === key);
    if (!field) return null;

    const lookup = LOOKUP_FIELD_MAP[key];
    if (lookup) {
      const nameField = ASSET_FORM_FIELDS.find((f) => f.key === lookup.nameKey);
      const parentId = lookup.parentKey ? values[lookup.parentKey] : undefined;
      return (
        <div key={key}>
          <label className={labelClass}>
            {nameField?.label || field.label}
            {nameField?.required && <span className="text-red-500"> *</span>}
            {field.optional && (
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            )}
          </label>
          <div className="mt-1">
            <LookupSelect
              type={lookup.type}
              parentId={parentId}
              value={values[lookup.idKey]}
              label={values[lookup.nameKey]}
              onChange={(id, label) => handleLookup(lookup.idKey, lookup.nameKey, id, label)}
              placeholder={`Select ${(nameField?.label || field.label).toLowerCase()}`}
              required={Boolean(nameField?.required)}
              disabled={Boolean(lookup.parentKey && !parentId)}
            />
          </div>
        </div>
      );
    }

    if (key === 'acquisitiondate') {
      return (
        <div key={key}>
          <label className={labelClass}>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          <div className="mt-1">
            <AssetDatePicker
              value={values.acquisitiondate}
              onChange={(v) => onChange('acquisitiondate', v)}
              required={field.required}
            />
          </div>
        </div>
      );
    }

    return (
      <div key={key} className={field.type === 'textarea' && !compact ? 'sm:col-span-2' : ''}>
        <label className={labelClass}>
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
          {field.optional && (
            <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
          )}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            rows={compact ? 2 : 3}
            value={values[field.key]}
            onChange={(e) => onChange(field.key, e.target.value)}
            className={inputClass}
          />
        ) : (
          <input
            type={field.type || 'text'}
            value={values[field.key]}
            placeholder={field.placeholder || field.hint}
            onChange={(e) => onChange(field.key, e.target.value)}
            className={inputClass}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
      {keys.map(renderField)}
    </div>
  );
}

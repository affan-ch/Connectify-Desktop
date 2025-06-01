import { upsertSetting } from '@/db/setting';


export async function storeDeviceStateFields(content: any) {
  const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(acc, flattenObject(value, fullKey));
      } else if (Array.isArray(value)) {
        acc[fullKey] = JSON.stringify(value); // Store arrays as JSON strings
      } else {
        acc[fullKey] = String(value); // Store primitive values as strings
      }
      return acc;
    }, {} as Record<string, string>);
  };

  const flattened = flattenObject(content);

  for (const [key, value] of Object.entries(flattened)) {
    try {
      await upsertSetting({ key, value });
    } catch (error) {
      console.error(`Error upserting setting for key "${key}":`, error);
    }
  }
}

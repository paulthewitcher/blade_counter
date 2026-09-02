import { useEffect, useState } from 'react';
import { loadAppData, saveAppData } from '../domain/storage';

export const useAppData = (catalog) => {
  const [data, setData] = useState(() => loadAppData(catalog));

  useEffect(() => {
    saveAppData(data, catalog);
  }, [data, catalog]);

  return [data, setData];
};

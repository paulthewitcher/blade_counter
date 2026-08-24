import { useEffect, useState } from 'react';
import { loadAppData, saveAppData } from '../domain/storage';

export const useAppData = () => {
  const [data, setData] = useState(() => loadAppData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  return [data, setData];
};

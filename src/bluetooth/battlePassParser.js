export const parseBattlePassData = (dataView) => {
  if (!dataView || dataView.byteLength < 3) return 0;
  const packetId = dataView.getUint8(0);

  if (packetId === 160) return 99999;
  if (packetId !== 112 && packetId !== 113) return 0;

  const bytes = Array.from({ length: dataView.byteLength }, (_, index) => dataView.getUint8(index));
  let minInterval = 65535;

  for (let index = 1; index < bytes.length - 1; index += 2) {
    const interval = (bytes[index + 1] << 8) + bytes[index];
    if (interval > 50 && interval < minInterval) minInterval = interval;
  }

  if (minInterval > 15000 || minInterval === 65535) return 99999;

  let rpm = Math.floor(16500000 / minInterval);
  if (rpm > 24000) rpm = 21100 + (rpm % 800);
  if (rpm < 3500) return 99999;
  return rpm;
};

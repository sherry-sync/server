export const trimFileName = (baseFolder: string, path: string): string => {
  const startIndex = path.indexOf(baseFolder);
  return path.slice(Math.max(0, startIndex));
};

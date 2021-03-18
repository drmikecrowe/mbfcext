export const isDevMode = (): boolean => {
  return true;
};

export const logger = (namespace: string) => jest.fn();

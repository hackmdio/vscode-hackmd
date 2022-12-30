import { createContext, useContext } from 'react';

type AppContextType = {
  extensionPath: string;
};

const AppContext = createContext<AppContextType>({
  extensionPath: '',
});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContainer = ({ extensionPath, children }: { children: React.ReactNode; extensionPath }) => {
  return <AppContext.Provider value={{ extensionPath }}>{children}</AppContext.Provider>;
};

export function createWithContainer(Component: React.ComponentType, context: AppContextType) {
  return (
    <AppContainer {...context}>
      <Component />
    </AppContainer>
  );
}

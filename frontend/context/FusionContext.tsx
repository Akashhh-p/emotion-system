import React, { createContext, useContext, useState } from "react";

interface FusionData {
  text?: any;
  speech?: any;
  face?: any;
}

interface FusionContextType {
  data: FusionData;
  setText: (res: any) => void;
  setSpeech: (res: any) => void;
  setFace: (res: any) => void;
}

const FusionContext = createContext<FusionContextType | undefined>(undefined);

export const FusionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<FusionData>({});

  const setText = (res: any) => {
    setData(prev => ({ ...prev, text: res }));
  };

  const setSpeech = (res: any) => {
    setData(prev => ({ ...prev, speech: res }));
  };

  const setFace = (res: any) => {
    setData(prev => ({ ...prev, face: res }));
  };

  return (
    <FusionContext.Provider value={{ data, setText, setSpeech, setFace }}>
      {children}
    </FusionContext.Provider>
  );
};

export const useFusion = () => {
  const context = useContext(FusionContext);
  if (!context) throw new Error("useFusion must be used inside FusionProvider");
  return context;
};
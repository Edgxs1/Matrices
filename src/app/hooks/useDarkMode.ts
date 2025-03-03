import { useState, useEffect } from "react";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);
  console.log(darkMode);

  // Inicialización del modo oscuro
  useEffect(() => {
    // Verificar preferencia en localStorage
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode !== null) {
      // Si existe una preferencia guardada, usarla
      setDarkMode(savedMode === 'true');
    } else if (typeof window !== 'undefined') {
      // Si no hay preferencia, usar la preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Efecto para aplicar los cambios del modo oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return { darkMode, toggleDarkMode };
}
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

const EDIT_MODE_STORAGE_KEY = 'site-admin-edit-mode';
const editModeListeners = new Set<() => void>();

type EditModeContextType = {
  editMode: boolean;
  setEditMode: (enabled: boolean) => void;
  toggleEditMode: () => void;
};

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
  toggleEditMode: () => {},
});

type Props = {
  children: React.ReactNode;
};

function getEditModeSnapshot() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(EDIT_MODE_STORAGE_KEY) === 'true';
}

function getEditModeServerSnapshot() {
  return false;
}

function subscribeEditMode(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  editModeListeners.add(callback);

  function handleStorage(event: StorageEvent) {
    if (event.key === EDIT_MODE_STORAGE_KEY) callback();
  }

  window.addEventListener('storage', handleStorage);

  return () => {
    editModeListeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function notifyEditModeListeners() {
  editModeListeners.forEach((listener) => listener());
}

export function EditModeProvider({ children }: Props) {
  const editMode = useSyncExternalStore(
    subscribeEditMode,
    getEditModeSnapshot,
    getEditModeServerSnapshot,
  );

  const setEditMode = useCallback((enabled: boolean) => {
    localStorage.setItem(EDIT_MODE_STORAGE_KEY, String(enabled));
    notifyEditModeListeners();
  }, []);

  const toggleEditMode = useCallback(() => {
    const next = !getEditModeSnapshot();
    localStorage.setItem(EDIT_MODE_STORAGE_KEY, String(next));
    notifyEditModeListeners();
  }, []);

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,
      toggleEditMode,
    }),
    [editMode, setEditMode, toggleEditMode],
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}

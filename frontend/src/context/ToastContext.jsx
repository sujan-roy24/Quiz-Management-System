import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(t => t.filter(x => x.id !== id));
    }, []);

    const toast = useCallback((message, type = 'success') => {
        const id = Date.now();

        setToasts(t => [...t, { id, message, type }]);

        // ✅ use dismiss instead of duplicating logic
        setTimeout(() => dismiss(id), 3500);
    }, [dismiss]);


    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast toast-${t.type}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12
                        }}
                    >
                        <span>{t.message}</span>

                        {/* ✅ NEW: Close button */}
                        <button
                            onClick={() => dismiss(t.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--muted)',
                                cursor: 'pointer',
                                fontSize: 14,
                                padding: 0
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
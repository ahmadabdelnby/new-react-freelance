import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBalance } from '../Services/Authentication/AuthSlice';
import { API_ENDPOINTS } from '../Services/config';

/**
 * Custom hook to sync user balance from backend
 * Call this in components that need real-time balance updates
 */
export const useBalanceSync = () => {
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector((state) => state.auth);

    const refreshBalance = useCallback(async () => {
        if (!isAuthenticated || !token) {
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.GET_CURRENT_BALANCE, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();

            if (data.success && typeof data.balance === 'number') {
                dispatch(updateBalance(data.balance));
            }
        } catch (error) {
            console.error('❌ Balance sync error:', error);
        }
    }, [token, isAuthenticated, dispatch]);

    return { refreshBalance };
};

/**
 * Auto-sync balance hook - automatically refreshes balance on mount
 * Use this in pages where balance should always be fresh
 */
export const useAutoBalanceSync = (enabled = true) => {
    const { refreshBalance } = useBalanceSync();

    useEffect(() => {
        if (enabled) {
            refreshBalance();
        }
    }, [enabled, refreshBalance]);

    return { refreshBalance };
};

export default useBalanceSync;

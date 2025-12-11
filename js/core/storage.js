/**
 * Low-level Storage Wrapper
 * Handles reading and writing JSON to LocalStorage.
 */

export const STORAGE_KEY = 'lingoflow_db_v2';

export function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Failed to load from LocalStorage", e);
        return null;
    }
}

export function saveToLocalStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error("Failed to save to LocalStorage", e);
        return false;
    }
}

export function clearLocalStorage() {
    localStorage.removeItem(STORAGE_KEY);
}

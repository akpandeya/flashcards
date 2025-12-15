import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
    it('renders dashboard layout by default', () => {
        // We expect the Sidebar to be present on the home route
        render(<App />);
        expect(screen.getByText('LingoDrift')).toBeDefined();
    });
});

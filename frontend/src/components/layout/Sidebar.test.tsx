import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { describe, it, expect } from 'vitest';

describe('Sidebar Component', () => {
    it('renders navigation links', () => {
        render(
            <BrowserRouter>
                <Sidebar />
            </BrowserRouter>
        );
        expect(screen.getByText('Dashboard')).toBeDefined();
        expect(screen.getByText('My Exams')).toBeDefined();
        expect(screen.getByText('LingoDrift')).toBeDefined();
    });
});

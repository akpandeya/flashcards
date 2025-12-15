import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import { describe, it, expect } from 'vitest';

describe('Login Page', () => {
    it('renders login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        expect(screen.getByText('Welcome back')).toBeDefined();
        expect(screen.getByPlaceholderText('you@example.com')).toBeDefined();
    });
});

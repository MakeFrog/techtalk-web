import { style } from '@vanilla-extract/css';

export const container = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '2rem',
    textAlign: 'center',
});

export const iconContainer = style({
    fontSize: '4rem',
    marginBottom: '1.5rem',
    opacity: 0.7,
});

export const title = style({
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '0.5rem',
});

export const description = style({
    fontSize: '1rem',
    color: '#666',
    marginBottom: '2rem',
    lineHeight: 1.6,
});

export const backButton = style({
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007AFF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',

    ':hover': {
        backgroundColor: '#0056CC',
        transform: 'translateY(-1px)',
    },
}); 
import { render, screen } from '@testing-library/react';
import React from 'react';

function SampleComponent() {
    return <div>Hello Test</div>;
}

describe('Frontend Setup', () => {
    test('should render sample component', () => {
        render(<SampleComponent />);
        expect(screen.getByText('Hello Test')).toBeInTheDocument();
    });
});

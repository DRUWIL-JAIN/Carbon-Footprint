import { render, screen } from '@testing-library/react';
import RegisterCompany from './Pages/RegisterCompany';

test('renders learn react link', () => {
  render(<RegisterCompany />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

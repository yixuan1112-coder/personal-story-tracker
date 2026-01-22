import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { store } from './store/store';
import App from './App';

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

test('renders app without crashing', () => {
  renderWithProviders(<App />);
  // 应用应该能够正常渲染而不崩溃
});
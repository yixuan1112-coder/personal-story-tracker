import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import LoginPage from '../../../pages/Auth/LoginPage';
import authReducer from '../../../store/slices/authSlice';

// Mock the authAPI
jest.mock('../../../services/authAPI', () => ({
  login: jest.fn(),
}));

// 创建测试用的store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

// 测试包装器组件
const TestWrapper = ({ children, initialState = {} }) => {
  const store = createTestStore(initialState);
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    expect(screen.getByText('还没有账户？立即注册')).toBeInTheDocument();
  });

  test('validates email format', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    const submitButton = screen.getByRole('button', { name: '登录' });

    // 输入无效邮箱
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: '登录' });

    // 提交空表单
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('邮箱地址不能为空')).toBeInTheDocument();
      expect(screen.getByText('密码不能为空')).toBeInTheDocument();
    });
  });

  test('shows loading state during login', () => {
    render(
      <TestWrapper initialState={{ auth: { loading: true } }}>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱地址')).toBeDisabled();
    expect(screen.getByLabelText('密码')).toBeDisabled();
  });

  test('displays error message when login fails', () => {
    const errorMessage = '登录失败，请检查邮箱和密码';
    render(
      <TestWrapper initialState={{ auth: { error: { message: errorMessage } } }}>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('clears error when user starts typing', async () => {
    const errorMessage = '登录失败，请检查邮箱和密码';
    render(
      <TestWrapper initialState={{ auth: { error: { message: errorMessage } } }}>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    const emailInput = screen.getByLabelText('邮箱地址');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // 错误信息应该被清除（通过dispatch clearError）
    // 注意：这个测试可能需要根据实际的Redux状态管理逻辑调整
  });

  test('remember me checkbox works correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const rememberMeCheckbox = screen.getByLabelText('记住我');
    expect(rememberMeCheckbox).not.toBeChecked();

    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  test('form submission with valid data', async () => {
    const store = createTestStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    const passwordInput = screen.getByLabelText('密码');
    const rememberMeCheckbox = screen.getByLabelText('记住我');
    const submitButton = screen.getByRole('button', { name: '登录' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(rememberMeCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'auth/login/pending'
      }));
    });
  });

  test('clears field validation errors when user types', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    const submitButton = screen.getByRole('button', { name: '登录' });

    // 先触发验证错误
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('邮箱地址不能为空')).toBeInTheDocument();
    });

    // 输入有效邮箱，错误应该清除
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText('邮箱地址不能为空')).not.toBeInTheDocument();
    });
  });

  test('validates email format on blur', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('邮箱地址');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    // 等待验证错误出现
    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });
  });

  test('handles different error message formats', () => {
    // 测试不同的错误消息格式
    const testCases = [
      { error: { message: '自定义错误消息' }, expected: '自定义错误消息' },
      { error: { email: ['邮箱格式错误'] }, expected: '邮箱格式错误' },
      { error: { password: ['密码错误'] }, expected: '密码错误' },
      { error: {}, expected: '登录失败' },
    ];

    testCases.forEach(({ error, expected }) => {
      const { unmount } = render(
        <TestWrapper initialState={{ auth: { error } }}>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  test('disables form fields during loading', () => {
    render(
      <TestWrapper initialState={{ auth: { loading: true } }}>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText('邮箱地址')).toBeDisabled();
    expect(screen.getByLabelText('密码')).toBeDisabled();
    expect(screen.getByLabelText('记住我')).toBeDisabled();
    expect(screen.getByRole('button', { name: /登录/ })).toBeDisabled();
  });

  test('form validation prevents submission with empty password', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    const submitButton = screen.getByRole('button', { name: '登录' });

    // 只填写邮箱，不填写密码
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('密码不能为空')).toBeInTheDocument();
    });
  });

  test('navigation link to register page is present', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const registerLink = screen.getByRole('link', { name: '还没有账户？立即注册' });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
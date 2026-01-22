import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import RegisterPage from '../../../pages/Auth/RegisterPage';
import authReducer from '../../../store/slices/authSlice';

// Mock the authAPI
jest.mock('../../../services/authAPI', () => ({
  register: jest.fn(),
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

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form correctly', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText('注册')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('显示名称（可选）')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
    expect(screen.getByText('已有账户？立即登录')).toBeInTheDocument();
  });

  test('validates email format', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });
  });

  test('validates username requirements', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('用户名');
    
    // 测试用户名太短
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.getByText('用户名至少需要3个字符')).toBeInTheDocument();
    });

    // 测试用户名包含无效字符
    fireEvent.change(usernameInput, { target: { value: 'user@name' } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.getByText('用户名只能包含字母、数字、下划线和中文字符')).toBeInTheDocument();
    });
  });

  test('validates password strength', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('密码');
    
    // 测试弱密码
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/密码必须/)).toBeInTheDocument();
    });
  });

  test('shows password strength indicator', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('密码');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });

    await waitFor(() => {
      expect(screen.getByText('密码强度:')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  test('validates password confirmation', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('密码');
    const confirmPasswordInput = screen.getByLabelText('确认密码');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword' } });
    fireEvent.blur(confirmPasswordInput);

    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
    });
  });

  test('validates display name length', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const displayNameInput = screen.getByLabelText('显示名称（可选）');
    
    // 创建一个超过50个字符的字符串
    const longName = 'a'.repeat(51);
    fireEvent.change(displayNameInput, { target: { value: longName } });
    fireEvent.blur(displayNameInput);

    await waitFor(() => {
      expect(screen.getByText('显示名称不能超过50个字符')).toBeInTheDocument();
    });
  });

  test('disables submit button when form is invalid', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: '注册' });
    
    // 初始状态下按钮应该被禁用
    expect(submitButton).toBeDisabled();
  });

  test('enables submit button when form is valid', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    const usernameInput = screen.getByLabelText('用户名');
    const passwordInput = screen.getByLabelText('密码');
    const confirmPasswordInput = screen.getByLabelText('确认密码');
    const submitButton = screen.getByRole('button', { name: '注册' });

    // 填写有效的表单数据
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('shows loading state during registration', () => {
    render(
      <TestWrapper initialState={{ auth: { loading: true } }}>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱地址')).toBeDisabled();
    expect(screen.getByLabelText('用户名')).toBeDisabled();
  });

  test('displays error message when registration fails', () => {
    const errorMessage = '注册失败，请检查输入信息';
    render(
      <TestWrapper initialState={{ auth: { error: { message: errorMessage } } }}>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('real-time validation updates', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('密码');
    const confirmPasswordInput = screen.getByLabelText('确认密码');

    // 输入密码
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    // 输入不匹配的确认密码
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different' } });

    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
    });

    // 修正确认密码
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });

    await waitFor(() => {
      expect(screen.queryByText('两次输入的密码不一致')).not.toBeInTheDocument();
    });
  });

  test('form submission with valid data', async () => {
    const store = createTestStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    const usernameInput = screen.getByLabelText('用户名');
    const passwordInput = screen.getByLabelText('密码');
    const confirmPasswordInput = screen.getByLabelText('确认密码');
    const displayNameInput = screen.getByLabelText('显示名称（可选）');
    const submitButton = screen.getByRole('button', { name: '注册' });

    // 填写完整的表单数据
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.change(displayNameInput, { target: { value: 'Test User' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'auth/register/pending'
      }));
    });
  });

  test('password strength updates dynamically', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('密码');

    // 测试弱密码
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    await waitFor(() => {
      expect(screen.getByText('弱')).toBeInTheDocument();
    });

    // 测试中等强度密码
    fireEvent.change(passwordInput, { target: { value: 'Password' } });
    await waitFor(() => {
      expect(screen.getByText('中等')).toBeInTheDocument();
    });

    // 测试强密码
    fireEvent.change(passwordInput, { target: { value: 'Password1' } });
    await waitFor(() => {
      expect(screen.getByText('强')).toBeInTheDocument();
    });

    // 测试很强密码
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    await waitFor(() => {
      expect(screen.getByText('很强')).toBeInTheDocument();
    });
  });

  test('clears server errors when user starts typing', async () => {
    const store = createTestStore({ auth: { error: { message: '注册失败' } } });
    const clearErrorSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('注册失败')).toBeInTheDocument();

    const emailInput = screen.getByLabelText('邮箱地址');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(clearErrorSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'auth/clearError'
      }));
    });
  });

  test('validates all required fields before enabling submit', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('邮箱地址');
    const usernameInput = screen.getByLabelText('用户名');
    const passwordInput = screen.getByLabelText('密码');
    const confirmPasswordInput = screen.getByLabelText('确认密码');
    const submitButton = screen.getByRole('button', { name: '注册' });

    // 初始状态下按钮应该被禁用
    expect(submitButton).toBeDisabled();

    // 逐步填写字段
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    expect(submitButton).toBeDisabled();

    // 填写确认密码后，按钮应该启用
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('handles password confirmation validation when password changes', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('密码');
    const confirmPasswordInput = screen.getByLabelText('确认密码');

    // 先输入确认密码
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    
    // 然后输入不匹配的密码
    fireEvent.change(passwordInput, { target: { value: 'DifferentPassword' } });

    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
    });

    // 修正密码
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });

    await waitFor(() => {
      expect(screen.queryByText('两次输入的密码不一致')).not.toBeInTheDocument();
    });
  });

  test('navigation link to login page is present', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const loginLink = screen.getByRole('link', { name: '已有账户？立即登录' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('handles different server error formats', () => {
    const testCases = [
      { error: { message: '自定义错误消息' }, expected: '自定义错误消息' },
      { error: { email: ['邮箱已存在'] }, expected: '注册失败，请检查输入信息' },
      { error: { username: ['用户名已存在'] }, expected: '注册失败，请检查输入信息' },
      { error: {}, expected: '注册失败，请检查输入信息' },
    ];

    testCases.forEach(({ error, expected }) => {
      const { unmount } = render(
        <TestWrapper initialState={{ auth: { error } }}>
          <RegisterPage />
        </TestWrapper>
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  test('password strength progress bar updates correctly', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('密码');

    // 输入密码以显示强度指示器
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // 验证进度条的值（很强密码应该是100%）
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });
});
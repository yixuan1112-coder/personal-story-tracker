import {
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordConfirm,
  validateDisplayName,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    test('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    test('rejects invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'user@',
        'user.example.com',
        'user@.com',
        'user@domain.',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.message).toBeTruthy();
      });
    });

    test('handles empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('邮箱地址不能为空');
    });
  });

  describe('validateUsername', () => {
    test('validates correct usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        '用户名',
        'User_123',
        'testuser',
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    test('rejects invalid usernames', () => {
      const result1 = validateUsername('');
      expect(result1.isValid).toBe(false);
      expect(result1.message).toBe('用户名不能为空');

      const result2 = validateUsername('ab');
      expect(result2.isValid).toBe(false);
      expect(result2.message).toBe('用户名至少需要3个字符');

      const result3 = validateUsername('a'.repeat(31));
      expect(result3.isValid).toBe(false);
      expect(result3.message).toBe('用户名不能超过30个字符');

      const result4 = validateUsername('user@name');
      expect(result4.isValid).toBe(false);
      expect(result4.message).toBe('用户名只能包含字母、数字、下划线和中文字符');
    });
  });

  describe('validatePassword', () => {
    test('validates strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MyStr0ngP@ss',
        'Test123Pass',
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.strength).toBeTruthy();
      });
    });

    test('rejects weak passwords', () => {
      const weakPasswords = [
        '',
        '123',
        'password',
        'PASSWORD',
        '12345678',
        'abcdefgh',
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        if (password === '') {
          expect(result.message).toBe('密码不能为空');
        } else {
          expect(result.isValid).toBe(false);
          expect(result.message).toContain('密码必须');
        }
      });
    });

    test('returns correct password strength', () => {
      const result1 = validatePassword('password');
      expect(result1.strength).toBe('weak');

      const result2 = validatePassword('Password');
      expect(result2.strength).toBe('medium');

      const result3 = validatePassword('Password1');
      expect(result3.strength).toBe('strong');

      const result4 = validatePassword('Password123');
      expect(result4.strength).toBe('very-strong');
    });
  });

  describe('validatePasswordConfirm', () => {
    test('validates matching passwords', () => {
      const result = validatePasswordConfirm('password123', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    test('rejects non-matching passwords', () => {
      const result = validatePasswordConfirm('password123', 'different');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('两次输入的密码不一致');
    });

    test('handles empty confirmation', () => {
      const result = validatePasswordConfirm('password123', '');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('请确认密码');
    });
  });

  describe('validateDisplayName', () => {
    test('validates correct display names', () => {
      const validNames = [
        '',
        'John Doe',
        '张三',
        'User 123',
        'Test Name',
      ];

      validNames.forEach(name => {
        const result = validateDisplayName(name);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    test('rejects too long display names', () => {
      const longName = 'a'.repeat(51);
      const result = validateDisplayName(longName);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('显示名称不能超过50个字符');
    });
  });

  describe('getPasswordStrengthColor', () => {
    test('returns correct colors for different strengths', () => {
      expect(getPasswordStrengthColor('weak')).toBe('error');
      expect(getPasswordStrengthColor('medium')).toBe('warning');
      expect(getPasswordStrengthColor('strong')).toBe('info');
      expect(getPasswordStrengthColor('very-strong')).toBe('success');
      expect(getPasswordStrengthColor('unknown')).toBe('default');
    });
  });

  describe('getPasswordStrengthText', () => {
    test('returns correct text for different strengths', () => {
      expect(getPasswordStrengthText('weak')).toBe('弱');
      expect(getPasswordStrengthText('medium')).toBe('中等');
      expect(getPasswordStrengthText('strong')).toBe('强');
      expect(getPasswordStrengthText('very-strong')).toBe('很强');
      expect(getPasswordStrengthText('unknown')).toBe('');
    });
  });
});
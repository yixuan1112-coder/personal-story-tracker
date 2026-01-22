// 演示模式API - 用于GitHub Pages部署
// 模拟后端API响应，使用localStorage存储数据

const DEMO_MODE = process.env.NODE_ENV === 'production' && 
  (window.location.hostname.includes('github.io') || window.location.hostname === 'yixuanstorytracker.live');

// 模拟数据
const demoUsers = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    first_name: '演示',
    last_name: '用户'
  }
];

const demoEntries = [
  {
    id: 1,
    title: '我的第一个故事',
    story: '这是一个关于我珍贵回忆的故事...',
    entry_type: 'object',
    importance_score: 85,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    user: 1
  },
  {
    id: 2,
    title: '重要的朋友',
    story: '这是关于一个重要朋友的故事...',
    entry_type: 'person',
    importance_score: 92,
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z',
    user: 1
  }
];

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取存储的数据
const getStoredData = (key, defaultData) => {
  try {
    const stored = localStorage.getItem(`demo_${key}`);
    return stored ? JSON.parse(stored) : defaultData;
  } catch {
    return defaultData;
  }
};

// 存储数据
const setStoredData = (key, data) => {
  localStorage.setItem(`demo_${key}`, JSON.stringify(data));
};

// 演示API方法
export const demoApi = {
  // 认证相关
  async login(credentials) {
    await delay(500);
    if (credentials.username === 'demo' && credentials.password === 'demo123') {
      const tokens = {
        access: 'demo_access_token',
        refresh: 'demo_refresh_token'
      };
      localStorage.setItem('demo_tokens', JSON.stringify(tokens));
      return tokens;
    }
    throw new Error('Invalid credentials');
  },

  async register(userData) {
    await delay(500);
    const user = {
      id: Date.now(),
      ...userData,
      password: undefined // 不返回密码
    };
    return {
      user,
      access: 'demo_access_token',
      refresh: 'demo_refresh_token'
    };
  },

  async logout() {
    await delay(200);
    localStorage.removeItem('demo_tokens');
    return { message: 'Logged out successfully' };
  },

  async getCurrentUser() {
    await delay(300);
    const tokens = localStorage.getItem('demo_tokens');
    if (!tokens) {
      throw new Error('Not authenticated');
    }
    return demoUsers[0];
  },

  // 条目相关
  async getEntries(params = {}) {
    await delay(400);
    let entries = getStoredData('entries', demoEntries);
    
    // 简单的搜索过滤
    if (params.search) {
      entries = entries.filter(entry => 
        entry.title.toLowerCase().includes(params.search.toLowerCase()) ||
        entry.story.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    // 类型过滤
    if (params.entry_type) {
      entries = entries.filter(entry => entry.entry_type === params.entry_type);
    }
    
    return {
      count: entries.length,
      results: entries
    };
  },

  async getEntry(id) {
    await delay(300);
    const entries = getStoredData('entries', demoEntries);
    const entry = entries.find(e => e.id === parseInt(id));
    if (!entry) {
      throw new Error('Entry not found');
    }
    return entry;
  },

  async createEntry(entryData) {
    await delay(500);
    const entries = getStoredData('entries', demoEntries);
    const newEntry = {
      id: Date.now(),
      ...entryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: 1,
      importance_score: Math.floor(Math.random() * 100) + 1
    };
    entries.push(newEntry);
    setStoredData('entries', entries);
    return newEntry;
  },

  async updateEntry(id, entryData) {
    await delay(500);
    const entries = getStoredData('entries', demoEntries);
    const index = entries.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
      throw new Error('Entry not found');
    }
    entries[index] = {
      ...entries[index],
      ...entryData,
      updated_at: new Date().toISOString()
    };
    setStoredData('entries', entries);
    return entries[index];
  },

  async deleteEntry(id) {
    await delay(300);
    const entries = getStoredData('entries', demoEntries);
    const filteredEntries = entries.filter(e => e.id !== parseInt(id));
    setStoredData('entries', filteredEntries);
    return { message: 'Entry deleted successfully' };
  },

  // 统计相关
  async getStats() {
    await delay(400);
    const entries = getStoredData('entries', demoEntries);
    return {
      total_entries: entries.length,
      object_entries: entries.filter(e => e.entry_type === 'object').length,
      person_entries: entries.filter(e => e.entry_type === 'person').length,
      average_importance: entries.length > 0 
        ? Math.round(entries.reduce((sum, e) => sum + e.importance_score, 0) / entries.length)
        : 0
    };
  }
};

// 检查是否为演示模式
export const isDemoMode = () => DEMO_MODE;

// 初始化演示数据
export const initDemoData = () => {
  if (DEMO_MODE && !localStorage.getItem('demo_entries')) {
    setStoredData('entries', demoEntries);
  }
};
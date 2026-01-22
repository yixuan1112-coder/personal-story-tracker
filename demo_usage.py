#!/usr/bin/env python
"""
个人故事追踪器使用演示
模拟用户完整的使用流程
"""
import requests
import json
import time
from datetime import datetime, date

# API基础URL
BASE_URL = "http://localhost:8000/api"

class StoryTrackerDemo:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        
    def print_step(self, step_num, description):
        print(f"\n{'='*60}")
        print(f"步骤 {step_num}: {description}")
        print('='*60)
        
    def print_result(self, result):
        print(f"✓ {result}")
        
    def print_error(self, error):
        print(f"✗ 错误: {error}")
        
    def register_user(self):
        """注册新用户"""
        self.print_step(1, "用户注册")
        
        register_data = {
            "username": "demo_user",
            "email": "demo@example.com", 
            "password": "demo123456",
            "password_confirm": "demo123456",
            "display_name": "演示用户"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/register/", json=register_data)
            if response.status_code == 201:
                self.user_data = response.json()
                self.print_result(f"用户注册成功: {self.user_data['user']['display_name']}")
                return True
            elif response.status_code == 400:
                error_data = response.json()
                if ("email" in error_data and "已存在" in str(error_data["email"])) or \
                   ("username" in error_data and "已存在" in str(error_data["username"])):
                    self.print_result("用户已存在，将直接登录")
                    return True
                else:
                    self.print_error(f"注册失败: {error_data}")
                    return False
            else:
                self.print_error(f"注册失败，状态码: {response.status_code}")
                return False
        except Exception as e:
            self.print_error(f"注册请求失败: {e}")
            return False
    
    def login_user(self):
        """用户登录"""
        self.print_step(2, "用户登录")
        
        login_data = {
            "email": "demo@example.com",  # 使用email而不是username
            "password": "demo123456"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/login/", json=login_data)
            if response.status_code == 200:
                login_result = response.json()
                self.access_token = login_result["access"]
                self.session.headers.update({
                    "Authorization": f"Bearer {self.access_token}"
                })
                self.print_result(f"登录成功，获得访问令牌")
                return True
            else:
                self.print_error(f"登录失败，状态码: {response.status_code}")
                if response.content:
                    print(f"错误详情: {response.json()}")
                return False
        except Exception as e:
            self.print_error(f"登录请求失败: {e}")
            return False
    
    def create_item_entry(self):
        """创建物品条目"""
        self.print_step(3, "创建物品条目 - 我的第一台笔记本电脑")
        
        entry_data = {
            "type": "item",
            "title": "ThinkPad X1 Carbon",
            "description": "我的第一台笔记本电脑，陪伴我度过了大学四年",
            "story_content": """这台笔记本电脑是我大一时父母送给我的礼物。当时我刚刚考上理想的大学，父母为了支持我的学习，特意选择了这款轻薄但性能强劲的商务笔记本。

记得第一次打开包装盒的时候，那种兴奋和感动至今难忘。黑色的机身，经典的小红点，还有那个标志性的ThinkPad标志。这不仅仅是一台电脑，更像是我进入新世界的钥匙。

在大学的四年里，它陪伴我完成了无数的作业、项目和论文。深夜在图书馆里敲击键盘的声音，宿舍里和室友一起讨论代码的时光，还有那些为了deadline而熬夜的日子，它都默默地支持着我。

虽然现在它已经有些老旧，屏幕上也有了一些小划痕，但每当我看到它，就会想起那些充满挑战和成长的美好时光。它见证了我从一个懵懂的新生成长为即将步入社会的毕业生。

这台电脑教会我的不仅仅是技术知识，更重要的是坚持和努力的品质。无论遇到多么复杂的问题，只要耐心地一步步解决，总能找到答案。""",
            "acquisition_date": "2020-09-01",
            "acquisition_method": "gift",
            "original_price": 8999.00,
            "currency": "CNY",
            "category": "电子产品",
            "condition": "good",
            "importance_score": 9,
            "emotional_value": 10,
            "practical_value": 8,
            "frequency_of_use": 7,
            "duration_owned": 9,
            "tags": ["笔记本电脑", "学习", "大学", "礼物", "ThinkPad"],
            "is_private": False
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/entries/", json=entry_data)
            if response.status_code == 201:
                entry = response.json()
                self.print_result(f"物品条目创建成功: {entry['title']} (ID: {entry['id']})")
                self.print_result(f"计算得出的重要度: {entry['calculated_importance']}/10")
                return entry
            else:
                self.print_error(f"创建失败，状态码: {response.status_code}")
                if response.content:
                    print(f"错误详情: {response.json()}")
                return None
        except Exception as e:
            self.print_error(f"创建请求失败: {e}")
            return None
    
    def create_person_entry(self):
        """创建人物条目"""
        self.print_step(4, "创建人物条目 - 我的大学室友")
        
        entry_data = {
            "type": "person",
            "title": "李明",
            "description": "我的大学室友，也是我最好的朋友之一",
            "story_content": """李明是我大学四年的室友，也是我人生中最重要的朋友之一。我们第一次见面是在大一的宿舍里，当时我刚刚整理好行李，他就拖着一个巨大的行李箱走了进来。

他来自南方的一个小城市，说话带着轻微的口音，性格开朗幽默。虽然我们来自不同的地方，有着不同的生活习惯，但很快就成为了无话不谈的好朋友。

在学习上，我们互相帮助。他的数学很好，经常帮我解决微积分的难题；而我比较擅长编程，也会教他一些代码技巧。我们经常一起在图书馆学习到很晚，然后在回宿舍的路上讨论今天学到的新知识。

除了学习，我们还有很多共同的兴趣爱好。周末的时候，我们会一起去打篮球、看电影，或者在宿舍里玩游戏。他总是能在我情绪低落的时候逗我开心，而我也会在他遇到困难时给予支持。

最难忘的是大三那年，他因为家里的经济困难想要退学。我们几个室友一起想办法帮他申请助学金，还陪他去找老师谈话。最终他顺利完成了学业，现在在一家不错的公司工作。

虽然毕业后我们各自忙碌，见面的机会不多，但我们的友谊依然深厚。每当想起大学时光，李明总是其中最重要的一部分。他教会了我什么是真正的友谊，什么是互相支持和理解。""",
            "relationship": "friend",
            "meeting_date": "2020-09-01",
            "importance_score": 8,
            "emotional_value": 9,
            "practical_value": 6,
            "frequency_of_use": 5,
            "duration_owned": 8,
            "tags": ["室友", "朋友", "大学", "同学", "友谊"],
            "is_private": False
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/entries/", json=entry_data)
            if response.status_code == 201:
                entry = response.json()
                self.print_result(f"人物条目创建成功: {entry['title']} (ID: {entry['id']})")
                self.print_result(f"计算得出的重要度: {entry['calculated_importance']}/10")
                return entry
            else:
                self.print_error(f"创建失败，状态码: {response.status_code}")
                return None
        except Exception as e:
            self.print_error(f"创建请求失败: {e}")
            return None
    
    def create_another_item(self):
        """创建另一个物品条目"""
        self.print_step(5, "创建物品条目 - 奶奶的手表")
        
        entry_data = {
            "type": "item",
            "title": "奶奶的老式手表",
            "description": "奶奶留给我的珍贵手表，承载着家族的回忆",
            "story_content": """这块手表是奶奶在她80岁生日时送给我的礼物。那是一块很老式的机械手表，表盘已经有些发黄，表带也显得有些陈旧，但对我来说，它比任何名贵的手表都要珍贵。

奶奶告诉我，这块手表是爷爷在他们结婚时送给她的。那时候家里条件不好，爷爷攒了很久的钱才买下这块手表。奶奶说，每当她看到这块手表，就会想起和爷爷一起度过的美好时光。

爷爷去世后，奶奶一直戴着这块手表，仿佛爷爷还在她身边一样。她经常对我说："时间是最珍贵的礼物，要珍惜和家人在一起的每一刻。"

当奶奶把这块手表交给我时，她的眼中含着泪水。她说："孩子，奶奶老了，这块手表以后就交给你了。希望它能提醒你，无论走到哪里，都不要忘记家人的爱。"

现在，每当我戴上这块手表，就能感受到奶奶和爷爷的爱。虽然它走得不是很准，有时候还会停下来，但我从来不想修理它，因为我怕失去那种特殊的感觉。

这块手表见证了我们家族三代人的爱情和亲情，它不仅仅是一个计时工具，更是一份珍贵的情感传承。""",
            "acquisition_date": "2022-03-15",
            "acquisition_method": "inheritance",
            "original_price": 200.00,
            "currency": "CNY",
            "category": "饰品",
            "condition": "fair",
            "importance_score": 10,
            "emotional_value": 10,
            "practical_value": 3,
            "frequency_of_use": 8,
            "duration_owned": 10,
            "tags": ["手表", "奶奶", "传承", "家族", "回忆", "爱情"],
            "is_private": False
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/entries/", json=entry_data)
            if response.status_code == 201:
                entry = response.json()
                self.print_result(f"物品条目创建成功: {entry['title']} (ID: {entry['id']})")
                self.print_result(f"计算得出的重要度: {entry['calculated_importance']}/10")
                return entry
            else:
                self.print_error(f"创建失败，状态码: {response.status_code}")
                return None
        except Exception as e:
            self.print_error(f"创建请求失败: {e}")
            return None
    
    def view_all_entries(self):
        """查看所有条目"""
        self.print_step(6, "查看所有条目")
        
        try:
            response = self.session.get(f"{BASE_URL}/entries/")
            if response.status_code == 200:
                data = response.json()
                entries = data.get('results', data) if isinstance(data, dict) else data
                
                self.print_result(f"成功获取 {len(entries)} 个条目:")
                
                for i, entry in enumerate(entries, 1):
                    print(f"\n{i}. {entry['title']} ({entry['type']})")
                    print(f"   描述: {entry['description']}")
                    print(f"   重要度: {entry['importance_score']}/10")
                    print(f"   计算重要度: {entry.get('calculated_importance', 'N/A')}/10")
                    print(f"   创建时间: {entry['created_at'][:10]}")
                    if entry.get('tags'):
                        print(f"   标签: {', '.join(entry['tags'])}")
                
                return entries
            else:
                self.print_error(f"获取失败，状态码: {response.status_code}")
                return []
        except Exception as e:
            self.print_error(f"获取请求失败: {e}")
            return []
    
    def search_entries(self):
        """搜索条目"""
        self.print_step(7, "搜索功能演示 - 搜索'大学'相关条目")
        
        try:
            response = self.session.get(f"{BASE_URL}/entries/", params={"search": "大学"})
            if response.status_code == 200:
                data = response.json()
                entries = data.get('results', data) if isinstance(data, dict) else data
                
                self.print_result(f"搜索到 {len(entries)} 个包含'大学'的条目:")
                
                for entry in entries:
                    print(f"- {entry['title']}: {entry['description']}")
                
                return entries
            else:
                self.print_error(f"搜索失败，状态码: {response.status_code}")
                return []
        except Exception as e:
            self.print_error(f"搜索请求失败: {e}")
            return []
    
    def filter_by_type(self):
        """按类型过滤"""
        self.print_step(8, "过滤功能演示 - 只显示物品类型")
        
        try:
            response = self.session.get(f"{BASE_URL}/entries/", params={"type": "item"})
            if response.status_code == 200:
                data = response.json()
                entries = data.get('results', data) if isinstance(data, dict) else data
                
                self.print_result(f"找到 {len(entries)} 个物品条目:")
                
                for entry in entries:
                    print(f"- {entry['title']}: {entry['description']}")
                    if entry.get('original_price'):
                        print(f"  原价: ¥{entry['original_price']}")
                
                return entries
            else:
                self.print_error(f"过滤失败，状态码: {response.status_code}")
                return []
        except Exception as e:
            self.print_error(f"过滤请求失败: {e}")
            return []
    
    def get_statistics(self):
        """获取统计信息"""
        self.print_step(9, "查看统计信息")
        
        try:
            response = self.session.get(f"{BASE_URL}/entries/statistics/")
            if response.status_code == 200:
                stats = response.json()
                
                self.print_result("统计信息:")
                print(f"- 总条目数: {stats.get('total_count', 0)}")
                print(f"- 物品条目: {stats.get('item_count', 0)}")
                print(f"- 人物条目: {stats.get('person_count', 0)}")
                print(f"- 有故事的条目: {stats.get('with_story_count', 0)}")
                print(f"- 无故事的条目: {stats.get('without_story_count', 0)}")
                
                if stats.get('importance_distribution'):
                    print("\n重要度分布:")
                    for score, count in stats['importance_distribution'].items():
                        if count > 0:
                            print(f"  {score}分: {count}个条目")
                
                if stats.get('tags'):
                    print(f"\n热门标签 (前5个):")
                    for tag, count in stats['tags'][:5]:
                        print(f"  {tag}: {count}次")
                
                return stats
            else:
                self.print_error(f"获取统计失败，状态码: {response.status_code}")
                return {}
        except Exception as e:
            self.print_error(f"统计请求失败: {e}")
            return {}
    
    def update_story(self, entry_id):
        """更新故事内容"""
        self.print_step(10, f"更新条目故事内容 (ID: {entry_id})")
        
        new_story = """[更新] 今天重新看到这台笔记本电脑，想起了更多美好的回忆。

刚刚翻看了当年用它写的第一个程序 - 一个简单的"Hello World"。那时候的我对编程一无所知，连最基本的语法都要查半天。但正是这台电脑，让我第一次体验到了代码运行成功时的喜悦。

还记得大二时用它做的第一个网站项目，虽然界面很简陋，功能也很基础，但当我把链接分享给朋友们时，那种成就感是无法言喻的。

现在回想起来，这台电脑不仅仅是我的学习工具，更是我梦想的起点。它见证了我从一个编程小白成长为能够独立开发项目的程序员。

虽然现在我已经有了更新更快的电脑，但这台ThinkPad在我心中的地位是无法替代的。它教会了我坚持和努力，也让我明白了技术的魅力。

感谢这台电脑，感谢那些一起奋斗的日子。"""
        
        try:
            response = self.session.put(f"{BASE_URL}/entries/{entry_id}/update_story/", 
                                      json={"story_content": new_story})
            if response.status_code == 200:
                result = response.json()
                self.print_result("故事内容更新成功")
                print(f"最后修改时间: {result.get('story_last_modified', 'N/A')}")
                return True
            else:
                self.print_error(f"更新失败，状态码: {response.status_code}")
                return False
        except Exception as e:
            self.print_error(f"更新请求失败: {e}")
            return False
    
    def run_demo(self):
        """运行完整演示"""
        print("🎉 欢迎使用个人故事追踪器演示！")
        print("这个演示将展示应用的主要功能...")
        
        # 1. 注册用户
        if not self.register_user():
            return
        
        time.sleep(1)
        
        # 2. 登录
        if not self.login_user():
            return
        
        time.sleep(1)
        
        # 3. 创建物品条目
        laptop_entry = self.create_item_entry()
        time.sleep(1)
        
        # 4. 创建人物条目
        friend_entry = self.create_person_entry()
        time.sleep(1)
        
        # 5. 创建另一个物品条目
        watch_entry = self.create_another_item()
        time.sleep(1)
        
        # 6. 查看所有条目
        all_entries = self.view_all_entries()
        time.sleep(1)
        
        # 7. 搜索功能
        search_results = self.search_entries()
        time.sleep(1)
        
        # 8. 过滤功能
        filtered_results = self.filter_by_type()
        time.sleep(1)
        
        # 9. 统计信息
        stats = self.get_statistics()
        time.sleep(1)
        
        # 10. 更新故事
        if laptop_entry:
            self.update_story(laptop_entry['id'])
        
        print(f"\n{'='*60}")
        print("🎊 演示完成！")
        print("='*60")
        print("您已经体验了个人故事追踪器的主要功能：")
        print("✓ 用户注册和登录")
        print("✓ 创建物品和人物条目")
        print("✓ 记录详细的故事内容")
        print("✓ 重要度评估系统")
        print("✓ 搜索和过滤功能")
        print("✓ 统计信息查看")
        print("✓ 故事内容更新")
        print("\n现在您可以访问 http://localhost:8000/admin 查看后台管理界面")
        print("或者等待前端服务器启动后访问完整的Web界面！")

if __name__ == "__main__":
    demo = StoryTrackerDemo()
    demo.run_demo()
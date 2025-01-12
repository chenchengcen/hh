// 页面加载完成后隐藏加载动画
window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
});

// 平滑滚动优化
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 100;
        const elementPosition = target.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// 返回顶部按钮
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 导航栏滚动效果优化
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 表单验证和提交动画
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 添加提交动画
    const submitBtn = this.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '发送中...';
    submitBtn.disabled = true;
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 显示成功消息
    alert('感谢您的留言，我们会尽快回复！');
    
    // 重置表单和按钮
    this.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
});

// 服务卡片点击事件
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function() {
        // 可以添加弹窗或跳转到详情页
        const title = this.querySelector('h3').textContent;
        alert(`您点击了${title}，更多详情请联系我们的客服。`);
    });
});

// AI助手相关代码
const aiAssistant = document.getElementById('aiAssistant');
const aiTrigger = document.getElementById('aiTrigger');
const minimizeBtn = document.getElementById('minimizeBtn');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 确保初始状态是最小化的
document.addEventListener('DOMContentLoaded', () => {
    // 确保AI助手可见且最小化
    aiAssistant.style.display = 'block';
    aiAssistant.classList.add('minimized');
});

// 触发按钮点击事件
aiTrigger.addEventListener('click', () => {
    aiAssistant.classList.toggle('minimized');
});

// 最小化按钮点击事件
minimizeBtn.addEventListener('click', () => {
    aiAssistant.classList.add('minimized');
});

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        // 添加用户消息
        addMessage(message, 'user');
        userInput.value = '';

        // 显示加载状态
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot';
        loadingDiv.innerHTML = `
            <img src="https://i.imgur.com/QXZJcK3.jpg" alt="AI" class="avatar">
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await getAIResponse(message);
            // 移除加载状态
            chatMessages.removeChild(loadingDiv);
            // 添加AI回复
            addMessage(response, 'bot');
        } catch (error) {
            // 移除加载状态
            chatMessages.removeChild(loadingDiv);
            // 显示错误消息
            addMessage('抱歉，服务出现了一些问题，请稍后再试。', 'bot');
            console.error('AI响应错误:', error);
        }
    }
}

// 添加消息到聊天窗口
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = type === 'user' 
        ? 'images/zhaoyuxuan.jpg'
        : 'https://i.imgur.com/QXZJcK3.jpg';
    avatar.alt = type === 'user' ? '用户' : 'AI小美';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 获取AI响应
async function getAIResponse(message) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer sk-27c64abe79fc4ee7a85c1add4d22afdc`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `你是一个直接简洁的AI助手：
                        1. 回答要简短直接，不需要客套语
                        2. 每次回复控制在50字以内
                        3. 使用简单的口语化表达
                        4. 不要说"抱歉"、"很高兴"等客套话
                        5. 记住以下信息：
                           - 电话：123-456-789
                           - 邮箱：info@company.com
                           - 工作时间：周一至周五 9:00-18:00`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 100,
                top_p: 0.95,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('API调用错误:', error);
        return getFallbackResponse(message);
    }
}

// 本地备用响应
function getFallbackResponse(message) {
    const responses = {
        '你好': '嗨！找我什么事？',
        '价格': '联系销售：123-456-789',
        '联系': '电话：123-456-789，邮箱：info@company.com',
        '地址': 'XX市XX区XX街XX号',
        '工作时间': '周一至周五，9点到6点'
    };

    for (let key in responses) {
        if (message.includes(key)) {
            return responses[key];
        }
    }

    return '说具体点，我没太明白你的问题';
}

// 发送按钮点击事件
sendBtn.addEventListener('click', sendMessage);

// 输入框回车事件
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 视频加载处理
document.querySelectorAll('.profile-video video').forEach(video => {
    const container = video.parentElement;
    
    // 添加加载状态
    video.addEventListener('loadstart', () => {
        container.classList.add('loading');
    });
    
    // 移除加载状态
    video.addEventListener('canplay', () => {
        container.classList.remove('loading');
    });
    
    // 错误处理
    video.addEventListener('error', () => {
        container.classList.remove('loading');
        container.innerHTML = '<div class="video-error">视频加载失败</div>';
    });
}); 
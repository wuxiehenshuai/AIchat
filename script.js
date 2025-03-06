document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    
    const API_KEY = 'sk-nhgqjsfxwxouwjokkyqdbwjtqeqkmbvsvokwzbhuaptyzfor';
    const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
    
    // 存储对话历史
    let conversationHistory = [{
        role: "system",
        content: "你是一个可爱的动漫少女角色，名叫小樱。你说话活泼可爱，经常使用颜文字表情。请用简短、轻松的语气回答问题。"
    }];
    
    // 添加消息到聊天窗口
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        
        const messageContent = document.createElement('p');
        messageContent.textContent = message;
        
        messageBubble.appendChild(messageContent);
        messageDiv.appendChild(messageBubble);
        chatMessages.appendChild(messageDiv);
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageContent; // 返回消息内容元素，用于流式更新
    }
    
    // 流式获取AI回复
    async function getAIStreamResponse(userMessage) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "Qwen/QwQ-32B",
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 512,
                    top_p: 0.7,
                    frequency_penalty: 0.5,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            
            // 创建一个消息气泡用于流式显示
            const messageElement = addMessage('', 'anime-girl');
            
            while (true) {
                const {value, done} = await reader.read();
                if (done) break;
                
                // 解码响应数据
                const chunk = decoder.decode(value);
                // 处理可能的多行数据
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.slice(5).trim();
                        if (data === '[DONE]') continue;
                        
                        try {
                            const jsonData = JSON.parse(data);
                            // 检查不同可能的数据结构
                            let content = '';
                            if (jsonData.choices && jsonData.choices[0]) {
                                if (jsonData.choices[0].delta) {
                                    content = jsonData.choices[0].delta.content || '';
                                } else if (jsonData.choices[0].message) {
                                    content = jsonData.choices[0].message.content || '';
                                }
                            }
                            
                            if (content) {
                                fullResponse += content;
                                messageElement.textContent = fullResponse;
                                // 滚动到最新位置
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (e) {
                            console.error('解析JSON数据错误:', e, 'Raw data:', data);
                        }
                    }
                }
            }
            
            return fullResponse || '抱歉，我好像走神了... (。・_・。)';
        } catch (error) {
            console.error('API调用错误:', error);
            return "抱歉，我现在有点累了，待会再聊吧~ (｡•́︿•̀｡)";
        }
    }
    
    // 发送消息事件
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;
        
        // 显示用户消息
        addMessage(message, 'user');
        messageInput.value = '';
        
        // 添加到对话历史
        conversationHistory.push({
            role: "user",
            content: message
        });
        
        // 显示加载状态
        sendButton.disabled = true;
        sendButton.textContent = '发送中...';
        messageInput.disabled = true;
        
        try {
            // 获取AI流式回复
            const aiResponse = await getAIStreamResponse(message);
            
            // 添加到对话历史
            conversationHistory.push({
                role: "assistant",
                content: aiResponse
            });
            
            // 保持对话历史在合理范围内（最多保留10轮对话）
            if (conversationHistory.length > 21) { // system(1) + 10轮对话(20)
                conversationHistory = [
                    conversationHistory[0],
                    ...conversationHistory.slice(-20)
                ];
            }
        } catch (error) {
            console.error('发送消息错误:', error);
            addMessage("抱歉，我遇到了一些问题 (｡•́︿•̀｡)", 'anime-girl');
        } finally {
            // 恢复发送按钮和输入框状态
            sendButton.disabled = false;
            sendButton.textContent = '发送';
            messageInput.disabled = false;
            messageInput.focus();
        }
    }
    
    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage);
    
    // 按下回车键发送
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    // 自动聚焦输入框
    messageInput.focus();
    
    // 初始欢迎语
    addMessage("你好啊！我是小樱，今天想聊些什么呢？(≧▽≦)", 'anime-girl');
}); 
const CONFIG = {
    API_URL: 'https://api.siliconflow.cn/v1/chat/completions',
    API_KEY: 'sk-nhgqjsfxwxouwjokkyqdbwjtqeqkmbvsvokwzbhuaptyzfor',
    // 为了安全起见，建议在实际使用时将API密钥存储在更安全的地方
    getApiKey: async function() {
        return this.API_KEY;
    }
}; 
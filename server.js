const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// API密钥代理
app.get('/api/get-key', (req, res) => {
    // 从环境变量获取API密钥
    res.send(process.env.API_KEY);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
export default async function handler(req, res) {
  const { path } = req.query;
  const backendUrl = `http://121.36.217.135/api/${path}`;
  
  try {
    // 构建请求选项
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy',
        // 传递其他必要的请求头
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        ...(req.headers.cookie && { 'Cookie': req.headers.cookie })
      }
    };
    
    // 如果有请求体，添加到选项中
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }
    
    // 发送请求到后端
    const response = await fetch(backendUrl, options);
    const data = await response.text();
    
    // 设置响应头
    res.status(response.status);
    
    // 传递重要的响应头
    if (response.headers.get('content-type')) {
      res.setHeader('Content-Type', response.headers.get('content-type'));
    }
    if (response.headers.get('set-cookie')) {
      res.setHeader('Set-Cookie', response.headers.get('set-cookie'));
    }
    
    // 返回响应数据
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', message: error.message });
  }
}
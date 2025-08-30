export default async function handler(req, res) {
  // Vercel不直接支持WebSocket代理
  // 这里返回一个提示信息，建议使用其他方式处理WebSocket连接
  if (req.method === 'GET') {
    res.status(426).json({
      error: 'WebSocket Upgrade Required',
      message: 'WebSocket connections are not supported in Vercel serverless functions. Consider using Socket.IO with polling fallback or direct connection to the backend server.',
      backendWsUrl: 'ws://121.36.217.135/api/ws'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
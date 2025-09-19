export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 只处理 /Image-processing 路径
    if (url.pathname.startsWith('/Image-processing')) {
      // 移除 /Image-processing 前缀，保留剩余路径
      const newPath = url.pathname.replace('/Image-processing', '') || '/';

      // 你的 Cloudflare Pages 域名（部署后替换这里）
      const targetUrl = `https://your-project.pages.dev${newPath}${url.search}`;

      // 创建新的请求
      const newRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // 获取响应
      const response = await fetch(newRequest);

      // 修改响应头，确保正确的 CORS 和缓存设置
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');

      return newResponse;
    }

    // 不是目标路径，继续正常处理
    return fetch(request);
  },
};
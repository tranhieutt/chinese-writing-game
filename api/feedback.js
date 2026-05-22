export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { difficulty, features } = req.body || {};
  const difficultyText = typeof difficulty === 'string' ? difficulty.trim() : '';
  const featuresText = typeof features === 'string' ? features.trim() : '';

  if (!difficultyText && !featuresText) {
    return res.status(400).json({ error: 'Nội dung góp ý không được để trống' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN is missing in environment variables.');
    return res.status(500).json({ error: 'GitHub Token chưa được cấu hình trên server.' });
  }

  const repoOwner = process.env.FEEDBACK_REPO_OWNER || 'tranhieutt';
  const repoName = process.env.FEEDBACK_REPO_NAME || 'chinese-writing-game';

  const dateStr = new Date().toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const title = `[Góp ý] Phản hồi từ người dùng (${dateStr})`;
  const body = `
### 1. Bạn có gặp khó khăn gì khi sử dụng không?
${difficultyText || '*Không có ý kiến*'}

### 2. Bạn muốn sản phẩm có thêm tính năng gì?
${featuresText || '*Không có ý kiến*'}

---
*Gửi từ chức năng Góp ý của Game Luyện Viết Chữ Hán.*
  `.trim();

  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Feedback-Proxy'
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['feedback', 'user-submitted']
      })
    });

    const responseText = await response.text();
    const responseData = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      console.error('GitHub API Error response:', responseData);
      return res.status(response.status).json({
        error: 'Failed to create GitHub Issue',
        details: responseData.message || responseData
      });
    }

    return res.status(200).json({ success: true, issueUrl: responseData.html_url });
  } catch (error) {
    console.error('GitHub integration error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

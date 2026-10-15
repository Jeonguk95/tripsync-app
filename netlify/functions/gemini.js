// 파일 경로: netlify/functions/gemini.js
exports.handler = async (event) => {
  // POST 요청만 허용
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Netlify 대시보드에 숨겨둔 환경변수에서 API 키 가져오기
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: "서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다." } })
    };
  }

  try {
    const { prompt, model = "gemini-2.5-flash", temperature = 0.4 } = JSON.parse(event.body);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }], // 실시간 구글 검색(Grounding) 활성화
        generationConfig: { temperature }
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};
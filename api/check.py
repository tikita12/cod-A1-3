from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI

# Vercel Python 함수는 BaseHTTPRequestHandler를 상속한 handler 클래스가 필요
class handler(BaseHTTPRequestHandler):

    def do_POST(self): #프론트가 POST로 보낸 요청을 처리
        try:
            # 1. 프론트에서 보낸 데이터 읽기
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            animal = data.get('animal', '').strip() #프론트에서 보낸 값 꺼내기
            age = data.get('age', '').strip()
            symptom = data.get('symptom', '').strip()
            duration = data.get('duration', '').strip()

            # 2. 빈 입력 검증 (실패 처리 ①)
            if not animal or not symptom:
                self.send_json(400, {
                    "error": "동물 종류와 증상을 모두 입력해주세요."
                })
                return

            # 3. OpenAI에 보낼 프롬프트 구성
            prompt = f"""너는 반려동물 응급도를 판단하는 도우미야.
아래 정보를 보고 응급도를 판정해줘.

- 동물 종류: {animal}
- 나이: {age or '미입력'}
- 증상: {symptom}
- 지속 기간: {duration or '미입력'}

반드시 아래 JSON 형식으로만 답변해:
{{
  "emergency_level": "🔴즉시 병원" 또는 "🟡24시간 내" 또는 "🟢경과 관찰",
  "checklist": ["병원 가기 전 확인할 것 1", "2", "3"],
  "warning_signs": ["이러면 바로 병원 신호 1", "2"],
  "disclaimer": "이 정보는 참고용이며 정확한 진단은 수의사에게 받으세요."
}}"""

            # 4. OpenAI API 호출
            client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
            response = client.chat.completions.create(
                model="GPT-5 Mini",  
                messages=[
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}  # JSON으로 답변 강제(파싱 용이)
            )

            # 5. AI 답변 파싱
            ai_result = json.loads(response.choices[0].message.content)

            # 6. 프론트로 결과 전송
            self.send_json(200, ai_result)

        except Exception as e:
            # API 오류 처리 (실패 처리 ②)
            print("에러:", str(e))
            self.send_json(500, {
                "error": "일시적 오류입니다. 잠시 후 다시 시도해주세요."
            })

    # JSON 응답을 보내는 헬퍼 함수
    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
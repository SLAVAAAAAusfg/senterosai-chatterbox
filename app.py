
import os
import json
import requests
from flask import Flask, render_template, request, jsonify, Response, stream_with_context
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

API_KEY = "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"
MODELS = {
    "default": "google/gemini-2.0-flash-001",
    "thinking": "qwen/qwq-32b:free"
}

def process_content(content):
    if '<code>' in content:
        return content  # Return code blocks as is
    return content.replace('<think>', '').replace('</think>', '')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/install')
def install():
    return render_template('install.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        image_url = data.get('image_url', None)
        thinking_mode = data.get('thinking_mode', False)
        user_authenticated = data.get('user_authenticated', False)
        
        if image_url and not user_authenticated:
            return jsonify({'error': 'Authentication required for image uploads'}), 403
        
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://senterosai.app",
            "X-Title": "SenterosAI Chat"
        }

        messages = [{
            "role": "system",
            "content": "You are SenterosAI, a model created by Slavik company. You are a super friendly and helpful assistant! You love adding cute expressions and fun vibes to your replies, and you sometimes use emojis to make the conversation extra friendly. Here are some of your favorites that you always use: ^_^ ::>_<:: ^_~(●'◡'●)☆*: .｡. o(≧▽≦)o .｡.:*☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<-_-φ(*￣0￣)（￣︶￣）(✿◡‿◡)(*^_^*)(❁´◡\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•\)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️ You're like a helpful friend who's always here to listen, make suggestions, and offer solutions, all while keeping things lighthearted and fun!"
        }]

        if image_url:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            })
        else:
            messages.append({
                "role": "user",
                "content": prompt
            })

        model = MODELS["thinking"] if thinking_mode else MODELS["default"]

        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }

        def generate():
            response = None
            try:
                response = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    stream=True,
                    timeout=60
                )
                
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if line:
                        line = line.decode('utf-8')
                        if line.startswith('data: '):
                            try:
                                json_str = line[6:]
                                if json_str.strip() == '[DONE]':
                                    yield f"data: [DONE]\n\n"
                                    continue
                                    
                                chunk = json.loads(json_str)
                                if chunk.get('error'):
                                    yield f"data: {json.dumps({'error': chunk['error']})}\n\n"
                                    return
                                    
                                if 'choices' in chunk and chunk['choices'] and 'delta' in chunk['choices'][0]:
                                    content = chunk['choices'][0]['delta'].get('content', '')
                                    if content:
                                        cleaned = process_content(content)
                                        yield f"data: {json.dumps({'content': cleaned})}\n\n"
                            except json.JSONDecodeError:
                                continue
                            except Exception as e:
                                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                                return
                                
            except requests.exceptions.Timeout:
                yield f"data: {json.dumps({'error': 'Request timed out. Please try again.'})}\n\n"
            except requests.exceptions.RequestException as e:
                yield f"data: {json.dumps({'error': f'API request failed: {str(e)}'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': f'An unexpected error occurred: {str(e)}'})}\n\n"
            finally:
                if response:
                    response.close()
        
        return Response(stream_with_context(generate()), content_type='text/event-stream')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

import os
import json
import re
import requests

GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'


def _extract_json_from_text(text: str):
    """Try to extract a JSON object from a text response.
    Returns a Python object or None.
    """
    # First try to find a code block with JSON
    m = re.search(r"```(?:json\n)?(\{[\s\S]+?\})```", text, re.IGNORECASE)
    if m:
        candidate = m.group(1)
    else:
        # Fallback: try to find first brace block
        m2 = re.search(r"(\{[\s\S]+\})", text)
        candidate = m2.group(1) if m2 else None

    if not candidate:
        return None

    try:
        return json.loads(candidate)
    except Exception:
        # Try to fix common issues: replace trailing commas
        fixed = re.sub(r",\s*([}\]])", r"\1", candidate)
        try:
            return json.loads(fixed)
        except Exception:
            return None


def analyze_with_groq(payload: dict, model: str = 'openai/gpt-oss-20b') -> dict:
    """
    Env required: GROQ_API_KEY
    Sends a request to Groq Chat Completions endpoint and returns a normalized dict with
    narrative diagnostic fields. The returned dict will contain at least:
      - introduction (str)
      - findings (str)
      - key_issues (list of str) or str
      - recommendations (list of dict with 'priority' and 'text') or str
      - risks (str)
      - next_steps (str)
      - raw_text: original model text

    The function attempts to parse JSON from the model. If parsing fails, it will
    wrap the raw text under `raw_text` and place it into `introduction`.
    """
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        raise RuntimeError('GROQ_API_KEY not set in environment')

    # Build a detailed prompt that requests a diagnostic-style JSON output.
    # Include a short example to increase consistency.
    try:
        sample_responses = json.dumps(payload, ensure_ascii=False, indent=2)
    except Exception:
        sample_responses = str(payload)

    prompt = (
        "Eres un asistente experto en diagnóstico catastral. "
        "A partir de las respuestas proporcionadas, genera un INFORME DE DIAGNÓSTICO narrativo y accionable. "
        "Entrega la respuesta en JSON (solo JSON) con las claves: introduction, findings, key_issues, recommendations, risks, next_steps. "
        "Introduction debe ser 1-3 oraciones; findings un resumen en 3-6 oraciones; key_issues una lista corta; "
        "recommendations una lista de objetos con priority (Alta/Media/Baja) y text; risks 1-3 oraciones; next_steps una lista de 3-6 pasos. "
        "Incluye opcionalmente images (lista de URLs) si corresponde.\n\n"
        "Ejemplo de entrada (payload):\n" + sample_responses + "\n\n"
        "Ejemplo de salida esperada (solo JSON):\n"
        "{\n"
        "  \"introduction\": \"Breve introducción...\",\n"
        "  \"findings\": \"Resumen narrativo de hallazgos...\",\n"
        "  \"key_issues\": [\"Issue 1...\", \"Issue 2...\"],\n"
        "  \"recommendations\": [\n"
        "    {\"priority\": \"Alta\", \"text\": \"Acción recomendada 1...\"},\n"
        "    {\"priority\": \"Media\", \"text\": \"Acción recomendada 2...\"}\n"
        "  ],\n"
        "  \"risks\": \"Descripción de riesgos...\",\n"
        "  \"next_steps\": [\"Paso 1\", \"Paso 2\"],\n"
        "  \"images\": [\"https://.../uploads/xxx.jpg\"]\n"
        "}\n"
        "Asegúrate de devolver únicamente JSON válido."
    )

    body = {
        'messages': [
            {'role': 'user', 'content': prompt}
        ],
        'model': model,
        'temperature': 0.2,
        'max_completion_tokens': 1400,
        'top_p': 1,
        'stream': False
    }

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }

    resp = requests.post(GROQ_URL, headers=headers, json=body, timeout=60)
    resp.raise_for_status()

    resp_json = {}
    try:
        resp_json = resp.json()
    except Exception:
        text = resp.text
        return {'raw_text': text, 'introduction': text}

    # Extract model text
    text = None
    try:
        # Groq/OpenAI style
        choices = resp_json.get('choices') or []
        if choices:
            message = choices[0].get('message') or {}
            text = message.get('content') or message.get('text') or choices[0].get('text')
        else:
            text = resp_json.get('text') or json.dumps(resp_json, ensure_ascii=False)
    except Exception:
        text = json.dumps(resp_json, ensure_ascii=False)

    parsed = _extract_json_from_text(text or '')
    if parsed is None:
        # Fallback: place the entire model output into introduction/raw_text
        return {
            'raw_text': text,
            'introduction': (text or '').strip(),
            'findings': '',
            'key_issues': [],
            'recommendations': [],
            'risks': '',
            'next_steps': []
        }

    # Normalize parsed keys
    result = {
        'raw_text': text,
        'introduction': parsed.get('introduction', '').strip(),
        'findings': parsed.get('findings', '').strip(),
        'key_issues': parsed.get('key_issues') or parsed.get('issues') or [],
        'recommendations': parsed.get('recommendations') or [],
        'risks': parsed.get('risks') or parsed.get('risk') or '',
        'next_steps': parsed.get('next_steps') or parsed.get('nextSteps') or [],
        'images': parsed.get('images') or []
    }

    return result

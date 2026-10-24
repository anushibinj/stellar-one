import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

def _as_int(value: Any) -> Optional[int]:
    return value if isinstance(value, int) and not isinstance(value, bool) and value >= 0 else None

def chat_usage_from_message(response: Any) -> Optional[Dict[str, int]]:
    """Extract token details from a LangChain AIMessage. Returns None if unavailable; never raises."""
    try:
        meta = getattr(response, "usage_metadata", None)
        if not meta:
            return None
        usage: Dict[str, int] = {}
        for key in ("input_tokens", "output_tokens", "total_tokens"):
            val = _as_int(meta.get(key))
            if val is not None:
                usage[key] = val
        for group, fields in (("input_token_details", ("cache_read", "cache_creation", "audio")),
                              ("output_token_details", ("reasoning", "audio"))):
            for field in fields:
                val = _as_int((meta.get(group) or {}).get(field))
                if val is not None:
                    usage[f"{group.split('_')[0]}_{field}_tokens"] = val
        return usage or None
    except Exception as e:
        logger.warning(f"Could not read chat token usage: {e}")
        return None

def embedding_usage_from_response(data: Any) -> Optional[Dict[str, int]]:
    """Extract token details from an OpenAI-style embeddings response. Returns None if unavailable; never raises."""
    try:
        usage = data.get("usage") if isinstance(data, dict) else None
        if not isinstance(usage, dict):
            return None
        out: Dict[str, int] = {}
        for src, dst in (("prompt_tokens", "input_tokens"), ("total_tokens", "total_tokens")):
            val = _as_int(usage.get(src))
            if val is not None:
                out[dst] = val
        return out or None
    except Exception as e:
        logger.warning(f"Could not read embedding token usage: {e}")
        return None

def summarize_usage(attempts: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Aggregate per-attempt usage ({"chat": {...}|None, "embedding": {...}|None}) into a storable dict.

    Returns None (stored as NULL, shown as NA) when no token information was available at all. Never raises.
    """
    try:
        chat: Dict[str, int] = {}
        embedding: Dict[str, int] = {}
        for a in attempts or []:
            for target, usage in ((chat, a.get("chat")), (embedding, a.get("embedding"))):
                for k, v in (usage or {}).items():
                    target[k] = target.get(k, 0) + v
        if not chat and not embedding:
            return None
        result: Dict[str, Any] = {}
        if chat:
            result["chat"] = chat
        if embedding:
            result["embedding"] = embedding
        result["total_tokens"] = chat.get("total_tokens", chat.get("input_tokens", 0) + chat.get("output_tokens", 0)) \
            + embedding.get("total_tokens", embedding.get("input_tokens", 0))
        result["attempts"] = attempts
        return result
    except Exception as e:
        logger.warning(f"Could not summarize token usage: {e}")
        return None

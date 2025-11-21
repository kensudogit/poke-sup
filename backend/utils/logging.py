"""
構造化ログユーティリティ
Railwayのログエクスプローラーで検索・フィルタリングしやすくするため、JSON形式でログを出力
"""
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional

def log_structured(
    level: str,
    message: str,
    **kwargs: Any
) -> None:
    """
    構造化ログを出力
    
    Args:
        level: ログレベル (debug, info, warn, error)
        message: ログメッセージ
        **kwargs: 追加の属性（カスタム属性として検索可能）
    
    Example:
        log_structured("info", "User logged in", userId=123, email="user@example.com")
        log_structured("error", "Database connection failed", error=str(e), retry_count=3)
    """
    log_data: Dict[str, Any] = {
        "level": level.lower(),
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        **kwargs
    }
    
    # JSON形式で1行に出力（Railwayのログパーサーが正しく解析できるように）
    print(json.dumps(log_data, ensure_ascii=False), file=sys.stdout if level != "error" else sys.stderr)

def log_info(message: str, **kwargs: Any) -> None:
    """情報ログ"""
    log_structured("info", message, **kwargs)

def log_error(message: str, error: Optional[Exception] = None, **kwargs: Any) -> None:
    """エラーログ"""
    error_data = {}
    if error:
        error_data = {
            "error_type": type(error).__name__,
            "error_message": str(error),
        }
        # スタックトレースがある場合は含める
        import traceback
        error_data["traceback"] = traceback.format_exc()
    
    log_structured("error", message, **{**error_data, **kwargs})

def log_warn(message: str, **kwargs: Any) -> None:
    """警告ログ"""
    log_structured("warn", message, **kwargs)

def log_debug(message: str, **kwargs: Any) -> None:
    """デバッグログ"""
    log_structured("debug", message, **kwargs)


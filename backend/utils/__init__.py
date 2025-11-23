"""
ユーティリティモジュール
"""
from .logging import log_info, log_error, log_warn, log_debug, log_structured
from extensions import db
from models import User, UserRole

def get_default_user_id():
    """Get default user ID (bypass authentication)"""
    try:
        # 最初のユーザーを取得、存在しない場合はデフォルトユーザーを作成
        user = User.query.first()
        if not user:
            # デフォルトユーザーを作成
            user = User(
                email='default@example.com',
                name='Default User',
                role=UserRole.PATIENT,
                language='ja'
            )
            user.set_password('default')
            db.session.add(user)
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                # コミットに失敗した場合、既存のユーザーを再取得
                user = User.query.first()
                if not user:
                    # それでもユーザーが見つからない場合は、ID=1を返す（仮）
                    return 1
        return user.id
    except Exception as e:
        # データベース接続エラーなどの場合、ID=1を返す（仮）
        return 1

__all__ = ['log_info', 'log_error', 'log_warn', 'log_debug', 'log_structured', 'get_default_user_id']


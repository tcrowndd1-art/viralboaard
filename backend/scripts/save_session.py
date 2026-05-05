"""
ViralBoard 자동 세션 저장 스크립트
실행: python save_session.py
- Supabase DB 건수 자동 쿼리
- docs/DAILY-{날짜}.md 생성 (존재 시 _2, _3 ... 순번)
- git commit 자동 실행
"""
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

from dotenv import load_dotenv
from supabase import create_client

SCRIPT_DIR = Path(__file__).parent
GIT_ROOT = SCRIPT_DIR.parent.parent          # c:/Ai_Wiki/viralboard
DOCS_DIR = GIT_ROOT / "docs"                 # c:/Ai_Wiki/viralboard/docs
ENV_PATH = GIT_ROOT / ".env"                 # c:/Ai_Wiki/viralboard/.env

load_dotenv(ENV_PATH)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


def get_counts(sb):
    vd  = sb.table("viralboard_data").select("*", count="exact").limit(0).execute()
    vta = sb.table("viral_title_archive").select("*", count="exact").limit(0).execute()
    return vd.count, vta.count


def resolve_path(docs_dir: Path, date_str: str) -> Path:
    base = docs_dir / f"DAILY-{date_str}.md"
    if not base.exists():
        return base
    i = 2
    while True:
        candidate = docs_dir / f"DAILY-{date_str}_{i}.md"
        if not candidate.exists():
            return candidate
        i += 1


def main():
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%Y-%m-%d %H:%M:%S")

    print(f"[save_session] {time_str} 세션 저장 시작")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[ERROR] SUPABASE 환경변수 없음 — .env 확인 필요")
        return

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    vd_count, vta_count = get_counts(sb)
    print(f"[INFO] viralboard_data: {vd_count}건 | viral_title_archive: {vta_count}건")

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    daily_path = resolve_path(DOCS_DIR, date_str)

    content = f"""---
# ViralBoard 세션 일지 - {date_str}

## DB 현황 (자동)
- viralboard_data: {vd_count}건
- viral_title_archive: {vta_count}건
- 수집 시각: {time_str}

## 오늘 완료한 작업
-

## 진행 중인 작업
-

## 내일 이어서 할 것
-

## 이슈 / 메모
-
---
"""

    daily_path.write_text(content, encoding="utf-8")
    print(f"[INFO] 세션 파일 생성: {daily_path.name}")

    rel = daily_path.relative_to(GIT_ROOT).as_posix()
    subprocess.run(["git", "add", rel], cwd=str(GIT_ROOT), check=True)
    subprocess.run(
        ["git", "commit", "-m", f"session: {date_str} 자동 세션 저장"],
        cwd=str(GIT_ROOT), check=True
    )
    print(f"[완료] 커밋 완료 — {daily_path.name}")


if __name__ == "__main__":
    main()

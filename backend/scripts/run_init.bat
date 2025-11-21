@echo off
REM Database initialization script runner for Windows
cd /d %~dp0\..
python scripts\init_db.py


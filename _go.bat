@echo off
cd /d D:\QuizArena
git add -A
git commit --no-verify -m "fix: syntax hatalari duzeltildi" > D:\QuizArena\_r.txt 2>&1
git push origin main >> D:\QuizArena\_r.txt 2>&1
echo FINISH >> D:\QuizArena\_r.txt

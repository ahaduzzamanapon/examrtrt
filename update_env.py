#!/usr/bin/env python3
import re

env_path = '/home/lcsyxfen/exam-arena-app/.env'

with open(env_path, 'r') as f:
    content = f.read()

# Update DB credentials
content = re.sub(r'DB_DATABASE=.*', 'DB_DATABASE=lcsyxfen_exam-arena', content)
content = re.sub(r'DB_USERNAME=.*', 'DB_USERNAME=lcsyxfen_exam-arena', content)
content = re.sub(r'DB_PASSWORD=.*', 'DB_PASSWORD="kReEMq=c}h,W.Tgb"', content)
# Fix APP_NAME quoting
content = re.sub(r'APP_NAME=NXLY_Exam_Arena', 'APP_NAME="NXLY Exam Arena"', content)

with open(env_path, 'w') as f:
    f.write(content)

print('✅ .env updated with DB credentials!')

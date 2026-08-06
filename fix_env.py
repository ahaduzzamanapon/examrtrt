#!/usr/bin/env python3
import re

env_path = '/home/lcsyxfen/exam-arena-app/.env'

with open(env_path, 'r') as f:
    content = f.read()

# Fix APP_NAME — ensure it's quoted
content = re.sub(r'^APP_NAME=(.+)$', lambda m: f'APP_NAME="{m.group(1).strip()}"' if not m.group(1).strip().startswith('"') else f'APP_NAME={m.group(1).strip()}', content, flags=re.MULTILINE)

with open(env_path, 'w') as f:
    f.write(content)

# Verify
with open(env_path, 'r') as f:
    first_line = f.readline().strip()
print(f'APP_NAME line: {first_line}')
print('Done!')

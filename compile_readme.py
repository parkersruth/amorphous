
import subprocess
import re

HTML_FILE = 'index.html'
MD_FILE = 'README.md'
START_TAG = '<!-- BEGIN README -->'
END_TAG = '<!-- END README -->'

result = subprocess.run(['multimarkdown', MD_FILE], stdout=subprocess.PIPE)
md = START_TAG + '\n' + result.stdout.decode() + '\n' + END_TAG

print("md:\n\n" + md)

f = open(HTML_FILE, 'r')
html = f.read()
f.close()

print('\n\nhtml:\n\n' + html)
regex = START_TAG + '.*' + END_TAG
print('\n\nregex:\n\n' + regex)
html = re.sub(regex, md, html, flags=re.DOTALL)
print('\n\nhtml:\n\n' + html)

f = open(HTML_FILE, 'w')
f.write(html)
f.close()

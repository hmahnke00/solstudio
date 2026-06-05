import json, os

# Regenerate js/gallery-data.js from gallery.json so the page works
# when opened as a local file:// (fetch() is blocked in that context).
with open('gallery.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

js_content = 'var GALLERY_DATA = ' + json.dumps(data, indent=2) + ';\n'
os.makedirs('js', exist_ok=True)
with open('js/gallery-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'✅ js/gallery-data.js regenerated ({len(data)} photos).')

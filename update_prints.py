import json, os

# Regenerate js/prints-data.js from prints.json so the page works
# when opened as a local file:// (fetch() is blocked in that context).
# Mirrors update_gallery.py, adapted for the Prints page's data shape.
with open('prints.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

js_content = 'var PRINTS_DATA = ' + json.dumps(data, indent=2) + ';\n'
os.makedirs('js', exist_ok=True)
with open('js/prints-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'✅ js/prints-data.js regenerated ({len(data)} photos).')

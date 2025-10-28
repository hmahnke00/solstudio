import os

photo_folder = 'gallery_photos'
gallery_file = 'gallery.html'

# Grab all valid image files
image_files = sorted([
    f for f in os.listdir(photo_folder)
    if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
])

# Create <img> tags
image_tags = '\n  '.join(
    f'<div class="image-container">\n    <img src="{photo_folder}/{file}" alt="{file.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()}">\n  </div>'
    for file in image_files
)

# Read existing gallery.html
with open(gallery_file, 'r', encoding='utf-8') as file:
    html = file.read()

# Replace the placeholder section
start_tag = '<!-- START GALLERY -->'
end_tag = '<!-- END GALLERY -->'

start_index = html.find(start_tag) + len(start_tag)
end_index = html.find(end_tag)

if start_index == -1 or end_index == -1:
    print("Placeholder tags not found in gallery.html")
else:
    updated_html = html[:start_index] + '\n  ' + image_tags + '\n' + html[end_index:]
    with open(gallery_file, 'w', encoding='utf-8') as file:
        file.write(updated_html)
    print("✅ gallery.html updated successfully.")

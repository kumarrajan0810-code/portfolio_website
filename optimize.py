import os
from PIL import Image

def convert_to_webp(directory):
    for root, dirs, files in os.walk(directory):
        if '.git' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.lower().endswith('.png') or file.lower().endswith('.jpg') or file.lower().endswith('.jpeg'):
                ext = os.path.splitext(file)[1]
                file_path = os.path.join(root, file)
                webp_path = os.path.splitext(file_path)[0] + '.webp'
                
                print(f"Converting {file_path} to {webp_path}...")
                
                try:
                    img = Image.open(file_path)
                    img.save(webp_path, 'webp', quality=85)
                    os.remove(file_path)
                    print(f"Success: {webp_path}")
                except Exception as e:
                    print(f"Failed to convert {file_path}: {e}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    print(f"Starting conversion in {current_dir}")
    convert_to_webp(current_dir)
    print("Done!")

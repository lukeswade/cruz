import requests
from bs4 import BeautifulSoup
import os
import urllib.parse

url = 'https://www.cruzcoaching.net/our-team'
headers = {'User-Agent': 'Mozilla/5.0'}
r = requests.get(url, headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')

os.makedirs('downloaded_images', exist_ok=True)
images = soup.find_all('img')

for i, img in enumerate(images):
    src = img.get('src') or img.get('data-src') or img.get('data-image')
    if src:
        if src.startswith('//'):
            src = 'https:' + src
        elif src.startswith('/'):
            src = 'https://www.cruzcoaching.net' + src
        
        try:
            print(f"Downloading {src}")
            img_data = requests.get(src).content
            ext = src.split('?')[0].split('.')[-1]
            if len(ext) > 4: ext = 'jpg'
            with open(f"downloaded_images/img_{i}.{ext}", 'wb') as handler:
                handler.write(img_data)
        except Exception as e:
            print(f"Failed {src}: {e}")


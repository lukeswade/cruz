import urllib.request
import re
import os
import ssl

url = 'https://www.cruzcoaching.net/our-team'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    img_matches = re.findall(r'<img[^>]+src=(["\'])(.*?)\1', html)
    data_matches = re.findall(r'<img[^>]+data-image=(["\'])(.*?)\1', html)
    
    urls = set(m[1] for m in img_matches + data_matches)
    
    os.makedirs('downloaded_images', exist_ok=True)
    
    i = 0
    for src in urls:
        if src.startswith('//'): src = 'https:' + src
        elif src.startswith('/'): src = 'https://www.cruzcoaching.net' + src
        
        print(f"Downloading: {src}")
        try:
            req_img = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
            img_data = urllib.request.urlopen(req_img, context=ctx).read()
            with open(f"downloaded_images/img_{i}.jpg", "wb") as f:
                f.write(img_data)
            i += 1
        except Exception as e:
            print(f"Failed {src}: {e}")
except Exception as e:
    print(f"Error: {e}")

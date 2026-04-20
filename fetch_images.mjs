import fs from 'fs';
import path from 'path';

const url = 'https://www.cruzcoaching.net/our-team';

async function run() {
  const res = await fetch(url);
  const text = await res.text();
  
  const imgRegex = /<img[^>]+src=(["'])([^"']+)\1/g;
  const dataImageRegex = /<img[^>]+data-image=(["'])([^"']+)\1/g;
  
  let match;
  const imageUrls = new Set();
  
  while ((match = imgRegex.exec(text)) !== null) {
      imageUrls.add(match[2]);
  }
  while ((match = dataImageRegex.exec(text)) !== null) {
      imageUrls.add(match[2]);
  }
  
  if (!fs.existsSync('downloaded_images')) {
      fs.mkdirSync('downloaded_images');
  }
  
  let i = 0;
  for (let src of imageUrls) {
      if (src.startsWith('//')) src = 'https:' + src;
      else if (src.startsWith('/')) src = 'https://www.cruzcoaching.net' + src;
      
      try {
          console.log(`Downloading: ${src}`);
          const imgRes = await fetch(src);
          const buffer = await imgRes.arrayBuffer();
          fs.writeFileSync(`downloaded_images/img_${i}.jpg`, Buffer.from(buffer));
          i++;
      } catch (e) {
          console.error(`Failed ${src}`, e.message);
      }
  }
}

run();

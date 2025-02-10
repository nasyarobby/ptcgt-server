import { Jimp } from 'jimp';

/**
 * @param {string[]} files
 */
export default async function createPackResult(files) {
  const image = new Jimp({
    width: (733+50)*5, height: (1024 * 2)+100, color: 0xffffffff 
  });

  
  for (let i = 0; i < 5; i++) {
    const card = await Jimp.read(files[i]);
    await image.composite(card, (i*(733+50)+25), 50)
  }
  

  for (let i = 5; i < 10; i++) {
    const card = await Jimp.read(files[i]);
    await image.composite(card, ((i-5)*(733+50)+25), 1024+70)
  }
  
  
  image.write('./pack.png')
}

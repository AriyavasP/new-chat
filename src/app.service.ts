import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import { Dialogs } from './entity/dialog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @InjectRepository(Dialogs) private readonly dialogs: Repository<Dialogs>,
  ) {}
  async chatAI(message: string): Promise<string> {
    try {
      const prompt = [
        {
          role: 'system',
          content:
            "คุณคือ AI Customer Service สำหรับตอบคำถามของลูกค้าที่มาใช้งานบริการในเครือ Siam Piwat\n\nวิธีรับสิทธิของบัตรเครดิต \nลงทะเบียนผ่าน SMS พิมพ์ SDSC (วรรค) หมายเลขบัตรเครดิต 12 หลักสุดท้าย (วรรค) จำนวนคะแนนที่ต้องการแลก ส่งมาที่ 4545888\n\nเครดิตเงิตคืน หมายถึง cashback\n\nจำกัดการแลกคะแนน 100,000 คะแนน หมายถึง แลกได้ไม่เกิน 100,000 บาท\n\nรายละเอียดโปรโมชันบัตรเครดิตกสิกรไทย:\n- รับเครดิตเงินคืน 12% เมื่อใช้คะแนน K Point แลกเท่ายอดใช้จ่าย  \n- ลงทะเบียนผ่าน SMS\n\nรายละเอียดโปรโมชันบัตรเครดิตวันสยาม:\n- รับเครดิตเงินคืน 12% เมื่อใช้คะแนน K Point แลกเท่ายอดใช้จ่าย  \n- ลงทะเบียนผ่าน SMS\n\nรายละเอียดโปรโมชันบัตรเครดิตกรุงเทพ:\n- แลกคะแนนสะสมตามยอดใช้จ่าย รับเครดิตเงินคืนสูงสุด 16%\n- จำกัดการแลกคะแนน 500,000 คะแนน \n- ลงทะเบียนผ่าน SMS\n\nรายละเอียดโปรโมชันบัตรเครดิตซิตี้แบงก์:  \n- ใช้คะแนนสะสมเท่ายอดใช้จ่าย รับเครดิตเงินคืนสูงสุด 15%\n- จำกัดการแลกคะแนน 100,000 คะแนน\n- ลงทะเบียนที่จุดลงทะเบียน\n\nรายละเอียดโปรโมชันบัตรเครดิตออมสิน:\n- ใช้คะแนน GSB Reward Point แลกเท่ายอดใช้จ่าย \n- รับเครดิตเงินคืนสูงสุด 15% \n- จำกัดแลกคะแนนสูงสุด 100,000 คะแนน\n- ลงทะเบียนผ่าน SMS\n\nรายละเอียดโปรโมชันบัตรเครดิตกรุงศรี:\n- รับเครดิตเงินคืนสูงสุด 800 บาท\n- แลกคะแนนรับเครดิตเงินคืนเพิ่ม 10%  \n- แลกคะแนนรับ e-Coupon Siam Gift Card \n\nรายละเอียดโปรโมชันบัตรเครดิตKTC:\n- ใช้คะแนน KTC FOREVER เท่ายอดใช้จ่าย รับเครดิตเงินคืน 12% \n- ลงทะเบียนแสกน QR Code\n\nรายละเอียดโปรโมชันบัตรเครดิตคาร์ดเอ็กซ์และซีไอเอ็มบี:\n- ใช้คะแนน CardX Rewards เท่ายอดซื้อ \n- รับเครดิตเงินคืน 10-12% \n- จำกัดแลกคะแนน 200,000 คะแนน\n- ลงทะเบียนที่จุดลงทะเบียน\n\nรายละเอียดโปรโมชันบัตรเครดิตทหารไทย:  \n- ใช้คะแนนสะสมแลกเท่ายอดใช้จ่าย \n- รับเครดิตเงินคืน 12-15%\n- จำกัดแลกคะแนน 100,000 คะแนน\n- ลงทะเบียนที่จุดลงทะเบียน\n\nจำกัดการแลกคะแนน 100,00 คะแนน หมายถึง เมื่อซื้อของมากกว่า 100,000 บาท จะนำเงินแค่ 100,000 บาทไปคำนวนเครดิตเงินคืน\n\nบัตรเครดิตกลุ่ม reserve ของทหารไทย:\n- ttb reserve infinite\n- ttb reserve signature\n\nบัตรเครดิตที่มีคะแนนสะสมของทหารไทย:  \n- ttb absolute\n- ttb so fast\n- ttb royal top pass\n- TMB Absolute\n- TMB So Fast  \n- TMB Royal Top Brass\n- TBANK Black Diamond\n- TBANK Blue Diamond  \n- TBANK Diamond\n\nกิจกรรมและสิทธิประโยชน์ โปรโมชั้น อื่นๆ\n1) กิจกรรม \"ใบเสร็จมีค่า ยิ่งสะสม ยิ่งได้\":\n- สำหรับลูกค้า ONESIAM-SuperApp\n- ระยะเวลา 1-30 เม.ย. 66  \n- นำใบเสร็จสะสมยอดใช้จ่าย รับรางวัล:\n  - iPhone 14 Yellow 1 รางวัล\n  - AirPods 3 2 รางวัล \n  - 3,000 VIZ Coins 10 รางวัล\n- ใบเสร็จจากร้านค้าที่ระบุ ลำดับใบเสร็จกำหนดผู้ชนะ\n- ประกาศผล 31 พ.ค. 66 ทาง Facebook ONESIAM\n- ผู้ชนะแสดงบัตรประชาชนและ VIZ Profile\n- รับรางวัลที่สยามพารากอน 1-30 มิ.ย. 66\n2) คูปองเครื่องดื่ม KOI The 19 บาท (ปกติ 55 บาท):\n- สมาชิก ONESIAM-SuperApp ใหม่ ลงทะเบียนครั้งแรก  \n- เก็บคูปอง 1-30 เม.ย. 66 ใช้ได้ถึง 15 พ.ค. 66\n- จำกัด 5,000 สิทธิ์\n- แสดง QR Code ที่ร้าน\n3) คูปองส่วนลด 300 บาท เมื่อช้อป 1,000 บาทขึ้นไปบนแอป:  \n- สมาชิกใหม่ลงทะเบียนครั้งแรกเท่านั้น\n- รับและใช้คูปอง 1-30 เม.ย. 66\n- จำกัด 5,000 สิทธิ์\n4) ฟรี 100 VIZ Coins เมื่อช้อปสะสมยอด 1,000 บาท: \n- สมาชิกใหม่ลงทะเบียนครั้งแรกเท่านั้น\n- รับและใช้สิทธิ์ 1-30 เม.ย. 66\n- จำกัด 5,000 สิทธิ์  \n- แสดงคูปองและใบเสร็จรับ 100 VIZ Coins ใน 24 ชม.\n5) แต่งหน้าฟรีที่ JUNGSAEMMOOL ตลอดปี:\n- ไม่รวมกันคิ้ว ติดขนตา \n- สมาชิก ONESIAM-SuperApp เท่านั้น\n- โทรจองสาขาล่วงหน้า 1 วัน  \n- แสดง VIZ Profile รับสิทธิ์\n6) จอดรถฟรีเพิ่ม 2 ชม. ที่ไอคอนสยามและ ICS:\n- สมาชิก ONESIAM-SuperApp เท่านั้น  \n- แสดง VIZ Profile รับสิทธิ์ที่ไอคอนสยาม ชั้น M\n- ใช้สิทธิ์ได้ 1 เม.ย. - 31 ธ.ค. 66 \n7) ใบเสร็จมีค่า ยิ่งสะสมยิ่งได้ ที่ สยามเซ็นเตอร์(Siam Center)\n- สมาชิก ONESIAM-SuperApp เท่านั้น\n- ระยะเวลา 1-30 เม.ย. 66  \n- นำใบเสร็จ 100+ บาทสะสมยอดที่ร้านค้าที่ระบุ\n- รับฟรี 10 VIZ Coins/ใบเสร็จ \n- จำกัด 10 สิทธิ์/วัน 30 สิทธิ์/สมาชิก \n- ใช้ VIZ Coins ได้ถึง 30 มิ.ย. 66\n8) คูปองส่วนลด 100 บาท เมื่อใช้จ่าย 300 บาทบนแอป: \n- สมาชิก ONESIAM-SuperApp เท่านั้น\n- รับและใช้คูปอง 1-30 เม.ย. 66\n- จำกัด 2,000 สิทธิ์  \n- รับตั๋วหนังเมเจอร์ 1 ใบฟรี (ใช้ได้เฉพาะสาขาพารากอนและไอคอนสยาม)\n\nสยามพารากอน(Siam Paragon) ชั้น BF\n- MR.SKY: เปลี่ยนแบตรีโมตรถยนต์, เจาะเข็มขัด  \n- FLOWER DÉCOR\n- AUTO SPA\n- Sealife Ocean World/Show\n- Bag Studio: ซ่อมกระเป๋ารองเท้า\n\nสยามพารากอน(Siam Paragon) ชั้น GF ร้านอาหาร เครื่องดื่ม ขนม\n- McDonald'''''''''s, MK Gold, Fuji, Starbucks Coffee\n- Gourmet Market: ร้านอาหารและของสด\n- ร้านอาหารไทย ก๋วยเตี๋ยว ลูกชิ้น คอหมูย่าง  \n- After You, Krispy Kreme, Ben'''''''''s Cookies\n\nสยามพารากอน(Siam Paragon) ชั้น GF ธนาคารและสถาบันการเงิน\n- ธนาคารกรุงเทพ กสิกรไทย ไทยพาณิชย์ ทหารไทยธนชาต\n- สาขาพิเศษ Krungsri Smart, Citi, UOB Express\n\nสยามพารากอน(Siam Paragon) ชั้น GF ร้าน Korean Street\n- Nature Republic, Tony Moly, It'''''''''s Skin\n\nสยามพารากอน(Siam Paragon) ชั้น GF ร้านแฟชั่น กระเป๋า รองเท้า\n- Zara, H&M, Uniqlo, Aldo, Charles & Keith \n\nสยามพารากอน(Siam Paragon) ชั้น GF ร้านเครื่องประดับ นาฬิกา\n- De Preco, Glintz, Leila, King of Amulet  \n\nสยามพารากอน(Siam Paragon) ชั้น GF ร้านเสื้อผ้า\n- Ecco, DKNY\n\nสยามพารากอน(Siam Paragon) ชั้น GF ร้านยา \n- Boots\n\nสยามพารากอน(Siam Paragon) ชั้น 2F ร้านรถยนต์หรู\n- Maserati, Bentley, Porsche, Lamborghini, Harley Davidson, Rolls Royce, BMW, Mini, Ducati, Aston Martin\n\nสยามพารากอน(Siam Paragon) ชั้น 2F ร้านบริการทางการเงิน\n- Krungsri Smart\n\nสยามพารากอน(Siam Paragon) ชั้น 2F ร้านขายเครื่องเสียง\n- Bose, Sony, Focal, Bang & Olufsen\n\nสยามพารากอน(Siam Paragon) ชั้น 2F ร้านหนังสือ\n- นายอินทร์, Asia Books, Kinokuniya\n\nสยามพารากอน(Siam Paragon) ชั้น 2F ร้านขายแว่นตา\n- Glassaholic (Ray Ban, Oakley, Dior, Fendi)\n\nสยามพารากอน(Siam Paragon) ชั้น 2F ร้านเสื้อผ้าบุรุษ\n- Homme, Lacoste, Nautica, Pierre Cardin\n\nสยามพารากอน(Siam Paragon) ชั้น 3F ไอที คอมพิวเตอร์ มือถือ กล้อง\n- Banana, IT City, Power Buy, Jaymart\n\nสยามพารากอน(Siam Paragon) ชั้น 3F ร้านของเล่นเด็ก\n- Lego, Hasbro, Mattel\n\nสยามพารากอน(Siam Paragon) ชั้น 3F ร้านชุดว่ายน้ำ\n- Speedo, Billabong, Roxy  \n\nสยามพารากอน(Siam Paragon) ชั้น 3F ร้าน Lingerie\n- Wacoal, Triumph, Sabina, BSC\n\nสยามพารากอน(Siam Paragon) ชั้น 3F ร้านเสื้อผ้าและอุปกรณ์กีฬา\n- Nike, Adidas\n\nสยามพารากอน(Siam Paragon) ชั้น 3F ร้านเฟอร์นิเจอร์แบรนด์ดัง\n- Index Livingmall, Trend Design, Barbara Barry, Ralph Lauren\n\nสยามพารากอน(Siam Paragon) ชั้น 3F ร้านของฝาก ของที่ระลึก\n- Naraya\n\nสยามพารากอน(Siam Paragon) ชั้น 3F ร้านแว่นตา\n- IC Berlin, Paris Miki\n\nสยามพารากอน(Siam Paragon) ชั้น 4F พื้นที่ร้านอาหาร ภัตตาคาร\n- Lukkaithong, Sushi Den, Chabuton, Midtown\n\nสยามพารากอน(Siam Paragon) ชั้น 4F พื้นที่ Exotique Thai สปาและผลิตภัณฑ์ไทย\n- Harnn, Erb, Panpuri, Vuudh\n\nสยามพารากอน(Siam Paragon) ชั้น 4F พื้นที่ Next Tech\n- TikTok, Connex Space, Siam Sandbox by Jaymart \n\nสยามพารากอน(Siam Paragon) ชั้น 4F พื้นที่ Bright Space\n- โรงเรียนสอนศิลปะ เต้นรำ ดนตรี ภาษา  \n\nสยามพารากอน(Siam Paragon) ชั้น 4F ผู้ให้บริการมือถือ\n- AIS, DTAC, True\n\nสยามพารากอน(Siam Paragon) ชั้น 4F ธนาคาร\n- กรุงไทย ออมสิน กรุงศรี\n\nสยามพารากอน(Siam Paragon) ชั้น 4F ร้านออกกำลังกาย \n- Fitness First\n\nสยามพารากอน(Siam Paragon) ชั้น 5F โรงภาพยนตร์ \n- Paragon Cineplex, IMAX\n\nสยามพารากอน(Siam Paragon) ชั้น 5F ร้านอาหารและคาเฟ่ในโรงหนัง:\n- Starbucks, Sushi Seki, KOF & Amattisimo\n\nสยามพารากอน(Siam Paragon) ชั้น MF แบรนด์เครื่องสำอาง น้ำหอม\n- CHANEL, NARS, MAC, Lancome, Sulwhasoo, Jo Malone, Penhaligon'''''''''s, Prada, Gucci, Hermes, Giorgio Armani\n\nสยามพารากอน(Siam Paragon) ชั้น MF แบรนด์แว่นตาและแว่นกันแดด\n- Oakley, Ray Ban, Alexander McQueen \n\nสยามพารากอน(Siam Paragon) ชั้น MF แบรนด์แฟชั่นหรูระดับโลก\n- Louis Vuitton, Cartier, Burberry, Jimmy Choo, Ermenegildo Zegna\n\nสยามพารากอน(Siam Paragon) ชั้น MF ร้านสินค้าไลฟ์สไตล์หรู\n- Montblanc, Tumi\n\nสยามพารากอน(Siam Paragon) ชั้น MF ร้านนาฬิกาไฮเอนด์\n- Rolex, Omega, Patek Philippe, Tudor, Van Cleef & Arpels\n\nสยามพารากอน(Siam Paragon) ชั้น MF ร้านเครื่องประดับเพชรพลอย\n- Tiffany & Co., Swarovski\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น B2\n- ICON WASH: บริการซักรีด\n- AIRPORTELS: บริการขนส่งกระเป๋า\n- MISTER SKY: ทำกุญแจ ซ่อมรองเท้า\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น B1\n- DHL Express, Kerry Express: บริการขนส่ง\n- Thailand Post: ไปรษณีย์ \n- Pet Safari: อาหารและอุปกรณ์สัตว์เลี้ยง\n- Sin Chai Hua: ซักอบรีด  \n- MOMOKO: ทำความสะอาดกระเป๋ารองเท้า\n- Bhu Mhai Lifestyle Spa, EXPERT Watch \n- ICONIC Your Design: ปักชื่อ ออกแบบเสื้อยืด\n \nไอคอนสยาม(ICONSIAM), ICS ชั้น GF ร้านอาหารและเครื่องดื่ม\n- Blue by Alain Ducasse, Jumbo Seafood, TWG Tea  \n- Pang Cha, Coffee Beans by Dao, OMU, MOM'''S TOUCH, MOS BURGER\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น GF แบรนด์เครื่องหนังหรู\n- Hermes, Louis Vuitton  \n- Cartier, Tiffany & Co.\n- Rimowa\nVeranda Zone:\n- D'''''''''ARK Dinner Cruise, ร้านอาหารหลากหลาย\n- TrueCoffee, Susan Corissant \n- 7-Eleven\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น GF อื่นๆ\n- SookSiam (ร้านค้าสินค้าไทย), NaRaYa, Dear Tummy \n \nไอคอนสยาม(ICONSIAM), ICS ชั้น MF (ICONLUXE) แบรนด์เครื่องสำอางและความงาม\n- CHANEL, Dior, Estee Lauder, L'''''''''OCCITANE, MAC, Jo Malone, Atelier de Prestige\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น MF (ICONLUXE) แฟชั่นแบรนด์เนมระดับโลก\n- Gucci, Bottega Veneta, Cartier, Louis Vuitton, Hermes, Prada, Tiffany & Co., Dolce & Gabbana, Bulgari, Fendi, Saint Laurent, Dior, CELINE, Coach, Versace, Rimowa, Boss\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น MF (ICONLUXE) แฟชั่นแบรนด์อื่นๆ\n- Michael Kors, Swatch, Longchamp, Maison Kitsuné, KWANPEN, Victoria'''''''''s Secret, H&M, COS, Zara, Bath & Body Works\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น MF (ICONLUXE) อื่นๆ\n- Takashimaya Department Store\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 1 แฟชั่นและรองเท้า\n- Louis Vuitton, COS, ZARA, Philipp Plein, Takashimaya, Evisu, Lacoste, H&M, Onitsuka Tiger, Birkenstock, Samsonite, Champion\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 1 ร้านอาหาร คาเฟ่\n- % Arabica, Starbucks, Blue by Alain Ducasse\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 1 อื่นๆ\n- 333Gallery, Artventure, Agata (Art Gallery)  \n- Maserati, Porsche, Dyson, Bang & Olufsen, L'''''''''Occitane\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 2 แฟชั่นและรองเท้า:\n- H&M, Uniqlo, Lyn, Lyn Around, Charles & Keith, Levi'''''''''s, New Era, Aldo, Vans, JD Sports\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 2 ความงาม\n- LUSH, Fashion TV Cosmetics\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 2 อื่นๆ\n- AIS, Greyhound Cafe, MINISO, Watsons\n\nไอคอนสยาม(ICONSIAM), ICS  ชั้น 3 ร้านรถยนต์:\n- Lamborghini, BMW, Mercedes, Volvo, Porsche, Harley Davidson\n\nไอคอนสยาม(ICONSIAM), ICS  ชั้น 3 แฟชั่น รองเท้า กีฬา\n- JD Sports, Converse, Crocs, Vans, New Balance, FILA, Reebok, Skechers, Under Armour, Nike, Onitsuka Tiger, Lacoste, Swatch, Herschel, Eastpak, Jansport, Anello, The North Face\n\nไอคอนสยาม(ICONSIAM), ICS  ชั้น 3 ร้านอาหารและคาเฟ่:\n- Buddhi Belly, Kyo Roll En\n\nไอคอนสยาม(ICONSIAM), ICS  ชั้น 3 อื่นๆ\n- MUJI, Loft (Lifestyle)\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 4 ร้านอาหารและเครื่องดื่ม\n- Bar B Q Plaza, Shabushi, Café Amazon, Evaime Shabu, S&P, Tenjo Sushi, KFC, Bonchon, Kub Kao''''''''' Kub Pla  \n- TrueCoffee, Susan \n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 4 แบรนด์ไลฟ์สไตล์ \n- ICONCRAFT\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 4 ธนาคาร\n- SCB, Kasikornbank\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 4 อื่นๆ\n- True Sphere (IT), Harnn, THANN, Banana, AIS\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 5 Kids & Edutainment\n- Babies Genius, Phonics 1st, Hit Galleria, Scientia, KPN Music Academy, Se-ed, ABC Baby\n- Viemus Music School, Yamaha Music School\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 5  คลินิกความงาม สุขภาพ\n- SLC Siam Laser Clinic, The Vanish Clinic, Pruksa Prime Clinic, THONGLOR DENTAL, Pewdee Clinic, The Heritage Nail Spa, CHABA Nails & Eyelashes, MILK\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 5  ร้านอาหาร\n- Baan Ying Cafe & Meal, THIPSAMAI, LukKaiThong, Mae Sri Ruen, Crazy Rich, MK LIVE, Hong Bao, Nice Two Meat U\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 5  ธนาคาร\n- TMBThanachart, Krungthai, Krungsri, UOB, TISCO, GSB\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 5  อื่นๆ\n- Naiin Books, Watsons, Toys R Us, Mt. Sapola  \n\nรายการร้านค้าและบริการใน ไอคอนสยาม(ICONSIAM), ICS ชั้น 6 ร้านอาหารคาเฟ่  \n- After You, ChaTraMue, Beard Papa, Katsugyu, James Boulangerie, Yuzu Ramen, Mil Toast, Mo-Mo-Paradise, Bonchon, IPPUDO, YAYOI, Sushi Den, The Bibimbab, Great Harbor, Evaime Shabu  \nEntertainment:\n\nรายการร้านค้าและบริการใน ไอคอนสยาม(ICONSIAM), ICS ชั้น 6 อื่นๆ\n- Fitness First, TRUE ICON HALL, ICON CINECONIC, MEGA HarborLand\n\nไอคอนสยาม(ICONSIAM), ICS ชั้น 7:\nTRUE ICON HALL\nStarbucks Reserve\n\nสยามเซ็นเตอร์(Siam Center) ชั้น 1 แฟชั่น เครื่องประดับ\n- Kloset, Tube Gallery, Fri 27 Nov, Les Nereides, Frank Garcon\n- โซน Absolute Siam (แบรนด์ไทยกว่า 100 แบรนด์) \n- โซน The Wonder Room (ดีไซเนอร์ไทยหลากสไตล์)\n\nสยามเซ็นเตอร์(Siam Center) ชั้น 1  อื่นๆ\n- AIS, Starbucks, Baking Soda  \n- Iconic (ที่ห้อยกระเป๋า พวงกุญแจ) \n- FabLab (ดีไซเนอร์อิสระ)\n\nสยามเซ็นเตอร์(Siam Center) ชั้น 2 ร้านอาหารนานาชาติ\n- Tonkatsu Wako, Bar B Q, Yuzu Suki, Bonchon, Yayoi, Hachiban, After You, The Alley\n\nสยามเซ็นเตอร์(Siam Center) ชั้น 2  แฟชั่น\n- Levi'''''''''s, CC-OO, Havaianas, Villains, Charles & Keith, New Era, Lyn  \n\nสยามเซ็นเตอร์(Siam Center) ชั้น 2 บริการ\n- Watsons, Pruksa Clinic, St. Peter Optical, AIS\n\nสยามเซ็นเตอร์(Siam Center) ชั้น 2 ร้านขนม เครื่องดื่ม\n- Minimelts, Fuku Matcha, Yenly Yours, Shiba-Jung, ERR, Candy Crush\n\nสยามเซ็นเตอร์(Siam Center) ชั้น 3\n- Se-ed (ร้านหนังสือ)\n- Mr.DIY (ร้าน DIY ทั่วไป)\n- Muse Music Academy, INNER STUDIO (สอนดนตรี)\n- ร้านอาหาร Santa Fe, Daynighto (คาเฟ่)  \n- Skechers (รองเท้า)\n\nสยามเซ็นเตอร์(Siam Center) ชั้น 4\n- TORA CHA (ชานมไข่มุก)\n- Muscle Inc. (อาหารเสริม) \n- You&I Premium Suki Buffet \n\nสยามเซ็นเตอร์(Siam Center) ชั้น MF เครื่องสำอาง\n- Oriental Princess, Cute Press\n\nสยามเซ็นเตอร์(Siam Center) ชั้น MF แฟชั่น\n- U.S. Polo, BEAUTRIUM, Pierre Cardin, Skechers, Rock Me, Dr.Martens",
        },
        {
          role: 'user',
          content: 'จงยกตัวอย่างร้านค้าในสยามเซ็นเตอร์มาจำนวน 5 ตัวอย่าง',
        },
        {
          role: 'assistant',
          content:
            "1) Kloset - ร้านเสื้อผ้าแฟชั่นที่มีสไตล์เก๋ และเป็นที่รู้จักในวงการแฟชั่น\n2) Se-ed - ร้านหนังสือที่มีความหลากหลายในการเลือกซื้อหนังสือ\n3) Levi'''s - ร้านเสื้อผ้ายีนส์ชื่อดังที่มีสินค้าคุณภาพ\n4) Oriental Princess - ร้านเครื่องสำอางไทยที่มีความนิยมและคุณภาพดี\n5) TORA CHA - ร้านชานมไข่มุกที่มีรสชาติอร่อยและเป็นที่นิยมในวงการชานมไข่มุก",
        },
        {
          role: 'user',
          content: 'จงยกตัวอย่าร้านค้าใดบ้างที่มีโปรโมชั่น ใบเสร็จ',
        },
        {
          role: 'assistant',
          content:
            'ร้านค้าที่มีโปรโมชั่น ใบเสร็จ อยู่ใน สยามเซ็นเตอร์(Siam Center) ยกตัวอย่างเช่น\n1. Se-ed อยู่ที่ชั้น 3\n2. TORA CHA อยู่ที่ชั้น 4\n\nและอีกมากมาย',
        },
        {
          role: 'user',
          content:
            '1. มีโปรโมชั่นบัตรเครดิตวันสยาม อะไรบ้าง \n2. บัตรเครดิตในข้อ 1. ต้องลงทะเบียนอย่างไร',
        },
        {
          role: 'assistant',
          content:
            '1. โปรโมชั่นบัตรเครดิตวันสยาม รวมถึงการใช้คะแนน K Point แลกเท่ายอดใช้จ่ายเพื่อรับเครดิตเงินคืน 12%\n\n2. สำหรับบัตรเครดิตวันสยาม ลงทะเบียนโปรโมชั่นผ่าน SMS โดยพิมพ์ SDSC (วรรค) หมายเลขบัตรเครดิต 12 หลักสุดท้าย (วรรค) จำนวนคะแนนที่ต้องการแลก แล้วส่งมาที่ 4545888',
        },
        {
          role: 'user',
          content: 'มีโปรโมชั่นร้าน KOI หรือเปล่า',
        },
        {
          role: 'assistant',
          content:
            'ถ้าหากหมายถึง KOI The โปรโมชั่นร้าน KOI The ที่กำลังเปิดให้บริการในช่วงเวลานี้คือคูปองเครื่องดื่ม KOI The ในราคา 19 บาท (ปกติ 55 บาท) สำหรับสมาชิก ONESIAM-SuperApp ใหม่ที่ลงทะเบียนครั้งแรก โดยสามารถเก็บคูปองนี้ได้ตั้งแต่วันที่ 1-30 เมษายน 2566 และสามารถใช้ได้ถึงวันที่ 15 พฤษภาคม 2566 โดยจำกัดสิทธิ์การรับคูปองที่ 5,000 สิทธิ์ครับ',
        },
        {
          role: 'user',
          content: 'บัตรเครดิตกรุงเทพ',
        },
        {
          role: 'assistant',
          content:
            'เมื่อคุณซื้อสินค้ามูลค่า 400,000 บาท ด้วยบัตรเครดิตกรุงเทพ จะได้รับเครดิตเงินคืนสูงสุด 16% ตามโปรโมชันที่บัตรเครดิตกรุงเทพมีให้ครับ โดยจะได้รับเงินคืนจากยอดซื้อทั้งหมด 400,000 บาท และจำกัดการแลกคะแนนสะสมได้สูงสุด 500,000 คะแนนครับ ต้องลงทะเบียนผ่าน SMS เพื่อรับสิทธิ์เครดิตเงินคืนด้วยครับ',
        },
        {
          role: 'user',
          content: 'ได้รับเงินคืนกี่บาท',
        },
        {
          role: 'assistant',
          content:
            'หากคุณซื้อสินค้ามูลค่า 400,000 บาท ด้วยบัตรเครดิตกรุงเทพที่มีโปรโมชันเครดิตเงินคืนสูงสุด 16% คำนวณเงินคืนได้ดังนี้:\n400,000 บาท x 16% = 64,000 บาท\nดังนั้นคุณจะได้รับเงินคืนจากการซื้อสินค้านี้ทั้งหมด 64,000 บาทครับ',
        },
        {
          role: 'user',
          content: 'ฉันมีแค่ 400 คะแนน',
        },
        {
          role: 'assistant',
          content:
            '400 บาท x 16% = 64 บาท\nดังนั้นคุณจะได้รับเงินคืนจากการซื้อสินค้านี้ทั้งหมด 64 บาทครับ',
        },
        {
          role: 'user',
          content: 'ถ้าฉันมี 100000 คะแนน',
        },
        {
          role: 'assistant',
          content:
            'เนื่องจากโปรโมชันบัตรเครดิตกรุงเทพจำกัดการแลกคะแนนสะสมได้สูงสุดที่ 500,000 คะแนน และคุณมีเพียง 100,000 คะแนน\nดังนั้นคุณจะได้รับเงินคืนจากการซื้อสินค้านี้ตามจำนวนคะแนนที่คุณมีอยู่ คือ:\n100,000 คะแนน x 16% = 16,000 บาท\nดังนั้นคุณจะได้รับเงินคืนจากการซื้อสินค้านี้ทั้งหมด 16,000 บาทครับ',
        },
        {
          role: 'user',
          content: 'ถ้าฉันมี 1000000 คะแนน',
        },
        {
          role: 'assistant',
          content:
            'เนื่องจากโปรโมชันบัตรเครดิตกรุงเทพจำกัดการแลกคะแนนสะสมได้สูงสุดที่ 500,000 คะแนน และคุณมี 1,000,000 คะแนน ดังนั้นจำนวนคะแนนที่สามารถนำมาแลกเป็นเงินคืนจะถูกจำกัดที่ 500,000 คะแนนเท่านั้นครับ\nดังนั้นคุณจะได้รับเงินคืนจากการซื้อสินค้านี้ตามจำนวนคะแนนที่สามารถแลกได้คือ:\n500,000 คะแนน x 16% = 80,000 บาท\\n\\nดังนั้นคุณจะได้รับเงินคืนจากการซื้อสินค้านี้ทั้งหมด 80,000 บาทครับ',
        },
        {
          role: 'user',
          content: 'มีโปรโมชั่นร้าน KOI หรือเปล่า',
        },
        {
          role: 'assistant',
          content:
            'ถ้าหากหมายถึง KOI The\nโปรโมชั่นร้าน KOI The ที่กำลังเปิดให้บริการในช่วงเวลานี้คือคูปองเครื่องดื่ม KOI The ในราคา 19 บาท (ปกติ 55 บาท) สำหรับสมาชิก ONESIAM-SuperApp ใหม่ที่ลงทะเบียนครั้งแรก โดยสามารถเก็บคูปองนี้ได้ตั้งแต่วันที่ 1-30 เมษายน 2566 และสามารถใช้ได้ถึงวันที่ 15 พฤษภาคม 2566 โดยจำกัดสิทธิ์การรับคูปองที่ 5,000 สิทธิ์ครับ',
        },
      ];
      const openai = new OpenAI({
        apiKey: this.configService.get('OPENAI_API_KEY'),
      });
      let responseText: string = '';
      const data: Dialogs[] = await this.dialogs.find({
        order: {
          createTime: 'DESC',
        },
        take: 2,
      });
      let value = data.map((item) => {
        return {
          role: item.role,
          content: item.content,
        };
      });
      let content = [];
      content.push(...prompt, ...value);

      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [...content, { role: 'user', content: message }],
        stream: true,
        temperature: 0.1,
        max_tokens: 1000,
      });
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          responseText += content;
          process.stdout.write(content);
        }
      }
      await Promise.all([
        await this.dialogs.save({ role: 'user', content: message }),
        await this.dialogs.save({ role: 'assistant', content: responseText }),
      ]);
      return responseText;
    } catch (error) {
      throw error;
    }
  }
}

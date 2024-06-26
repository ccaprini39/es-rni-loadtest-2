import { americanMaleFirstNames, americanFemaleFirstNames, americanLastNames } from "./american-names"
import { asianMaleFirstNames, asianFemaleFirstNames, asianLastNames } from "./asian-names"
import { arabicMaleFirstNames, arabicFemaleFirstNames, arabicLastNames } from "./arabic-names"
import { hispanicMaleFirstNames, hispanicFemaleFirstNames, hispanicLastNames } from "./hispanic-names"

//****************Name Generation ******************/

// this function will generate function with between 1 and 3 first names and a last name
function generateAmericanName() : string {
  let gender = Math.floor(Math.random() * 2);
  let numFirstNames = Math.floor(Math.random() * 3) + 1;
  let name = "";
  for (let i = 0; i < numFirstNames; i++) {
    if (gender == 0) name += americanMaleFirstNames[Math.floor(Math.random() * americanMaleFirstNames.length)] + " ";
    else name += americanFemaleFirstNames[Math.floor(Math.random() * americanFemaleFirstNames.length)] + " ";
  }
  name += americanLastNames[Math.floor(Math.random() * americanLastNames.length)];
  return name;
}

function generateAsianName() : string {
  let gender = Math.floor(Math.random() * 2);
  let numFirstNames = Math.floor(Math.random() * 3) + 1;
  let name = "";
  for (let i = 0; i < numFirstNames; i++) {
    if (gender == 0) name += asianMaleFirstNames[Math.floor(Math.random() * asianMaleFirstNames.length)] + " ";
    else name += asianFemaleFirstNames[Math.floor(Math.random() * asianFemaleFirstNames.length)] + " ";
  }
  name += asianLastNames[Math.floor(Math.random() * asianLastNames.length)];
  return name;
}

function generateArabicName() : string {
  let gender = Math.floor(Math.random() * 2);
  let numFirstNames = Math.floor(Math.random() * 3) + 1;
  let name = "";
  for (let i = 0; i < numFirstNames; i++) {
    if (gender == 0) name += arabicMaleFirstNames[Math.floor(Math.random() * arabicMaleFirstNames.length)] + " ";
    else name += arabicFemaleFirstNames[Math.floor(Math.random() * arabicFemaleFirstNames.length)] + " ";
  }
  name += arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)];
  return name;
}

function generateHispanicName() : string {
  let gender = Math.floor(Math.random() * 2);
  let numFirstNames = Math.floor(Math.random() * 3) + 1;
  let name = "";
  for (let i = 0; i < numFirstNames; i++) {
    if (gender == 0) name += hispanicMaleFirstNames[Math.floor(Math.random() * hispanicMaleFirstNames.length)] + " ";
    else name += hispanicFemaleFirstNames[Math.floor(Math.random() * hispanicFemaleFirstNames.length)] + " ";
  }
  name += hispanicLastNames[Math.floor(Math.random() * hispanicLastNames.length)];
  return name;
}

export function generateSingleRandomName() : string {
  //generate a random number between 1 and 100
  let random = Math.floor(Math.random() * 100) + 1;
  if (random <= 66) return generateAmericanName();
  if (random <= 78) return generateAsianName();
  if (random <= 84) return generateArabicName();
  return generateHispanicName();
}

export function generateRandomDate() : string {
  //generates dates between 1900-jan-01 and 
  const start = -2208988800000
  const end = 1712102400000
  const randomTime = start + Math.random() * (end - start)
  //now convert to yyyy-MM-dd format
  const date = new Date(randomTime)
  const year = date.getFullYear()
  let month : any = date.getMonth() + 1
  if (month < 10) {
    month = '0' + month.toString()
  }
  let day : any = date.getDate()
  if (day < 10) {
    day = '0' + day.toString()
  }
  return `${year}-${month}-${day}`
}
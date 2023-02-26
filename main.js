import puppeteer from 'puppeteer';
import * as fs from 'fs';
import axios from 'axios';

const TEMP_MAIL_URL = 'https://tempmailo.com/';
const ORELLY_REGISTER_URL =
  'https://www.oreilly.com/start-trial/api/v1/registration/individual/';
const PASSWORD = 'Temp@123';

const getEmailId = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = TEMP_MAIL_URL;

  let emailId = '';

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#i-email', { visible: true });
  const emailIdBody = await page.evaluate(() =>
    document.getElementById('i-email')
  );
  const title = await page.evaluate(() => document.title);
  console.log('Title: ' + title);
  console.log('emailIdBody: ' + emailIdBody);

  if (typeof emailIdBody != 'undefined' && emailIdBody != null) {
    emailId = '_value' in emailIdBody ? emailIdBody._value : 'temp@email.com';
  }

  await page.screenshot({
    path: './screenshot.jpg',
    type: 'jpeg',
    fullPage: 'true',
  });

  await browser.close();
  return emailId;
};

const getRandomName = () => {
  return (Math.random() + 1).toString(36).substring(7);
};

const createOReillyAccount = async () => {
  const emailId = await getEmailId();
  console.log('emailId: ' + emailId);
  const headers = {
    'accept-language': 'en-GB,en;q=0.9',
    'content-type': 'application/json',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'Content-Type': 'application/json',
    Referer: 'https://www.oreilly.com/',
    'Referrer-Policy': 'strict-origin',
  };

  const data = {
    email: emailId,
    password: PASSWORD,
    first_name: getRandomName(),
    last_name: getRandomName(),
    country: 'IN',
    t_c_agreement: true,
    contact: true,
    path: '/start-trial/',
    source: 'payments-client-register',
    trial_length: 10,
  };

  try {
    let response = await axios.post(ORELLY_REGISTER_URL, data, {
      headers: headers,
    });
    console.log('Account created successfully');
    console.log('Status: ' + response.status);
    console.log('Data: ' + JSON.stringify(response.data));
    let textContent = {};
    textContent.emailId = emailId;
    textContent.password = PASSWORD;
    textContent.accountCreatedOn = new Date().toLocaleDateString();
    fs.appendFile(
      'account-details.txt',
      '\n' + JSON.stringify(textContent),
      (err) => {
        if (err) {
          console.log(
            'Account created but got some error while saving data in file'
          );
          throw new Error(err);
        }
        console.log('Successfully saved!');
      }
    );
  } catch (err) {
    console.log('Failed to create OReilly account');
    throw new Error(err);
  }
};

let accountCreated = false;
let retryCount = 10;
while (!accountCreated & (retryCount > 0)) {
  retryCount--;
  try {
    let response = await createOReillyAccount();
    console.log('Successfully created OReilly account! Enjoy');
    accountCreated = true;
  } catch (err) {
    console.log(
      'There was some error while trying to create Orelly account. ',
      err
    );
  }
}

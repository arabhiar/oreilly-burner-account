import puppeteer from 'puppeteer-extra';
import { executablePath } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
import fs from 'fs';

// URLS and constants
const TEMP_MAIL_URL = 'https://tempmailo.com/';
const ORELLY_REGISTER_URL = 'https://www.oreilly.com/start-trial/api/v1/registration/individual/';
const PASSWORD = 'Temp@123';
const MAX_RETRIES = 10;

// Enable stealth plugin for puppeteer
puppeteer.use(StealthPlugin());

// Function to get random name
const getRandomName = () => (Math.random() + 1).toString(36).substring(7);

// Function to get email ID
const getEmailId = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    ignoreHTTPSErrors: true,
    executablePath: executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.goto(TEMP_MAIL_URL, { waitUntil: 'networkidle0' });

    const emailId = await page.$eval('#i-email', node => node.value);
    await page.screenshot({ path: './screenshot.jpg', type: 'jpeg', fullPage: 'true' });

    return emailId;
  } catch (err) {
    console.error(err);
    return 'temp@email.com';
  } finally {
    await browser.close();
  }
};

// Function to create O'Reilly account
const createOReillyAccount = async () => {
  const emailId = await getEmailId();
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
    const response = await axios.post(ORELLY_REGISTER_URL, data);
    console.log('Account created successfully');

    const accountDetails = {
      emailId,
      password: PASSWORD,
      accountCreatedOn: new Date().toLocaleDateString(),
    };

    fs.appendFile('account-details.txt', '\n' + JSON.stringify(accountDetails), err => {
      if (err) throw err;
      console.log('Successfully saved!');
    });
  } catch (err) {
    console.error('Failed to create OReilly account', err);
  }
};

// Main function
const main = async () => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await createOReillyAccount();
      console.log('Successfully created OReilly account! Enjoy');
      break;
    } catch (err) {
      console.error('There was some error while trying to create Orelly account.', err);
    }
  }
};

main().catch(err => console.error(err));
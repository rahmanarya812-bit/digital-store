import fs from 'fs';
import path from 'path';

const getDbPath = () => path.join(process.cwd(), 'api', '_data', 'products.json');

// Global memory cache to support read-only filesystems (like Vercel)
let memoryProducts = null;

export const getProducts = () => {
  if (memoryProducts) {
    return memoryProducts;
  }

  try {
    const filePath = getDbPath();
    let list = [];
    if (!fs.existsSync(filePath)) {
      const jsPath = path.join(process.cwd(), 'api', '_data', 'products.js');
      if (fs.existsSync(jsPath)) {
        const content = fs.readFileSync(jsPath, 'utf8');
        const startIdx = content.indexOf('[');
        const endIdx = content.lastIndexOf(']') + 1;
        if (startIdx !== -1 && endIdx !== -1) {
          const jsonText = content.substring(startIdx, endIdx);
          list = JSON.parse(jsonText);
        }
      }
    } else {
      list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    memoryProducts = list;
    return list;
  } catch (err) {
    console.error('DB Read Error:', err);
    return [];
  }
};

export const saveProducts = (products) => {
  memoryProducts = products;
  
  try {
    const filePath = getDbPath();
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
    
    // Sync to JS file as well for git tracking
    const jsPath = path.join(process.cwd(), 'api', '_data', 'products.js');
    const jsContent = `export const products = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync(jsPath, jsContent, 'utf8');
  } catch (err) {
    console.warn('DB Write Warning:', err.message);
  }
};

import { kvCall } from './kv.js';

const getSettingsDbPath = () => path.join(process.cwd(), 'api', '_data', 'settings.json');
let memorySettings = null;

const defaultSettings = {
  receiptName: 'ARYA STORE',
  receiptTagline: 'Marketplace Produk Digital Premium',
  receiptPhone: '085808703940',
  pakasirProject: '',
  pakasirApiKey: '',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  smtpSender: 'ARYA STORE'
};

export const getSettings = async () => {
  // If Vercel KV is connected, load settings from Vercel KV
  if (process.env.KV_REST_API_URL) {
    const kvData = await kvCall('GET', ['store:settings']);
    if (kvData) {
      try {
        const parsed = JSON.parse(kvData);
        memorySettings = { ...defaultSettings, ...parsed };
        return memorySettings;
      } catch (err) {
        console.error('KV Settings Parse Error:', err);
      }
    }
  }

  if (memorySettings) return memorySettings;

  try {
    const filePath = getSettingsDbPath();
    if (!fs.existsSync(filePath)) {
      memorySettings = defaultSettings;
      return defaultSettings;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    memorySettings = { ...defaultSettings, ...data };
    return memorySettings;
  } catch (err) {
    console.error('Settings Read Error:', err);
    return defaultSettings;
  }
};

export const saveSettings = async (settings) => {
  memorySettings = settings;

  // Sync settings to Vercel KV
  if (process.env.KV_REST_API_URL) {
    await kvCall('SET', ['store:settings', JSON.stringify(settings)]);
  }

  try {
    const filePath = getSettingsDbPath();
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.warn('Settings Write Warning:', err.message);
  }
};

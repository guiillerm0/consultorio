import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Función para normalizar los datos de la prescripción
const normalizePrescriptionData = (data) => {
  if (!data) throw new Error('Prescription data is required');

  return {
    patientId: String(data.patientId),
    doctorId: String(data.doctorId),
    issueDate: new Date(data.issueDate).toISOString(),
    // medications: data.medications.map(med => ({
    //   name: String(med.name),
    //   dosage: String(med.dosage),
    //   frequency: String(med.frequency),
    //   duration: String(med.duration),
    //   // Añadir otros campos necesarios en orden alfabético
    // })).sort((a, b) => a.name.localeCompare(b.name)) // Ordenar medicamentos
  };
};

// Validación de claves y firmas
const validateHexKey = (keyHex, expectedLength, name) => {
  if (!keyHex || typeof keyHex !== 'string') {
    throw new Error(`Invalid ${name}: must be a hex string`);
  }
  if (!/^[0-9a-fA-F]+$/.test(keyHex)) {
    throw new Error(`Invalid ${name}: contains non-hex characters`);
  }
  if (keyHex.length !== expectedLength) {
    throw new Error(`Invalid ${name}: expected ${expectedLength} chars, got ${keyHex.length}`);
  }
  return Buffer.from(keyHex, 'hex');
};

export const generateKeyPair = async () => {
  const privateKey = randomBytes(32);
  const publicKey = await ed.getPublicKey(privateKey);
  return {
    privateKey: Buffer.from(privateKey).toString('hex'),
    publicKey: Buffer.from(publicKey).toString('hex')
  };
};

export const signPrescription = async (privateKeyHex, prescriptionData) => {
  try {
    const privateKey = validateHexKey(privateKeyHex, 64, 'private key');
    const normalizedData = normalizePrescriptionData(prescriptionData);
    const messageStr = JSON.stringify(normalizedData, Object.keys(normalizedData).sort());
    const message = Buffer.from(messageStr);

    console.log('[SIGN] Data being signed:', messageStr);

    const signature = await ed.sign(message, privateKey);
    return Buffer.from(signature).toString('hex');
  } catch (error) {
    console.error('Signing error:', error);
    throw new Error('Failed to sign prescription: ' + error.message);
  }
};

export const verifySignature = async (publicKeyHex, signatureHex, prescriptionData) => {
  try {
    console.log('[VERIFY] Input:', { publicKeyHex, signatureHex });

    const publicKey = validateHexKey(publicKeyHex, 64, 'public key');
    const signature = validateHexKey(signatureHex, 128, 'signature');
    const normalizedData = normalizePrescriptionData(prescriptionData);
    const messageStr = JSON.stringify(normalizedData, Object.keys(normalizedData).sort());
    const message = Buffer.from(messageStr);

    console.log('[VERIFY] Normalized data:', messageStr);

    const isValid = await ed.verify(signature, message, publicKey);
    console.log('[VERIFY] Result:', isValid);

    return isValid;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};

export function encryptMedications(medications) {
  const aesKey = randomBytes(32);      // 256 bits
  const iv = randomBytes(12);          // 96 bits (recomendado para GCM)

  const cipher = createCipheriv('aes-256-gcm', aesKey, iv);
  const medicationsStr = JSON.stringify(medications);

  let encrypted = cipher.update(medicationsStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    encryptedMedications: encrypted,
    aesKey: aesKey.toString('hex'),                    // la clave AES original (a cifrar para cada usuario)
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

export function decryptMedications(
  encryptedMedications,
  aesKey,
  ivHex,
  authTagHex
) {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', aesKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedMedications, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}


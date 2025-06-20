import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { randomBytes } from 'crypto';

// Configurar la función de hash requerida por noble/ed25519
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Generar par de claves
export const generateKeyPair = async () => {
  try {
    // Usar crypto nativo de Node.js para generar bytes aleatorios seguros
    const privateKey = randomBytes(32);
    const publicKey = await ed.getPublicKey(privateKey);
    return {
      privateKey: Buffer.from(privateKey).toString('hex'),
      publicKey: Buffer.from(publicKey).toString('hex')
    };
  } catch (error) {
    console.error('Key generation error:', error);
    throw new Error('Failed to generate key pair');
  }
};

// Firmar receta
export const signPrescription = async (privateKeyHex, prescriptionData) => {
  // Validar que privateKeyHex no sea undefined/null
  if (!privateKeyHex) {
    throw new Error('Private key is required for signing');
  }
  
  try {
    const privateKey = Buffer.from(privateKeyHex, 'hex');
    const message = Buffer.from(JSON.stringify(prescriptionData));
    const signature = await ed.sign(message, privateKey);
    return Buffer.from(signature).toString('hex');
  } catch (error) {
    console.error('Signing error:', error);
    throw new Error('Failed to sign prescription: ' + error.message);
  }
};

// Verificar firma
export const verifySignature = async (publicKeyHex, signatureHex, prescriptionData) => {
  try {
    if (!publicKeyHex || !signatureHex) {
      return false;
    }
    
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    const signature = Buffer.from(signatureHex, 'hex');
    const message = Buffer.from(JSON.stringify(prescriptionData));
    return await ed.verify(signature, message, publicKey);
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};
package com.example.crypto.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class CryptoService {
    private final SecretKeySpec keySpec;

    public CryptoService(@Value("${app.master.key}") String masterKey) {
        byte[] keyBytes = masterKey.getBytes();
        byte[] k = new byte[16];
        System.arraycopy(keyBytes, 0, k, 0, Math.min(keyBytes.length, 16));
        this.keySpec = new SecretKeySpec(k, "AES");
    }

    public String encrypt(String plain) {
        try {
            Cipher c = Cipher.getInstance("AES");
            c.init(Cipher.ENCRYPT_MODE, keySpec);
            return Base64.getEncoder().encodeToString(c.doFinal(plain.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String decrypt(String ct) {
        try {
            Cipher c = Cipher.getInstance("AES");
            c.init(Cipher.DECRYPT_MODE, keySpec);
            return new String(c.doFinal(Base64.getDecoder().decode(ct)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
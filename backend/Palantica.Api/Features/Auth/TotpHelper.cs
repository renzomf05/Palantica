using System.Security.Cryptography;
using System.Text;

namespace Palantica.Api.Features.Auth;

/// <summary>
/// Implementación pura y segura del algoritmo RFC 6238 (TOTP) y codificación Base32.
/// No depende de bibliotecas externas y es 100% compatible con Google Authenticator, Authy, 1Password, etc.
/// </summary>
public static class TotpHelper
{
    private const string Base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private const int TimeStepSeconds = 30;
    private const int Digits = 6;

    /// <summary>
    /// Genera una clave secreta aleatoria criptográficamente segura de 160 bits codificada en Base32 (32 caracteres).
    /// </summary>
    public static string GenerateSecretKey()
    {
        var bytes = RandomNumberGenerator.GetBytes(20);
        return ToBase32(bytes);
    }

    /// <summary>
    /// Genera la URI estándar otpauth:// para renderizar como código QR o importar en apps autenticadoras.
    /// </summary>
    public static string GenerateQrUri(string email, string secretKey, string issuer = "Palantica")
    {
        var escapedIssuer = Uri.EscapeDataString(issuer);
        var escapedLabel = Uri.EscapeDataString($"{issuer}:{email.Trim()}");
        return $"otpauth://totp/{escapedLabel}?secret={secretKey}&issuer={escapedIssuer}&algorithm=SHA1&digits={Digits}&period={TimeStepSeconds}";
    }

    /// <summary>
    /// Valida un código TOTP de 6 dígitos ingresado por el usuario, admitiendo una ventana de ±1 paso (±30s) para mitigar desfases de reloj.
    /// </summary>
    public static bool ValidateTotp(string secretKey, string code)
    {
        if (string.IsNullOrWhiteSpace(secretKey) || string.IsNullOrWhiteSpace(code))
        {
            return false;
        }

        var normalizedCode = code.Trim().Replace(" ", "");
        if (normalizedCode.Length != Digits || !int.TryParse(normalizedCode, out _))
        {
            return false;
        }

        byte[] keyBytes;
        try
        {
            keyBytes = FromBase32(secretKey.Trim());
        }
        catch
        {
            return false;
        }

        var currentStep = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / TimeStepSeconds;

        // Comprueba ventana: paso anterior (-30s), actual, y siguiente (+30s)
        for (long step = currentStep - 1; step <= currentStep + 1; step++)
        {
            var expectedCode = ComputeTotp(keyBytes, step);
            if (CryptographicOperations.FixedTimeEquals(
                    Encoding.ASCII.GetBytes(expectedCode),
                    Encoding.ASCII.GetBytes(normalizedCode)))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Calcula el código TOTP para un paso temporal específico.
    /// </summary>
    public static string ComputeTotp(byte[] keyBytes, long step)
    {
        var counterBytes = BitConverter.GetBytes(step);
        if (BitConverter.IsLittleEndian)
        {
            Array.Reverse(counterBytes);
        }

        using var hmac = new HMACSHA1(keyBytes);
        var hash = hmac.ComputeHash(counterBytes);

        var offset = hash[^1] & 0x0F;
        var binaryCode =
            ((hash[offset] & 0x7F) << 24) |
            ((hash[offset + 1] & 0xFF) << 16) |
            ((hash[offset + 2] & 0xFF) << 8) |
            (hash[offset + 3] & 0xFF);

        var otp = binaryCode % (int)Math.Pow(10, Digits);
        return otp.ToString(new string('0', Digits));
    }

    /// <summary>
    /// Convierte bytes a formato Base32 sin padding.
    /// </summary>
    public static string ToBase32(byte[] data)
    {
        if (data == null || data.Length == 0) return string.Empty;

        var sb = new StringBuilder((data.Length * 8 + 4) / 5);
        int buffer = 0;
        int bitsLeft = 0;

        foreach (var b in data)
        {
            buffer = (buffer << 8) | b;
            bitsLeft += 8;
            while (bitsLeft >= 5)
            {
                sb.Append(Base32Alphabet[(buffer >> (bitsLeft - 5)) & 31]);
                bitsLeft -= 5;
            }
        }

        if (bitsLeft > 0)
        {
            sb.Append(Base32Alphabet[(buffer << (5 - bitsLeft)) & 31]);
        }

        return sb.ToString();
    }

    /// <summary>
    /// Convierte una cadena Base32 a arreglo de bytes.
    /// </summary>
    public static byte[] FromBase32(string base32)
    {
        if (string.IsNullOrEmpty(base32)) return Array.Empty<byte>();

        var clean = base32.Trim().TrimEnd('=').ToUpperInvariant();
        var output = new List<byte>((clean.Length * 5) / 8);

        int buffer = 0;
        int bitsLeft = 0;

        foreach (var c in clean)
        {
            var charIndex = Base32Alphabet.IndexOf(c);
            if (charIndex < 0)
            {
                throw new FormatException($"Carácter Base32 no válido: {c}");
            }

            buffer = (buffer << 5) | charIndex;
            bitsLeft += 5;

            if (bitsLeft >= 8)
            {
                output.Add((byte)((buffer >> (bitsLeft - 8)) & 0xFF));
                bitsLeft -= 8;
            }
        }

        return output.ToArray();
    }
}

using System.ComponentModel.DataAnnotations;

namespace Palantica.Api.Features.Auth;

/// <summary>
/// Contrato de solicitud para registro de nuevo usuario.
/// </summary>
public sealed record RegistroRequest(
    [Required(ErrorMessage = "El email es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato de email no es válido.")]
    string Email,

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    string Password,

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 120 caracteres.")]
    string Nombre,

    string? NivelJuego = "Intermedio",
    string? LadoPistaPreferido = "Reves",
    string? AvatarUrl = null
);

/// <summary>
/// Contrato de solicitud para inicio de sesión.
/// </summary>
public sealed record LoginRequest(
    [Required(ErrorMessage = "El email es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato de email no es válido.")]
    string Email,

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    string Password
);

/// <summary>
/// Respuesta devuelta tras una autenticación exitosa.
/// </summary>
public sealed record AuthResponse(
    string Token,
    int Id,
    string Email,
    string Nombre,
    string Rol,
    string NivelJuego,
    string LadoPistaPreferido,
    string? AvatarUrl
);

/// <summary>
/// Perfil público y de juego del usuario.
/// </summary>
public sealed record PerfilResponse(
    int Id,
    string Email,
    string Nombre,
    string Rol,
    int? PalaActivaId,
    string? PalaActivaModelo,
    string? PalaActivaMarca,
    string NivelJuego,
    string LadoPistaPreferido,
    string? AvatarUrl,
    DateTimeOffset FechaRegistro,
    int TotalResenas,
    int TotalVotos,
    int TotalPaletero,
    int TotalPadelgramPosts,
    bool EmailVerificado = true,
    bool TwoFactorEnabled = false
);

// ==========================================
// ÉPICA 2: VERIFICACIÓN DE CORREO (OTP)
// ==========================================

public sealed record VerificarCodigoRequest(
    [Required(ErrorMessage = "El email es obligatorio.")]
    [EmailAddress]
    string Email,

    [Required(ErrorMessage = "El código es obligatorio.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "El código debe tener 6 dígitos.")]
    string Codigo
);

public sealed record ReenviarCodigoRequest(
    [Required(ErrorMessage = "El email es obligatorio.")]
    [EmailAddress]
    string Email
);

public sealed record RegistroPendienteResponse(
    string Message,
    string Email,
    bool RequiresVerification,
    string? DevCode = null
);

// ==========================================
// ÉPICA 3: AUTENTICACIÓN EN 2 PASOS (2FA TOTP)
// ==========================================

public sealed record TwoFactorSetupResponse(
    string Secret,
    string QrUri
);

public sealed record ActivarTwoFactorRequest(
    [Required(ErrorMessage = "El secreto es requerido.")]
    string Secret,

    [Required(ErrorMessage = "El código TOTP de 6 dígitos es requerido.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "El código TOTP debe tener 6 dígitos.")]
    string Codigo
);

public sealed record DesactivarTwoFactorRequest(
    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    string Password
);

public sealed record TwoFactorRequeridoResponse(
    bool Requires2FA,
    string TempToken,
    string Email
);

public sealed record VerificarTwoFactorLoginRequest(
    [Required(ErrorMessage = "El token temporal es obligatorio.")]
    string TempToken,

    [Required(ErrorMessage = "El código TOTP es obligatorio.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "El código debe tener 6 dígitos.")]
    string Codigo
);

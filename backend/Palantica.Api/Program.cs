using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Palantica.Api.Common.Database;
using Palantica.Api.Common.Middleware;
using Palantica.Api.Features.Auth;
using Palantica.Api.Features.Marcas;
using Palantica.Api.Features.Noticias;
using Palantica.Api.Features.Padelgram;
using Palantica.Api.Features.Palas;
using Palantica.Api.Features.Paletero;
using Palantica.Api.Features.Resenas;
using Palantica.Api.Features.Shopify;
using Palantica.Api.Features.Padelful;
using Palantica.Api.Features.Votaciones;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Configuración de Base de Datos y Servicios
// ==========================================
builder.Services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();
builder.Services.AddSingleton<SupabaseRestClient>();

// Feature Repositories y Servicios de Dominio
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<MarcaRepository>();
builder.Services.AddScoped<PalaRepository>();
builder.Services.AddSingleton<PalaSimilarityEngine>();
builder.Services.AddSingleton<NoticiasService>();
builder.Services.AddSingleton<ShopifyService>();
builder.Services.AddSingleton<PadelfulService>();
builder.Services.AddScoped<ResenaRepository>();
builder.Services.AddScoped<VotacionRepository>();
builder.Services.AddScoped<PaleteroRepository>();
builder.Services.AddScoped<PadelgramRepository>();

// ==========================================
// 2. Manejo Global de Excepciones (RFC 7807)
// ==========================================
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ==========================================
// 3. Autenticación y Autorización JWT
// ==========================================
var jwtSecret = builder.Configuration["Jwt:Key"]
                ?? builder.Configuration["JWT_SECRET"]
                ?? "***REMOVED***";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Palantica.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "Palantica.Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ==========================================
// 4. Configuración de CORS para Frontend Desacoplado
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("PalanticaCorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ==========================================
// 5. Documentación OpenAPI / Swagger
// ==========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Palantica API 🎾",
        Version = "v1",
        Description = "Enciclopedia analítica, catálogo interactivo y comunidad de reviews técnicas de pádel."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese 'Bearer' seguido de un espacio y su token JWT."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ==========================================
// 6. Migraciones Automáticas de Base de Datos
// ==========================================
var connectionString = app.Configuration["SUPABASE_CONNECTION_STRING"]
                       ?? app.Configuration.GetConnectionString("Supabase")
                       ?? app.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrWhiteSpace(connectionString))
{
    try
    {
        var normalizedConn = NpgsqlConnectionFactory.NormalizeToAdoConnectionString(connectionString);
        DatabaseMigrator.MigrateDatabase(normalizedConn, app.Logger);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Aviso: No se pudo ejecutar la migración inicial de DbUp (posible falta de conectividad temporal).");
    }
}

// ==========================================
// 7. Pipeline HTTP Middleware
// ==========================================
app.UseExceptionHandler();
app.UseCors("PalanticaCorsPolicy");

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Palantica API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseAuthentication();
app.UseAuthorization();

// ==========================================
// 8. Health Check
// ==========================================
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "Palantica.Api",
    timestamp = DateTimeOffset.UtcNow
}))
.WithTags("Sistema")
.WithName("HealthCheck");

app.MapGet("/api/padel/telemetry", () => Results.Ok(new
{
    rankings = new
    {
        date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
        topPlayers = new[]
        {
            new { ranking = 1, name = "Agustín Tapia", country = "AR", points = 20383, pala = "Nox AT10 Luxury Genius 18K Alum 2026", palaSlug = "nox-at10-luxury-genius-18k-alum-xtrem-2027-agustin-tapia", fotoUrl = "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&auto=format&fit=crop&q=80", mano = "Revés", victorias = "92%" },
            new { ranking = 1, name = "Arturo Coello", country = "ES", points = 20383, pala = "Head Extreme Pro 2026", palaSlug = "head-extreme-pro", fotoUrl = "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80", mano = "Drive / Zurdo", victorias = "92%" },
            new { ranking = 3, name = "Alejandro Galán", country = "ES", points = 18006, pala = "Adidas Metalbone 3.3 HRD 2026", palaSlug = "adidas-metalbone-3-3", fotoUrl = "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80", mano = "Revés", victorias = "88%" },
            new { ranking = 3, name = "Federico Chingotto", country = "AR", points = 18006, pala = "Bullpadel Neuron 2026", palaSlug = "bullpadel-vertex-04-2025", fotoUrl = "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80", mano = "Drive", victorias = "88%" },
            new { ranking = 5, name = "Juan Lebrón", country = "ES", points = 12450, pala = "Babolat Technical Viper 2026", palaSlug = "babolat-technical-viper-2025", fotoUrl = "https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=800&auto=format&fit=crop&q=80", mano = "Revés / Drive", victorias = "82%" },
            new { ranking = 6, name = "Franco Stupaczuk", country = "AR", points = 11200, pala = "Siux Electra ST3 Pro 2026", palaSlug = "siux-electra-st3-pro", fotoUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&auto=format&fit=crop&q=80", mano = "Revés", victorias = "79%" },
            new { ranking = 1, name = "Paula Josemaría", country = "ES", points = 21100, pala = "Head Speed Motion 2026", palaSlug = "head-extreme-pro", fotoUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80", mano = "Drive / Zurda", victorias = "94%" },
            new { ranking = 1, name = "Ariana Sánchez", country = "ES", points = 21100, pala = "Head Speed Pro 2026", palaSlug = "head-extreme-pro", fotoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80", mano = "Revés", victorias = "94%" }
        }
    },
    upcomingTournaments = new[]
    {
        new
        {
            id = "tourn-1",
            name = "Kuwait City Premier Padel P1",
            location = "Kuwait City, Kuwait",
            startDate = "2026-10-26",
            endDate = "2026-11-01",
            level = "P1",
            prize = "470.000 €",
            surface = "Indoor Cristal Rápido",
            featured = true,
            imageUrl = "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80",
            descripcion = "El circuito aterriza en el Golfo Pérsico con las mejores 48 parejas masculinas y 32 femeninas luchando por 1.000 puntos FIP."
        },
        new
        {
            id = "tourn-2",
            name = "Dubai Premier Padel P1",
            location = "Dubai, Emiratos Árabes Unidos",
            startDate = "2026-11-03",
            endDate = "2026-11-09",
            level = "P1",
            prize = "470.000 €",
            surface = "Outdoor Pista Panorámica",
            featured = true,
            imageUrl = "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1000&auto=format&fit=crop&q=80",
            descripcion = "Segundo torneo consecutivo de la gira árabe en el Dubai Duty Free Tennis Stadium con clima templado y pista activa."
        },
        new
        {
            id = "tourn-3",
            name = "GNP Mexico Premier Padel Major",
            location = "Acapulco, México",
            startDate = "2026-11-23",
            endDate = "2026-11-29",
            level = "MAJOR",
            prize = "600.000 €",
            surface = "Arena GNP Seguros",
            featured = true,
            imageUrl = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1000&auto=format&fit=crop&q=80",
            descripcion = "El cuarto y último Major de la temporada en la cuna del pádel. 2.000 puntos en juego que definirán los números 1 del mundo."
        },
        new
        {
            id = "tourn-4",
            name = "Milano Premier Padel P1",
            location = "Milán, Italia",
            startDate = "2026-12-01",
            endDate = "2026-12-07",
            level = "P1",
            prize = "470.000 €",
            surface = "Allianz Cloud Indoor",
            featured = false,
            imageUrl = "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80",
            descripcion = "El torneo bajo techo más vibrante de Europa antes del Tour Finals en el majestuoso Allianz Cloud de Milán."
        },
        new
        {
            id = "tourn-5",
            name = "Barcelona Premier Padel Finals 2026",
            location = "Barcelona, España",
            startDate = "2026-12-16",
            endDate = "2026-12-20",
            level = "FINALS",
            prize = "750.000 €",
            surface = "Palau Sant Jordi",
            featured = true,
            imageUrl = "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1000&auto=format&fit=crop&q=80",
            descripcion = "El torneo de maestros definitivo con las 8 mejores parejas del año compitiendo por la corona mundial de la temporada."
        }
    },
    totalTournaments = 25
}))
.WithTags("Circuito y Telemetría")
.WithName("GetPadelTelemetry");

// ==========================================
// 9. Mapeo de Endpoints de Features
// ==========================================
app.MapAuthEndpoints();
app.MapMarcaEndpoints();
app.MapPalaEndpoints();
app.MapNoticiasEndpoints();
app.MapResenaEndpoints();
app.MapVotacionEndpoints();
app.MapPaleteroEndpoints();
app.MapPadelgramEndpoints();
app.MapShopifyEndpoints();
app.MapPadelfulEndpoints();

app.Run();

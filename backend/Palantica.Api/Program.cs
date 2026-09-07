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

app.Run();

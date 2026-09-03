# Palantica 🎾
> **El Fragrantica de las palas de pádel** — Enciclopedia analítica, catálogo interactivo y comunidad de reviews técnicas de pádel.

Palantica es una plataforma comunitaria y analítica diseñada para jugadores que buscan conocer a fondo cada pala de pádel: valoraciones de dureza, comportamiento según la época y temperatura del año, composición de materiales (núcleo y caras), punto dulce, balance y un motor algorítmico de **"Palas parecidas"**.

---

## ⚡ Características Principales

- **Ficha Técnica Estilo Fragrantica**:
  - Matriz y radar de atributos (Potencia, Control, Salida de bola, Maniobrabilidad, Punto dulce).
  - Votación comunitaria de dureza (Blanda / Media / Dura).
  - Comportamiento térmico: Recomendación estacional (Verano vs Invierno).
  - Radiografía de materiales: Núcleo (EVA Soft, Black EVA, Foam), Caras (Fibra de Vidrio, Carbono 3K/12K/18K/24K) y marco.
- **Motor Algorítmico de Similitud ("Palas Parecidas")**:
  - Algoritmo de distancia y similitud vectorial multicriterio para encontrar alternativas directas a cualquier pala.
- **Comunidad y Reseñas Reales**:
  - Reviews verificadas de jugadores con filtros por estilo de juego y nivel.
  - Indicador de precio promedio orientativo de mercado (sin ventas directas ni e-commerce).
- **Visor 3D y Gráficos Interactivos**:
  - Inspección 3D 360° de la pala (forma, balance y textura).
  - Diagrama dinámico del mapa de perforaciones y punto dulce.
- **Panel de Administración**:
  - Gestión masiva del catálogo de palas, moderación de reviews e integración con APIs/fuentes públicas de pádel.

---

## 🛠️ Stack Tecnológico

- **Backend**: C# (.NET 10 / ASP.NET Core Web API) + Entity Framework Core.
- **Frontend**: React 19 + TypeScript + Vite.
- **3D & Animaciones**: Three.js (`@react-three/fiber`), `motion.dev`, `animejs`.
- **Estética**: Neumorfismo deportivo, soporte Nativo Claro / Oscuro, acentos Verde Lima Tenis (`#D4FF00`) y Rosa Fluo (`#FF007F`), patrones Kokonut UI y BkLit UI.
- **Directivas**: Anti-Vibecoding estricto y filosofía Fail-Fast.

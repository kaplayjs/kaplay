# 🎮 KAPLAY.js — Una Biblioteca de Juegos en JavaScript y TypeScript

<div align="center">
  <img src="./kaplay.webp">
</div>

KAPLAY es una biblioteca de juegos 2D **divertida y fácil de usar** para **JavaScript** y **TypeScript**. Está diseñada para que te sientas como si estuvieras jugando mientras creas juegos. Simple. Rápida. Poderosa.

✨ Ya seas principiante o desarrollador experimentado, **KAPLAY** incluye su propio **editor basado en web** — el [KAPLAYGROUND](https://play.kaplayjs.com) — donde puedes probar código al instante y aprender con más de **90 ejemplos**.

## 🎲 Vista Rápida

```js
// Iniciar un juego
kaplay({
    background: "#6d80fa",
});

// Cargar una imagen
loadSprite("frijol", "https://play.kaplayjs.com/bean.png");

// Añadir un sprite a la escena
add([
    sprite("frijol"), // se renderiza como un sprite
]);
```

Los objetos del juego se componen de componentes simples pero potentes:

```js
// Añadir un objeto al juego con una lista de componentes
const jugador = add([
    rect(40, 40),        // se renderiza como un rectángulo
    pos(100, 200),       // tiene una posición (coordenadas)
    area(),              // tiene un colisionador
    body(),              // es un cuerpo físico que responde a la física
    salud(8),            // tiene 8 puntos de salud
    // Etiquetas para comportamientos de grupo
    "amigable",
    // Campos adicionales para datos asociados
    {
        dir: vec2(-1, 0),
        muerto: false,
        velocidad: 240,
    },
]);
```

Sintaxis imperativa para describir comportamientos:

```js
// .onCollide() viene del componente "area"
jugador.onCollide("enemigo", () => {
    // .hurt() viene del componente "salud"
    jugador.hurt(1);
});

// Verificar caída mortal
jugador.onUpdate(() => {
    if (jugador.pos.y >= height()) {
        destroy(jugador);
    }
});

// Todos los objetos con etiqueta "enemigo" se moverán a la izquierda
onUpdate("enemigo", (enemigo) => {
    enemigo.move(-400, 0);
});

// Mover hacia arriba 100 píxeles por segundo mientras se mantiene presionada la tecla "w"
onKeyDown("w", () => {
    jugador.move(0, 100);
});
```

## 🖥️ Instalación

### 🚀 Usando `create-kaplay`

La forma más rápida de comenzar:

```sh
npx create-kaplay mi-juego
```

Luego abre [http://localhost:5173](http://localhost:5173) y edita `src/game.js`.

### 📦 Instalar con gestor de paquetes

```sh
npm install kaplay
```

```sh
yarn add kaplay
```

```sh
pnpm add kaplay
```

```sh
bun add kaplay
```

> Necesitarás un empaquetador como [Vite](https://vitejs.dev/) o
> [ESBuild](https://esbuild.github.io/) para usar KAPLAY en tu proyecto. Aprende cómo
> configurar ESbuild [aquí](https://kaplayjs.com/guides/install/#setup-your-own-nodejs-environment).

### 🌐 Usar en el Navegador

Incluye vía CDN:

```html
<script src="https://unpkg.com/kaplay@3001.0.12/dist/kaplay.js"></script>
```

### 📜 Tipos Globales en TypeScript

Si estás usando **TypeScript**, usaste `create-kaplay` o lo instalaste con un
administrador de paquetes y quieres **tipos globales**, puedes cargarlos con:

```ts
import "kaplay/global";

vec2(10, 10); // ¡Tipado correcto!
```

Pero se recomienda usar `tsconfig.json` para incluir los tipos:

```json
{
  "compilerOptions": {
    "types": ["./node_modules/kaplay/dist/declaration/global.d.ts"]
  }
}
```

> Si estás publicando un juego (y no solo probando/aprendiendo) quizás no quieras
> usar el espacio de nombres global,
> [ver por qué](https://kaplayjs.com/guides/optimization/#avoid-global-namespace).

## 📚 Recursos

### 📖 Documentación

- [Documentación Oficial de KAPLAY](https://kaplayjs.com/docs/)
- [KAPLAYGROUND](https://play.kaplayjs.com)

### 📺 Tutoriales

- 🎥 [Curso Rápido de KAPLAY por JSLegend ⚔️](https://www.youtube.com/watch?v=FdEYxGoy5_c)
- 📖 [Aprende lo básico de JavaScript y KAPLAY para hacer juegos rápidamente](https://jslegenddev.substack.com/p/learn-the-basics-of-javascript-and)

### 💬 Comunidad

- [Servidor de Discord](https://discord.gg/aQ6RuQm3TF)
- [Discusiones en GitHub](https://github.com/kaplayjs/kaplay/discussions)
- [Twitter](https://twitter.com/Kaboomjs)

## 🎮 Juegos

Colecciones de juegos hechos con KAPLAY, seleccionados por KAPLAY:

- [Itch.io](https://itch.io/c/4494863/kag-collection)
- [Newgrounds.com](https://www.newgrounds.com/playlist/379920/kaplay-games)

## 🙌 Créditos

KAPLAY es un proyecto de código abierto, mantenido por el
[Equipo de KAPLAY y colaboradores principales](https://github.com/kaplayjs/kaplay/wiki/Development-Team)
y con el apoyo de muchos [otros increíbles colaboradores](https://github.com/kaplayjs/kaplay/graphs/contributors).

### 🏆 Reconocimientos

- Gracias a [mulfok](https://twitter.com/MulfoK) por la increíble
  paleta de colores [mulfok32](https://lospec.com/palette-list/mulfok32), usada en
  los sprites y arte de KAPLAY
- Gracias a [Pixabay](https://pixabay.com/users/pixabay-1/) por el genial
  sonido de [eructo](https://pixabay.com/sound-effects/burp-104984/), usado en la función `burp()`
- Gracias a [Kenney](https://kenney.nl/) por todos los recursos utilizados en los ejemplos
  - [Impact Sound Pack](https://kenney.nl/assets/impact-sounds)
  - [1-Bit Platformer Pack](https://kenney.nl/assets/1-bit-platformer-pack)
- Gracias a [abrudz](https://github.com/abrudz) por la increíble
  [fuente APL386](https://abrudz.github.io/APL386/)
- Gracias a [Polyducks](http://polyducks.co.uk/) por la asombrosa
  [fuente kitchen sink](https://polyducks.itch.io/kitchen-sink-textmode-font)
- Gracias a [0x72](https://0x72.itch.io/) por el increíble
  [Dungeon Tileset](https://0x72.itch.io/dungeontileset-ii)


### 🔍 Ejemplos Rápidos en Español

```js
// Crear un contador de puntos
const puntos = add([
    text("Puntos: 0"),
    pos(20, 20),
    { valor: 0 },
]);

// Aumentar puntos al hacer clic
onClick(() => {
    puntos.valor++;
    puntos.text = `Puntos: ${puntos.valor}`;
});
```

### 📌 Componentes Comunes

- `text()`: Muestra texto en pantalla
- `sprite()`: Muestra una imagen o sprite
- `rect()`: Dibuja un rectángulo
- `pos()`: Establece la posición (x, y)
- `area()`: Añade detección de colisiones
- `body()`: Añade física al objeto
- `health()`: Añade un sistema de salud

### 📢 ¿Necesitas Ayuda?

Si tienes preguntas o necesitas ayuda en español, no dudes en unirte a nuestro [servidor de Discord](https://discord.gg/aQ6RuQm3TF) o abrir un issue en el repositorio. ¡Estamos aquí para ayudar!
